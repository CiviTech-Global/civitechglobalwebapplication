# Layer 8 — Cloud & Compute

**Score:** 2 / 5  
**Status:** 🔴 Not Started  
**Owner:** Cloud Security Architect, DevOps Engineer

## Executive summary

Services are containerized but there is no cloud provider integration, infrastructure-as-code, auto-scaling, or managed services. The setup is suitable for a single VM or local Docker, not a resilient cloud deployment.

## Current state

### Strengths (with evidence)

- [x] Containerized Node.js services with Alpine Linux images.
- [x] Multi-target server Dockerfile supports API and bot from one codebase.
- [x] Nginx frontend image ready for cloud hosting.

### Gaps / risks (with evidence)

- [ ] **No IaC** — No Terraform, Pulumi, CloudFormation, or ARM/Bicep templates.
- [ ] **No managed services** — Postgres is self-hosted in Compose; no managed DB, object storage, cache, or secret manager.
- [ ] **No auto-scaling** — No HPA, replica sets, or VM scale sets defined.
- [ ] **Image security gaps** — Base images pinned by tag only; no digest pinning, no distroless final stage, no CVE scanning in CI.
  - Evidence: `civitechglobal-server/Dockerfile:6,25,49`; `civitechglobal-web/Dockerfile:18`.
- [ ] **Web container runs as root** — `nginx:alpine` default; no `USER` directive.
- [ ] **No cost/usage controls** — No resource quotas, budget alerts, or tagging strategy.

## Recommended actions

- [ ] **1. Adopt infrastructure-as-code**
  - Create Terraform/Pulumi modules for network, compute, database, cache, and storage.
  - Store state remotely with locking.
  - Acceptance: entire production stack is reproducible from code.

- [ ] **2. Use managed services**
  - Managed PostgreSQL (RDS/Cloud SQL/Atlas), managed Redis/Valkey for cache and rate limits, object storage for uploads/backups.
  - Acceptance: no self-managed stateful services in production.

- [ ] **3. Harden container images**
  - Pin base images by digest, use distroless or non-root final stages, run Trivy/Grype scans in CI.
  - Acceptance: CI fails on high/critical CVEs.

- [ ] **4. Define scaling policies**
  - Add HPA/replica rules based on CPU/memory or request latency; configure min/max replicas.
  - Acceptance: services scale automatically under load.

- [ ] **5. Implement cost and security guardrails**
  - Resource requests/limits, budget alerts, mandatory resource tagging, and cloud IAM least privilege.
  - Acceptance: monthly cost alerts and IAM audit log enabled.

## Definition of done for this layer

- [ ] IaC deploys production environment.
- [ ] Managed DB, cache, and object storage in use.
- [ ] Container images scanned and non-root.
- [ ] Auto-scaling policies active.
- [ ] Score raised to **4/5** or higher.
