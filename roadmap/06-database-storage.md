# Layer 6 — Database & Storage

**Score:** 3.5 / 5  
**Status:** 🟡 In Progress (RLS + PII encryption + global soft-delete middleware + backup/retention scripts; restore still untested)  
**Owner:** Database Optimizer, Prisma Schema Architect, Data Privacy Officer

## Executive summary

The PostgreSQL/Prisma schema is coherent and recently improved (soft deletes, token versioning, refresh-token indexes). However, it lacks RLS, PII encryption, a consistent repository pattern, and any backup/DR strategy.

## Current state

### Strengths (with evidence)

- [x] **CUID primary keys & consistent naming** — All models use `@id @default(cuid())` and `@@map` snake_case table names (`prisma/schema.prisma:58-324`).
- [x] **Enums** — Controlled vocabularies for roles, statuses, priorities, etc. (`prisma/schema.prisma:10-56`).
- [x] **Soft-delete field on users** — `deletedAt` added via migration (`prisma/schema.prisma:85`).
- [x] **Token revocation strategy** — `tokenVersion` on `User`; `RefreshToken` has `revokedAt` and `expiresAt`; JTIs are now SHA-256 hashed at rest (`prisma/schema.prisma:82`, `:100-114`; `src/services/auth.service.ts:23-25`).
- [x] **Indexes** — Role, createdAt, deletedAt on `User`; token/userId/expiresAt on `RefreshToken`.
- [x] **Unique constraints** — `@@unique([userId, opportunityId])`, `@@unique([categoryId, title])`.
- [x] **Seed credentials from env** — `prisma/seed.ts:9-30` refuses to run if required passwords are missing.
- [x] **Password hashing in seed** — `bcrypt.hash(..., 12)` (`prisma/seed.ts:60`).
- [x] **Prisma singleton** — Reuses client in dev to avoid connection-pool exhaustion (`src/config/database.ts:5-8`).

### Gaps / risks (with evidence)

- [x] **RLS enabled and forced** — Policies on tenant-scoped tables; `FORCE ROW LEVEL SECURITY` prevents owner bypass. Verified with a non-owner test role.
- [x] **PII encrypted at rest** — AES-256-GCM application-layer encryption with deterministic HMAC-SHA256 search hashes; backfilled existing rows via `scripts/backfill-pii.ts`.
- [x] **Seed no longer logs PII** — Seeded emails/names are encrypted and not printed to stdout.
- [x] **Global soft-delete middleware added** — `src/config/database.ts` intercepts `find*`, `update`, `delete`, and `count` for `User`, `Product`, `Service`, `Opportunity`, and `AdminRole`, filtering on `deletedAt` unless bypassed by `SYSTEM` role.
- [ ] **Some services may still issue hard deletes** — Review remaining `prisma.*.delete` calls (e.g. `user.service.ts`) to ensure they are caught by the middleware or converted to explicit soft deletes.
- [ ] **Cascade deletes risk data loss** — `User` deletion cascades to orders, tickets, applications, refresh tokens (`prisma/schema.prisma:88-92`); no archive table.
- [ ] **Missing composite/search indexes** — No `(userId, createdAt)`, full-text search, or `(status, createdAt)` for dashboards.
- [ ] **Repository pattern incomplete** — Only insurance/lead repositories exist; most services call Prisma directly.
- [ ] **No data retention / anonymization** — Leads, tickets, refresh tokens have no retention policy or anonymization logic.
- [x] **Backup and retention scripts added** — `scripts/backup.sh` performs `pg_dump`; `scripts/retention-cleanup.ts` purges old soft-deleted records and expired refresh tokens.
- [ ] **Restore not tested** — Backup restore has not been exercised end-to-end; RTO/RPO not documented.

## Recommended actions

- [x] **1. Enable PostgreSQL RLS**
  - Add policies tied to `current_setting('app.current_user_id')` or role.
  - Set session variable in Prisma middleware or transaction wrapper.
  - Acceptance: direct SQL from a non-owner connection is blocked.

- [x] **2. Encrypt/hash PII at rest**
  - Use pgcrypto encrypted columns or application-layer encryption for phone, email, names, Telegram IDs.
  - Mask data in list APIs.
  - Acceptance: DB dump reveals no usable PII.

- [x] **3. Fix deletion strategy**
  - Added global Prisma soft-delete extension in `src/config/database.ts`.
  - Added `deletedAt` to `Product`, `Service`, `Opportunity`, and `AdminRole`.
  - Acceptance: production queries filter `deletedAt` by default; hard deletes are intercepted.

- [ ] **4. Add operational data lifecycle**
  - Implement retention columns/cron jobs for refresh tokens, tickets, and leads.
  - Anonymize old leads after a defined period.
  - Acceptance: retention policy documented and scheduled.

- [x] **5. Introduce backups & DR basics**
  - Added `scripts/backup.sh` and `scripts/retention-cleanup.ts`.
  - Documented backup variables in `civitechglobal-server/.env.example`.
  - Acceptance: restore tested from backup at least once.

## Definition of done for this layer

- [x] RLS policies exist and tested.
- [x] PII encrypted/masked.
- [x] Soft delete enforced by global Prisma middleware.
- [x] Backup/retention scripts in place.
- [ ] Restore tested and runbook published.
- [ ] Score raised to **4/5** or higher.
