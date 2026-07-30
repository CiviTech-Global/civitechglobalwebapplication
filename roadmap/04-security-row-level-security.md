# Layer 4 — Security & Row-Level Security (RLS)

**Score:** 2.5 / 5  
**Status:** 🔴 Not Started  
**Owner:** Security Architect, Security & Compliance Officer, Data Privacy Officer

## Executive summary

Basic application security is in place (helmet, CORS, input sanitization, bcrypt, webhook secret validation), but the platform lacks database-level access controls and stores significant PII in plain text. This is the highest-risk area for production readiness.

## Current state

### Strengths (with evidence)

- [x] **Security headers** — `helmet` with HSTS preload, CORS origin restricted to `CLIENT_URL` with credentials (`src/index.ts:19-23`, `src/config/cors.ts:4-9`).
- [x] **Input sanitization** — `sanitizeObject` HTML-escapes strings in validation middleware (`src/middleware/validate.ts:5-18`).
- [x] **Password hashing** — bcrypt cost 12 in auth service and seed.
- [x] **Bot webhook auth** — Validates `x-telegram-bot-api-secret-token` header and passes `secret_token` to `setWebhook` (`src/bot/app.ts:15, 68-73, 81-83`).
- [x] **JWT hardening** — Explicit `HS256`, separate secrets, short expiry (`src/utils/jwt.ts:16-31`).

### Gaps / risks (with evidence)

- [ ] **No PostgreSQL RLS** — All access control is application-layer; a compromised DB connection or direct query can read everything.
- [ ] **PII stored in plain text** —
  - `User.email`, `firstName`, `lastName`, `phone` (`prisma/schema.prisma:71-79`).
  - `Lead.fullName`, `phoneNumber`, `telegramUsername`, `telegramFirstName`, `city` (`prisma/schema.prisma:304-323`).
  - `Ticket.email` (`prisma/schema.prisma:235`).
- [ ] **Refresh tokens stored plain text** — `RefreshToken.token` is the raw JTI (`prisma/schema.prisma:100-114`).
- [ ] **`trust proxy` hard-coded to `1`** — Misconfigured infra can let clients spoof `req.ip`, breaking rate limiting and logs (`src/index.ts:16`).
- [ ] **Bot webhook lacks rate/body limits** — If `webhookSecret` is unset, the endpoint is open and unthrottled (`src/bot/app.ts:65-79`).
- [ ] **PII in logs** — `errorHandler.ts:16` logs the full `err` object; bot error middleware logs `ctx.update` (`src/bot/middleware/error.middleware.ts:10`).
- [ ] **Super-admin bootstrap uses env defaults** — Weak local secrets can leak into deployed environments (`src/config/env.ts:36-49`).

## Recommended actions

- [ ] **1. Enable PostgreSQL Row-Level Security (RLS)**
  - Add policies on `users`, `orders`, `tickets`, `leads` tied to `current_setting('app.current_user_id')` or role.
  - Use Prisma middleware or a transaction wrapper to set the session variable.
  - Acceptance: direct SQL queries from a non-owner connection cannot read other tenants’ data.

- [ ] **2. Encrypt or tokenize PII at rest**
  - Use `pgcrypto` encrypted columns or an application-layer vault for `phoneNumber`, `fullName`, Telegram IDs, emails.
  - Return masked/anonymized data by default in non-admin list APIs.
  - Acceptance: DB dump reveals no usable PII.

- [ ] **3. Hash refresh-token JTIs**
  - Store `SHA-256(jti)` and compare hashes during refresh.
  - Acceptance: refresh tokens are unusable if DB is compromised.

- [ ] **4. Harden proxy trust and bot webhook**
  - Make `trust proxy` configurable via env and document reverse-proxy requirements.
  - Add body-size limit and per-IP rate limiting to `/webhook`.
  - Require `webhookSecret` in production.
  - Acceptance: bot webhook rejects oversized/unauthorized requests.

- [ ] **5. Redact PII from logs**
  - Configure Pino redaction for `password`, `token`, `phoneNumber`, `email`, `ctx.update.message.text`, etc.
  - Acceptance: no PII in logs during test error scenarios.

## Definition of done for this layer

- [ ] RLS policies exist and are tested for all tenant-scoped tables.
- [ ] PII columns are encrypted or tokenized.
- [ ] Refresh-token identifiers are hashed at rest.
- [ ] Production bot webhook requires a secret and is rate-limited.
- [ ] Logs redact sensitive fields.
- [ ] Score raised to **4/5** or higher.
