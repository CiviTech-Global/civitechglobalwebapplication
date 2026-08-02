# Prioritized Remediation Roadmap

> Cross-layer action plan. Update status and add notes as items are completed.

## Legend

- **P0** — Security/critical; blocks production.
- **P1** — Required for production-grade operation.
- **P2** — Important for scale, quality of life, and maintainability.

---

## P0 — Security & Data Protection

| # | Layer | Gap | Action | Acceptance Criteria | Effort | Status |
|---|---|---|---|---|---|---|
| 1 | Security/RLS | No database-level access control | Enable PostgreSQL RLS policies on tenant-scoped tables | Direct SQL queries from non-owner connection blocked | M | 🟢 |
| 2 | Security/DB | PII stored in plain text | Encrypt/tokenize phone, email, names, Telegram IDs; mask in list APIs | DB dump reveals no usable PII | L | 🟢 |
| 3 | Rate Limiting | In-memory rate limits break scaling | Move all rate limiting to Redis | Two API replicas share state; abuse test passes | M | 🟢 |
| 4 | Auth | Deleted users can still use tokens | Harden `authenticate.ts` to check `deletedAt` and `tokenVersion` | Deleted users receive `401` on protected endpoints | S | 🟢 |
| 5 | Availability | Health checks are shallow | Add `/ready` and `/live` endpoints verifying DB connectivity | Orchestrator detects DB outage correctly | S | 🟢 |

## P1 — Production Readiness

| # | Layer | Gap | Action | Acceptance Criteria | Effort | Status |
|---|---|---|---|---|---|---|
| 6 | Auth | `optionalAuth` bypasses revocation | Apply token-version and account-status checks | Revoked tokens fail on optional routes | S | 🟢 |
| 7 | Auth | `requirePermission` ignores non-admin permissions | Make permission check role-agnostic with DB fallback | USER with explicit permissions can access permitted resources | S | 🟢 |
| 8 | Auth | Weak password policy | Enforce 12+ chars, complexity, max length; align seed/demo/generated credentials | Zod rejects weak passwords; seed/demo/admin passwords are policy-compliant | S | 🟢 |
| 9 | Auth/DB | Refresh tokens stored plain text | Hash JTIs with SHA-256 before DB storage | DB dump does not reveal usable refresh tokens | S | 🟢 |
| 10 | Hosting | No CD or production manifests | Create `.github/workflows/cd.yml` and `docker-compose.prod.yml` | Merge to `main` deploys staging | M | 🟢 |
| 11 | Hosting | Web image bakes API target | Inject API URL at runtime; make image environment-agnostic | One web image deploys to dev/staging/prod | M | 🟢 |
| 12 | Hosting | Secrets in `.env` only | Externalize secrets (Docker Secrets / Vault / cloud secret manager) | No secrets in repo or CI logs | M | 🟡 |
| 13 | Logging | No centralized logs or correlation IDs | Add `pino-http`, request IDs, central log shipping | Logs searchable by request ID | M | 🟢 |
| 14 | Logging/Error | No crash tracking or metrics | Integrate Sentry + Prometheus `/metrics` | Alerts fire on error-rate threshold | M | 🟢 |
| 15 | DB | No backup/DR | Automate daily backups; document RTO/RPO; test restore | Restore tested successfully | M | 🟡 |
| 16 | DB | Hard deletes exist despite soft-delete field | Replace hard delete with `deletedAt` update | No production `DELETE FROM users` | S | 🟢 |
| 17 | Frontend | Forms not using installed validation libraries | Migrate all forms to `react-hook-form` + `zod` | All user input validated by Zod | M | 🟢 |
| 18 | Frontend | Minimal test coverage | Add component/integration tests | ≥ 60% coverage on components/auth pages | M | 🟢 |
| 19 | Availability | No Docker HEALTHCHECK | Add HEALTHCHECK to Dockerfiles and use `service_healthy` | Unhealthy containers auto-restart | S | 🟢 |

## P2 — Scale, Quality & Maintainability

| # | Layer | Gap | Action | Acceptance Criteria | Effort | Status |
|---|---|---|---|---|---|---|
| 20 | Frontend | Duplicate UI variants | Consolidate navbars, footers, buttons | One component per abstraction | S | 🔴 |
| 21 | Frontend | No code splitting | Lazy-load admin routes and 3D globe | Reduced initial bundle | S | 🔴 |
| 22 | Frontend | Accessibility gaps | Add ARIA attributes, keyboard handling, localized ErrorBoundary | Pass axe-core scan | M | 🔴 |
| 23 | API | Repository pattern incomplete | Add repositories for all entities | Services do not import Prisma directly | M | 🔴 |
| 24 | API | Typed query DTOs missing | Validate all list/query params with Zod | All list endpoints validate query input | S | 🔴 |
| 25 | API | Error logs may contain PII | Configure Pino redaction | No PII in test error logs | S | 🟢 |
| 26 | Security | Bot webhook unthrottled | Add body-size and per-IP rate limits on `/webhook` | Webhook rejects bursts | S | 🟢 |
| 27 | Caching/CDN | No cache/CDN | Add Redis cache, HTTP cache headers, CDN for static assets | Assets served from CDN | M | 🔴 |
| 28 | LB/Scaling | Single-instance | Add ingress/LB, replicas, auto-scaling policies | Load test scales automatically | L | 🔴 |
| 29 | Cloud | No IaC | Adopt Terraform/Pulumi for production infrastructure | Stack reproducible from code | L | 🔴 |
| 30 | CI/CD | No image scanning/signing | Add Trivy/Grype scans and cosign signing | CI fails on high CVEs; images signed | S | 🔴 |
| 31 | Availability | No incident response runbook | Document severity, escalation, rollback, comms | Runbook published and reviewed | S | 🔴 |

---

## Suggested implementation order

1. **Sprint 0 — Security foundation**  
   P0 items: RLS, PII encryption. (Redis rate limits, auth hardening, and deep health checks are now complete.)
2. **Sprint 1 — Production deployment**  
   P1 items: CD, environment-agnostic web image, secrets management, backups.
3. **Sprint 2 — Observability**  
   P1 items: logging/correlation IDs, Sentry, Prometheus metrics, SLOs.
4. **Sprint 3 — Frontend hardening**  
   P1/P2 items: form validation, tests, component consolidation, accessibility.
5. **Sprint 4 — Scale & quality**  
   P2 items: CDN, caching, load balancing, IaC, image scanning, runbooks.
