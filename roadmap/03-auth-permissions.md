# Layer 3 — Auth & Permissions

**Score:** 3 / 5  
**Status:** 🟡 In Progress  
**Owner:** Security Architect, Backend Architect

## Executive summary

Authentication uses solid JWT practices (separate access/refresh secrets, rotation, token versioning) and a reasonable RBAC schema. However, authorization checks are incomplete: deleted/deactivated users can still use valid tokens, `optionalAuth` bypasses revocation checks, and `requirePermission` is hard-coded to admin roles only.

## Current state

### Strengths (with evidence)

- [x] **JWT best practices** — Separate `JWT_SECRET`/`JWT_REFRESH_SECRET`, explicit `HS256`, 15-minute access tokens, 7-day refresh tokens with random JTI (`src/utils/jwt.ts:16-31`).
- [x] **Refresh-token rotation** — `refreshTokens` revokes the old DB token and issues a new one (`src/services/auth.service.ts:146-173`).
- [x] **Token versioning / global revocation** — Access-token validity tied to `user.tokenVersion`; `revokeAllUserRefreshTokens` increments it (`src/services/auth.service.ts:188-198`).
- [x] **Failed-login lockout** — Tracks failed attempts per email and locks for 15 minutes after 5 failures (`src/services/auth.service.ts:8-43`).
- [x] **Prisma RBAC schema** — `User.role`, `User.permissions`, `AdminRole.permissions`, soft-delete `deletedAt`, `tokenVersion` (`prisma/schema.prisma:69-98`).

### Gaps / risks (with evidence)

- [ ] **Auth middleware does not check account status** — `authenticate.ts` never verifies `deletedAt` or `emailVerified`.
  - Evidence: `src/middleware/authenticate.ts:14-36`.
  - Risk: a revoked/deleted user can continue accessing the API if their token version matches.
- [ ] **`optionalAuth` bypasses token-version checks** — It sets `req.user` without checking `tokenVersion` against the DB.
  - Evidence: `src/middleware/authenticate.ts:39-51`.
- [ ] **`requirePermission` is role-biased** — Only `ADMIN`/`SUPER_ADMIN` are honored; a `USER` with explicit permissions is denied.
  - Evidence: `src/middleware/requirePermission.ts:11-35`.
- [ ] **Weak password policy** — Only 8-character minimum; no complexity, max-length, or breached-password checks.
  - Evidence: `src/validators/auth.schema.ts:3-8`.
- [ ] **Refresh-token JTIs stored plain text** — If the DB is dumped, active refresh tokens are usable until expiry/revocation.
  - Evidence: `prisma/schema.prisma:100-114`, `src/services/auth.service.ts:77-83`.

## Recommended actions

- [ ] **1. Harden `authenticate.ts`**
  - After verifying JWT, fetch the user and reject if `deletedAt` is set or `emailVerified` is required but false.
  - Acceptance: deleted users receive `401` on all protected endpoints.

- [ ] **2. Fix `optionalAuth`**
  - Apply the same `tokenVersion` and account-status checks as `authenticate`.
  - Acceptance: revoked tokens fail even on optional routes.

- [ ] **3. Make `requirePermission` role-agnostic**
  - Check `req.user.permissions` for any authenticated role.
  - Add a stale-permission fallback that fetches current permissions from DB.
  - Acceptance: a `USER` with explicit permissions can access permitted resources.

- [ ] **4. Strengthen password policy**
  - Enforce min 12 chars, mixed case, digit, symbol, and a max length (e.g. 128) to prevent DoS via bcrypt.
  - Optional: integrate breached-password checking.
  - Acceptance: Zod schema rejects weak passwords with localized messages.

- [ ] **5. Hash refresh-token JTIs before DB storage**
  - Store `SHA-256(tokenJti)` and compare hashes on refresh.
  - Acceptance: DB dump does not reveal usable refresh tokens.

## Definition of done for this layer

- [ ] `authenticate` rejects deleted/unverified users.
- [ ] `optionalAuth` validates token version and account status.
- [ ] `requirePermission` works for any role with permissions.
- [ ] Password policy meets enterprise baseline.
- [ ] Refresh-token identifiers are hashed at rest.
- [ ] Score raised to **4/5** or higher.
