# Roadmap

## P1 — Frontend learning platform foundation
- [x] React + TypeScript + Vite application shell
- [x] 20-module curriculum navigation and full-text search
- [x] Runtime schema validation for course content, with strict unknown-field rejection at every object boundary
- [x] Prerequisite integrity and cycle validation
- [x] Explicit lab execution registry and safety notes
- [x] Safe Markdown rendering without raw HTML
- [x] Eight teaching labs: Tokenizer, Transformer, RAG, Tool Calling, Agent Runtime, MCP, Multi-Agent and Evaluation
- [x] Author substantive, sourced lessons and rubric assessments for M01–M20
- [x] Browser-local module completion progress, bookmarks and assessment self-review
- [x] Playwright Chromium E2E suite authored for core learning flows, accessibility and mobile widths
- [x] Execute browser E2E suite (47 passed) and automated accessibility checks; [ ] complete manual accessibility audit
- [x] Generate and commit the dependency lockfile after resolving the package set
- [x] Verify clean lockfile install, local tests and production build in the controlled local runtime

## P2 — Learning experience
- [x] Content authoring guide, schemaVersion contract and legacy v0-to-v1 migration
- [x] Course module search across title, summary, objectives and lesson content
- [x] Browser-local course authoring workspace with JSON import/export, strict schema validation, UTF-8 byte limits and local draft persistence
- [x] Simplified Chinese curriculum copy pass and content release 0.3.1
- [x] UTF-8 byte-limit helper tests for multibyte text

## P3 — Backend and execution platform
- [x] Accepted ADR for a FastAPI modular monolith; defer microservices and infrastructure without validated need
- [x] FastAPI operational API skeleton with liveness and dependency-aware readiness endpoints
- [x] Environment-backed settings and production fail-closed database configuration
- [x] Async SQLAlchemy PostgreSQL connectivity probe and session factory
- [x] Explicit session and atomic transaction context managers
- [x] Alembic async PostgreSQL migration environment
- [x] Initial versioned course-release snapshot schema and ORM model
- [x] Deterministic course-content hashing and draft-to-published domain service
- [x] Publication timestamp/status invariant enforced by a follow-up migration
- [x] Course release lifecycle and migration-chain unit tests authored
- [x] Backend health and model tests executed as part of local acceptance
- [x] Define OIDC identity, tenant membership, session and learner-data isolation baseline in ADR-0003
- [x] Add user, OIDC identity, session, tenant, membership, role, invitation and audit schemas with no general CRUD HTTP exposure
- [x] Add provider-neutral opaque session hashing, CSRF HMAC, OIDC state/nonce and PKCE S256 primitives with RFC-vector tests
- [x] Implement strict OIDC discovery, HTTPS endpoint validation, cached JWKS retrieval/key rotation refresh and PyJWT ID-token verification (signature, issuer, audience, exp/iat, sub, nonce, azp)
- [x] Implement opaque session create/resolve/revoke/rotate services and HttpOnly cookie helpers (used by OIDC routes)
- [x] Implement opt-in CSRF/Origin middleware with explicit origin allowlist and session-bound double-submit HMAC (installed only when OIDC is configured)
- [x] Implement active tenant-membership resolution and default-deny role permission checks; tenant admins cannot grant tenant_admin
- [x] Add narrow transaction-local token-hash RLS bootstrap for session lookup before user identity resolution
- [x] Implement authorization-code exchange (public-client PKCE and confidential client_secret_basic); return only the ID token
- [x] Persist one-time OIDC login transactions with state/nonce hashes, Fernet-encrypted PKCE verifier, expiry and row-lock consume-once semantics under state-hash RLS
- [x] Build Authorization Code + PKCE authorization URLs with server-generated state/nonce and S256 challenge
- [x] Implement issuer+subject identity resolution and learner-only personal workspace provisioning with verified-email handling and security audit events
- [x] Add exact issuer/subject RLS bootstrap and self-only personal-tenant/membership/learner-role insert policies
- [x] Implement opt-in OIDC login/callback/current-session/CSRF-token/logout routes; routes return 503 until configuration is complete
- [x] Add fail-closed OIDC settings validation, exact CORS/Origin allowlists and lifespan-scoped provider/JWKS cache
- [ ] Configure the production OIDC provider registration, secrets, callback URL and same-site deployment
- [x] Implement transaction-local user/tenant context helper and forced PostgreSQL RLS policies for identity/tenant tables
- [x] Execute repeatable PostgreSQL RLS integration acceptance using a separate non-owner runtime role (PostgreSQL 18.6, 2026-11-10; see [POSTGRES_RLS_ACCEPTANCE](./POSTGRES_RLS_ACCEPTANCE.md))
- [x] Execute RLS integration acceptance with provisioned admin/runtime database roles before learner-data APIs
- [x] Add tenant/user/course-release-scoped learning progress and assessment result schemas with lifecycle constraints
- [x] Add pure progress/assessment lifecycle services with JSON payload and timestamp validation
- [x] Apply forced RLS to learner records and execute non-owner cross-tenant integration acceptance
- [x] Add static migration-policy tests and same-tenant cross-user read/update isolation assertions to PostgreSQL acceptance; execute against real PostgreSQL
- [x] Execute PostgreSQL RLS acceptance with provisioned runtime role before learner-data APIs
- [x] Implement self-scoped learner progress and assessment-attempt routes with session, membership, role and owner filters (disabled by default)
- [x] Add database trigger preventing learner self-grading and assessment identity mutation
- [x] Add self-only active-membership discovery so clients can select an authorized tenant context
- [x] Execute non-owner PostgreSQL RLS acceptance.
- [x] Complete engineering privacy data inventory/control-gap assessment in [PRIVACY_AND_RETENTION_REVIEW_2026-11](./PRIVACY_AND_RETENTION_REVIEW_2026-11.md).
- [ ] Approve jurisdiction-specific privacy notice/consent, retention schedule, export/deletion workflow and backup deletion semantics before enabling learner APIs.
- [ ] Add resource-scoped instructor authorization and instructor grading APIs
- [ ] Sandboxed code execution with quotas and isolation
- [ ] Model gateway with explicit provider configuration
- [ ] Evaluation datasets, trace capture and observability

## P4 — Production readiness
- Threat modelling, privacy review and operational controls
- Performance, reliability and cost budgets
- CI/CD enablement after workflow governance is approved


## P5 — Code quality and system functionalization (2026-11-10)

- [x] Establish current local quality baseline: 106 Vitest, 47 Playwright, 159 backend pytest passed / 3 optional DB-only skips, Biome, Ruff, TypeScript, OpenAPI drift (17 paths), PostgreSQL RLS acceptance (3 passed) and production build passed.
- [x] Execute real PostgreSQL 18.6 RLS acceptance with an unprivileged non-owner / non-superuser / non-BYPASSRLS runtime role.
- [x] Document risk-based code-quality and system-functionalization backlog in [ENGINEERING_QUALITY_AND_FUNCTIONALIZATION_2026-11](./ENGINEERING_QUALITY_AND_FUNCTIONALIZATION_2026-11.md).
- [x] Expose authenticated `GET /tenants/me` using migration 0010's self-only RLS policy; verify actual query service on PostgreSQL 18.6.
- [x] Implement typed frontend API transport with Cookie credentials, session-bound CSRF, explicit tenant context, structured errors, timeout/cancellation and 18 regression tests; full local acceptance passed.
- [x] Add feature-gated session bootstrap, tenant discovery/selection, stale-preference revalidation and CSRF-protected logout UI (4 dedicated scenarios; full Playwright suite 47 passed); frontend auth UI flag defaults off.
- [x] Implement exact-version learner progress sync with full published-snapshot validation, remote/local reconciliation and complete/reopen APIs (feature-gated).
- [x] Implement assessment draft persistence/sync with latest-draft reads, optimistic concurrency, latest-attempt-only update/submit serialization, conflict-safe attempt creation and no-store responses (feature-gated).
- [x] Implement explicit idempotent guest-to-account import with set-union and draft-conflict preservation.
- [x] Publish the current curriculum snapshot into the dedicated persistent local PostgreSQL database and bind live synchronization to its actual release UUID (release `a8c08456-6f6b-4f68-8ec9-40785ca7db71`, version `0.40.9`, 20 modules / 100 lessons / 100 assessments).
- [ ] Complete real-provider OIDC E2E; the engineering privacy assessment is complete, but accountable-owner privacy/retention and user-rights approvals remain outstanding before enabling learner APIs.
- [x] Add authenticated, tenant-authorized published course-release metadata/content read APIs; drafts remain hidden (17 OpenAPI paths after learner draft endpoints; PostgreSQL 18.6 RLS route acceptance passed).
- [x] Add ADR-0009 defining immutable release consumption, platform-scoped publication and explicit legacy-data import boundaries.
- [x] Implement platform-scoped course publication CLI, strict snapshot validation, reviewed digest, atomic audit, idempotency and immutable database guards (ADR-0010; PostgreSQL 18.6 disposable acceptance passed).
- [x] Add loopback-only persistent PostgreSQL bootstrap and least-privilege runtime/publisher role provisioning scripts; SQL syntax/role grants validated in a rollback-only PostgreSQL transaction.
- [x] Add reviewed-digest publisher wrapper; first run is dry-run only and publication requires the exact approved SHA-256.
- [x] Upgrade the dedicated persistent local PostgreSQL database to migration 0012, provision runtime/publisher roles and publish the first persistent release; disposable acceptance UUIDs are not reused.
- [x] Implement runtime release resolution and exact version/schema/module validation; no release UUID is hard-coded.
- [ ] Define instructor/course-authoring authorization and publishing workflow before exposing authoring APIs.


## Frontend maintainability

- [x] Extract course navigation, lesson article/assessment content, learning-context aside, course-data loading hook, lazy lab registry and learner account/sync controls into feature-owned modules with explicit inputs/callbacks; App.tsx currently 257 lines.
- [ ] Extract course-authoring orchestration into a feature-owned workflow only if its lifecycle boundary is clear; preserve lazy loading, validation and local draft semantics.
- [ ] Add focused component-level tests where they provide coverage beyond the existing Playwright end-to-end suite.
