# Layer 7 — Hosting & Deployment

**Score:** 3.5 / 5  
**Status:** 🟡 In Progress (CD, production manifests, runtime-configurable web image, Docker Secrets support, and non-root Nginx added; cloud secrets manager and live deployment still pending)  
**Owner:** DevOps Engineer, SRE

## Executive summary

The project has a working containerized local stack and solid CI, but no continuous delivery or production deployment manifests. The current setup is developer-centric and not ready for hosted production workloads.

## Current state

### Strengths (with evidence)

- [x] **Docker Compose local stack** — Postgres + API + Bot + Web with `depends_on` conditions and Postgres healthcheck (`docker-compose.yml:1-59`).
- [x] **Multi-stage server build** — `node:22-alpine`, separate `base`/`build`/`api`/`bot` targets, non-root `appuser` (`civitechglobal-server/Dockerfile:1-68`).
- [x] **Nginx frontend with TLS hardening** — HTTPS redirect, TLS 1.2/1.3, strong ciphers, HSTS, security headers, SPA fallback (`civitechglobal-web/nginx.conf:1-42`).
- [x] **Graceful API shutdown** — Handles `SIGTERM`/`SIGINT` (`src/index.ts:47-56`).
- [x] **CI builds Docker images** — `.github/workflows/ci.yml:124-158` builds API, bot, and web images with GHA cache.
- [x] **Docker HEALTHCHECKs added** — API, bot, and web images define `HEALTHCHECK`; Compose uses `condition: service_healthy`.
- [x] **Optional Docker Postgres** — Compose `depends_on` for Postgres is `required: false`, so local dev can use an existing pgAdmin4 Postgres on the host.

### Gaps / risks (with evidence)

- [x] **CD pipeline added** — `.github/workflows/cd.yml` builds and pushes images on merge to `main`; `docker-compose.prod.yml` provides production orchestration.
- [x] **Production Compose hardened** — `docker-compose.prod.yml` adds restart policies, resource limits, custom bridge network, log rotation, and Docker Secrets volumes.
- [x] **Frontend image is environment-agnostic** — `entrypoint.sh` injects `API_BASE_URL` at runtime; `nginx.conf` is templated so one image deploys to dev/staging/prod.
- [x] **Docker Secrets support added** — `docker-entrypoint.sh` reads secrets from `/run/secrets/` and falls back to env vars; root `.env.example` added.
- [x] **Web container runs as non-root** — Custom `nginx.conf` uses unprivileged port 8080 and `USER nginx`.
- [ ] **No cloud secrets manager integration** — Docker Secrets are supported, but no Vault/AWS Secrets Manager/Azure Key Vault integration yet.
- [ ] **Live deployment not verified** — Production manifest validates with `docker-compose config`, but no actual host/Orchestrator has run it.
- [ ] **Port mapping mismatch** — Web service maps host `5173` → container `80`, coupling local-dev port to production Nginx config (`docker-compose.yml:53-54`).

## Recommended actions

- [x] **1. Add continuous deployment**
  - Created `.github/workflows/cd.yml` and `docker-compose.prod.yml`.
  - Acceptance: merge to `main` builds and pushes images.

- [x] **2. Make the web image environment-agnostic**
  - Runtime `API_BASE_URL` injection via `entrypoint.sh` and Nginx templating.
  - Acceptance: one web image deploys to dev/staging/prod unchanged.

- [x] **3. Harden Compose for production**
  - Added restart policies, resource limits, custom bridge network, log rotation, and Docker Secrets.
  - Acceptance: production Compose passes a security baseline review.

- [x] **4. Externalize secrets (baseline)**
  - Added root `.env.example` and Docker Secrets support via `docker-entrypoint.sh`.
  - Acceptance: no secrets required in image; secrets mountable at runtime.

- [x] **5. Non-root web container**
  - Nginx runs as `nginx` user on port 8080.
  - Acceptance: container does not run as root.

## Definition of done for this layer

- [x] CD pipeline deploys images on merge.
- [x] Production deployment manifests committed.
- [x] Web image environment-agnostic.
- [x] Docker Secrets / env separation in place.
- [x] Web container runs as non-root.
- [ ] Live staging deployment verified.
- [ ] Score raised to **4/5** or higher.
