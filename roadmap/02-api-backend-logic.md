# Layer 2 — API & Backend Logic

**Score:** 3 / 5  
**Status:** 🟡 In Progress (structure solid; repository/DTO/contract work still open)  
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

- [ ] **Repository pattern inconsistency** — Only insurance and lead repositories exist (`src/database/prisma/repositories/*.ts`); `user.service.ts`, `order.service.ts`, etc. call Prisma directly.
- [ ] **Client-side filtering caused by API design** — Product edit form fetches all products (`limit=100`) and filters client-side instead of a single-resource endpoint.
  - Evidence: `ProductFormPage.tsx:40-42`.
- [ ] **Manual query parsing** — `lead.service.ts:getAllLeads` parses `page`, `limit`, and `status` manually instead of using a typed DTO.
- [x] **Error logs redacted for PII** — Pino redacts `password`, `token`, `refreshToken`, `email`, `phone`, `phoneNumber`, and request-body fields; error handlers log only names/messages.
  - Evidence: `src/config/logger.ts`, `src/middleware/errorHandler.ts`.
- [ ] **Validation middleware is body-only** — `validate.ts` only parses `req.body`; query params and route params are not validated, enabling the manual parsing gaps above.
  - Evidence: `src/middleware/validate.ts:7`.
- [ ] **Dead dependency** — `fastify` is listed in `package.json` but the API is Express-only; the bot uses Fastify separately.
  - Evidence: `civitechglobal-server/package.json:42`.
- [ ] **Sensitive credential returned in admin creation response** — `createAdmin` returns the generated plaintext password in the API payload.
  - Evidence: `src/services/user.service.ts:173`.
- [ ] **No API contract tests** — No OpenAPI spec or generated client; frontend and backend types are manually kept in sync.

## Recommended actions

- [ ] **1. Complete the repository layer**
  - Add repositories for `User`, `Order`, `Ticket`, `Product`, `Service`, `Opportunity`, `SiteContent`.
  - Refactor services to depend on repositories, not Prisma directly.
  - Acceptance: no service file imports `prisma` except through repositories.

- [ ] **2. Introduce typed query DTOs**
  - Define Zod schemas for list/query params (pagination, filters, sorting).
  - Apply `validate` middleware to list routes.
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

- [ ] All services use repositories.
- [ ] All query params are validated by Zod.
- [ ] Error logs are PII-free.
- [ ] API contract spec exists and is kept up-to-date.
- [ ] Score raised to **4/5** or higher.
