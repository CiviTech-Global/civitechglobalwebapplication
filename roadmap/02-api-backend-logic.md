# Layer 2 — API & Backend Logic

**Score:** 4 / 5  
**Status:** 🟢 Mostly complete (repository layer and typed DTOs done; client-side filtering and API contract docs remain)  
**Owner:** Backend Architect, Senior Backend Developer

## Executive summary

The API is a well-structured Express application with route/service separation, Zod validation, and centralized error handling. Business logic is mostly clean, but the repository pattern is inconsistently applied and some endpoints force client-side filtering.

## Current state

### Strengths (with evidence)

- [x] **Layered architecture** — Routes are thin; controllers/services hold business logic (`src/routes/index.ts`, `src/services/*.ts`).
- [x] **Validation & sanitization** — `validate.ts` uses Zod `safeParse` and runs `sanitizeObject` to HTML-escape strings, mitigating stored XSS (`src/middleware/validate.ts:5-18`).
- [x] **Centralized error handling** — `errorHandler.ts` distinguishes `AppError`, validation errors, and JWT errors (`src/middleware/errorHandler.ts:15-52`).
- [x] **Consistent controller pattern** — Controllers uniformly use `try { ... } catch (error) { next(error); }`.
- [x] **Security headers & body limits** — `helmet` with HSTS, CORS allow-list, 1 MB JSON/urlencoded limits (`src/index.ts:19-28`).
- [x] **Structured logging** — Pino with production/dev transports (`src/config/logger.ts:5-12`).

### Gaps / risks (with evidence)

- [x] **Repository pattern inconsistency** — Repositories now exist for `User`, `Order`, `Ticket`, `Product`, `Service`, `Opportunity`, `SiteContent`, `RefreshToken`, `Lead`, and admin roles. Core services consume repositories instead of importing `prisma` directly (`src/database/prisma/repositories/*.ts`).
- [ ] **Client-side filtering caused by API design** — Product edit form fetches all products (`limit=100`) and filters client-side instead of a single-resource endpoint.
  - Evidence: `ProductFormPage.tsx:40-42`.
- [x] **Manual query parsing replaced by typed DTOs** — All list endpoints now use Zod query DTOs; services receive typed inputs.
- [x] **Error logs redacted for PII** — Pino redacts `password`, `token`, `refreshToken`, `email`, `phone`, `phoneNumber`, and request-body fields; error handlers log only names/messages.
  - Evidence: `src/config/logger.ts`, `src/middleware/errorHandler.ts`.
- [x] **Validation middleware supports body, query, and params** — `validate.ts` now accepts `{ body, query, params }` schemas and parses/sanitizes each target (`src/middleware/validate.ts`).
  - Evidence: `src/middleware/validate.ts:7`.
- [x] **Dead dependency verified** — `fastify` is required by the Telegram bot (`src/bot/app.ts`, `src/bot/middleware/webhookRateLimit.ts`), so it is not a dead dependency.
  - Evidence: `civitechglobal-server/package.json:42`, `src/bot/app.ts:1`.
- [x] **Sensitive credential removed from admin creation response** — `createAdmin` now requires the creator to supply a strong password, hashes it, and no longer returns any plaintext credential in the API payload.
  - Evidence: `src/services/user.service.ts:136`, `src/validators/user.schema.ts:31`.
- [ ] **No API contract tests** — No OpenAPI spec or generated client; frontend and backend types are manually kept in sync.

## Recommended actions

- [x] **1. Complete the repository layer**
  - Added repositories for `User`, `Order`, `Ticket`, `Product`, `Service`, `Opportunity`, `SiteContent`, `RefreshToken`, `Lead`, and admin roles.
  - Refactored core services to depend on repositories instead of `prisma` directly.
  - Acceptance: no runtime service file imports `prisma` except the seed/demo helper.

- [x] **2. Introduce typed query DTOs**
  - Shared `paginationQuerySchema`, `uuidParamSchema`, and `slugParamSchema` in `src/validators/common.schema.ts`.
  - Query/param DTOs wired for users, products, services, opportunities, orders, tickets, and leads.
  - `validate` middleware supports `{ body, query, params }` and is applied to list/detail routes.
  - Acceptance: all list endpoints validate and type query parameters.

- [ ] **3. Add single-resource endpoints where missing**
  - Ensure `GET /products/:slug` and `GET /services/:slug` are used by edit forms instead of fetching all records.
  - Acceptance: no admin form fetches a full collection to select one item.

- [ ] **4. Redact request bodies from logs**
  - Configure Pino redaction for `password`, `token`, `phoneNumber`, `email`, etc.
  - Acceptance: error logs contain no PII in test scenarios.

- [ ] **5. Add API contract documentation**
  - Generate an OpenAPI spec (e.g. via `openapi-typescript` + route comments or Zod-to-OpenAPI).
  - Acceptance: published `/api/docs` endpoint or committed `openapi.yml`.

## Definition of done for this layer

- [x] All services use repositories. (`demo-data.service.ts` still uses `prisma` directly because it coordinates multi-model transactions; it is treated as a seed/demo helper.)
- [x] All query params are validated by Zod.
- [ ] Error logs are PII-free.
- [ ] API contract spec exists and is kept up-to-date.
- [ ] Score raised to **4/5** or higher.
