# syntax=docker/dockerfile:1

# -------------------------------
# Base stage: install dependencies
# -------------------------------
FROM node:22-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm ci

# -------------------------------
# Build stage: compile TypeScript + generate Prisma client
# -------------------------------
FROM base AS build
WORKDIR /app

COPY . .
RUN npx prisma generate
RUN npm run build

# -------------------------------
# Shared runtime entrypoint helper for Docker Secrets.
# Copies secrets referenced by *_FILE env vars into their base env var names.
# -------------------------------
FROM node:22-alpine AS runtime-base
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY package*.json ./
RUN npm ci --omit=dev && npm install prisma --no-save

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh && npx prisma generate

USER appuser

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

# -------------------------------
# API target: runs the Express API server
# -------------------------------
FROM runtime-base AS api
WORKDIR /app

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health/live || exit 1

CMD ["node", "dist/index.js"]

# -------------------------------
# Bot target: runs the Telegram bot server
# -------------------------------
FROM runtime-base AS bot
WORKDIR /app

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:4000/health/live || exit 1

CMD ["node", "dist/bot/index.js"]
