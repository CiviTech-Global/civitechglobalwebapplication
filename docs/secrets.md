# Secrets Management Guide

This document explains how to provide sensitive configuration to CiviTech Global across local development, production, and CI/CD.

## Supported secret sources

The server image (`civitechglobal-server`) ships with a small Docker Secrets helper entrypoint. If an environment variable ending in `_FILE` is set, the container reads the referenced file and exports the value as the same variable name without the `_FILE` suffix. This lets the same image consume secrets from:

- A local `.env` file (development).
- Docker Secrets files mounted at `/run/secrets/` (production Compose).
- A cloud secret manager mounted into the container as files (AWS Secrets Manager, Azure Key Vault, GCP Secret Manager, 1Password, etc.).

Example:

```bash
DATABASE_URL_FILE=/run/secrets/database_url
# becomes inside the container
DATABASE_URL=postgresql://...secret...
```

## Local development

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Fill in real values for `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ADMIN_PASSWORD`, and any other empty fields.
   Seed and demo passwords must be 12-128 characters and include at least one uppercase letter, one lowercase letter, one number, and one special character.

3. Start the development stack:

   ```bash
   docker compose up -d
   # Run migrations explicitly before the API is healthy:
   cd civitechglobal-server && npx prisma migrate deploy
   ```

## Production with Docker Secrets (recommended)

1. Create secret files under `secrets/`:

   ```bash
   mkdir -p secrets/ssl
   echo 'civitechglobal' > secrets/postgres_db.txt
   printf 'super-secure-postgres-password' > secrets/postgres_password.txt
   printf 'civitechglobal' > secrets/postgres_user.txt
   printf 'postgresql://civitechglobal:password@postgres:5432/civitechglobal?schema=public' > secrets/database_url.txt
   printf 'redis://redis:6379' > secrets/redis_url.txt
   printf 'min-32-char-jwt-secret-goes-here-!!' > secrets/jwt_secret.txt
   printf 'min-32-char-refresh-secret-goes-here' > secrets/jwt_refresh_secret.txt
   printf 'min-32-char-pii-encryption-key-here!!' > secrets/pii_encryption_key.txt
   printf 'min-32-char-pii-hmac-key-here!!!!!!' > secrets/pii_hmac_key.txt
   printf 'superadmin@civitechglobal.com' > secrets/admin_email.txt
   printf 'super-secure-admin-password' > secrets/admin_password.txt
   printf 'Super' > secrets/admin_first_name.txt
   printf 'Admin' > secrets/admin_last_name.txt
   # Optional
   printf '' > secrets/telegram_bot_token.txt
   printf '' > secrets/telegram_webhook_secret.txt
   printf '' > secrets/telegram_admin_user_ids.txt
   printf '' > secrets/sentry_dsn.txt
   ```

2. Add or replace TLS certificates:

   ```bash
   cp /path/to/fullchain.pem secrets/ssl/fullchain.pem
   cp /path/to/privkey.pem secrets/ssl/privkey.pem
   ```

3. Deploy the stack:

   ```bash
   export IMAGE_TAG=main
   docker compose -f docker-compose.prod.yml pull
   docker compose -f docker-compose.prod.yml run --rm init-migrations
   docker compose -f docker-compose.prod.yml up -d
   ```

4. Verify:

   ```bash
   docker compose -f docker-compose.prod.yml ps
   curl -k https://localhost/api/health/ready
   ```

### Using Docker Swarm secrets

If you run on Docker Swarm, replace the `secrets:` file mappings with Swarm-managed secrets and remove the `file:` lines. The server entrypoint and Compose environment variables work the same way.

Example:

```yaml
secrets:
  database_url:
    external: true
```

## Production with a cloud secret manager

Most secret managers can inject secrets as files into a container. Mount the files into `/run/secrets/` and set the corresponding `*_FILE` environment variables in your orchestrator (Kubernetes, ECS, Azure Container Apps, etc.).

The application never needs to know which manager you use; it only needs the base environment variables.

## GitHub Actions

The CD workflow (`.github/workflows/cd.yml`) expects the following repository secrets and variables:

### Required repository secrets

| Secret | Purpose |
|--------|---------|
| `GHCR_TOKEN` or `GITHUB_TOKEN` with `packages:write` | Push images to GHCR. |
| `DATABASE_URL` | Run `prisma migrate deploy` against the production database. |

### Recommended repository secrets

| Secret | Purpose |
|--------|---------|
| `JWT_SECRET` | Production JWT signing secret (≥32 chars). |
| `JWT_REFRESH_SECRET` | Production JWT refresh signing secret (≥32 chars). |
| `PII_ENCRYPTION_KEY` | AES-256-GCM key for PII encryption (≥32 chars). |
| `PII_HMAC_KEY` | HMAC key for PII search hashes (≥32 chars). |
| `ADMIN_PASSWORD` | Initial Super Admin password (12-128 chars, uppercase, lowercase, number, special character). |
| `SENTRY_DSN` | Sentry project DSN (optional). |

### Required repository variables

| Variable | Purpose |
|----------|---------|
| `IMAGE_TAG` | Tag used for the production image (e.g., `main` or a release tag). |
| `CLIENT_URL` | Public URL of the web frontend (e.g., `https://civitechglobal.com`). |

## Rotating secrets

1. Update the secret value in your secret manager or `secrets/` directory.
2. Redeploy the affected service(s) so they read the new value.
3. For database credentials, restart `postgres`, then `init-migrations`, `api`, and `bot` in that order.

## Security checklist

- [ ] Never commit real secrets to Git.
- [ ] Keep `.env` files in `.gitignore`.
- [ ] Use secrets that are at least 32 characters long for JWT, encryption, and HMAC keys.
- [ ] Restrict file permissions on `secrets/` to the deployment user (`chmod 600 secrets/*.txt`).
- [ ] Use TLS certificates signed by a trusted CA in production; the default self-signed certificates in `secrets/ssl/` are for local testing only.
