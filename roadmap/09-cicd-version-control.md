# Layer 9 — CI/CD & Version Control

**Score:** 3 / 5  
**Status:** 🟡 In Progress (Redis service added to CI for Wave A)  
**Owner:** DevOps Engineer, Git Workflow Master

## Executive summary

CI is solid: GitHub Actions runs server checks against a real Postgres service, web checks, and Docker image builds. Pre-commit hooks are configured. The missing piece is CD, image security scanning, and codified branch protection.

## Current state

### Strengths (with evidence)

- [x] **CI matrix** — Server (with Postgres service container), web, and Docker build jobs (`.github/workflows/ci.yml:1-147`).
- [x] **Quality gates** — Type-check, lint, format check, migrations, tests run on every push/PR.
- [x] **Pre-commit hooks** — Husky + lint-staged configured in root and both packages.
- [x] **Docker build caching** — GHA cache-from/cache-to in CI builds.

### Gaps / risks (with evidence)

- [ ] **No CD** — Only `ci.yml`; nothing deploys images or infrastructure.
- [ ] **No container scanning** — Docker build job does not run Trivy/Grype or generate SBOMs.
- [ ] **No signed images** — No cosign/sigstore signing.
- [ ] **No branch protection codified** — No `.github/settings.yml` or documented required-review policy.
- [ ] **No deployment gates** — No staging/prod promotion, canary, or approval steps.
- [ ] **No secrets scanning in CI** — No `truffleHog` or GitHub secret scanning custom patterns.

## Recommended actions

- [ ] **1. Add CD workflow**
  - Build and push images on merge to `main`; deploy to staging automatically.
  - Acceptance: every merged PR produces a deployed staging build.

- [ ] **2. Add container security scanning**
  - Integrate Trivy or Grype into CI; fail on high/critical CVEs.
  - Acceptance: CI reports vulnerability summary per image.

- [ ] **3. Sign container images**
  - Use cosign to sign images pushed to the registry.
  - Acceptance: signature verified on deployment.

- [ ] **4. Codify branch protection**
  - Document and enforce required reviews, status checks, and signed commits if applicable.
  - Acceptance: `main` cannot be pushed to directly.

- [ ] **5. Add secrets scanning**
  - Enable GitHub secret scanning and/or run `truffleHog` in CI.
  - Acceptance: CI fails if secrets are detected.

## Definition of done for this layer

- [ ] CD deploys to staging on every merge.
- [ ] Container scans block high/critical CVEs.
- [ ] Images signed.
- [ ] Branch protection enforced.
- [ ] Secrets scanning active.
- [ ] Score raised to **4.5/5** or higher.
