# CiviTech Global Platform

A Persian-first civic technology platform with an insurance lead generation Telegram bot.

## Project Structure

```
.
├── civitechglobal-server/    # Express.js API + Fastify Telegram bot
├── civitechglobal-web/       # React 19 + Vite admin/dashboard frontend
├── docker-compose.yml        # Full stack orchestration
└── README.md
```

## Services

- **API** — Express.js REST API (port 5000)
- **Bot** — Fastify + grammY Telegram bot for insurance lead generation (port 4000)
- **Web** — React admin panel and public site (port 5173)
- **Postgres** — PostgreSQL database (port 5432)

## Quick Start with Docker

1. Copy environment files and fill in required values (especially `TELEGRAM_BOT_TOKEN`):

   ```bash
   cp civitechglobal-server/.env.example civitechglobal-server/.env
   ```

2. Build and start all services:

   ```bash
   docker compose up --build
   ```

3. Seed the database with demo data and insurance categories:

   ```bash
   docker compose exec api npx prisma db seed
   ```

4. Access the services:
   - Web app: http://localhost:5173
   - API: http://localhost:5000/api
   - Bot health: http://localhost:4000/health

## Local Development

### Backend

```bash
cd civitechglobal-server
npm install
cp .env.example .env
# update DATABASE_URL and other variables
npx prisma migrate dev
npx prisma db seed
npm run dev          # API server
npm run dev:bot      # Telegram bot
```

### Frontend

```bash
cd civitechglobal-web
npm install
npm run dev
```

The Vite dev server proxies `/api` to `http://localhost:5000`.

## Telegram Bot

1. Create a bot with [@BotFather](https://t.me/BotFather) and copy the token.
2. Set `TELEGRAM_BOT_TOKEN` in `civitechglobal-server/.env`.
3. Set `TELEGRAM_ADMIN_USER_IDS` with comma-separated Telegram user IDs for admin notifications.
4. Choose `TELEGRAM_BOT_MODE=polling` for local development or `webhook` for production.

## Insurance Lead Flow

Users interact with the Telegram bot in Persian:

```
/start → Category → Subcategory → Full Name → Phone → City → Contact Time → Notes → Confirm → Lead Created
```

Admins can view and manage leads at `/admin/leads` in the web app.

## Environment Variables

See `civitechglobal-server/.env.example` for all required variables.
