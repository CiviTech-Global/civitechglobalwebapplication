# Layer 4 — Security & Row-Level Security (RLS)

**Score:** 4 / 5  
**Status:** 🟢 Done (Wave A + Wave B complete: RLS, PII encryption, webhook hardening, log redaction)  
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

- [x] **PostgreSQL RLS enabled and forced** — Policies on `users`, `orders`, `tickets`, `order_items`, `ticket_messages`, `opportunity_applications`, and `refresh_tokens`; `FORCE ROW LEVEL SECURITY` prevents owner bypass. Verified with a non-owner test role.
- [x] **PII encrypted at rest with search hashes** — AES-256-GCM encryption in application layer; deterministic HMAC-SHA256 hashes on `email_hash`, `phone_hash`, `phone_number_hash`, and `ticket.email_hash` allow login/lookup without leaking plaintext.
- [x] **Refresh-token JTIs hashed at rest** — `auth.service.ts` stores `SHA-256(jti)` in `RefreshToken.token`; the Wave A migration cleared legacy raw tokens.
  - Evidence: `src/services/auth.service.ts:23-25`, `prisma/migrations/20260730080000_hash_refresh_tokens/migration.sql`.
- [x] **`trust proxy` configurable via `TRUST_PROXY` env var** — Express reads `TRUST_PROXY` (number, IPs, or boolean); defaults to 1 for single-proxy local setups (`src/index.ts`, `src/config/env.ts`).
- [x] **Bot webhook hardened** — 1 MB body limit, `TELEGRAM_WEBHOOK_SECRET` required in production, and Redis-backed per-IP rate limiting (60/min) verified with a 70-request burst test.
- [x] **PII redacted from logs** — Pino redacts `password`, `token`, `refreshToken`, `email`, `phone`, `phoneNumber`, `ctx.update.message.text`, and request-body fields; error handlers log only names/messages.
- [x] **Super-admin bootstrap requires explicit credentials** — `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_FIRST_NAME`, and `ADMIN_LAST_NAME` have no code defaults; seed script validates them (`src/config/env.ts`, `prisma/seed.ts`).

## Recommended actions

- [x] **1. Enable PostgreSQL Row-Level Security (RLS)**
  - Add policies on `users`, `orders`, `tickets`, `leads` tied to `current_setting('app.current_user_id')` or role.
  - Use Prisma middleware or a transaction wrapper to set the session variable.
  - Acceptance: direct SQL queries from a non-owner connection cannot read other tenants’ data.

- [x] **2. Encrypt or tokenize PII at rest**
  - Use `pgcrypto` encrypted columns or an application-layer vault for `phoneNumber`, `fullName`, Telegram IDs, emails.
  - Return masked/anonymized data by default in non-admin list APIs.
  - Acceptance: DB dump reveals no usable PII.

- [x] **3. Hash refresh-token JTIs**
  - Store `SHA-256(jti)` and compare hashes during refresh.
  - Acceptance: refresh tokens are unusable if DB is compromised.

- [x] **4. Harden bot webhook**
  - Add body-size limit and per-IP rate limiting to `/webhook`.
  - Require `webhookSecret` in production.
  - Acceptance: bot webhook rejects oversized/unauthorized requests.
- [x] **4b. Make proxy trust configurable**
  - Make `trust proxy` configurable via env and document reverse-proxy requirements.
  - Acceptance: `src/index.ts` does not hard-code `trust proxy`.

- [x] **5. Redact PII from logs**
  - Configure Pino redaction for `password`, `token`, `phoneNumber`, `email`, `ctx.update.message.text`, etc.
  - Acceptance: no PII in logs during test error scenarios.

## Definition of done for this layer

- [x] RLS policies exist and are tested for all tenant-scoped tables.
- [x] PII columns are encrypted or tokenized.
- [x] Refresh-token identifiers are hashed at rest.
- [x] Production bot webhook requires a secret and is rate-limited.
- [x] Logs redact sensitive fields.
- [x] `trust proxy` is configurable.
- [x] Super-admin bootstrap secrets are not env defaults.
- [x] Score raised to **4/5** or higher.
