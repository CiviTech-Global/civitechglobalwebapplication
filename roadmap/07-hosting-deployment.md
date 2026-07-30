# Layer 7 — Hosting & Deployment

**Score:** 2 / 5  
**Status:** 🔴 Not Started  
**Owner:** DevOps Engineer, SRE

## Executive summary

The project has a working containerized local stack and solid CI, but no continuous delivery or production deployment manifests. The current setup is developer-centric and not ready for hosted production workloads.

## Current state

### Strengths (with evidence)

- [x] **Docker Compose local stack** — Postgres + API + Bot + Web with `depends_on` conditions and Postgres healthcheck (`docker-compose.yml:1-59`).
- [x] **Multi-stage server build** — `node:22-alpine`, separate `base`/`build`/`api`/`bot` targets, non-root `appuser` (`civitechglobal-server/Dockerfile:1-68`).
- [x] **Nginx frontend with TLS hardening** — HTTPS redirect, TLS 1.2/1.3, strong ciphers, HSTS, security headers, SPA fallback (`civitechglobal-web/nginx.conf:1-42`).
- [x] **Graceful API shutdown** — Handles `SIGTERM`/`SIGINT` (`src/index.ts:47-56`).
- [x] **CI builds Docker images** — `.github/workflows/ci.yml:113-147` builds API, bot, and web images with GHA cache.

### Gaps / risks (with evidence)

- [ ] **No CD pipeline** — `.github/workflows/` only contains `ci.yml`; no deployment on merge.
- [ ] **Dev-oriented Docker Compose** — No restart policies, resource limits, replicas, logging driver, or secrets volumes.
- [ ] **Frontend image bakes API target** — `nginx.conf:31-32` hard-codes `proxy_pass http://api:5000`; web image cannot be reused across environments without rebuild.
- [ ] **No externalized secrets management** — `.env` files are the only mechanism; root `.env` exists and is untracked.
- [ ] **No migration safety / backup** — `docker-compose.yml:30-31` runs `prisma migrate deploy` on startup with no rollback or backup job.
- [ ] **Web container runs as root** — `nginx:alpine` defaults to root; no `USER` directive.
- [ ] **Port mapping mismatch** — Web service maps host `5173` → container `80`, coupling local-dev port to production Nginx config (`docker-compose.yml:53-54`).

## Recommended actions

- [ ] **1. Add continuous deployment**
  - Create `.github/workflows/cd.yml` to push images to a registry (GHCR/ECR/ACR/GCR).
  - Add deployment manifests: `docker-compose.prod.yml` or Kubernetes manifests/Helm.
  - Acceptance: merge to `main` deploys to staging automatically.

- [ ] **2. Make the web image environment-agnostic**
  - Inject API base URL at runtime via env substitution in Nginx or use a separate reverse proxy/ingress.
  - Acceptance: one web image deploys to dev/staging/prod unchanged.

- [ ] **3. Harden Compose for production**
  - Add `restart: unless-stopped`, resource limits, custom bridge network, log rotation, and Docker Secrets / env-file separation.
  - Acceptance: production Compose passes a security baseline review.

- [ ] **4. Externalize secrets**
  - Remove root `.env`; add root `.env.example`. Use Docker Secrets, Vault, or cloud secret stores in production.
  - Acceptance: no secrets in repo or CI logs.

- [ ] **5. Non-root web container**
  - Run Nginx as non-root (`USER nginx` or custom uid) and adjust port to unprivileged (e.g. 8080).
  - Acceptance: container does not run as root.

## Definition of done for this layer

- [ ] CD pipeline deploys to staging on merge.
- [ ] Production deployment manifests committed.
- [ ] Web image environment-agnostic.
- [ ] Secrets externalized.
- [ ] Web container runs as non-root.
- [ ] Score raised to **4/5** or higher.
