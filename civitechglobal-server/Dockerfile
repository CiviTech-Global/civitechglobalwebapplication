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
# API target: runs the Express API server
# -------------------------------
FROM node:22-alpine AS api
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm install prisma --no-save

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

RUN npx prisma generate

EXPOSE 5000

CMD ["node", "dist/index.js"]

# -------------------------------
# Bot target: runs the Telegram bot server
# -------------------------------
FROM node:22-alpine AS bot
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm install prisma --no-save

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

RUN npx prisma generate

EXPOSE 4000

CMD ["node", "dist/bot/index.js"]
