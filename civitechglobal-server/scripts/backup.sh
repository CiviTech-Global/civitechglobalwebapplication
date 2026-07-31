#!/usr/bin/env bash
set -euo pipefail

# CiviTech Global — PostgreSQL backup script.
# Usage: backup.sh [--dry-run]
#
# Environment variables:
#   DATABASE_URL              PostgreSQL connection string (required).
#   BACKUP_DIR                Local backup directory (default: /backups).
#   BACKUP_RETENTION_COUNT    Number of local dumps to keep (default: 7).
#   S3_BACKUP_BUCKET          Optional S3-compatible bucket name.
#   S3_BACKUP_ENDPOINT        Optional S3 endpoint URL (e.g., https://s3.example.com).
#   S3_BACKUP_ACCESS_KEY      Optional S3 access key.
#   S3_BACKUP_SECRET_KEY      Optional S3 secret key.
#   S3_BACKUP_REGION          Optional S3 region (default: us-east-1).
#   S3_BACKUP_PREFIX          Optional key prefix (default: civitechglobal/postgres).

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
  shift || true
fi

BACKUP_DIR="${BACKUP_DIR:-/backups}"
BACKUP_RETENTION_COUNT="${BACKUP_RETENTION_COUNT:-7}"
S3_BACKUP_REGION="${S3_BACKUP_REGION:-us-east-1}"
S3_BACKUP_PREFIX="${S3_BACKUP_PREFIX:-civitechglobal/postgres}"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "Error: DATABASE_URL is not set." >&2
  exit 1
fi

TIMESTAMP=$(date -u +%Y%m%d%H%M%S)
DUMP_FILENAME="civitechglobal-${TIMESTAMP}.sql"
COMPRESSED_FILENAME="${DUMP_FILENAME}.gz"
LOCAL_PATH="${BACKUP_DIR}/${COMPRESSED_FILENAME}"
REMOTE_PATH="${S3_BACKUP_PREFIX}/${COMPRESSED_FILENAME}"

log() {
  echo "[backup] $*"
}

run() {
  if $DRY_RUN; then
    echo "[dry-run] $*"
  else
    "$@"
  fi
}

log "Starting backup (dryRun=${DRY_RUN})"
log "Local backup path: ${LOCAL_PATH}"

# Ensure backup directory exists.
if ! $DRY_RUN; then
  mkdir -p "${BACKUP_DIR}"
fi

# Dump and compress in one pipeline.
log "Running pg_dump..."
if $DRY_RUN; then
  log "Would run: pg_dump \"${DATABASE_URL}\" | gzip > \"${LOCAL_PATH}\""
else
  pg_dump "${DATABASE_URL}" | gzip > "${LOCAL_PATH}"
fi

# Verify the dump is non-empty.
if ! $DRY_RUN; then
  if [[ ! -s "${LOCAL_PATH}" ]]; then
    echo "Error: backup file is empty or missing." >&2
    rm -f "${LOCAL_PATH}"
    exit 1
  fi
  log "Backup size: $(du -h "${LOCAL_PATH}" | cut -f1)"
fi

# Optional S3-compatible upload.
if [[ -n "${S3_BACKUP_BUCKET:-}" ]]; then
  log "Uploading to s3://${S3_BACKUP_BUCKET}/${REMOTE_PATH}"

  if command -v aws >/dev/null 2>&1; then
    AWS_ARGS=()
    if [[ -n "${S3_BACKUP_ENDPOINT:-}" ]]; then
      AWS_ARGS+=(--endpoint-url "${S3_BACKUP_ENDPOINT}")
    fi
    if [[ -n "${S3_BACKUP_REGION:-}" ]]; then
      AWS_ARGS+=(--region "${S3_BACKUP_REGION}")
    fi

    # Export credentials for the AWS CLI if provided.
    if [[ -n "${S3_BACKUP_ACCESS_KEY:-}" && -n "${S3_BACKUP_SECRET_KEY:-}" ]]; then
      export AWS_ACCESS_KEY_ID="${S3_BACKUP_ACCESS_KEY}"
      export AWS_SECRET_ACCESS_KEY="${S3_BACKUP_SECRET_KEY}"
    fi

    run aws s3 cp "${LOCAL_PATH}" "s3://${S3_BACKUP_BUCKET}/${REMOTE_PATH}" "${AWS_ARGS[@]}"
  elif command -v rclone >/dev/null 2>&1; then
    if [[ -n "${S3_BACKUP_ENDPOINT:-}" && -n "${S3_BACKUP_ACCESS_KEY:-}" && -n "${S3_BACKUP_SECRET_KEY:-}" ]]; then
      export RCLONE_CONFIG_S3_TYPE=s3
      export RCLONE_CONFIG_S3_PROVIDER=Other
      export RCLONE_CONFIG_S3_ENDPOINT="${S3_BACKUP_ENDPOINT}"
      export RCLONE_CONFIG_S3_ACCESS_KEY_ID="${S3_BACKUP_ACCESS_KEY}"
      export RCLONE_CONFIG_S3_SECRET_ACCESS_KEY="${S3_BACKUP_SECRET_KEY}"
      export RCLONE_CONFIG_S3_REGION="${S3_BACKUP_REGION}"
    fi
    run rclone copyto "${LOCAL_PATH}" ":s3:${S3_BACKUP_BUCKET}/${REMOTE_PATH}"
  else
    echo "Warning: S3_BACKUP_BUCKET is set but neither aws nor rclone is installed. Skipping upload." >&2
  fi
else
  log "S3_BACKUP_BUCKET not set; skipping remote upload."
fi

# Local rotation: keep only the newest N compressed dumps.
log "Rotating local backups (retention count: ${BACKUP_RETENTION_COUNT})..."
if $DRY_RUN; then
  log "Would delete all but the newest ${BACKUP_RETENTION_COUNT} backups in ${BACKUP_DIR}"
else
  find "${BACKUP_DIR}" -maxdepth 1 -type f -name 'civitechglobal-*.sql.gz' -printf '%T@ %p\n' |
    sort -rn |
    tail -n +$((BACKUP_RETENTION_COUNT + 1)) |
    while read -r _ filepath; do
      log "Removing old backup: ${filepath}"
      rm -f "${filepath}"
    done
fi

log "Backup completed: ${LOCAL_PATH}"
