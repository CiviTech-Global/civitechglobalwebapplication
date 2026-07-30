# Layer 3 — Auth & Permissions

**Score:** 4 / 5  
**Status:** 🟢 Done (Wave A complete; email-verification enforcement pending a verification flow)  
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

- [x] **Auth middleware checks account status** — `authenticate.ts` verifies `deletedAt` and `tokenVersion`; rejects inactive/revoked users.
  - Evidence: `src/middleware/authenticate.ts:6-33`.
  - Note: `emailVerified` is loaded but not enforced until an email-verification flow is implemented.
- [x] **`optionalAuth` validates token-version and account status** — Uses the same `loadUserFromToken` helper; invalid tokens continue as anonymous.
  - Evidence: `src/middleware/authenticate.ts:53-69`.
- [x] **`requirePermission` is role-agnostic** — `SUPER_ADMIN` bypasses; any authenticated user with the required permission passes. Falls back to DB if `req.user.permissions` is empty.
  - Evidence: `src/middleware/requirePermission.ts`.
- [x] **Strong password policy** — Min 12, max 128, requires uppercase, lowercase, digit, and special character.
  - Evidence: `src/validators/auth.schema.ts`.
- [x] **Refresh-token JTIs hashed at rest** — SHA-256 hash stored in `User.refreshToken`; rotation compares hashes. Existing tokens were invalidated by the migration.
  - Evidence: `src/services/auth.service.ts`, `prisma/migrations/20260730080000_hash_refresh_tokens`.

## Recommended actions

- [x] **1. Harden `authenticate.ts`**
  - After verifying JWT, fetch the user and reject if `deletedAt` is set or `emailVerified` is required but false.
  - Acceptance: deleted users receive `401` on all protected endpoints.

- [x] **2. Fix `optionalAuth`**
  - Apply the same `tokenVersion` and account-status checks as `authenticate`.
  - Acceptance: revoked tokens fail even on optional routes.

- [x] **3. Make `requirePermission` role-agnostic**
  - Check `req.user.permissions` for any authenticated role.
  - Add a stale-permission fallback that fetches current permissions from DB.
  - Acceptance: a `USER` with explicit permissions can access permitted resources.

- [x] **4. Strengthen password policy**
  - Enforce min 12 chars, mixed case, digit, symbol, and a max length (e.g. 128) to prevent DoS via bcrypt.
  - Optional: integrate breached-password checking.
  - Acceptance: Zod schema rejects weak passwords with localized messages.

- [x] **5. Hash refresh-token JTIs before DB storage**
  - Store `SHA-256(tokenJti)` and compare hashes on refresh.
  - Acceptance: DB dump does not reveal usable refresh tokens.

## Definition of done for this layer

- [x] `authenticate` rejects deleted/revoked users (`emailVerified` enforcement pending verification flow).
- [x] `optionalAuth` validates token version and account status.
- [x] `requirePermission` works for any role with permissions.
- [x] Password policy meets enterprise baseline.
- [x] Refresh-token identifiers are hashed at rest.
- [x] Score raised to **4/5** or higher.
