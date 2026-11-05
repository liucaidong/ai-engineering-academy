# Roadmap

## P1 — Frontend learning platform foundation
- [x] React + TypeScript + Vite application shell
- [x] 20-module curriculum navigation and full-text module search
- [x] Runtime schema validation, prerequisite integrity and cycle validation
- [x] Explicit lab execution registry and safety notes
- [x] Safe Markdown rendering without raw HTML
- [x] Eight browser-local/simulation labs: Tokenizer, Transformer, RAG, Tool Calling, Agent Runtime, MCP, Multi-Agent and Evaluation
- [x] Sourced lesson content and rubric assessments for M01–M20
- [x] Browser-local module completion, bookmarks, assessment drafts and rubric self-review
- [x] Prerequisite-aware next-module recommendations
- [x] Keyboard skip link, semantic navigation, focus-visible and reduced-motion support
- [x] Playwright Chromium E2E suite and axe WCAG A/AA scans authored
- [ ] Execute browser E2E suite and complete full accessibility audit
- [ ] Generate and commit a dependency lockfile after resolving the final package set
- [ ] Verify clean install, unit tests and production build in a controlled runtime

## P2 — Learning experience
- [x] Content authoring guide, schemaVersion contract and legacy v0-to-v1 migration
- [x] Course module search, bookmarks and prerequisite-aware recommendations
- [ ] Server-synced assessment history and instructor feedback
- [ ] Content authoring UI and review workflow

## P3 — Backend and execution platform
- Server-side learner progress and assessment history
- API service and PostgreSQL persistence
- Identity, learner profiles and progress events
- Sandboxed code execution with quotas and isolation
- Model gateway with explicit provider configuration
- Evaluation datasets, trace capture and observability

## P4 — Production readiness
- Threat modelling, privacy review and operational controls
- Performance, reliability and cost budgets
- CI/CD enablement after workflow governance is approved
