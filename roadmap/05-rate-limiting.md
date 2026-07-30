# Layer 5 — Rate Limiting

**Score:** 2 / 5  
**Status:** 🔴 Not Started  
**Owner:** Backend Architect, Security Architect

## Executive summary

Rate limiting exists for the Express API but is implemented in process memory, making it ineffective across replicas. The auth routes also define their own limiter that conflicts with the exported one, and the Telegram bot webhook has no rate limiting.

## Current state

### Strengths (with evidence)

- [x] `express-rate-limit` installed and configured (`src/middleware/rateLimit.ts:1-16`).
- [x] General API limiter applied to all `/api` routes (`src/index.ts:36`).
- [x] Auth routes have a dedicated limiter (`src/routes/auth.routes.ts:10-16`).

### Gaps / risks (with evidence)

- [ ] **In-memory counters** — `authRateLimiter` and `generalRateLimiter` store counters in the Node process. They do not coordinate across replicas or even across Node workers.
  - Evidence: `src/middleware/rateLimit.ts:3-15`.
  - Risk: an attacker can distribute requests across instances to bypass limits.
- [ ] **Conflicting auth limiters** — `rateLimit.ts` exports a 5-request/15-minute limiter, but auth routes use a 10-request/15-minute limiter.
  - Evidence: `src/routes/auth.routes.ts:10-16`.
- [ ] **No bot/webhook rate limiting** — `src/bot/app.ts:65-79` accepts webhook updates without throttling or IP allowlisting.
- [ ] **No per-user limits** — All limits are IP-based; authenticated users share the same bucket.
- [ ] **No burst or slow-down behavior** — Hard block after threshold; no graduated penalties.

## Recommended actions

- [ ] **1. Move rate limiting to Redis**
  - Use a Redis-backed store (e.g. `rate-limit-redis`) for all Express limiters.
  - Add a Redis service to `docker-compose.yml`.
  - Acceptance: limits are enforced consistently across two API replicas in local test.

- [ ] **2. Consolidate auth limiter configuration**
  - Remove the inline limiter in `auth.routes.ts`; import and configure `authRateLimiter` from `rateLimit.ts`.
  - Set stricter limits on `/login`, `/register`, `/refresh`.
  - Acceptance: one source of truth for auth rate limits.

- [ ] **3. Add bot webhook rate limiting**
  - Limit `/webhook` by IP and/or Telegram update ID window.
  - Return `429` for excessive requests.
  - Acceptance: webhook rejects bursts beyond configured threshold.

- [ ] **4. Add per-user rate limits for authenticated endpoints**
  - Use user ID in addition to IP for sensitive routes (lead export, admin actions).
  - Acceptance: authenticated users have their own buckets.

- [ ] **5. Configure graduated penalties**
  - Implement slow-down responses or longer windows after repeated violations.
  - Acceptance: repeated abuse triggers progressively longer lockouts.

## Definition of done for this layer

- [ ] Redis-backed rate limiting for all API routes.
- [ ] Single consolidated auth limiter.
- [ ] Bot webhook rate-limited.
- [ ] Per-user limits on sensitive endpoints.
- [ ] Score raised to **4/5** or higher.
