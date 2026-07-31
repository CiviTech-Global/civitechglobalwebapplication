#!/bin/sh
set -e

# Runtime-configurable Nginx upstream. Defaults to the Compose service name
# and port used in docker-compose.prod.yml.
export NGINX_UPSTREAM="${NGINX_UPSTREAM:-api:5000}"

# Choose the active configuration template. If TLS certificates are mounted,
# use the SSL-enabled template; otherwise fall back to plain HTTP so the same
# image works in local development without certificates.
if [ -f /etc/nginx/ssl/fullchain.pem ] && [ -f /etc/nginx/ssl/privkey.pem ]; then
  TEMPLATE=/etc/nginx/conf.d/default-ssl.template
else
  TEMPLATE=/etc/nginx/conf.d/default-nossl.template
fi

# Substitute environment variables into the Nginx template and write the
# active configuration. Only variables explicitly referenced in the templates
# are replaced so we do not leak the full container environment.
envsubst '\$NGINX_UPSTREAM' < "$TEMPLATE" > /etc/nginx/conf.d/default.conf

# Generate a static runtime config the SPA can read via window.__ENV__.
# Values here are injected at container start, not at build time, so the
# same image can be promoted across environments.
cat > /usr/share/nginx/html/config.js <<EOF
window.__ENV__ = {
  API_BASE_URL: "${API_BASE_URL:-/api}",
  SENTRY_DSN: "${SENTRY_DSN:-}",
  NODE_ENV: "${NODE_ENV:-production}",
};
EOF

# Validate the generated configuration before handing off to Nginx.
nginx -t

exec "$@"
