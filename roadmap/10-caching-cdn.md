# Layer 10 — Caching & CDN

**Score:** 1 / 5  
**Status:** 🔴 Not Started  
**Owner:** Backend Architect, DevOps Engineer

## Executive summary

There is no caching layer and no CDN. Failed-login lockouts live in process memory, API responses are not cached, and static assets are served directly from Nginx.

## Current state

### Strengths (with evidence)

- [x] Nginx serves static build output (`civitechglobal-web/nginx.conf:24-29`).

### Gaps / risks (with evidence)

- [ ] **No distributed cache** — Failed-login lockouts are an in-memory `Map` (`src/services/auth.service.ts:17-18`); lost on restart, not shared across replicas.
- [ ] **No HTTP caching** — No `Cache-Control`, `ETag`, or `Last-Modified` headers on API responses or static assets.
- [ ] **No CDN** — Static assets served directly from the origin.
- [ ] **No session/cache backing for bot** — Bot session is in-memory via grammY defaults.
- [ ] **No cache invalidation strategy** — Because no cache exists.

## Recommended actions

- [ ] **1. Add Redis**
  - Introduce Redis to Docker Compose and production manifests.
  - Use it for rate-limit counters, failed-login lockouts, and bot session store.
  - Acceptance: two API replicas share rate-limit state correctly.

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

- [ ] Redis running in all environments.
- [ ] Rate limits and bot sessions use Redis.
- [ ] Static assets served via CDN with cache headers.
- [ ] At least one API query result cached and invalidated correctly.
- [ ] Score raised to **4/5** or higher.
