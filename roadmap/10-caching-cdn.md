# Layer 10 — Caching & CDN

**Score:** 2.5 / 5  
**Status:** 🟡 In Progress (Redis added for rate limits/lockouts; cache headers/CDN/query cache still missing)  
**Owner:** Backend Architect, DevOps Engineer

## Executive summary

There is no caching layer and no CDN. Failed-login lockouts live in process memory, API responses are not cached, and static assets are served directly from Nginx.

## Current state

### Strengths (with evidence)

- [x] **Redis infrastructure in place** — `ioredis` singleton with retry/disconnect logic; Redis service in Compose; health check verifies Redis (`src/config/redis.ts`, `docker-compose.yml`, `src/index.ts:54-60`).
- [x] **Redis-backed rate limiting** — `rate-limit-redis` store with auth/general limiters; shared across replicas (`src/middleware/rateLimit.ts`).
- [x] **Redis-backed failed-login lockout** — `login:failed:${email}` counters stored in Redis with TTL (`src/services/auth.service.ts:19-52`).
- [x] Nginx serves static build output (`civitechglobal-web/nginx.conf:24-29`).

### Gaps / risks (with evidence)

- [ ] **No HTTP caching headers** — No `Cache-Control`, `ETag`, or `Last-Modified` headers on API responses or static assets.
- [ ] **No CDN** — Static assets served directly from the origin.
- [ ] **Bot session still in-memory** — `src/bot/app.ts:23-29` uses grammY default `session()` with no Redis storage adapter.
- [ ] **No application-level query cache** — Dashboard/product/service list queries are not cached; no invalidation strategy.
- [ ] **No static-asset cache directives in Nginx** — `nginx.conf` has no `expires` or cache-busting headers.

## Recommended actions

- [x] **1. Add Redis for rate limits and lockouts**
  - Redis is used for rate-limit counters and failed-login lockouts.
  - Acceptance: two API replicas share rate-limit state correctly.

- [ ] **1b. Add Redis-backed bot session store**
  - Configure grammY session adapter backed by Redis.
  - Acceptance: bot session survives restart and replication.

- [ ] **2. Add HTTP caching headers**
  - Set `Cache-Control` for static assets (long-lived) and API responses (short/no-cache for dynamic data).
  - Use `ETag` for public content endpoints.
  - Acceptance: browser/network tools show expected cache headers.

- [ ] **3. Integrate a CDN**
  - Serve static assets and uploaded media through CloudFront/Cloudflare.
  - Use cache-busting filenames from Vite build.
  - Acceptance: assets load from CDN domain in production.

- [ ] **4. Cache expensive queries**
  - Cache lead dashboard counts, product/service lists, and site content.
  - Invalidate on relevant writes.
  - Acceptance: repeated read requests hit Redis instead of Postgres.

## Definition of done for this layer

- [x] Redis running in local environment.
- [ ] Rate limits and failed-login lockouts use Redis (done); bot sessions do not yet.
- [ ] Static assets served via CDN with cache headers.
- [ ] At least one API query result cached and invalidated correctly.
- [ ] Score raised to **4/5** or higher.
