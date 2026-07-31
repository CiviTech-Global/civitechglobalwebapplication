# Layer 11 — Load Balancing & Scaling

**Score:** 2.5 / 5  
**Status:** 🟡 In Progress (state externalized to Redis; no LB, replicas, queue, or bot session sharing yet)  
**Owner:** SRE, Backend Architect, DevOps Engineer

## Executive summary

The architecture is single-instance by default. There is no load balancer, ingress, or replica configuration. In-memory state (rate limits, failed logins) prevents safe horizontal scaling.

## Current state

### Strengths (with evidence)

- [x] Services are containerized and can theoretically be replicated.
- [x] Prisma singleton pattern helps avoid connection-pool exhaustion (`src/config/database.ts:5-8`).

### Gaps / risks (with evidence)

- [ ] **Single container per service** — `docker-compose.yml` defines one API, one bot, one web container.
- [ ] **No load balancer / ingress** — No Nginx/Traefik/Kubernetes ingress in front of API or bot.
- [x] **Redis-backed shared state** — Rate limiting and failed-login lockouts now use Redis, removing the main horizontal-scaling blocker.
  - Evidence: `src/middleware/rateLimit.ts`, `src/services/auth.service.ts:19-52`.
- [ ] **No replica definitions** — No `deploy.replicas`, HPA, or VM scale sets.
- [ ] **No connection-pool sizing for scale** — Prisma defaults may not handle many replicas.
- [ ] **No queue for background work** — Heavy operations run synchronously in API requests.
- [ ] **Bot still has local state** — In-memory grammY session prevents safe bot replication (`src/bot/app.ts:23-29`).
- [ ] **No load balancer / ingress** — No Nginx/Traefik/Kubernetes ingress in front of API or bot.

## Recommended actions

- [x] **1. Externalize state to Redis**
  - Rate limits and failed logins are now Redis-backed.
  - Acceptance: two API replicas behave consistently under abuse test.

- [ ] **1b. Externalize bot session to Redis**
  - Move grammY session storage to Redis.
  - Acceptance: bot replica behaves consistently across restarts.

- [ ] **2. Add a reverse proxy / ingress**
  - Deploy Nginx, Traefik, or an ALB/ingress controller in front of API and web.
  - Configure TLS termination and path-based routing.
  - Acceptance: traffic round-robins across multiple API replicas.

- [ ] **3. Define replica and scaling policies**
  - Add `deploy.replicas` or Kubernetes HPA based on CPU/memory/request latency.
  - Set min/max replicas.
  - Acceptance: services scale automatically under load test.

- [ ] **4. Tune Prisma connection pools**
  - Size pools based on replica count and managed DB connection limits.
  - Use connection pooling proxy (PgBouncer/Supavisor) if needed.
  - Acceptance: no connection exhaustion under load.

- [ ] **5. Introduce a background job queue**
  - Offload notifications, exports, and analytics to a worker queue (BullMQ/Redis).
  - Acceptance: long operations do not block API requests.

## Definition of done for this layer

- [x] Redis-backed shared state for rate limits and lockouts.
- [ ] Load balancer/ingress in place.
- [ ] Auto-scaling configured and tested.
- [ ] Prisma connection limits validated under load.
- [ ] Background job queue in use.
- [ ] Score raised to **4/5** or higher.
