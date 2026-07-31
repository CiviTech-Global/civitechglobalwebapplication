# syntax=docker/dockerfile:1

# -------------------------------
# Build stage
# -------------------------------
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# -------------------------------
# Production stage with nginx
# -------------------------------
FROM nginx:alpine

# gettext provides envsubst for runtime configuration injection.
RUN apk add --no-cache gettext

# Create writable directories for the non-root nginx worker process.
RUN mkdir -p /var/cache/nginx /var/run && \
    chown -R nginx:nginx /var/cache/nginx /var/run /etc/nginx /usr/share/nginx/html

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default-ssl.template
COPY nginx.nossl.conf /etc/nginx/conf.d/default-nossl.template
COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

USER nginx

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
