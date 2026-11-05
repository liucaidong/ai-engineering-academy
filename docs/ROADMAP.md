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
- [ ] Execute browser E2E suite and complete full accessibility audit
- [ ] Generate and commit a dependency lockfile after resolving the final package set
- [ ] Verified clean install, test and production build in a controlled runtime

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
- [x] Backend health and model tests authored (execution pending)
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
- [x] Author optional PostgreSQL RLS integration acceptance using a separate non-owner runtime role (execution pending)
- [ ] Execute RLS integration acceptance with provisioned admin/runtime database roles before learner-data APIs
- [x] Add tenant/user/course-release-scoped learning progress and assessment result schemas with lifecycle constraints
- [x] Add pure progress/assessment lifecycle services with JSON payload and timestamp validation
- [x] Apply forced RLS to learner records and author non-owner cross-tenant integration acceptance (execution pending)
- [x] Add static migration-policy tests and same-tenant cross-user read/update isolation assertions to PostgreSQL acceptance (execution pending)
- [ ] Execute PostgreSQL RLS acceptance with provisioned runtime role before learner-data APIs
- [ ] Add resource-scoped instructor authorization plus learner-data application services
- [ ] Sandboxed code execution with quotas and isolation
- [ ] Model gateway with explicit provider configuration
- [ ] Evaluation datasets, trace capture and observability

## P4 — Production readiness
- Threat modelling, privacy review and operational controls
- Performance, reliability and cost budgets
- CI/CD enablement after workflow governance is approved
