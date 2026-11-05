# Roadmap

## P1 — Frontend learning platform foundation
- [x] React + TypeScript + Vite application shell
- [x] 20-module curriculum navigation and full-text search
- [x] Runtime schema validation for course content, with strict unknown-field rejection at every object boundary
- [x] Prerequisite integrity and cycle validation
- [x] Explicit lab execution registry and safety notes
- [x] Safe Markdown rendering without raw HTML
- [x] Eight teaching labs: Tokenizer, Transformer, RAG, Tool Calling, Agent Runtime, MCP, Multi-Agent and Evaluation
- [x] Author substantive, sourced lessons and rubric assessments for M01–M03
- [x] Author substantive, sourced lessons and rubric assessments for M04–M09
- [x] Author substantive, sourced lessons and rubric assessments for M10–M20
- [x] Browser-local module completion progress (localStorage; no account sync)
- [x] Browser-local assessment drafts and rubric self-review (no server sync)
- [x] Keyboard skip link, semantic navigation, focus-visible and reduced-motion support
- [x] Playwright Chromium E2E suite authored for search, progress, assessments, all eight labs, keyboard navigation, mobile width and axe WCAG A/AA scan
- [ ] Execute browser E2E suite and complete full accessibility audit
- [ ] Generate and commit a dependency lockfile after resolving the final package set
- [ ] Verified clean install, test and production build in a controlled runtime

## P2 — Learning experience
- [x] Content authoring guide, schemaVersion contract and legacy v0-to-v1 migration
- [x] Course module search across title, summary, objectives and lesson content
- [x] Browser-local module bookmarks and prerequisite-aware next-module recommendations
- [x] Tool Calling, Agent Runtime, MCP, Multi-Agent and Evaluation local teaching labs
- [x] Browser-local course authoring workspace with JSON import/export, strict schema validation, UTF-8 byte limits and local draft persistence
- [x] Simplified Chinese curriculum copy pass and content release 0.3.1
- [x] UTF-8 byte-limit helper tests for multibyte text

## P3 — Backend and execution platform
- [x] Accepted ADR for a FastAPI modular monolith; defer microservices and infrastructure without validated need
- [x] FastAPI operational API skeleton with liveness and dependency-aware readiness endpoints
- [x] Environment-backed settings and production fail-closed database configuration
- [x] Async SQLAlchemy PostgreSQL connectivity probe
- [x] Backend health/configuration tests authored (execution pending)
- [ ] Add Alembic migration foundation and first versioned database schema
- [ ] Define identity, tenant isolation, learner profiles and authorization model before learner-data APIs
- [ ] Persist learner progress and assessment history with explicit transaction boundaries
- [ ] Sandboxed code execution with quotas and isolation
- [ ] Model gateway with explicit provider configuration
- [ ] Evaluation datasets, trace capture and observability

## P4 — Production readiness
- Threat modelling, privacy review and operational controls
- Performance, reliability and cost budgets
- CI/CD enablement after workflow governance is approved
