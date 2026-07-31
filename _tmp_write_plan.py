import pathlib
content = """# CiviTech Global — Frontend Form Validation & Test Coverage Plan

## Goal
Migrate all `civitechglobal-web` forms to schema-driven validation with `react-hook-form` + `zod`, expand test coverage to the project target (>= 60% on components and auth pages), and raise Layer 1 (Frontend Foundations) score from 3/5 to 4/5.

---

## Current state

### Stack
- **Framework**: React 19 + Vite 8 + TypeScript 6 + Tailwind CSS v4 (`civitechglobal-web/package.json`).
- **Routing**: `react-router` v7 with nested routes in `src/App.tsx:73-201`.
- **API client**: Axios instance in `src/config/api.ts` -- baseURL `/api`, `withCredentials: true`, bearer-token injection, and refresh-token queue (`api.ts:19-73`).
- **Dev proxy**: `vite.config.ts:14-18` proxies `/api` to `http://localhost:5000`.
- **UI primitives**: `Input`, `Select`, `TextArea`, `Button`, `NeonButton`, `Card`, etc. in `src/components/ui`. They already support an `error` prop (`Input.tsx:6-7`, `Select.tsx:6-7`, `TextArea.tsx:6-7`).

### Validation libraries (installed but unused)
- `react-hook-form@^7.74.0` (`package.json:31`)
- `zod@^4.3.6` (`package.json:35`)
- `@hookform/resolvers@^5.2.2` (`package.json:40`)

No source file under `src/` imports `react-hook-form`, `zod`, or `@hookform/resolvers` (verified by grep).

### Forms inventory (all manual `useState` + HTML5 validation)

| Page | Path | Fields | Validation today |
|---|---|---|---|
| Login | `src/pages/public/LoginPage.tsx` | email, password | HTML5 `type="email"` + `required` |
| Register | `src/pages/public/RegisterPage.tsx` | firstName, lastName, email, password | HTML5 `type="email"` + `required` |
| Contact | `src/pages/public/ContactPage.tsx` | name, email, subject, category, description, priority | HTML5 `type="email"` + `required` |
| Support | `src/pages/public/SupportPage.tsx` | name, email, subject, description, priority | HTML5 `type="email"` + `required` |
| Admin create | `src/pages/admin/AdminFormPage.tsx` | firstName, lastName, email, adminRoleId | HTML5 `type="email"` + `required` |
| Product CRUD | `src/pages/admin/ProductFormPage.tsx` | name, slug, description, price, category, features, image, githubUrl, isActive | HTML5 `required`; manual `parseFloat` |
| Service CRUD | `src/pages/admin/ServiceFormPage.tsx` | name, slug, description, price, category, features, image, isActive | HTML5 `required`; manual `parseFloat` |
| Opportunity CRUD | `src/pages/admin/OpportunityFormPage.tsx` | title, slug, description, requirements, duration, location, type, opportunityType, isOpen | HTML5 `required` |
| Role CRUD | `src/pages/admin/RoleFormPage.tsx` | name, permissions[] | HTML5 `required` only on name |
| Profile | `src/pages/dashboard/ProfilePage.tsx` | firstName, lastName, phone | No validation at all |
| Ticket reply | `src/pages/dashboard/TicketDetailPage.tsx` | message | Manual `!message.trim()` disables submit |

All forms use imperative `handleSubmit` with inline `try/catch` and toast errors.

### Test framework
- **Runner**: Vitest 2.1.9 (`package.json:63`, `vitest.config.ts`).
- **Environment**: `jsdom` with globals enabled (`vitest.config.ts:5-6`).
- **Libraries**: `@testing-library/react@^16`, `@testing-library/jest-dom@^6`, `@testing-library/user-event@^14` (`package.json:43-45`).
- **Coverage**: configured in `vitest.config.ts:8-11` (`text`, `json`, `html` reporters).

### Test files (only one)
- `src/lib/utils.test.ts` -- 2 tests for the `cn()` Tailwind-merge utility.

### Test scripts
- `npm test` -> `vitest run`
- `npm run test:watch` -> `vitest`

Verified locally: tests pass, but only 2/2 tests run.

---

## Gaps mapped to roadmap targets

| Source | Gap | Evidence |
|---|---|---|
| `roadmap/01-frontend-foundations.md:27` | Forms are manual despite installed libs | All pages above use `useState` and `required` |
| `roadmap/01-frontend-foundations.md:29` | Test coverage trivial | Only `src/lib/utils.test.ts` exists |
| `roadmap/14-prioritized-remediation-roadmap.md:17` | P1 #17 Forms not using installed validation libraries | Status red not started |
| `roadmap/14-prioritized-remediation-roadmap.md:18` | P1 #18 Minimal test coverage | Status red not started |

Target acceptance from roadmaps:
- All user input validated by Zod before submit.
- No manual `useState` for form fields.
- >= 60% coverage on `components/` and `pages/public/auth`.

---

## Recommended single approach

A single focused pass, ordered to minimize churn and maximize testability.

### Phase 1 -- Shared validation infrastructure
1. Create `src/lib/validation.ts` exporting reusable Zod helpers (e.g., `emailSchema`, `passwordSchema`, `requiredString`).
2. Add `src/components/ui/FormField.tsx` wrapper that binds `react-hook-form` Controller/register to our `Input`, `Select`, `TextArea`, and renders `error` props.
3. Add `src/test/setup.ts` if needed (it is not required now because `vitest.config.ts` uses globals, but keep it available for MSW later).

### Phase 2 -- Migrate auth forms first
4. Rewrite `LoginPage.tsx` and `RegisterPage.tsx` with `useForm` + `zodResolver`.
   - Zod schemas live next to each page or in `src/lib/validation.ts`.
   - Add field-level error display via `FormField`.
   - Preserve existing `useAuth` hooks, redirect logic, and toast behavior.
5. Add tests:
   - `src/pages/public/LoginPage.test.tsx` -- validation errors, submit calls `login`, success redirect.
   - `src/pages/public/RegisterPage.test.tsx` -- validation errors, submit calls `register`, success redirect.
   - Mock `useAuth`, `useToast`, `useLocale`, and `useNavigate`.

### Phase 3 -- Migrate public ticket/contact forms
6. Rewrite `ContactPage.tsx` and `SupportPage.tsx` with `useForm` + `zod`.
   - Validate email format, min/max lengths, and category/priority enums against `types/index.ts`.
7. Add tests for both pages mocking `api.post('/tickets', ...)`.

### Phase 4 -- Migrate admin CRUD forms
8. Rewrite the five admin form pages with `useForm`:
   - `AdminFormPage.tsx`
   - `ProductFormPage.tsx`
   - `ServiceFormPage.tsx`
   - `OpportunityFormPage.tsx`
   - `RoleFormPage.tsx`
   - Keep `useQuery`/`useMutation` for data fetching; replace only the local form state.
   - For Product/Service/Opportunity, derive `slug` with `zod.transform` or a `useEffect` watching `name`/`title`.
   - For RoleForm, model the permission set as a zod array.
9. Add tests for at least `ProductFormPage` (create + edit) and `RoleFormPage` to reach coverage target.

### Phase 5 -- Dashboard forms
10. Migrate `ProfilePage.tsx` and `TicketDetailPage.tsx` reply form to `useForm` + `zod`.

### Phase 6 -- Coverage and CI
11. Run `npm test -- --coverage` and close gaps on `components/` and `pages/public/auth`.
12. Add quick tests for `Button`, `Input`, `ErrorBoundary`, and `ProtectedRoute` to hit >= 60%.
13. Update `roadmap/01-frontend-foundations.md` and `roadmap/14-prioritized-remediation-roadmap.md` to mark items complete and raise Layer 1 score to 4/5.

---

## Acceptance criteria

- [ ] Every form page listed above uses `react-hook-form` + `zod` (`@hookform/resolvers`).
- [ ] No form uses `useState` for individual field values (loading/submission state may remain).
- [ ] Zod schemas reject invalid email, empty required fields, weak/short passwords, and malformed numbers/URLs before submission.
- [ ] `npm test` passes with >= 60% coverage on `src/components/**` and `src/pages/public/**`.
- [ ] Existing CI test step continues to pass.
- [ ] Roadmap files updated: P1 #17 and #18 marked complete, Layer 1 score raised to 4/5.

---

## Notes

- This plan aligns with `roadmap/14-prioritized-remediation-roadmap.md` Sprint 3 (Frontend hardening).
- The `api.ts` refresh-token queue and route structure should not change; only form internals change.
- Component consolidation (duplicate navbars/footers/buttons) and route-level code splitting are out of scope here; they remain P2 items in the roadmap.
"""
pathlib.Path(r'C:\Users\mokha\.kimi\plans\iron-fist-animal-man-ms-marvel.md').write_text(content, encoding='utf-8')
