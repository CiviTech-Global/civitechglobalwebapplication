# Layer 1 — Frontend Foundations

**Score:** 3.5 / 5  
**Status:** 🟡 In Progress (forms migrated and public/UI test coverage ≥ 60%; a11y, duplication, admin route splitting still open)  
**Owner:** Senior Frontend Developer, UX/UI Designer

## Executive summary

The frontend is a modern React 19 + Vite 8 + TypeScript 6 + Tailwind CSS v4 application with solid routing, auth refresh, and full Persian/English RTL/LTR support. It is early in production maturity: form validation libraries are installed but unused, test coverage is minimal, accessibility is inconsistent, and component duplication exists.

## Current state

### Strengths (with evidence)

- [x] **Modern stack** — React 19, Vite 8, TypeScript 6, Tailwind CSS v4, React Compiler preset (`vite.config.ts:10`).
- [x] **Clean routing & RBAC** — Nested `react-router` v7 routes in `App.tsx:73-201`; `ProtectedRoute.tsx:11-31` accepts role arrays.
- [x] **i18n + RTL/LTR** — `LocaleProvider.tsx:19-34` updates `html.lang`, `html.dir`, document title, and font family. `i18n/en.ts` and `i18n/fa.ts` are comprehensive.
- [x] **Design tokens** — `index.css:46-173` defines semantic light/dark tokens; `.dark` swap at `index.css:175-233`.
- [x] **API client & silent refresh** — `config/api.ts:26-73` implements an Axios interceptor with refresh-token queue (`failedQueue`, `isRefreshing`).
- [x] **Error boundary** — `components/ErrorBoundary.tsx:13-60` wraps the route tree in `App.tsx:72`.
- [x] **Custom hooks** — `useAuth.ts`, `useToast.ts` guard against misuse outside providers; `useReducedMotion.ts:19-21` uses `useSyncExternalStore`.
- [x] **Domain types** — `types/index.ts:1-205` defines `User`, `Product`, `Order`, `Ticket`, `Lead`, `ApiResponse`, etc.
- [x] **Lint / type-check / test pass** — verified locally and in CI.

### Gaps / risks (with evidence)

- [x] **Forms migrated to `react-hook-form` + Zod** — `FormField.tsx` wrapper created; `LoginPage`, `RegisterPage`, `ContactPage`, `SupportPage`, and all admin form pages now use schema-driven validation.
  - Evidence: `src/components/ui/FormField.tsx`, `src/lib/validation.ts`, `src/pages/public/LoginPage.tsx`, `src/pages/admin/*FormPage.tsx`.
- [x] **Test coverage expanded** — 23 test files / 45 tests pass; `components/ui` at 80.51% and `pages/public` at 71.57% statement coverage.
- [ ] **Accessibility gaps** — Missing `aria-expanded`/`aria-controls`, keyboard handling, skip-to-content, `aria-live` toasts; `ErrorBoundary.tsx:36-37` uses hard-coded English.
  - Evidence: `Navbar.tsx:105-165`, `FuturisticNavbar.tsx:131-179`, `Toast.tsx:41-66`.
- [ ] **Component duplication / dead code** — Two navbars, two footers, two buttons; public layout uses the futuristic set, leaving legacy variants unused.
  - Evidence: `PublicLayout.tsx:2-3`, `LoginPage.tsx:7`, `RegisterPage.tsx:7`.
- [ ] **Partial code splitting only** — `HomePage.tsx` now lazy-loads the `DigitalGlobe` component, but admin routes and other heavy deps (`framer-motion`, `@react-three/*`) are still eagerly imported in `App.tsx`.
- [ ] **Hard-coded API base** — `config/api.ts:4` uses `/api`; `vite.config.ts:14-18` hard-codes the dev proxy target. No runtime env handling.
- [ ] **SSR/initial-render flash** — `index.html:2` hard-codes `lang="fa" dir="rtl"`; `LocaleProvider` overrides it after hydration.

## Recommended actions

- [x] **1. Migrate all forms to `react-hook-form` + `zod`**
  - Created reusable `FormField` wrappers.
  - Migrated `LoginPage`, `RegisterPage`, `ContactPage`, `SupportPage`, and all admin form pages.
  - Acceptance: all user input validated by Zod before submit; no manual `useState` for form fields.

- [x] **2. Expand test coverage**
  - Added component tests for `Button`, `Input`, `Select`, `TextArea`, `Card`, `GlowCard`, `NeonButton`, `Modal`, `FormField`, and public pages.
  - Added route-level tests using a `renderWithProviders` helper and mocked `config/api`.
  - Acceptance: ≥ 60% coverage on `components/ui` and `pages/public`.

- [ ] **3. Consolidate UI component library**
  - Merge `Navbar`/`FuturisticNavbar`, `Footer`/`FuturisticFooter`, `Button`/`NeonButton` into single configurable components.
  - Delete dead variants.
  - Acceptance: one component per abstraction; lint/type-check/tests pass.

- [ ] **4. Implement route-level code splitting**
  - Wrap admin routes and the 3D globe component in `React.lazy` + `Suspense` with a shared fallback.
  - Acceptance: initial public bundle reduced; no lazy-load runtime errors.

- [ ] **5. Accessibility pass**
  - Add `aria-expanded`/`aria-controls` to menu toggles, keyboard Escape/Arrow handling for dropdowns, `aria-live` region for toasts, skip-to-content link, localize `ErrorBoundary` through locale context.
  - Acceptance: pass an automated a11y scan (e.g. axe-core) on public and admin layouts.

## Definition of done for this layer

- [x] All forms use schema-driven validation.
- [ ] Component library has no duplicate variants.
- [x] Frontend test coverage ≥ 60% on `components/ui` and `pages/public`.
- [ ] No critical accessibility issues in automated scan.
- [ ] Admin routes are lazy-loaded.
- [ ] Score raised to **4/5** or higher.
