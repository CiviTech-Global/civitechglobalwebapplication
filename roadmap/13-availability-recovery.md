# Layer 13 — Availability & Recovery

**Score:** 3 / 5  
**Status:** 🟡 In Progress (Wave A complete; backups & incident response pending)  
**Owner:** SRE, Incident Response Commander

## Executive summary

Basic availability primitives exist (graceful shutdown, shallow health endpoints), but readiness checks do not verify database connectivity, there are no Docker health checks, no backup/DR strategy, and no incident response runbook.

## Current state

### Strengths (with evidence)

- [x] **API graceful shutdown** — Handles `SIGTERM`/`SIGINT` and closes HTTP server (`src/index.ts:47-56`).
- [x] **Bot graceful stop** — Fastify `onClose` stops the bot (`src/bot/app.ts:96-101`).
- [x] **Health endpoints exist** — `/api/health` (`src/index.ts:32-34`) and bot `/health` (`src/bot/app.ts:63`).
- [x] **Postgres healthcheck in Compose** — `pg_isready` with interval/timeout/retries (`docker-compose.yml:11-15`).
- [x] **CI includes service health checks and tests** (`.github/workflows/ci.yml`).

### Gaps / risks (with evidence)

- [x] **Deep readiness/liveness checks** — `/api/health/live` is static; `/api/health/ready` verifies Prisma and Redis. Bot `/health` still to be extended.
  - Evidence: `src/index.ts`.
- [x] **Docker HEALTHCHECK** — Added to server, bot, and web Dockerfiles; Compose depends on `condition: service_healthy` for API/bot.
  - Evidence: `civitechglobal-server/Dockerfile`, `civitechglobal-web/Dockerfile`, `docker-compose.yml`.
- [x] **Graceful shutdown hardened** — Closes HTTP server, drains in-flight requests with timeout, disconnects Prisma and Redis, exits cleanly.
  - Evidence: `src/index.ts`, `src/config/database.ts`, `src/config/redis.ts`.
- [x] **Global error handlers** — `uncaughtException` and `unhandledRejection` handlers log and trigger graceful shutdown.
  - Evidence: `src/index.ts`.
- [ ] **No backup/DR strategy** — Named volume `postgres_data` with no automated backups, WAL archiving, or restore runbook.
- [ ] **No incident response plan** — No runbooks, severity levels, escalation paths, or communication templates.

## Recommended actions

- [x] **1. Implement deep readiness/liveness probes**
  - Add `/api/health/ready` that checks Prisma connectivity.
  - Add `/api/health/live` for liveness.
  - Update bot `/health` to verify DB and Telegram API.
  - Acceptance: orchestrator marks pods/containers unhealthy when DB is down.

- [x] **2. Add Docker HEALTHCHECK instructions**
  - Add to server and web Dockerfiles.
  - Switch Compose to `condition: service_healthy` for API/bot.
  - Acceptance: unhealthy containers are restarted automatically.

- [x] **3. Harden graceful shutdown**
  - Disconnect Prisma client, drain in-flight requests with a timeout, exit cleanly.
  - Add `uncaughtException`/`unhandledRejection` handlers that log and exit safely.
  - Acceptance: zero connection leaks during rolling restart test.

- [ ] **4. Establish backups and DR**
  - Automate daily `pg_dump` or WAL-G to object storage.
  - Document RTO/RPO and test restores quarterly.
  - Acceptance: successful restore demonstrated from backup.

- [ ] **5. Create incident response runbook**
  - Define severity levels, escalation, rollback steps, and communication templates.
  - Acceptance: runbook reviewed and stored in `guides/incident-response.md`.

## Definition of done for this layer

- [x] Deep health checks active for API (bot health extension pending).
- [x] Docker HEALTHCHECK in place.
- [x] Graceful shutdown handles DB disconnect and in-flight requests.
- [ ] Backup/restore tested and documented.
- [ ] Incident response runbook published.
- [ ] Score raised to **4/5** or higher.
