# AI Engineering Academy — Code Quality & System Functionalization Plan

- Date: 2026-11-10
- Branch baseline: `develop`
- Repository baseline: `0fd819eca6715a6c4e568142a8c65532d110209b`
- Scope: code quality, backend/frontend integration, product workflows and local acceptance.
- Exclusions: curriculum expansion, framework replacement, speculative infrastructure, GitHub Actions execution.

## 1. Current verified baseline

| Area | Evidence | Status |
|---|---|---|
| Frontend lint/format | Biome | Pass |
| Type safety | TypeScript strict check | Pass |
| API contract | OpenAPI 3.1 export + generated type drift check | Pass; 13 paths |
| Frontend unit tests | Vitest | 73 passed / 16 files |
| Browser E2E | Playwright Chromium | 42 passed |
| Backend tests | pytest | 135 passed, 1 skipped |
| Backend lint/format | Ruff | Pass; 67 Python files formatted |
| Production build | Vite 8.3.6 | Pass; 414 modules transformed |
| PostgreSQL RLS | Disposable PostgreSQL 18.6, full Alembic chain, unprivileged runtime role | 1 integration test passed |
| Git state | `develop` | Clean; local HEAD equals origin/develop |

The one skipped test in the ordinary backend pytest run is the optional two-connection PostgreSQL RLS harness when its environment URLs are absent. The independent disposable-PostgreSQL acceptance passed; the skip must not be counted as a pass.

### Build observations

The current main entry chunk is 40.29 kB raw / 15.27 kB gzip. React Runtime is 218.74 kB / 68.27 kB gzip, Vendor is 164.01 kB / 49.11 kB gzip, Validation is 89.89 kB / 25.50 kB gzip, and each curriculum module is emitted as an independent chunk. The previous ~971 kB main-chunk observation is stale. Further optimization must use measured initial-route waterfalls and interaction timings, not raw chunk size alone.

## 2. Confirmed product/system gaps

### SF-01 — Frontend does not consume authenticated learner APIs

- Backend routes exist for OIDC login/callback/current-session/CSRF/logout, learner progress and assessment attempts.
- Frontend currently persists bookmarks, completion and assessment drafts in browser `localStorage`.
- There is no runtime API client in `src/api`; only generated OpenAPI types exist.
- Consequence: learning state is device-local, not account-synchronized. A successful backend RLS test does not make the frontend a multi-device learning product.

**Target:** one typed API transport with credentialed cookies, session-bound CSRF handling, tenant header handling, structured HTTP errors, abort/timeout behavior and tests. Do not implement a second authentication scheme.

### SF-02 — Tenant discovery HTTP endpoint (implemented 2026-11-10)

- Migration `0010_tenant_membership_discovery` permits a signed-in user to discover only their own active tenant memberships.
- `GET /auth/tenants` remains intentionally absent (a test asserts 404); the supported route is `GET /tenants/me`.
- The route is gated by complete OIDC configuration and `ACADEMY_LEARNER_DATA_API_ENABLED=true`.

**Delivered:** `GET /tenants/me` uses the authenticated HttpOnly session, the transaction-local user context and migration 0010 self-discovery policy; it switches into each tenant context before reading tenant metadata and assigned roles, omits memberships suspended during the read, returns `Cache-Control: no-store`, and never accepts a caller-supplied user ID or role. Unit tests and the complete `GET /tenants/me` HTTP route (including real opaque-session resolution) pass against disposable PostgreSQL 18.6 with the non-owner/non-BYPASSRLS runtime role. The OpenAPI contract now contains 13 paths. This does not exercise an external OIDC provider.

### SF-03 — Learner API remains disabled by default

- `ACADEMY_LEARNER_DATA_API_ENABLED` defaults to false.
- Learner APIs also require complete OIDC/database configuration and schema head 0011.
- RLS acceptance is now complete, but that is not equivalent to production OIDC provider acceptance, production database least-privilege review or privacy approval.

**Target:** preserve fail-closed defaults. Do not turn on the feature flag as a shortcut. Complete provider-backed E2E and privacy/retention review first.

### SF-04 — Course authoring remains browser-local

- Course authoring uses local drafts and browser JSON import/export.
- Course release domain services and schema exist, but a complete authenticated authoring/publishing workflow is not exposed through HTTP and the UI.
- No instructor/course-authoring permissions should be inferred from the existing learner-only OIDC provisioning path.

**Target:** define the authoring roles, review/publish lifecycle, immutable release behavior and audit requirements before adding authoring endpoints.

### SF-05 — Frontend composition and state ownership

- `src/App.tsx` still owns navigation, route-like view selection, lesson loading, full-text search loading, authoring loading and learning-state presentation.
- The learning state persistence boundary has been extracted to `useLearningState`, but it is still browser-local.
- The next decomposition should follow real feature boundaries (session, tenant, learning progress, assessment, course workspace), not arbitrary component line counts.

## 3. Code-quality workstream

### CQ-01 — Full risk-based code review

Review the production source and migrations by trust boundary:
- authentication/session lifecycle and cookie/CSRF handling;
- tenant discovery and authorization;
- RLS context setup, transaction boundaries and pooled connection reuse;
- course release lifecycle and content digest invariants;
- learning progress and assessment attempt state transitions;
- frontend async loading, stale responses, storage failures and error recovery;
- dependency boundaries, secret handling and configuration fail-closed behavior.

Classify each finding as P0/P1/P2/P3. Each finding must include evidence, exploit/failure scenario, affected boundary, remediation, regression test and residual risk. Do not claim a whole-repository security certification from a focused review.

### CQ-02 — Concurrency and idempotency

Add deterministic tests for:
- concurrent progress creation for the same learner/release/module;
- concurrent assessment attempt number allocation;
- duplicate submission and invalid lifecycle transitions;
- session revocation racing with requests;
- tenant membership suspension during access;
- retry behavior after database integrity failures.

Use database constraints and row locks as correctness controls; do not rely on UI button disabling.

### CQ-03 — Frontend resilience

Test:
- API timeout, offline, 401, 403, 409, 422 and 5xx states;
- expired session and logout cleanup;
- CSRF token acquisition and invalidation;
- storage quota/private-mode failures without losing in-memory usability;
- switching modules while earlier requests are still pending;
- retry behavior and stale-result suppression.

### CQ-04 — Performance and accessibility

- Record real initial-route network waterfall and Web Vitals before optimizing.
- Preserve module-level curriculum lazy loading and on-demand full-text indexing.
- Profile the React/Vendor/Validation split; do not add a framework or state library without measured need.
- Expand accessibility checks with manual keyboard and screen-reader review; automated axe passing is not full WCAG conformance.

## 4. System functionality workstream

Implement vertical slices in this order:

1. **Session and tenant context**
   - typed frontend API client;
   - login/session/current-user/logout UX;
   - active tenant discovery and explicit tenant selection;
   - cookie credentials, CSRF, Origin/CORS and error contract;
   - provider-backed test IdP acceptance before enabling production login.

2. **Learner progress synchronization**
   - map local module progress to a published course release;
   - create/touch/complete/reopen progress through backend routes;
   - reconcile existing browser-local state after login;
   - define deterministic conflict and deletion behavior;
   - show sync state and recoverable errors.

3. **Assessment lifecycle**
   - persist draft responses and rubric self-review;
   - create/list/submit attempts through backend APIs;
   - enforce attempt identity, immutable submission state and concurrency invariants;
   - distinguish self-review from instructor grading (not implemented).

4. **Course release consumption**
   - expose published release metadata and immutable content snapshots;
   - pin learner progress and attempts to a specific release;
   - define behavior when a new release is published.

5. **Authoring and instructor workflows**
   - define role/resource authorization and review/approval lifecycle;
   - implement course draft/version/publish APIs only after authorization design;
   - retain audit events and immutable published releases.

6. **Operational readiness**
   - real OIDC provider E2E;
   - runtime database least-privilege audit;
   - request correlation, structured safe logs and operational health;
   - load, failure and recovery tests;
   - deployment and backup/restore rehearsal.

## 5. Delivery and quality gates

Every implementation task must:
1. start from clean `develop` and inspect current changes;
2. state the bounded scope and acceptance criteria;
3. make the smallest coherent change;
4. add regression tests at the correct layer;
5. run relevant local tests, lint, typecheck, API drift and build checks;
6. update architecture/ADR/API docs when behavior or trust boundaries change;
7. commit and push directly to `origin/develop`;
8. verify local HEAD equals `origin/develop` and the worktree is clean.

Do not trigger or wait for GitHub Actions. Never mark an external provider, production deployment, privacy review or manual acceptance as complete without evidence.

## 6. Immediate next implementation slice

**SF-01: typed frontend API transport**, including Cookie credentials, session-bound CSRF acquisition, tenant header handling, structured errors and tests. Then add the session/tenant UI and connect learner progress. Keep OIDC and learner API defaults disabled until the separate provider/privacy gates are accepted.
