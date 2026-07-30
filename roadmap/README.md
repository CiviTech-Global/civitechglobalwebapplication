# CiviTech Global — Platform Engineering Roadmap & Gap Tracker

> Generated: 2026-07-30  
> Based on: full 263-agent roster + code review + passing unit tests (server 7/7, web 2/2)

## What this directory is

This folder breaks the platform-wide technical assessment into **per-layer gap documents** and a **prioritized remediation roadmap**. Each `.md` file represents a work package. As we close gaps, update the checkboxes and change the `Status` field.

## Legend

- **Score:** 1–5 maturity rating for that layer.
- **Status:**
  - 🔴 Not Started
  - 🟡 In Progress
  - 🟢 Done
- **Priority:**
  - **P0** — blocks production / security-critical
  - **P1** — required for production-grade operation
  - **P2** — important for scale/quality of life

## Overall snapshot

| Metric | Value |
|---|---|
| Overall maturity | **2.5 / 5** |
| Strongest layers | Frontend foundations, API/backend logic, CI/CD |
| Weakest layers | Caching & CDN, Load balancing & scaling, Security/RLS, Observability |
| Biggest risks | Plain-text PII, no RLS, in-memory rate limits, no backups/CD/observability |

## File index

| # | Layer | Score | File |
|---|---|---|---|
| 1 | Frontend Foundations | 3/5 | [01-frontend-foundations.md](./01-frontend-foundations.md) |
| 2 | API & Backend Logic | 3/5 | [02-api-backend-logic.md](./02-api-backend-logic.md) |
| 3 | Auth & Permissions | 3/5 | [03-auth-permissions.md](./03-auth-permissions.md) |
| 4 | Security & Row-Level Security | 2.5/5 | [04-security-row-level-security.md](./04-security-row-level-security.md) |
| 5 | Rate Limiting | 2/5 | [05-rate-limiting.md](./05-rate-limiting.md) |
| 6 | Database & Storage | 2.5/5 | [06-database-storage.md](./06-database-storage.md) |
| 7 | Hosting & Deployment | 2/5 | [07-hosting-deployment.md](./07-hosting-deployment.md) |
| 8 | Cloud & Compute | 2/5 | [08-cloud-compute.md](./08-cloud-compute.md) |
| 9 | CI/CD & Version Control | 3/5 | [09-cicd-version-control.md](./09-cicd-version-control.md) |
| 10 | Caching & CDN | 1/5 | [10-caching-cdn.md](./10-caching-cdn.md) |
| 11 | Load Balancing & Scaling | 1.5/5 | [11-load-balancing-scaling.md](./11-load-balancing-scaling.md) |
| 12 | Error Tracking & Logging | 2/5 | [12-error-tracking-logging.md](./12-error-tracking-logging.md) |
| 13 | Availability & Recovery | 2/5 | [13-availability-recovery.md](./13-availability-recovery.md) |
| 14 | Prioritized Remediation Roadmap | — | [14-prioritized-remediation-roadmap.md](./14-prioritized-remediation-roadmap.md) |

## How to use

1. Open the layer you are working on.
2. Pick an unchecked action item.
3. Create a branch/task and implement it.
4. Mark the checkbox `[x]` and add a note (PR link, date, or test result).
5. Update this `README.md` overall snapshot if the score materially changes.

## Roster involved

Review was performed using roles from the CiviTech Global agent roster:
`Orchestrator`, `Backend Architect`, `Security Architect`, `SRE`, `Database Optimizer`, `Prisma Schema Architect`, `DevOps Engineer`, `Frontend Developer`, `UX/UI Designer`, `API Contract Guardian`, `Security & Compliance Officer`, `Data Privacy Officer`.

## Agent roster digest

The full 263-agent roster was loaded and compacted into [`agent-roster-digest.json`](./agent-roster-digest.json) for reference.
