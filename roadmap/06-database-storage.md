# Layer 6 — Database & Storage

**Score:** 2.5 / 5  
**Status:** 🔴 Not Started  
**Owner:** Database Optimizer, Prisma Schema Architect, Data Privacy Officer

## Executive summary

The PostgreSQL/Prisma schema is coherent and recently improved (soft deletes, token versioning, refresh-token indexes). However, it lacks RLS, PII encryption, a consistent repository pattern, and any backup/DR strategy.

## Current state

### Strengths (with evidence)

- [x] **CUID primary keys & consistent naming** — All models use `@id @default(cuid())` and `@@map` snake_case table names (`prisma/schema.prisma:58-324`).
- [x] **Enums** — Controlled vocabularies for roles, statuses, priorities, etc. (`prisma/schema.prisma:10-56`).
- [x] **Soft-delete field on users** — `deletedAt` added via migration (`prisma/schema.prisma:85`).
- [x] **Token revocation strategy** — `tokenVersion` on `User`; `RefreshToken` has `revokedAt` and `expiresAt` (`prisma/schema.prisma:82`, `:100-114`).
- [x] **Indexes** — Role, createdAt, deletedAt on `User`; token/userId/expiresAt on `RefreshToken`.
- [x] **Unique constraints** — `@@unique([userId, opportunityId])`, `@@unique([categoryId, title])`.
- [x] **Seed credentials from env** — `prisma/seed.ts:9-30` refuses to run if required passwords are missing.
- [x] **Password hashing in seed** — `bcrypt.hash(..., 12)` (`prisma/seed.ts:60`).
- [x] **Prisma singleton** — Reuses client in dev to avoid connection-pool exhaustion (`src/config/database.ts:5-8`).

### Gaps / risks (with evidence)

- [ ] **No RLS** — Migrations contain zero `CREATE POLICY` statements; access control is fully application-layer.
- [ ] **PII stored unencrypted** — `User.email`, `firstName`, `lastName`, `phone`; `Lead.fullName`, `phoneNumber`, `telegramUsername`, `telegramFirstName`; `Ticket.email`.
- [ ] **Seed logs PII** — `prisma/seed.ts:75,93,108` prints seeded emails and names to stdout.
- [ ] **Hard delete in user service** — `src/services/user.service.ts:127` calls `prisma.user.delete` despite `deletedAt` existing.
- [ ] **Cascade deletes risk data loss** — `User` deletion cascades to orders, tickets, applications, refresh tokens (`prisma/schema.prisma:88-92`); no archive table.
- [ ] **Missing composite/search indexes** — No `(userId, createdAt)`, full-text search, or `(status, createdAt)` for dashboards.
- [ ] **Repository pattern incomplete** — Only insurance/lead repositories exist; most services call Prisma directly.
- [ ] **No data retention / anonymization** — Leads, tickets, refresh tokens have no retention policy.
- [ ] **No backup/DR** — No scripts, env vars, or docs for backups (`docker-compose.yml:9-10` uses a named volume only).

## Recommended actions

- [ ] **1. Enable PostgreSQL RLS**
  - Add policies tied to `current_setting('app.current_user_id')` or role.
  - Set session variable in Prisma middleware or transaction wrapper.
  - Acceptance: direct SQL from a non-owner connection is blocked.

- [ ] **2. Encrypt/hash PII at rest**
  - Use pgcrypto encrypted columns or application-layer encryption for phone, email, names, Telegram IDs.
  - Mask data in list APIs.
  - Acceptance: DB dump reveals no usable PII.

- [ ] **3. Fix deletion strategy**
  - Replace `user.service.ts:127` hard delete with `deletedAt` update.
  - Add composite index `(deletedAt, createdAt)` and filter deleted users globally.
  - Acceptance: no `DELETE FROM users` in production paths.

- [ ] **4. Add operational data lifecycle**
  - Implement retention columns/cron jobs for refresh tokens, tickets, and leads.
  - Anonymize old leads after a defined period.
  - Acceptance: retention policy documented and scheduled.

- [ ] **5. Introduce backups & DR basics**
  - Add a daily `pg_dump` or WAL-G script, offsite storage, documented RTO/RPO.
  - Update `.env.example` with backup target config.
  - Acceptance: restore tested from backup at least once.

## Definition of done for this layer

- [ ] RLS policies exist and tested.
- [ ] PII encrypted/masked.
- [ ] Soft delete used everywhere; no hard deletes.
- [ ] Backup/restore runbook tested.
- [ ] Score raised to **4/5** or higher.
