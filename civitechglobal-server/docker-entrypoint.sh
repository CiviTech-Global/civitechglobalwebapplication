#!/bin/sh
set -e

# Docker Secrets helper: for any exported variable ending in _FILE, read the
# referenced file and export the same variable name without the _FILE suffix.
# Example: DATABASE_URL_FILE=/run/secrets/database_url -> DATABASE_URL=<content>
for var in $(env | grep '_FILE=' | cut -d= -f1); do
  target_var="${var%_FILE}"
  secret_file="$(eval echo "\$${var}")"

  if [ -f "$secret_file" ]; then
    # Read the first line and strip trailing newlines to avoid surprises.
    secret_value="$(head -n 1 "$secret_file" | tr -d '\n')"
    export "${target_var}=${secret_value}"
    unset "$var"
  else
    echo "WARNING: Secret file $secret_file for ${target_var} not found" >&2
  fi
done

exec "$@"
