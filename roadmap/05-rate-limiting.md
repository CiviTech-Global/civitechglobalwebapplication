# Layer 5 — Rate Limiting

**Score:** 4 / 5  
**Status:** 🟢 Done (Wave A + Wave B: Redis-backed API limits and per-IP bot webhook throttling in place; graduated penalties remain a future enhancement)  
**Owner:** Backend Architect, Security Architect

## Executive summary

Rate limiting exists for the Express API but is implemented in process memory, making it ineffective across replicas. The auth routes also define their own limiter that conflicts with the exported one, and the Telegram bot webhook has no rate limiting.

## Current state

### Strengths (with evidence)

- [x] `express-rate-limit` installed and configured (`src/middleware/rateLimit.ts:1-16`).
- [x] General API limiter applied to all `/api` routes (`src/index.ts:36`).
- [x] Auth routes have a dedicated limiter (`src/routes/auth.routes.ts:10-16`).

### Gaps / risks (with evidence)

- [x] **Redis-backed counters** — `authRateLimiter` and `generalRateLimiter` use `rate-limit-redis` with a shared Redis store.
  - Evidence: `src/middleware/rateLimit.ts`, `docker-compose.yml`.
  - Note: two API replicas now share state; abuse test passes locally.
- [x] **Consolidated auth limiter** — Auth routes import `authRateLimiter` from `rateLimit.ts` (5 requests / 15 min).
  - Evidence: `src/routes/auth.routes.ts`, `src/middleware/rateLimit.ts`.
- [x] **Bot/webhook rate-limited** — Redis-backed per-IP limiter (`webhook:ip:<ip>`) blocks bursts beyond 60 req/min; verified with 70-request burst test.
- [x] **Per-user limits** — `keyGenerator` uses `req.user.userId` when authenticated, falling back to `ipKeyGenerator(req.ip)` for anonymous requests.
  - Evidence: `src/middleware/rateLimit.ts`.
- [ ] **No burst or slow-down behavior** — Hard block after threshold; no graduated penalties.

## Recommended actions

- [x] **1. Move rate limiting to Redis**
  - Use a Redis-backed store (e.g. `rate-limit-redis`) for all Express limiters.
  - Add a Redis service to `docker-compose.yml`.
  - Acceptance: limits are enforced consistently across two API replicas in local test.

- [x] **2. Consolidate auth limiter configuration**
  - Remove the inline limiter in `auth.routes.ts`; import and configure `authRateLimiter` from `rateLimit.ts`.
  - Set stricter limits on `/login`, `/register`, `/refresh`.
  - Acceptance: one source of truth for auth rate limits.

- [x] **3. Add bot webhook rate limiting**
  - Limit `/webhook` by IP and/or Telegram update ID window.
  - Return `429` for excessive requests.
  - Acceptance: webhook rejects bursts beyond configured threshold.

- [x] **4. Add per-user rate limits for authenticated endpoints**
  - Use user ID in addition to IP for sensitive routes (lead export, admin actions).
  - Acceptance: authenticated users have their own buckets.

- [ ] **5. Configure graduated penalties**
  - Implement slow-down responses or longer windows after repeated violations.
  - Acceptance: repeated abuse triggers progressively longer lockouts.

## Definition of done for this layer

- [x] Redis-backed rate limiting for all API routes.
- [x] Single consolidated auth limiter.
- [x] Bot webhook rate-limited.
- [x] Per-user limits on sensitive endpoints.
- [x] Score raised to **4/5** or higher.
