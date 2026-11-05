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
- [x] Add dormant user, OIDC identity, session, tenant, membership, role, invitation and audit schemas with Alembic migration (no HTTP exposure)
- [ ] Implement OIDC sign-in/session lifecycle and CSRF/origin protections
- [x] Implement transaction-local user/tenant context helper and forced PostgreSQL RLS policies for identity/tenant tables
- [x] Author optional PostgreSQL RLS integration acceptance using a separate non-owner runtime role (execution pending)
- [ ] Execute RLS integration acceptance with provisioned admin/runtime database roles before learner-data APIs
- [x] Add tenant/user/course-release-scoped learning progress and assessment result schemas with lifecycle constraints
- [x] Apply forced RLS to learner records and author non-owner cross-tenant integration acceptance (execution pending)
- [ ] Execute PostgreSQL RLS acceptance with provisioned runtime role before learner-data APIs
- [ ] Implement OIDC authentication, instructor authorization and learner-data application services
- [ ] Sandboxed code execution with quotas and isolation
- [ ] Model gateway with explicit provider configuration
- [ ] Evaluation datasets, trace capture and observability

## P4 — Production readiness
- Threat modelling, privacy review and operational controls
- Performance, reliability and cost budgets
- CI/CD enablement after workflow governance is approved
