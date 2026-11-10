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
| API contract | OpenAPI 3.1 export + generated type drift check | Pass; 15 paths |
| Frontend unit tests | Vitest | 88 passed / 17 files |
| Browser E2E | Playwright Chromium | 46 passed |
| Backend tests | pytest | 152 passed, 1 optional PostgreSQL harness skip |
| Backend lint/format | Ruff | Pass; 77 Python files formatted |
| Production build | Vite 8.3.6 | Pass; 418 modules transformed |
| PostgreSQL RLS | Disposable PostgreSQL 18.6, full Alembic chain, unprivileged runtime role | 1 integration test passed |
| Git state | `develop` | Clean; local HEAD equals origin/develop |

The one skipped test in the ordinary backend pytest run is the optional two-connection PostgreSQL RLS harness when its environment URLs are absent. The independent disposable-PostgreSQL acceptance passed; the skip must not be counted as a pass.

### Build observations

The current main entry chunk is 40.29 kB raw / 15.27 kB gzip. React Runtime is 218.74 kB / 68.27 kB gzip, Vendor is 164.01 kB / 49.11 kB gzip, Validation is 89.89 kB / 25.50 kB gzip, and each curriculum module is emitted as an independent chunk. The previous ~971 kB main-chunk observation is stale. Further optimization must use measured initial-route waterfalls and interaction timings, not raw chunk size alone.

## 2. Confirmed product/system gaps

### SF-01 — Typed API transport implemented; learner state remains device-local

- Backend routes exist for OIDC login/callback/current-session/CSRF/logout, learner progress and assessment attempts.
- src/api/client.ts provides typed session, tenant discovery, learner progress, assessment attempt and logout methods.
- The client uses credentialed HttpOnly cookies, session-bound CSRF, explicit tenant headers, structured errors, timeout/cancellation and request correlation.
- Frontend bookmarks, completion and assessment drafts still persist in browser localStorage; learner UI calls are not yet connected to backend persistence.
- Consequence: the application has a transport layer but is not yet a multi-device learning product.

**Next:** after a real published release UUID exists, connect progress and assessment flows with explicit legacy-data import and deterministic conflict handling. Do not introduce a second authentication scheme.

### SF-02 — Tenant discovery HTTP endpoint (implemented 2026-11-10)

- Migration `0010_tenant_membership_discovery` permits a signed-in user to discover only their own active tenant memberships.
- `GET /auth/tenants` remains intentionally absent (a test asserts 404); the supported route is `GET /tenants/me`.
- The route is gated by complete OIDC configuration and `ACADEMY_LEARNER_DATA_API_ENABLED=true`.

**Delivered:** `GET /tenants/me` uses the authenticated HttpOnly session, the transaction-local user context and migration 0010 self-discovery policy; it switches into each tenant context before reading tenant metadata and assigned roles, omits memberships suspended during the read, returns `Cache-Control: no-store`, and never accepts a caller-supplied user ID or role. Unit tests and the complete `GET /tenants/me` HTTP route (including real opaque-session resolution) pass against disposable PostgreSQL 18.6 with the non-owner/non-BYPASSRLS runtime role. The OpenAPI contract now contains 15 paths. This does not exercise an external OIDC provider.

### SF-03 — Learner API remains disabled by default

- `ACADEMY_LEARNER_DATA_API_ENABLED` defaults to false.
- Learner APIs also require complete OIDC/database configuration and schema head 0012.
- RLS acceptance is now complete, but that is not equivalent to production OIDC provider acceptance, production database least-privilege review or privacy approval.

**Target:** preserve fail-closed defaults. Do not turn on the feature flag as a shortcut. Complete provider-backed E2E and privacy/retention review first.

### SF-04 — Course authoring remains browser-local; platform publishing is CLI-only

- Course authoring uses local drafts and browser JSON import/export.
- A dedicated platform publisher CLI, strict snapshot validation, digest review, idempotent publication and immutable-release database guards are implemented; authenticated authoring/publishing UI and HTTP endpoints remain absent.
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

2. **Course release consumption and publication boundary**
   - expose authenticated published release metadata and immutable content snapshots;
   - keep global catalog publishing platform-scoped, separate from tenant_admin;
   - bootstrap and verify a real immutable release UUID before learner writes.

3. **Learner progress synchronization**
   - map local module progress to a published course release;
   - create/touch/complete/reopen progress through backend routes;
   - reconcile existing browser-local state only through explicit, idempotent import;
   - define deterministic conflict and deletion behavior;
   - show sync state and recoverable errors.

4. **Assessment lifecycle**
   - persist draft responses and rubric self-review;
   - create/list/submit attempts through backend APIs;
   - enforce attempt identity, immutable submission state and concurrency invariants;
   - distinguish self-review from instructor grading (not implemented).

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

## 6. Implementation progress and next slice

### SF-01 — Typed frontend API transport (implemented locally)

Added `src/api/client.ts` and exported the runtime through `src/api/index.ts`. The client currently provides typed methods for current session, tenant discovery, learner progress, assessment attempts and logout. It implements:

- `credentials: include` for opaque HttpOnly session cookies; no token is read from browser storage. All API requests use `cache: no-store` to avoid browser HTTP caching of learner/session data.
- Session-bound CSRF acquisition from `GET /auth/csrf`, cached only in memory and invalidated after session rejection or an explicit CSRF validation failure. Mutations are not automatically replayed after a 403.
- Explicit `X-Tenant-ID` for tenant-scoped learner/assessment operations; the client does not infer or invent the active tenant.
- Structured error categories for 401/403/409/422/5xx, request correlation ID capture, network failures, timeout and caller cancellation.
- Query serialization, JSON request/response handling, 204 responses and configurable API base URL/fetch implementation.

Regression coverage: `src/api/client.test.ts` (15 tests). The full `pnpm acceptance:local` gate passed after implementation: Biome lint/format, strict TypeScript, OpenAPI 3.1 drift check (15 paths), Vitest (88 passed), Playwright Chromium (46 passed), all M04–M20 Python example suites, Ruff, backend pytest (152 passed, 1 optional PostgreSQL harness skip) and production build. The client is deliberately not wired into the learner UI yet; no OIDC or learner-data feature flag has been enabled. Browser-backed provider E2E remains pending. A separate local dependency security audit also passed: no known npm or Python dependency vulnerabilities; the unpublished first-party Python package was skipped by pip-audit because it is not on PyPI. GitHub Actions were not triggered.

### SF-02 — Session and tenant context UI (implemented locally)

Added `src/features/session/useAcademySession.ts` and `SessionTenantControl.tsx`, mounted in the application header. The flow performs a server-authoritative `GET /auth/me` bootstrap followed by `GET /tenants/me`, and supports loading, unauthenticated, authenticated, unavailable, tenant-unavailable, empty-membership, retry and logout states. Logout uses the API client's CSRF-protected `POST /auth/logout` path.

Tenant selection is explicit. The browser stores only a tenant ID preference (no user ID, credential or role); each bootstrap revalidates that preference against the authenticated user's current tenant memberships and clears it if no longer authorized. The preference is not an authorization grant, is not sent as proof of access, and does not yet drive learner data calls. The backend remains the authorization source of truth.

The account shell is gated by `VITE_ACADEMY_AUTH_UI_ENABLED`, which defaults to false. This is a frontend presentation flag only; it does not enable backend OIDC, learner APIs or production data access. The Playwright test server sets it to true to exercise the UI. No secret is exposed through this variable.

Regression coverage: four dedicated Playwright scenarios verify authorized tenant preference revalidation and selection, expired-session login affordance, tenant API unavailability, and CSRF-protected logout. The latest local acceptance gate passed: Biome, TypeScript, OpenAPI drift check, Vitest (88 passed), Playwright Chromium (46 passed), all M04–M20 Python example suites, Ruff, backend pytest (152 passed, 1 optional PostgreSQL harness skip), and production build. The independent dependency audit found no known npm/Python dependency vulnerabilities; the unpublished first-party Python package remains outside pip-audit's PyPI coverage. Provider-backed OIDC remains untested; tenant selection is not yet integrated into learning/assessment requests. GitHub Actions were not triggered.

### SF-03 — Authenticated course release read API (implemented locally)

Added `backend/app/api/course_releases.py` with tenant-authorized `GET /courses/releases` and `GET /courses/releases/{release_id}`. Both use the authenticated session, active tenant membership and the existing `course:read` permission. Discovery returns published metadata only; detail reads published or retired immutable snapshots for historical interpretation. Drafts are never exposed. Responses use `Cache-Control: no-store` and `Pragma: no-cache`. The OpenAPI contract and generated TypeScript types now include the two routes; the frontend API client exposes typed discovery and detail methods.

Regression coverage includes API-level tests for published-only filtering, snapshot visibility, no-store headers and 404 behavior. The PostgreSQL RLS acceptance harness exercises the actual HTTP read routes with an opaque session and non-owner/non-BYPASSRLS runtime role, including rejection of a tenant without active membership. The full local acceptance gate passed: OpenAPI 3.1 drift check (15 paths), Vitest (88 passed), Playwright Chromium (46 passed), all M04–M20 Python example suites, Ruff (77 files formatted), backend pytest (152 passed, 1 optional PostgreSQL harness skip) and production build. The independent disposable PostgreSQL 18.6 RLS acceptance passed with `superuser=false` and `bypassrls=false`; the dependency audit found no known npm/Python third-party vulnerabilities, while the unpublished first-party Python package remains outside pip-audit's PyPI coverage. GitHub Actions were not triggered.

### SF-04 — Platform-scoped course publication (implementation complete; persistent environment seed pending)

Implemented ADR-0010 and the platform publication boundary:

- scripts/export-course-release.mjs loads all modules through the Vite SSR loader and validates the complete curriculum with the same Zod CourseSchema used by the frontend.
- backend/app/schemas/course_release.py independently validates the complete nested snapshot with strict Pydantic models, unknown-field rejection, duplicate-ID checks, prerequisite graph validation, URL/date validation and lab-reference integrity.
- backend/scripts/publish_course_release.py requires a dedicated ACADEMY_PUBLISHER_DATABASE_URL, verifies both session_user and current_user, requires a reviewed --expected-sha256, and inserts the published snapshot plus global audit event in one transaction.
- Migration 0012_platform_publisher_audit adds the narrow global audit policy, denies the publisher all tenant-membership rows through restrictive RLS, and installs database guards against draft insertion by the publisher and mutation/deletion/reactivation of published releases.
- The unique course/version constraint provides the concurrency boundary. Identical repeated publication returns the existing UUID without a second audit event; mismatched digest/schema/status is rejected.
- Disposable PostgreSQL 18.6 acceptance exported and validated the actual course bundle (20 modules, 100 lessons, 100 assessments), published it, raced two concurrent publishers (one insert, one idempotent conflict result), repeated it idempotently, rejected a conflicting snapshot and digest mismatch, proved release rollback when audit INSERT was denied, verified one audit event, checked role/grant attributes and confirmed snapshot immutability. The generated UUID existed only in the disposable database and must not be used by the frontend.

**Remaining external operation:** no persistent target database or publisher credential is configured in this local environment. A DBA must apply migrations through 0012_platform_publisher_audit, provision the dedicated role, and run the documented dry-run/review/publish sequence against the intended persistent database. Only that database's committed release UUID can unblock SF-05.

### SF-05 — Learner data synchronization (blocked on SF-04)

After a real published release is available, map learner progress to its persisted UUID and selected tenant. Reconcile legacy browser-local completion only through an explicit, idempotent import; preserve the original local snapshot and report conflicts. Assessment persistence follows the same release binding.

Keep OIDC and learner API defaults disabled until provider-backed E2E, runtime DB least-privilege and privacy/retention gates are accepted.


### SF-04 acceptance evidence — 2026-11-10

- Disposable PostgreSQL 18.6 migration rehearsal reached the single Alembic head 0012_platform_publisher_audit.
- Dedicated publisher acceptance passed: strict full-curriculum validation, direct-role identity checks, least-privilege grants, restrictive tenant-membership RLS, atomic release/audit write and forced audit-failure rollback, concurrent idempotency race, conflicting-content rejection, expected-digest rejection, draft-insert rejection and immutable published-snapshot update/delete rejection.
- Separate PostgreSQL RLS acceptance passed with a non-owner, non-superuser, non-BYPASSRLS academy_runtime role.
- pnpm acceptance:local: Biome lint/format, TypeScript, OpenAPI drift (15 paths), Vitest 88, Playwright Chromium 46, M04–M20 Python example suites, Ruff, backend pytest 152 passed / 1 optional skip, Vite production build passed.
- pnpm security:audit: no known npm or Python third-party dependency vulnerabilities; the unpublished first-party Python package was skipped by pip-audit because it is not published on PyPI.
- GitHub Actions were not triggered. No persistent production database publication or external OIDC acceptance is claimed.
