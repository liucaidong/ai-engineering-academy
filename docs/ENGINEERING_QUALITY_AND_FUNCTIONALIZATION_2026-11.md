# AI Engineering Academy — Code Quality & System Functionalization Plan

- Date: 2026-11-10
- Branch baseline: `develop`
- Repository baseline: `0fd819eca6715a6c4e568142a8c65532d110209b`
- Scope: code quality, backend/frontend integration, product workflows and local acceptance.
- Exclusions: curriculum expansion, framework replacement, speculative infrastructure, GitHub Actions execution.

## 1. Current verified baseline（2026-11-10）

| Area | Latest evidence | Status |
|---|---|---|
| Frontend lint/format | Biome lint + format | Pass |
| Type safety | TypeScript strict check | Pass |
| API contract | OpenAPI 3.1 export + generated TypeScript drift check | Pass; 17 paths |
| Frontend unit tests | Vitest | 106 passed / 21 files |
| Browser E2E | Playwright Chromium | 47 passed |
| Backend tests | pytest | 159 passed / 3 optional DB-only skips |
| Backend lint/format | Ruff | Pass; 77 Python files formatted |
| Production build | Vite 8.3.6 | Pass; 430 modules transformed |
| PostgreSQL RLS | PostgreSQL 18.6, actual HTTP routes, non-owner/non-superuser/non-BYPASSRLS runtime role | 3 passed |
| Platform publisher | Disposable PostgreSQL 18, strict snapshot, idempotency, atomic audit, role/RLS and immutability tests | Pass |
| Git state | `develop` | Clean; local HEAD equals origin/develop |

The three skipped backend tests are optional DB-only tests in the ordinary pytest invocation; they are not counted as passes. The dedicated PostgreSQL acceptance script separately executes the real RLS HTTP integration suite and passes 3/3. The publisher acceptance uses a separate disposable PostgreSQL database and removes it after the test. Neither result proves that a persistent production database or external OIDC provider has been configured.

### Build observations

The current build keeps curriculum module content in independent lazy-loaded chunks. The measured main entry is approximately 64.49 kB raw / 21.77 kB gzip; React Runtime is 218.74 kB / 68.27 kB gzip, Vendor 164.01 kB / 49.11 kB gzip and Validation 89.89 kB / 25.50 kB gzip. Continue to use initial-route waterfalls and interaction timings before changing the chunk strategy; do not optimize based only on raw chunk size.

### Current integration state

- Frontend browser state is isolated by authenticated user and selected tenant. Guest/legacy data can be imported explicitly with idempotent union semantics and draft-conflict preservation.
- Learner progress and assessment draft sync are implemented but require both frontend flags and an exact persisted published release. Both flags remain false by default.
- Backend learner routes remain disabled unless complete OIDC/database configuration and the database feature flag are enabled.
- A local PostgreSQL container was observed on the development machine with database `academy`, Alembic revision `0011_personal_tenant_bootstrap`, zero course releases and an `academy_runtime` role. It is not configured in `backend/.env`; no publisher role or persistent release is provisioned there. A loopback-only bootstrap helper and role-provisioning SQL now exist, but were not applied to this candidate database. Treat it as local development infrastructure, not production acceptance evidence.
- No external OIDC issuer/client registration or production secrets are configured in the current environment.

## 2. Confirmed product/system gaps

### SF-01 — Learner data is account-scoped locally and cloud-sync capable

- Bookmarks, module completion and assessment drafts use localStorage scopes derived from the authenticated server user ID and the currently selected tenant ID. Guest state is separate.
- An explicit guest import control merges bookmarks/completion by set union and copies only assessment drafts absent from the account. Conflicting drafts never overwrite account data; the guest source remains intact.
- Exact-version progress sync and assessment draft sync are implemented behind `VITE_ACADEMY_AUTH_UI_ENABLED` and `VITE_ACADEMY_LEARNER_SYNC_ENABLED`, both false by default.
- Progress sync resolves the exact published `course_key + version + schema_version`, validates the complete snapshot with the frontend CourseSchema and checks the exact module sequence before using the server UUID.
- Assessment drafts use latest-draft reads, bounded JSON, optimistic concurrency and conflict-safe attempt creation. No instructor grading capability is implied.

**Remaining:** publish the actual curriculum snapshot into the intended persistent database, configure a real OIDC provider, then perform provider-backed E2E and privacy/retention review before enabling the feature flags.

### SF-02 — Tenant discovery and session UI（implemented）

`GET /tenants/me` uses the authenticated HttpOnly session, transaction-local user context and self-only membership RLS. The React session UI revalidates remembered tenant preferences and exposes explicit tenant selection/logout. One session hook is owned by App and passed to the account-control feature; the browser never treats its tenant preference as authorization.

**Remaining:** provider-backed OIDC E2E. No real provider is configured in the current environment.

### SF-03 — Learner API remains disabled by default

- `ACADEMY_LEARNER_DATA_API_ENABLED` defaults to false.
- Frontend auth UI and learner sync flags also default to false.
- Learner routes require a valid session, active tenant membership, role permission, schema head 0012 and PostgreSQL RLS.
- Disposable PostgreSQL acceptance is complete, but it is not equivalent to external provider acceptance, persistent runtime-role verification or privacy approval.

**Target:** preserve fail-closed defaults until provider-backed E2E, persistent database least-privilege review and privacy/retention review are complete.

### SF-04 — Course authoring remains browser-local; platform publishing is CLI-only

- Course authoring currently uses local drafts and browser JSON import/export.
- A dedicated platform publisher CLI, strict full-snapshot validation, reviewed SHA-256 digest, atomic audit, idempotent publication and immutable-release database guards are implemented.
- Authenticated authoring, review/approval and publishing UI/HTTP endpoints remain absent.
- No instructor/course-authoring permission should be inferred from the learner-only OIDC provisioning path.

**Target:** define authoring roles, resource authorization, review/approval lifecycle and audit requirements before exposing authoring endpoints.

### SF-05 — Frontend composition and state ownership

- `src/App.tsx` is now 257 lines; account/tenant/import/progress-sync/assessment-sync UI and side effects are encapsulated in `LearningAccountControls`.
- Course navigation, lesson content, course-data loading, labs and local learning-state persistence already have feature-owned boundaries.
- Course-authoring orchestration and route-like view selection remain in App; extract only where lifecycle ownership is clear.

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

| Slice | Implementation status | Remaining acceptance |
|---|---|---|
| Session and tenant context | Session API, tenant discovery, explicit selector, stale-preference revalidation and logout implemented | Configure a real OIDC provider and complete provider-backed E2E |
| Course release consumption | Authenticated published metadata and immutable snapshot reads implemented | Seed the exact current curriculum into the intended persistent database and record its real UUID |
| Platform publication | Strict publisher CLI, dedicated DB role contract, reviewed digest, atomic audit, idempotency and immutability implemented | Provision publisher role in persistent target DB and publish there |
| Learner progress | Exact-release resolution, full snapshot validation, remote/local merge, complete/reopen sync implemented | Enable only after OIDC, persistent DB and privacy gates |
| Assessment lifecycle | Latest-draft API, optimistic update, 64 KiB JSON bound, no-store, conflict-safe sync implemented | Instructor grading remains out of scope; real provider/persistent DB acceptance pending |
| Guest/local data migration | Explicit account/tenant import, set-union semantics and draft conflict preservation implemented | Manual UX review on shared browser/account switching |
| Authoring/instructor workflow | Browser-local authoring only; no authenticated server authoring API | Define roles, resource-scoped authorization, review/approval and audit before implementation |
| Operational readiness | Liveness/readiness, request correlation, security boundaries and local acceptance available | Persistent deployment, backup/restore, provider E2E, privacy review, load/failure/recovery rehearsal |

Implementation order from here:
1. Complete persistent PostgreSQL setup and seed the first immutable course release; do not reuse a UUID from a disposable test database.
2. Configure a real OIDC provider registration, callback URL, client type and secrets; run the full login/session/tenant/learner API E2E.
3. Perform production runtime-role grants review and privacy/retention review; only then consider enabling learner APIs.
4. Define instructor/course-authoring roles and approval lifecycle before adding server authoring endpoints.
5. Continue risk-based code review, manual accessibility review, operational backup/restore and failure recovery.

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

**Remaining external operation:** a local PostgreSQL container was found, but it is not configured in `backend/.env`; its `academy` database is at revision 0011 and contains zero course releases. It has an existing runtime role but no publisher role. The database has not been modified in this continuation. Apply migration 0012 through Alembic, verify/reprovision least-privilege roles, and run the documented dry-run/review/publish sequence against the intended persistent database. Only the resulting committed release UUID can unblock live learner synchronization.

### SF-05/SF-06/SF-07 — Learner progress, assessment drafts and guest import（code implemented; activation gated）

The frontend sync adapters and backend routes are implemented and tested. Progress sync requires an exact published release UUID and exact module sequence. Assessment draft sync uses a 700 ms debounce, latest-draft lookup, optimistic `updated_at` revision checks and a new attempt on concurrent conflict. Guest-to-account import is explicit and idempotent; conflicting assessment drafts are preserved rather than overwritten.

The production activation dependency is now narrowly defined: the current course snapshot must be published into the intended persistent database; the actual returned UUID is resolved by API at runtime, never hard-coded. Then a real OIDC provider and production runtime role/privacy review must pass. Keep all feature flags false until those gates are satisfied.


### SF-04 acceptance evidence — 2026-11-10

- Disposable PostgreSQL 18.6 migration rehearsal reached the single Alembic head 0012_platform_publisher_audit.
- Dedicated publisher acceptance passed: strict full-curriculum validation, direct-role identity checks, least-privilege grants, restrictive tenant-membership RLS, atomic release/audit write and forced audit-failure rollback, concurrent idempotency race, conflicting-content rejection, expected-digest rejection, draft-insert rejection and immutable published-snapshot update/delete rejection.
- Separate PostgreSQL RLS acceptance passed with a non-owner, non-superuser, non-BYPASSRLS academy_runtime role.
- pnpm acceptance:local: Biome lint/format, TypeScript, OpenAPI drift (15 paths), Vitest 88, Playwright Chromium 46, M04–M20 Python example suites, Ruff, backend pytest 152 passed / 1 optional skip, Vite production build passed.
- pnpm security:audit: no known npm or Python third-party dependency vulnerabilities; the unpublished first-party Python package was skipped by pip-audit because it is not published on PyPI.
- GitHub Actions were not triggered. No persistent production database publication or external OIDC acceptance is claimed.


### SF-06 — Frontend feature-boundary refactor (three slices complete)

- Extracted course directory, progress summary, recommendation, search and bookmark filtering into src/features/learning/CourseModuleNavigation.tsx.
- Centralized course-level labels and implemented-lab metadata in src/features/learning/courseMetadata.ts.
- Extracted lesson content, learning objectives, completion action, assessment response UI and source references into src/features/learning/LessonArticle.tsx.
- Extracted prerequisites, learning outcomes and lab execution context into src/features/learning/LearningContextAside.tsx.
- Extracted module lesson loading, authoring data loading, full-text search indexing, retry handling and course validation into src/features/learning/useAcademyCourseData.ts.
- Added a lazy lab component registry and LabWorkspace. Catalog labs are marked implemented only when a matching lazy workspace exists; a focused Vitest contract test prevents registry/catalog drift.
- These components/hooks receive explicit inputs and callbacks. They do not introduce global state, alter localStorage persistence, or change authentication/tenant responsibilities.
- src/App.tsx reduced from 574 to 237 lines (337 lines / 58.7% reduction) while retaining application orchestration and view composition.
- Full local acceptance passed after the refactor: 90 Vitest, 47 Playwright, 152 backend pytest + 1 optional skip, TypeScript, Biome, OpenAPI drift, M04–M20 examples and production build.

Regression coverage now forces the first M01 dynamic import to fail and verifies that the retry control successfully reloads the lesson payload; this caught and fixed a retry effect that previously did not re-run when the lesson cache entry remained undefined. Next extraction should target course-authoring orchestration only if its lifecycle and validation boundary can be isolated cleanly. Avoid splitting files solely to reduce line count.


### CQ-02 — Learner record creation serialization（implemented 2026-11-10）

The first-write race in both assessment attempt numbering and learning-progress creation is closed with PostgreSQL transaction-scoped advisory locks keyed by the complete logical record identity. The database unique constraints remain authoritative. The lock helper uses a parameterized `hashtextextended` key; lock lifetime is bounded by the authenticated learner transaction. A two-connection PostgreSQL integration test proves that a second creator blocks until the first transaction ends.

Acceptance: 154 backend tests passed (2 optional DB-only skips in the ordinary run); disposable PostgreSQL RLS/concurrency acceptance passed 2 tests with a non-owner, non-superuser, non-BYPASSRLS runtime role; full `pnpm acceptance:local` passed with 90 Vitest and 47 Playwright tests.


### CQ-02 — Session revocation ordering（implemented 2026-11-10）

Session resolution and revocation now coordinate through PostgreSQL transaction-scoped shared/exclusive advisory locks. The token-hash bootstrap query remains SELECT-only; the resolver switches to the owner RLS context before rechecking active session state. Concurrent authenticated requests share the lock, while logout/rotation require the exclusive lock. This makes logout wait for in-flight requests without granting broader bootstrap RLS permissions.

A real PostgreSQL two-connection test invokes `resolve_session` and `revoke_session`, verifies revocation waits for the in-flight transaction, and confirms subsequent resolution fails. Disposable PostgreSQL RLS acceptance passed 3 tests with a non-owner, non-superuser, non-BYPASSRLS role.


### CQ-02 — Real learner HTTP concurrency acceptance（implemented 2026-11-10）

The disposable PostgreSQL RLS harness now exercises concurrent `POST /learning/progress` and `POST /assessments/attempts` requests through FastAPI using an opaque session cookie and the non-owner runtime role. Concurrent progress starts converge on one UUID; concurrent assessment attempts continue an existing sequence as 2 and 3 without duplicate numbers or gaps. The exercise also caught and fixed detached ORM response timestamps by refreshing write results before leaving the transaction. PostgreSQL integration acceptance: 3 passed; ordinary backend pytest: 154 passed / 3 optional DB-only skips.


Session lifecycle follow-up: the PostgreSQL integration test now proves concurrent authenticated readers can hold the shared lifecycle lock together while logout waits for both. `last_seen_at` is updated with `GREATEST(existing, request_time)` so a slower, earlier request cannot move activity time backwards when it commits after a newer request. PostgreSQL acceptance remains 3 passed.


### CQ-03 — API mutation cancellation covers CSRF bootstrap（implemented 2026-11-10）

Caller cancellation now applies while an unsafe request waits for the shared session-bound CSRF token, not only after the business request starts. Cancellation rejects only that caller's wait and does not abort the shared token bootstrap used by concurrent requests. A post-bootstrap abort check prevents the mutation from being sent after cancellation. No automatic mutation replay was introduced.

Regression: cancel a progress mutation while the CSRF endpoint is pending; assert no mutation request is sent; resolve the shared token and verify a subsequent mutation succeeds. API client tests: 16 passed. Full local acceptance: 91 Vitest, 47 Playwright, 154 backend pytest / 3 optional DB-only skips, Biome, TypeScript, OpenAPI drift, M04–M20 examples, Ruff and production build all passed. GitHub Actions were not triggered.


### CQ-04 — Publisher schema-head preflight（implemented 2026-11-10）

The platform publisher now reads `alembic_version` before any write and requires exactly one revision: `0012_platform_publisher_audit`. Missing, stale or multi-head schema state fails closed. The dedicated publisher role receives SELECT-only access to `alembic_version`; its provisioning SQL and ADR document the purpose, and no migration-state write privilege is granted.

Disposable PostgreSQL publisher acceptance now downgrades to 0011 and proves publication is rejected before restoring 0012. The full `pnpm acceptance:course-publisher` gate passed, including the existing strict snapshot, concurrency/idempotency, audit atomicity, least-privilege, RLS, immutability and migration downgrade/re-upgrade checks. The temporary database was removed; its release UUID is not a persistent course identity.


### CQ-05 — Account- and tenant-scoped browser learning state（implemented 2026-11-10）

Browser-local bookmarks, completion flags and assessment drafts are now stored under a scope derived from the authenticated server session user ID and the currently revalidated tenant ID. Guest state is isolated. Legacy unscoped keys remain readable only as guest data and are not silently copied into an account. App now owns one session hook and passes its authoritative state to both the account control and learning-state boundary. Scope transitions synchronously reset in-memory state before persistence effects can run.

Two unit tests cover user/tenant separation and key encoding. TypeScript, Biome, and focused API/storage tests passed. Authentication and learner data feature flags remain disabled by default.


### SF-05 — Exact-version learner progress sync（implemented, feature-gated 2026-11-10）

Added an account/tenant-scoped learner progress sync adapter. It resolves the exact published `course_key + version + schema_version`, fetches the immutable snapshot, validates the full snapshot with the frontend Zod CourseSchema, and requires the exact module ID sequence before using the release UUID. It merges remote completions into local account/tenant state and converges local completion changes through idempotent begin/complete/reopen APIs. It does not infer UUIDs from version labels, import guest/legacy browser state into an account, or upload bookmarks/assessment drafts.

The feature requires both `VITE_ACADEMY_AUTH_UI_ENABLED=true` and `VITE_ACADEMY_LEARNER_SYNC_ENABLED=true`; both remain false by default. No release exists in the durable production database yet, so this capability must not be enabled in production until a real release is published and OIDC/runtime-role/privacy acceptance is complete.

Tests: exact published-version resolution and schema validation, fail-closed missing release, creation/completion/reopening reconciliation. Focused tests and TypeScript passed.


### SF-06 — Assessment draft persistence and conflict-safe sync（implemented, feature-gated 2026-11-10）

Added learner-owned latest-draft reads and optimistic-concurrency draft updates. The API exposes only the latest attempt per assessment when its lifecycle state is still `draft`; submitted/graded attempts are not resurrected. Draft writes require the expected server `updated_at` revision and reject stale writes with 409. Payloads remain bounded to 64 KiB finite JSON, and submitted attempts are immutable through the learner draft endpoint. All learner progress/assessment responses are `no-store`.

The frontend debounces draft sync, validates assessment IDs against the exact published release snapshot, merges remote-only drafts, preserves pending local edits, updates matching server revisions, and forks a new attempt on concurrent revision conflict rather than overwriting remote work. ACK handling checks that the local value still matches the sent payload before marking it synchronized. The feature shares the existing learner sync gate and remains disabled by default.

Acceptance: OpenAPI 17 paths in sync; backend 159 passed / 3 optional DB-only skips; real PostgreSQL 18 RLS HTTP integration 3/3 passed including stale revision conflict, submitted draft immutability and no-store; Vitest 104, Playwright 47, M04–M20 examples, Biome, TypeScript, Ruff and production build passed. GitHub Actions not triggered.


### SF-07 — Explicit guest-to-account learning data import（implemented 2026-11-10）

Added an explicit import control after authentication and tenant selection. Guest/legacy local bookmarks and completions merge by set union; guest assessment drafts are copied only when the account has no draft for that assessment. Conflicts preserve the account value and keep the guest source unchanged, with a visible conflict count. A scope-specific fingerprint marker makes repeated imports idempotent and allows later guest changes to be imported. The migration never fabricates identity, tenant authorization or course release IDs.

Four focused tests cover key scope and guest-import merge/idempotency/conflict behavior. Cloud synchronization remains independently feature-gated.


### CQ-06 — Account and learner-control feature boundary（implemented 2026-11-10）

Extracted session/tenant presentation, guest import, learner progress sync and assessment draft sync orchestration from `src/App.tsx` into `LearningAccountControls`. App retains the authoritative session and learning state; the component receives explicit state/setter props and does not instantiate a second session or make authorization decisions. App composition is reduced by roughly 90 lines without changing default feature gates.


### SF-08 — Persistent local PostgreSQL bootstrap and reviewed publication（implemented, not applied to candidate DB）

Added a loopback-only bootstrap path: `scripts/bootstrap-local-postgres.sh` runs the full Alembic chain as a separate admin role, requires exact migration head 0012, provisions `academy_runtime` and `academy_course_publisher` as direct-login non-superuser/non-BYPASSRLS roles, removes role memberships, applies narrow grants/default privileges and verifies ownership/grant invariants. `backend/.env.example` separates admin/runtime/publisher credentials; the real `.env` remains ignored and is mode 0600. The bootstrap supports hosts without `psql` through an explicit `ACADEMY_DB_PSQL_CONTAINER` setting. Runtime has read-only access to immutable `course_releases`; only the dedicated publisher may insert releases. No default privileges are granted to future migration-created tables or sequences; role provisioning must be rerun after each schema migration. `scripts/publish-local-course-release.sh` exports the exact current curriculum and performs a dry-run first; persistent publication requires a second invocation with the reviewed SHA-256 in `ACADEMY_EXPECTED_COURSE_SHA256`.

A new, isolated persistent local PostgreSQL 18 instance now runs as Docker container `aea-local-postgres` on `127.0.0.1:5433`, backed by named volume `aea-local-postgres-data`. The pre-existing `aea-acceptance-pg` candidate database was left untouched. Bootstrap reached `0012_platform_publisher_audit`; runtime and publisher roles were verified direct-login, non-superuser and non-BYPASSRLS. The actual current curriculum was published as immutable release `a8c08456-6f6b-4f68-8ec9-40785ca7db71` (`ai-engineering-foundations` 0.40.9, schema 1), 20 modules / 100 lessons / 100 assessments, SHA-256 `4779e75a5042b4759f011bc2747850e6ad7151657368ba1912574615766b5df0`. The matching global audit event exists. The application SQLAlchemy connection uses `academy_runtime`, sees the correct migration head and release, and readiness returns ready. Learner APIs remain disabled because no real OIDC provider or privacy/retention approval has been configured.

Latest full acceptance: 106 Vitest, 47 Playwright, 159 backend pytest / 3 optional DB-only skips, OpenAPI 17 paths, Biome, TypeScript, Ruff, all M04–M20 examples, production build, PostgreSQL RLS 3/3 (including runtime release-table read-only grants), publisher PostgreSQL acceptance and dependency audit all passed. A separate basedpyright scan reported 0 errors and 301 warnings; warnings are not yet an enforced project gate. No GitHub Actions were triggered.


### CQ-07 — Serialize assessment attempt lifecycle by logical assessment identity（implemented 2026-11-10）

Draft update and submit now acquire the same transaction-scoped advisory lock used by attempt creation, keyed by tenant/user/release/assessment, before checking the latest attempt number. Only the latest attempt may be edited or submitted; older drafts remain historical and return 409. This closes the race where a new attempt could be created while an older draft update was in flight. Row locking and expected `updated_at` revision checks remain in place.

PostgreSQL 18.6 HTTP acceptance now exercises concurrent attempt creation vs update and asserts a serializable outcome: the old update either commits before the new attempt or is rejected after it, and the new attempt remains latest. RLS acceptance: 3/3 passed.


### Privacy/retention engineering assessment（completed; policy approval remains open）

Added `docs/PRIVACY_AND_RETENTION_REVIEW_2026-11.md` with a code-grounded inventory of account, OIDC identity/session, tenant, learner progress, assessment, audit, course release and browser-local data; current security controls; gaps in scheduled cleanup, export/erasure, backup deletion and legal/operational retention; and a proposed schedule explicitly marked as unapproved. This completes the engineering inventory/control-gap assessment only. It does not approve a privacy notice, lawful basis, minors' consent, jurisdiction, data-controller roles or retention contract. Production learner APIs remain disabled until an accountable owner approves those decisions and the implementation evidence exists.
