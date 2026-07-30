# Layer 12 — Error Tracking & Logging

**Score:** 2 / 5  
**Status:** 🔴 Not Started  
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
- [ ] **No request-level logging or correlation IDs** — `src/index.ts` does not use `pino-http` or request ID middleware.
- [ ] **No metrics or alerting** — No Prometheus, Sentry, Datadog, Grafana, or alertmanager configs.
- [ ] **PII in logs** — `errorHandler.ts:16` logs full `err` object; bot error middleware logs `ctx.update` (`src/bot/middleware/error.middleware.ts:10`).
- [ ] **Dual log streams in bot** — Fastify built-in logger plus imported Pino produce uncorrelated logs (`src/bot/app.ts:55-60`).
- [ ] **No SLOs/error budgets** — Reliability targets are undefined.

## Recommended actions

- [ ] **1. Add request-level logging with correlation IDs**
  - Use `pino-http` or custom middleware to assign a request ID and log method/path/status/latency.
  - Propagate ID to bot logs for end-to-end tracing.
  - Acceptance: every log line includes `reqId`.

- [ ] **2. Redact PII from logs**
  - Configure Pino redaction for `password`, `token`, `phoneNumber`, `email`, `ctx.update.message.text`, etc.
  - Acceptance: no sensitive values in logs during tests.

- [ ] **3. Centralize logs**
  - Ship logs to Loki/CloudWatch/ELK with rotation and retention.
  - Acceptance: logs searchable by service, level, and request ID in the log platform.

- [ ] **4. Add error tracking and metrics**
  - Integrate Sentry for crash tracking.
  - Expose `/metrics` with `prom-client` for request rate, latency, errors, DB pool stats.
  - Acceptance: alerts fire on error-rate threshold.

- [ ] **5. Define SLOs**
  - e.g. 99.9% API availability, p99 latency < 500 ms, lead-submission success rate > 99.5%.
  - Acceptance: SLOs documented and dashboards created.

## Definition of done for this layer

- [ ] Every request has a correlation ID.
- [ ] Logs are centralized and PII-redacted.
- [ ] Sentry + Prometheus metrics active.
- [ ] SLOs defined and alertable.
- [ ] Score raised to **4/5** or higher.
