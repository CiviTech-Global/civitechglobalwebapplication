# Layer 12 — Error Tracking & Logging

**Score:** 3.5 / 5  
**Status:** 🟡 In Progress (PII redaction, request IDs, Sentry, Prometheus metrics, and SLOs complete; centralized log platform still pending)  
**Owner:** SRE, Observability SRE Engineer

## Executive summary

Structured logging exists in both API and bot, and errors are handled consistently. However, there is no centralized log aggregation, request correlation, metrics, or dedicated error-tracking service. Logs may also contain PII.

## Current state

### Strengths (with evidence)

- [x] **Structured JSON logging** — Pino in API (`src/config/logger.ts:5-12`) and bot (`src/bot/logger.ts:4-15`).
- [x] **Global API error handler** — Logs and returns generic 500s (`src/middleware/errorHandler.ts:15-52`).
- [x] **Custom error class** — `AppError` supports status code and validation errors (`src/middleware/errorHandler.ts:4-13`).
- [x] **Bot error capture** — `bot.catch` handles Grammy/HTTP errors (`src/bot/app.ts:42-50`); error middleware replies to users (`src/bot/middleware/error.middleware.ts:4-20`).
- [x] **Consistent controller error propagation** — Controllers pass errors to `next(error)`.

### Gaps / risks (with evidence)

- [ ] **No centralized log aggregation** — Logs go to stdout only; no Loki/ELK/CloudWatch agent or retention policy.
- [x] **Request-level logging with correlation IDs** — `pino-http` logs every request with an `x-request-id`; bot logs correlate where possible.
  - Evidence: `src/index.ts`, `src/config/logger.ts`.
- [x] **Sentry + Prometheus metrics active** — Sentry initialized in API, bot, and web; `/metrics` exposes `http_request_duration_seconds`, DB/Redis health gauges, and `auth_failures_total`.
  - Evidence: `src/index.ts`, `src/config/metrics.ts`, `src/bot/app.ts`, web Sentry init.
- [x] **SLOs documented** — `docs/slos.md` defines availability, latency, and error-rate targets.
- [x] **PII redacted from logs** — Pino redacts sensitive paths; error handlers log only names/messages; readiness checks no longer log raw errors.
- [ ] **Dual log streams in bot** — Fastify built-in logger plus imported Pino produce uncorrelated logs (`src/bot/app.ts:57-60`).
- [ ] **No SLOs/error budgets** — Reliability targets are undefined.

## Recommended actions

- [x] **1. Add request-level logging with correlation IDs**
  - `pino-http` with `x-request-id` and custom `reqId` attribute.
  - Acceptance: every API log line includes `reqId`.

- [x] **2. Redact PII from logs**
  - Configure Pino redaction for `password`, `token`, `phoneNumber`, `email`, `ctx.update.message.text`, etc.
  - Acceptance: no sensitive values in logs during tests.

- [ ] **3. Centralize logs**
  - Ship logs to Loki/CloudWatch/ELK with rotation and retention.
  - Acceptance: logs searchable by service, level, and request ID in the log platform.

- [x] **4. Add error tracking and metrics**
  - Sentry initialized in API, bot, and web.
  - Prometheus `/metrics` with request duration, DB/Redis health, auth failures.
  - Acceptance: metrics endpoint responds and Sentry captures errors.

- [x] **5. Define SLOs**
  - Documented in `docs/slos.md`.
  - Acceptance: SLOs published and alertable.

## Definition of done for this layer

- [x] Every request has a correlation ID.
- [x] Logs are PII-redacted.
- [ ] Logs centralized in a log platform (Loki/CloudWatch/ELK).
- [x] Sentry + Prometheus metrics active.
- [x] SLOs defined and alertable.
- [ ] Score raised to **4/5** or higher.
