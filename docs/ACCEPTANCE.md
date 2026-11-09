# Engineering Acceptance Checklist

## Scope

This checklist covers the frontend, FastAPI backend, generated API contract and local engineering acceptance. It distinguishes repository implementation from runtime acceptance. A checked source-code item does not imply that a production environment has been accepted.

## Repository and build

Run from a clean clone with the repository-pinned Node.js 26 LTS and pnpm 12.7.0:

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm validate:course
pnpm typecheck
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e

# 完整本地质量门禁（前端 + 后端）
pnpm acceptance:local

pnpm dev
```

Acceptance evidence to retain:

- Node.js and pnpm versions;
- install output and dependency resolution result;
- complete Vitest summary;
- Biome lint/format and TypeScript typecheck output;
- OpenAPI source schema and generated TypeScript drift check;
- Vite production build output;
- browser and operating-system versions used for manual checks.

## Course contract

- [ ] The 20 modules load without schema warnings.
- [x] `pnpm test:e2e` passes all 23 browser scenarios (2026-11-09).
- [ ] Every module has at least one lesson, three or more content sections, two source references and one rubric assessment.
- [ ] Duplicate module, lesson, assessment and rubric criterion identifiers are rejected.
- [ ] Unknown, repeated, self-referential and cyclic prerequisites are rejected.
- [ ] Unknown lab references are rejected when a lab registry is supplied.
- [ ] Source URLs pass Zod URL validation.
- [ ] Legacy payloads migrate to schemaVersion 1 and unsupported versions are rejected.

## Learning workflow

- [ ] Bookmark and unbookmark a module, refresh, and confirm persistence.
- [ ] Filter the curriculum to bookmarked modules.
- [ ] Confirm the next-module recommendation respects prerequisite completion.

- [ ] Select each module from the navigation.
- [ ] Open prerequisites and confirm navigation to the referenced module.
- [ ] Mark a module complete, refresh, and confirm it remains complete.
- [ ] Unmark a module and confirm the progress percentage updates.
- [ ] Enter an assessment response and select rubric criteria.
- [ ] Refresh and confirm assessment draft and self-review persist.
- [ ] Confirm stale or malformed localStorage data does not prevent the app from loading.
- [ ] Confirm private browsing or blocked localStorage degrades gracefully.

## Course authoring

- [ ] Add unknown keys at course, module and lesson-section levels; confirm strict Schema validation rejects them instead of stripping them.
- [ ] Confirm the 2 MiB limit is measured in UTF-8 bytes, including multibyte Chinese text.
- [ ] Confirm validation errors show actionable JSON paths.

- [ ] Open the course editor and confirm the current course payload loads.
- [ ] Import a valid JSON course file and confirm Schema v1 validation succeeds.
- [ ] Import malformed JSON and confirm export is disabled with a visible error.
- [ ] Confirm the draft persists after refresh in the same browser.
- [ ] Export a valid course and re-import it without losing modules, labs or assessments.
- [ ] Confirm the editor discloses that drafts are browser-local and are not published.

## Labs

- [ ] Tokenizer accepts bounded text input and shows the toy BPE merge steps.
- [ ] Transformer toggles causal masking and updates score/weight/output matrices.
- [ ] RAG query changes update ranked teaching examples.
- [ ] Tool Calling rejects malformed, unauthorized and unknown tool requests.
- [ ] Agent Runtime blocks execution until approval and terminates on rejection.
- [ ] MCP lab discovers local capabilities without opening a network connection.
- [ ] Multi-Agent lab shows role findings and bounded synthesis.
- [ ] Evaluation lab reports exact-match metrics and failure cases.
- [ ] Each lab visibly states whether it is browser-local or simulation.
- [ ] No lab implies a real model call, production embedding, external network access or server sandbox.

## Accessibility and responsive layout

- [ ] Skip link moves focus to the main content.
- [ ] All controls are reachable and operable by keyboard.
- [ ] Focus indicators remain visible.
- [ ] Navigation and progress indicators expose meaningful accessible names and states.
- [ ] Matrix values and dynamic RAG results expose appropriate semantics.
- [ ] Layout remains usable at 320px width and common tablet/desktop widths.
- [ ] Reduced-motion preference is respected.
- [ ] Resolve all axe WCAG 2.0/2.1/2.2 A/AA violations.
- [ ] Verify contrast and screen-reader output with manual accessibility checks.

## Security and privacy

- [ ] Markdown raw HTML remains disabled.
- [ ] No provider API key or secret is bundled into the frontend.
- [ ] No server-sandbox or provider-backed capability is advertised as implemented.
- [ ] Assessment responses and module progress are clearly disclosed as browser-local.
- [ ] No learner response is transmitted to a server.

## TypeScript quality and API contract

- [x] Biome 2.6.6 lint and formatting are enforced by `pnpm check`.
- [x] Ruff format and lint are enforced by `pnpm acceptance:local`.
- [x] TypeScript strict typecheck is enforced by `pnpm check`.
- [x] FastAPI exports a checked-in OpenAPI 3.1 schema at `openapi/openapi.json`.
- [x] `src/api/generated.ts` is generated with `openapi-typescript`; do not edit it manually.
- [x] `pnpm api:check` regenerates the schema and types in a temporary directory and compares them with the checked-in artifacts.
- [ ] Add an API client only when the frontend begins consuming authenticated backend routes; cookie credentials and CSRF handling must be implemented together.

## Current verification status

Local verification record (2026-11-09):

- Node.js 26.13.0 / pnpm 12.7.0：`pnpm install --frozen-lockfile` 通过；Biome lint/format 通过；TypeScript typecheck 通过；OpenAPI drift check 通过；Vitest 67 passed；课程数据校验 19 passed；Vite production build 通过；Playwright E2E 23 passed；`pnpm acceptance:local` 一键门禁整体退出码 0。
- Clean-room 验收：将当前工作树复制到隔离临时目录，排除 `.git`、`node_modules`、`backend/.venv`、构建缓存和环境密钥；在空依赖目录执行完整 `pnpm acceptance:local`，退出码 0。pnpm/uv 使用本机内容缓存，不代表冷缓存或跨操作系统验收。
- Vite build 2026-11-09 快照（模块级教材拆分前）：`App.tsx` 对 9 个实验组件和课程编辑器使用 `React.lazy`；当时最大 `course-content` chunk 约 424.28 kB（gzip 151.73 kB）。该历史数据已由 2026-11-10 的模块级加载验收记录取代，不作为当前构建指标。
- Python 3.12.14 / uv：项目 `backend/.venv` 按锁文件同步；Ruff format、import sorting 与 lint 通过；pytest 122 passed、1 skipped、0 warnings。Starlette TestClient 弃用路径已改为异步 ASGI 测试客户端，httpx Cookie 测试改用 client cookie jar。
- PostgreSQL 自动化 RLS 双连接集成测试已单独执行：1 passed。使用已迁移至 `0011_personal_tenant_bootstrap` 的专用本地验收数据库、临时 BYPASSRLS 测试管理员和非 owner / 非 superuser / 非 BYPASSRLS runtime 测试角色；测试角色及其授权在执行后删除。该结果验证了 RLS 测试 harness，不等于生产 runtime 账号最小权限审计或全新数据库 migration rehearsal。
- 生产 OIDC Provider 注册、生产密钥、正式部署、真实负载和人工验收仍未完成。

以上是本地验收记录，不代表 GitHub Actions 或生产环境通过。

## Backend foundation acceptance

Run from `backend/` with the repository-pinned Python 3.12 and uv:

```bash
uv sync --locked --default-index https://pypi.org/simple --extra dev
uv run --locked --default-index https://pypi.org/simple pytest -q
uv run --locked --default-index https://pypi.org/simple ruff check app migrations tests
```

With a disposable PostgreSQL database and a schema-owner/migrator connection:

```bash
export ACADEMY_DATABASE_REQUIRED=true
export ACADEMY_DATABASE_URL='postgresql+asyncpg://...'
uv run --locked --default-index https://pypi.org/simple alembic -c alembic.ini upgrade head
uv run --locked --default-index https://pypi.org/simple alembic -c alembic.ini current
uv run --locked --default-index https://pypi.org/simple alembic -c alembic.ini history
```

Acceptance checklist:

- [x] Alembic has one linear head at `0011_personal_tenant_bootstrap` (head/history inspected 2026-11-09).
- [x] Fresh disposable PostgreSQL database migrates from base to `0011_personal_tenant_bootstrap` without errors (2026-11-09).
- [x] Downgrade from head to `0003_identity_tenancy` and re-upgrade through identity/RLS revisions succeeds on a disposable database (2026-11-09).
- [x] ORM metadata and migration schema agree; `alembic check` reports no new upgrade operations (2026-11-09).
- [ ] Course-release digest, unique course/version, status and publication-timestamp constraints reject invalid rows.
- [ ] Identity uniqueness is `issuer + subject`; email is not used as an account identity key.
- [ ] Opaque session tokens are stored only as SHA-256 hashes; CSRF tokens are session-bound and compared in constant time.
- [ ] OIDC state/nonce are single-use, hashed at rest, and PKCE uses S256; provider signature/issuer/audience/nonce validation is still required before login is enabled.
- [ ] Tenant membership roles carry tenant scope and use a composite foreign key to their membership.
- [x] RLS is enabled and forced on identity/tenant tables and learner progress/assessment tables (verified by the PostgreSQL integration harness).
- [x] The optional RLS integration test passes using a non-owner, non-superuser, non-`BYPASSRLS` runtime role (local PostgreSQL acceptance, 2026-11-09).
- [x] Missing user/tenant transaction context returns no tenant rows (integration harness).
- [x] Mismatched user/tenant context returns no cross-tenant rows for tenants, memberships, learning progress and assessment results (integration harness).
- [x] A learner cannot read or update another learner's progress or assessment attempt within the same tenant (integration harness).
- [x] A suspended tenant membership loses access to tenant-scoped progress and assessment records (integration harness).
- [ ] Instructor access remains denied until a separately tested instructor-role policy is implemented.
- [ ] The runtime database role is distinct from the schema owner and has only required grants.
- [ ] No learner-data or tenant-management HTTP routes are exposed before OIDC, CSRF, authorization, RLS and privacy gates are accepted.

## Current backend verification status

Backend local verification record (2026-11-09):

- Python 3.12.14 isolated environment was synchronized with `uv sync --locked`; Ruff format and lint passed.
- Standard pytest run: 122 passed, 1 skipped, 0 failed, 0 warnings. The skipped test is the opt-in two-connection PostgreSQL RLS harness when its dedicated URLs are absent.
- PostgreSQL RLS harness: separately executed against `aea_acceptance_fresh_20261109` at migration head `0011_personal_tenant_bootstrap`; 1 passed using a temporary BYPASSRLS admin role and a non-owner, non-superuser, non-BYPASSRLS runtime role. The temporary roles and grants were removed after the run.
- Alembic fresh-database rehearsal: created a disposable empty PostgreSQL database with a dedicated non-superuser schema-owner role; `upgrade head` reached `0011_personal_tenant_bootstrap`, downgrade to `0003_identity_tenancy` succeeded, and re-upgrade to head succeeded. The database and role were deleted after the rehearsal. All 10 protected tables had RLS enabled and forced at head.
- Alembic: one linear head confirmed at `0011_personal_tenant_bootstrap`; full migration history inspected; offline SQL generation from base through head succeeded.
- Not yet proven: ORM metadata vs migration schema parity review, production OIDC provider registration, production secrets, deployment and load acceptance.

Do not interpret the RLS harness pass as a fresh-database migration rehearsal, a production database-role least-privilege audit, or production acceptance.


Module-level curriculum loading verification (2026-11-10):

- `courseCatalog.ts` carries only module metadata and lab definitions; `moduleLessons.ts` dynamically loads each of the 20 lesson payloads independently. The app entry and teaching labs no longer statically import the eager `curriculum.ts` fixture.
- Normal first load downloads only M01 lesson content; selecting M05 downloads M05 separately. Playwright resource assertions confirm M02/M20 are not fetched on the initial M01 view and M20 remains unfetched after switching to M05.
- Full-text search and the course authoring workspace explicitly call `loadFullCourse()` and load all module payloads on demand; this preserves existing body search, full-course validation, JSON editing and export semantics.
- Production build emits 20 separate `flagshipMNN` content chunks. Individual raw chunk sizes are approximately 15.43–40.83 kB; gzip sizes are approximately 6.25–17.02 kB. The initial JS set (entry, React runtime, vendor, validation and M01 content) is approximately 161.62 kB gzip including the Markdown renderer, excluding the 5.50 kB gzip stylesheet. This is a bundle accounting estimate, not a measured network waterfall or runtime performance benchmark.
- Vitest: 72 passed across 16 files, including dynamic loader completeness, Promise reuse, unknown module rejection and full-course schema validation. Playwright: 34 passed in the 2026-11-10 full local acceptance run, including M12/M13 rendering, selected-module-only resource loading and full-text search.


## M12 MCP 2026-07-28 courseware verification (2026-11-10)

- M12 now has six substantive sections in each of five lessons, five scored assessments, 24 source entries and 23 unique URLs within the module.
- The current curriculum-wide static source inventory is 349 HTTPS entries and 238 unique URLs. This is a syntax/structure scan, not a live HTTP crawl.
- Five runnable standard-library teaching examples and five unit tests are registered in `pnpm acceptance:local`.
- The full local acceptance run passed: 72 Vitest tests, 19 course-schema validation tests, 33 Playwright E2E tests (including M12 lesson rendering), 45 M04–M12 Python example tests, 122 backend tests passed and 1 optional RLS integration test skipped. Biome, TypeScript, production build, OpenAPI drift, Ruff and uv lock checks passed.
- The examples are synthetic calculators. They do not establish MCP protocol conformance, production OAuth security, real transport interoperability or live MCP server behavior.
- Official protocol basis: [2026-07-28 MCP release](https://blog.modelcontextprotocol.io/posts/2026-07-28/), [Specification](https://modelcontextprotocol.io/specification/2026-07-28), [Streamable HTTP](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http), [Authorization](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization).


## M13 Agent Skills courseware verification (2026-11-10)

- M13 now has six substantive sections in each of five lessons, five scored assessments, 20 source entries and 14 unique URLs within the module.
- The current curriculum-wide static source inventory is 354 HTTPS entries and 241 unique URLs. This is a syntax/structure scan, not a live HTTP crawl.
- Added a five-experiment workbook, five standard-library teaching calculators, seven Python unit tests and a complete sample Agent Skill package with a report-shape validator.
- The full local acceptance run passed: 72 Vitest tests, 19 course-schema validation tests, 34 Playwright E2E tests (including M13 lesson rendering), 52 M04–M13 Python example tests, 122 backend tests passed and 1 optional RLS integration test skipped. Biome, TypeScript, production build, OpenAPI drift, Ruff and uv lock checks passed.
- The sample Skill demonstrates portable package format only. It does not grant tool permissions, execute repository review tasks, provide a sandbox or prove cross-Runtime behavior.
- Official references: [Agent Skills Specification](https://agentskills.io/specification), [Anthropic Agent Skills design](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills), [skills-ref reference validator](https://github.com/agentskills/agentskills/blob/main/skills-ref/README.md), [Anthropic advanced tool use](https://www.anthropic.com/research/advanced-tool-use), [OWASP Top 10 for Agentic Applications 2026](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/).


## M14 Multi-Agent courseware verification (2026-11-10)

- M14 now has six substantive sections in each of five lessons, five scored assessments, 20 source entries and 19 unique URLs within the module.
- The current curriculum-wide static source inventory is 359 HTTPS entries and 246 unique URLs. This is a syntax/structure scan, not a live HTTP crawl.
- Added a five-experiment workbook and five standard-library calculators with five unit tests.
- The full local acceptance run passed: 72 Vitest tests, 19 course-schema validation tests, 35 Playwright E2E tests (including M14 lesson rendering), 57 M04–M14 Python example tests, 122 backend tests passed and 1 optional RLS integration test skipped. Biome, TypeScript, production build, OpenAPI drift, Ruff and uv lock checks passed.
- The examples distinguish internal Task/Result contracts, A2A remote Agent interoperability and MCP tool/context integration. They do not implement a conformant A2A client/server, distributed shared state, independent statistical samples or production trace backend.
- Official references: [Anthropic Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents), [A2A Core Concepts](https://a2a-protocol.org/latest/topics/key-concepts/), [Dynamo paper](https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf), [Anthropic multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system), [OpenAI Agents SDK tracing](https://openai.github.io/openai-agents-python/tracing/).


## M15 Agentic security courseware verification (2026-11-10)

- M15 now has six substantive sections in each of five lessons, five scored assessments, 20 source entries and 19 unique URLs within the module.
- The current curriculum-wide static source inventory is 364 HTTPS entries and 250 unique URLs. This is a syntax/structure scan, not a live HTTP crawl.
- Added a five-experiment workbook, five standard-library security calculators and six Python unit tests.
- The full local acceptance run passed: 72 Vitest tests, 19 course-schema validation tests, 36 Playwright E2E tests (including M15 lesson rendering), 63 M04–M15 Python example tests, 122 backend tests passed and 1 optional RLS integration test skipped. Biome, TypeScript, production build, OpenAPI drift, Ruff and uv lock checks passed.
- The HMAC example demonstrates action-parameter binding only. It does not provide production key management, durable nonce storage, real IAM/PDP/PEP, DLP, sandboxing or incident response.
- Official references: [MITRE ATLAS](https://atlas.mitre.org/), [OWASP Top 10 for Agentic Applications 2026](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/), [NIST SP 800-162 ABAC](https://csrc.nist.gov/pubs/sp/800/162/upd2/final), [NIST AI 600-1](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence), [MITRE ATLAS OpenClaw Investigation](https://www.mitre.org/news-insights/publication/mitre-atlas-openclaw-investigation).


## M16 Durable Workflow courseware verification (2026-11-10)

- M16 now has six substantive sections in each of five lessons, five scored assessments, 20 source entries and 18 unique URLs within the module.
- The current curriculum-wide static source inventory is 369 HTTPS entries and 255 unique URLs. This is a syntax/structure scan, not a live HTTP crawl.
- Added a five-experiment workbook, five standard-library workflow calculators and five Python unit tests.
- The full local acceptance run passed: 72 Vitest tests, 19 course-schema validation tests, 37 Playwright E2E tests (including M16 lesson rendering), 68 M04–M16 Python example tests, 122 backend tests passed and 1 optional RLS integration test skipped. Biome, TypeScript, production build, OpenAPI drift, Ruff and uv lock checks passed.
- The examples distinguish workflow control from Agent proposals, demonstrate Saga/outbox concepts, bounded retries, durable approval event binding and replay compatibility. They do not implement a real workflow engine, message broker or durable state store.
- Official references: [Azure Durable Orchestrations](https://learn.microsoft.com/en-us/azure/durable-task/common/durable-task-orchestrations), [AWS Saga Patterns](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/saga-patterns.html), [AWS Step Functions Error Handling](https://docs.aws.amazon.com/step-functions/latest/dg/concepts-error-handling.html), [OpenTelemetry Messaging Spans](https://opentelemetry.io/docs/specs/semconv/messaging/messaging-spans/), [Temporal Workflow Definition](https://docs.temporal.io/workflow-definition).


## M17 Evaluation and Observability courseware verification (2026-11-10)

- M17 now has six substantive sections in each of five lessons, five scored assessments, 20 source entries and 18 unique URLs within the module.
- The current curriculum-wide static source inventory is 374 HTTPS entries and 260 unique URLs. This is a syntax/structure scan, not a live HTTP crawl.
- Added a five-experiment workbook, five standard-library evaluation/telemetry calculators and five Python unit tests.
- The full local acceptance run passed: 72 Vitest tests, 19 course-schema validation tests, 38 Playwright E2E tests (including M17 lesson rendering), 73 M04–M17 Python example tests, 122 backend tests passed and 1 optional RLS integration test skipped. Biome, TypeScript, production build, OpenAPI drift, Ruff and uv lock checks passed.
- The examples illustrate evaluation object contracts, task-level statistical analysis, Judge calibration, privacy-aware GenAI telemetry and Quality SLOs. They do not provide model grading, production trace collection, dataset governance or live SLO alerting.
- Official/research references: [Anthropic Demystifying Evals for AI Agents](https://www.anthropic.com/research/demystifying-evals-for-ai-agents), [HumanEval](https://arxiv.org/abs/2107.03374), [Prometheus](https://arxiv.org/abs/2310.08491), [OpenTelemetry GenAI Semantic Conventions](https://github.com/open-telemetry/semantic-conventions-genai), [Google SRE Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/).


## M18 AI Platform architecture courseware verification (2026-11-10)

- M18 now has six substantive sections in each of five lessons, five scored assessments and 20 source entries (18 unique URLs) within the module.
- Curriculum-wide static source inventory: 379 HTTPS source entries, 265 unique URLs and 114 repeated occurrences. This is a syntax/structure scan, not a live HTTP crawl.
- Added five experiments, five dependency-free Python calculators and five unit tests covering desired-state snapshots, Gateway route constraints/rate-limit scopes, usage event idempotency/settlement, trusted tenant context and weighted scheduling/admission control.
- References: [Kubernetes Cluster Architecture](https://kubernetes.io/docs/concepts/architecture/), [Envoy Gateway Rate Limiting](https://gateway.envoyproxy.io/docs/concepts/rate-limiting/), [AWS SaaS Lens architecture patterns](https://docs.aws.amazon.com/wellarchitected/latest/saas-lens/software-and-architecture-patterns.html), [OpenMeter Usage Events](https://openmeter.io/docs/metering/events/usage-events), [Google SRE Handling Overload](https://sre.google/sre-book/handling-overload/).
- Synthetic examples are educational only and do not provide real cryptographic verification, distributed gateway limits, durable billing, JWT validation/RLS, or production fair scheduling.
- Full local acceptance passed for curriculum 0.37.0: 72 Vitest tests, 19 course-schema validation tests, 39 Playwright E2E tests, 78 M04–M18 Python example tests, 122 backend tests passed and 1 optional RLS test skipped. Biome, TypeScript, production build, OpenAPI drift, Ruff, uv lock and `git diff --check` passed. GitHub Actions was not triggered.


## M19 AI Product Engineering courseware verification (2026-11-10)

- M19 now has six substantive sections in each of five lessons, five scored assessments and 20 source entries (15 unique URLs) within the module.
- Curriculum-wide static source inventory: 384 HTTPS source entries and 270 unique URLs. Static syntax/structure only; not a live HTTP crawl.
- Added five experiments and five dependency-free Python examples/tests covering opportunity discovery, risk-tiered human control, cost per successful task, SRM/experiment diagnostics and versioned release manifests.
- References: [Product Talk Continuous Discovery Habits](https://www.producttalk.org/continuous-discovery-habits/), [ACM CHI Human-AI Interaction Guidelines](https://doi.org/10.1145/3290605.3300233), [AWS Cost Optimization Pillar](https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html), [Microsoft Treatment Effect Assessment at Scale](https://www.microsoft.com/en-us/research/articles/treatment-effect-assessment-at-scale-accounting-for-correlated-metrics-and-metric-relevance-in-modern-experimentation/), [DORA Continuous Delivery](https://dora.dev/capabilities/continuous-delivery/).
- Full local acceptance passed for curriculum 0.38.0: 72 Vitest tests, 19 course-schema validation tests, 40 Playwright E2E tests, 83 M04–M19 Python example tests, 122 backend tests passed and 1 optional RLS test skipped. Biome, TypeScript, production build, OpenAPI drift, Ruff, uv lock and `git diff --check` passed. GitHub Actions was not triggered.


## M20 Capstone courseware verification (2026-11-10)

- M20 now has six substantive sections in each of five lessons, five scored assessments and 20 source entries (16 unique URLs) within the module.
- Curriculum-wide static source inventory: 389 HTTPS source entries and 275 unique URLs. This is not a live HTTP crawl.
- Added five Capstone Gate experiments and five dependency-free Python examples/tests for requirement traceability, ADR review, vertical-slice evidence, risk evidence matrix and defense readiness.
- References: [ISO/IEC/IEEE 29148](https://www.iso.org/standard/72089.html), [arc42](https://arc42.org/overview), [Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html), [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/), [SLSA v1.1](https://slsa.dev/spec/v1.1/).
- Synthetic examples validate teaching contracts only; they do not authenticate evidence, certify architecture/security or approve production deployment.
- Full local acceptance passed for curriculum 0.39.0: 72 Vitest tests, 19 course-schema validation tests, 41 Playwright E2E tests, 88 M04–M20 Python example tests, 122 backend tests passed and 1 optional RLS test skipped. Biome, TypeScript, production build, OpenAPI drift, Ruff, uv lock and `git diff --check` passed. GitHub Actions was not triggered.


## Curriculum quality audit corrections (2026-11-10, course 0.39.1)

- Completed a first-pass technical review of the central claims in M04–M20 and recorded the module-by-module review register in `docs/CURRICULUM_QUALITY_AUDIT.md`.
- M04: clarified the limits of the 6ND compute estimate and added an ICML/PMLR DPO-versus-PPO comparison; the new reference is included in the live URL audit.
- M14: corrected the A2A binding description to include JSON-RPC, gRPC and HTTP+JSON/REST, with Agent Card interface/version declaration.
- M17: marked OpenTelemetry GenAI Semantic Conventions as Development status rather than Stable.
- M19/M20: corrected double-escaped Markdown newlines; added a regression test. M20 also records the current ISO/IEC/IEEE 29148 status and need to track the expected replacement draft.
- Updated current source inventory to 390 HTTPS references and 276 unique URLs. Live HTTP scan: 272 HTTP 200, 3 HTTP 403, 1 TLS error, 47 redirects, no remaining confirmed HTTP 404. The four inconclusive endpoints are listed in `docs/reference-url-audit-2026-11-10.csv`.
- Structural alignment check: M04–M20 each have 5 lessons, 30 teaching sections, 5 assessments, and rubric totals of 10 points; each has a teacher guide, lab workbook and five Python example scripts. M07–M20 teacher guides each contain five unique lesson-specific checkpoint blocks (70 distinct blocks total).
- This is a first-pass curriculum audit, not a line-by-line verification of all 390 source occurrences or production/provider execution certification.


### Final 0.39.1 local acceptance (2026-11-10)

- Vitest: 73 passed (16 files), including a regression test for M19/M20 Markdown paragraph boundaries.
- Course Schema: 19 passed.
- Playwright E2E: 41 passed.
- M04–M20 Python example tests: 88 passed.
- Backend pytest: 122 passed, 1 optional RLS integration test skipped (dedicated RLS environment variables not configured in this run).
- Biome lint/format, TypeScript, OpenAPI drift, Vite production build, Ruff format/lint, uv lock check and `git diff --check`: passed.
- GitHub Actions was not triggered. No commit or push was made.


## Curriculum reference correction and local acceptance (2026-11-10, course 0.39.2)

- Replaced the legacy OpenAI API pricing URL in M19 with the current canonical official developer documentation URL. The lesson continues to identify pricing as time-sensitive and requiring revalidation.
- Added the 390-occurrence lesson-level claim-to-source traceability register and the M04 deep source review report. All 21 M04 source occurrences were checked against primary papers or official documentation; 30/390 source occurrences now have scoped verification notes and 360 remain pending.
- Re-crawled all 276 unique source URLs: 270 HTTP 200, 5 HTTP 403, 1 TLS negotiation error, 46 redirects, and no confirmed remaining HTTP 404. Six crawler-limited sources were independently corroborated; crawler status and independent evidence are kept separate.
- `pnpm acceptance:local` passed: 73 Vitest tests (16 files), 19 course-schema tests, 41 Playwright E2E tests, 88 Python example tests across M04–M20, and backend pytest 122 passed / 1 optional RLS integration test skipped. Biome lint/format, TypeScript, OpenAPI drift, Vite production build, Ruff, uv lock and `git diff --check` passed.
- GitHub Actions was not triggered. No commit, push, branch switch, reset or destructive cleanup was performed.


## M05 source correction and local acceptance (2026-11-10, course 0.39.3)

- Completed claim-to-source matching for all 20 M05 references. The M05 review covers KV cache/MQA/GQA/PagedAttention, sampling, continuous batching and chunked prefill, speculative decoding, GPTQ/SmoothQuant/AWQ, and phase-disaggregated serving.
- Replaced the legacy DeepSpeed inference tutorial URL with the current official inference overview. Added a course note that DeepSpeed-Inference v2 is now DeepSpeed-FastGen and that old `init_inference` tutorials must be treated as legacy API examples. The new official URL returned HTTP 200.
- Updated the 390-row traceability register: 50 source occurrences have scoped verification notes; 340 remain pending.
- `pnpm acceptance:local` passed: 73 Vitest tests (16 files), 19 course-schema tests, 41 Playwright E2E tests, 88 M04–M20 Python example tests, and backend pytest 122 passed / 1 optional RLS integration test skipped. Biome lint/format, TypeScript, OpenAPI drift, Vite production build, Ruff, uv lock and `git diff --check` passed.
- GitHub Actions was not triggered. No commit, push, branch switch, reset or destructive cleanup was performed.


## M06 source and statistical-method corrections (2026-11-10, course 0.39.4)

- Completed claim-to-source matching for all 21 M06 references. Canonicalized OpenAI, Anthropic and Google documentation URLs; updated OWASP Top 10 to the 2025 edition; corrected PromptBench v1 / PromptRobust v5 metadata; added Wilson and bootstrap primary references.
- Clarified that paired bootstrap must resample matched task/example units and estimate the paired difference interval. The example code implements Wilson intervals and a paired order-bias diagnostic; it does not claim to implement bootstrap.
- Traceability register: 392 source occurrences / 279 unique URLs; 70 source occurrences have scoped verification notes and 322 remain pending. Full URL recrawl: 272 HTTP 200, 6 HTTP 403, 1 TLS error, 44 redirects; all seven crawler-limited sources independently corroborated.


## M07 protocol, idempotency and source corrections (2026-11-10, course 0.39.5)

- Completed source-content matching for all 20 M07 references. Canonicalized OpenAI, Anthropic, Stripe and OWASP API Security URLs; corrected the ToolBench/ToolLLM citation title.
- Clarified MCP 2026-07-28 required `_meta` fields; provider call IDs, JSON-RPC request IDs and business idempotency keys are distinct; Stripe API v1/v2 idempotency retention/replay behavior differs; Transactional Outbox relays may publish duplicates and consumers must deduplicate.
- Traceability register: 392 occurrences / 278 unique URLs; 90 occurrences have scoped verification notes and 302 remain pending. Full URL recrawl: 271 HTTP 200, 6 HTTP 403, 1 TLS error, 40 redirects; all seven crawler-limited sources independently corroborated.


### M07 local acceptance result (2026-11-10)

`pnpm acceptance:local` passed after the M07 source and lesson corrections: 73 Vitest tests (16 files), 19 course-schema tests, 41 Playwright E2E tests, 88 Python example tests across M04–M20, and backend pytest 122 passed / 1 optional RLS integration test skipped. Biome lint/format, TypeScript, OpenAPI drift, Vite production build, Ruff, uv lock and `git diff --check` passed. No GitHub Actions, commit, push, branch switch or destructive cleanup was performed.


## M08 retrieval and NIST reference updates (2026-11-10, course 0.39.6)

- Completed claim-to-source matching for all 19 M08 references. Canonicalized Unstructured/LlamaIndex/LangChain docs; updated OWASP to 2025; corrected the BERT reranking source, Ragas/BEIR metadata and token-vs-character chunk-size semantics.
- Canonicalized six NIST references across M10/M13/M15/M16/M18. Updated SP 800-53 to Release 5.2.0 and SP 800-61 Rev.2 to Rev.3; retained SP 800-57 Rev.5 as final and identified Rev.6 as draft; noted SSDF SP 800-218A. All six original NIST URLs returned GET 200 after HEAD-only 404 false positives.
- Traceability register: 392 occurrences / 278 unique URLs; 118 occurrences have scoped verification notes and 274 remain pending. URL audit: 268 HTTP 200, 3 HTTP 206, 6 HTTP 403, 1 TLS error, 39 redirects and no confirmed 404.


### M08/NIST local acceptance result (2026-11-10)

`pnpm acceptance:local` passed after M08 and NIST source corrections: 73 Vitest tests (16 files), 19 course-schema tests, 41 Playwright E2E tests, 88 Python example tests across M04–M20, and backend pytest 122 passed / 1 optional RLS integration test skipped. Biome lint/format, TypeScript, OpenAPI drift, Vite production build, Ruff, uv lock and `git diff --check` passed. No GitHub Actions, commit, push, branch switch or destructive cleanup was performed.


## M09 multimodal source and formula review (2026-11-10, course 0.39.7)

- Completed claim-to-source matching for all 20 M09 references. Corrected Whisper, EnCodec and Video-LLaMA paper titles; clarified NIST Privacy Framework 1.0 final versus 1.1 draft.
- Checked contrastive alignment, ViT patch counts and attention scaling, DDPM/CFG equations, PCM storage, WER and video frame-sampling examples.
- Traceability register: 392 source occurrences / 278 unique URLs; 138 occurrences have scoped verification notes and 254 remain pending. URL crawl: 268 HTTP 200, 3 HTTP 206, 6 HTTP 403, 1 TLS error, 39 redirects and no confirmed 404.


### M09 local acceptance result (2026-11-10)

`pnpm acceptance:local` passed after M09 source and version-status corrections: 73 Vitest tests (16 files), 19 course-schema tests, 41 Playwright E2E tests, 88 Python example tests across M04–M20, and backend pytest 122 passed / 1 optional RLS integration test skipped. Biome lint/format, TypeScript, OpenAPI drift, Vite production build, Ruff, uv lock and `git diff --check` passed. No GitHub Actions, commit, push, branch switch or destructive cleanup was performed.


## M10 agent runtime and observability review (2026-11-10, course 0.39.8)

- Completed claim-to-source matching for all 20 M10 references. Clarified AgentBench v3, Temporal replay vs Activity retry, LangGraph checkpointer/store scope, and OpenTelemetry GenAI conventions Development maturity.
- Traceability register: 392 source occurrences / 278 unique URLs; 157 occurrences have scoped verification notes and 235 remain pending. URL audit: 268 HTTP 200, 3 HTTP 206, 6 HTTP 403, 1 TLS error, 39 redirects and no confirmed 404.


### M10 local acceptance result (2026-11-10)

`pnpm acceptance:local` passed after M10 source and observability corrections: 73 Vitest tests (16 files), 19 course-schema tests, 41 Playwright E2E tests, 88 Python example tests across M04–M20, and backend pytest 122 passed / 1 optional RLS integration test skipped. Biome lint/format, TypeScript, OpenAPI drift, Vite production build, Ruff, uv lock and `git diff --check` passed. No GitHub Actions, commit, push, branch switch or destructive cleanup was performed.


## M11 planning and long-term memory source review (2026-11-10, course 0.39.9)

- Completed claim-to-source matching for all 20 M11 references. Clarified formal planning vs prompting, NIST AI RMF revision status, LongMemEval v2/LoCoMo benchmark dimensions and Mem0 author-reported performance claims.
- Traceability register: 392 source occurrences / 278 unique URLs; 177 occurrences have scoped verification notes and 215 remain pending. URL audit: 268 HTTP 200, 3 HTTP 206, 6 HTTP 403, 1 TLS error, 39 redirects and no confirmed 404.


### M11 local acceptance result (2026-11-10)

`pnpm acceptance:local` passed after M11 source and teaching-guide corrections: 73 Vitest tests (16 files), 19 course-schema tests, 41 Playwright E2E tests, 88 Python example tests across M04–M20, and backend pytest 122 passed / 1 optional RLS integration test skipped. Biome lint/format, TypeScript, OpenAPI drift, Vite production build, Ruff, uv lock and `git diff --check` passed. No GitHub Actions, commit, push, branch switch or destructive cleanup was performed.


## M12 MCP 2026-07-28 protocol audit (2026-11-10, course 0.40.0)

- Completed claim-to-source matching for all 24 M12 references. Corrected modern stateless vs legacy handshake/session, per-request metadata, server/discover, Streamable HTTP headers/subscriptions, cache semantics, MRTR requestState, HTTP-only OAuth, OAuth 2.1/CIMD draft status, Tasks/MCP Apps extensions and deprecated APIs.
- Traceability register: 396 source occurrences / 285 unique URLs; 201 occurrences have scoped verification notes and 195 remain pending. URL audit: 275 HTTP 200, 3 HTTP 206, 6 HTTP 403, 1 TLS error, 34 redirects and no confirmed 404.


## M12 extension-scope and citation reconciliation (2026-11-10, course 0.40.1)

- Tasks extension now explicitly limits task-augmented execution to `tools/call`; regression tests reject `prompts/get` and `resources/read` as task-augmented entry points.
- MCP Apps guidance now specifies Host capability advertisement, sandboxed iframe rendering and progressive fallback to ordinary tool results.
- Corrected OAuth 2.1 draft-17 update date to 2026-10-30; refreshed official Tasks/MCP Apps source URLs and all 24 M12 traceability rows.
- Targeted verification passed: M12 Python tests 5/5; Vitest module loader and course schema 24/24; `git diff --check` passed.
- Full `pnpm acceptance:local` passed after this correction tranche: 73 Vitest, 19 course-schema, 41 Playwright E2E, 88 M04–M20 Python examples, backend pytest 122 passed / 1 optional RLS test skipped; Biome, TypeScript, OpenAPI drift, production build, Ruff, uv lock and `git diff --check` passed. No GitHub Actions, commit, push, branch switch or destructive cleanup was performed.


## M13 Agent Skills source review and metric corrections (2026-11-10, course 0.40.2)

- Verified all 20 M13 source occurrences across 14 unique URLs and updated the traceability register.
- Updated SLSA to current Approved v1.2; v1.0 is Retired. Canonicalized Claude Code Skills documentation URL.
- Clarified Agent Skills standard fields vs organization-specific registry contracts and Claude Code-only frontmatter semantics.
- Confirmed skills-ref is demonstration-only, not for production; documented the scope of OpenAI Agents SDK, LangGraph and Anthropic advanced tool-use references.
- Separated binary trigger FPR (`FP/(FP+TN)`) from false-trigger share and multi-Skill wrong-selection/miss/false-activation rates; added regression tests.
- Full `pnpm acceptance:local` passed after this M13 correction tranche: 73 Vitest, 19 course-schema, 41 Playwright E2E, 88 M04–M20 Python example tests, backend pytest 122 passed / 1 optional RLS test skipped; Biome, TypeScript, OpenAPI drift, production build, Ruff, uv lock and `git diff --check` passed.


## M14 Multi-Agent source review and A2A v1.0.1 correction (2026-11-10, course 0.40.3)

- Verified 20 M14 source occurrences across 19 unique URLs and synchronized the traceability register.
- Pinned A2A specification/Core Concepts to v1.0.1; updated the validator for supportedInterfaces, protocolBinding, Task.status.state, ROLE_USER/ROLE_AGENT and Part oneof.
- Added AUTH_REQUIRED state coverage and documented that it does not grant permissions.
- Added process-local thread-safe CAS and source-lineage deduplication tests; explicitly limited both examples to their single-process teaching scope.
- Corrected tracing documentation for custom artifact spans and default sensitive input/output capture.
- Full `pnpm acceptance:local` passed after this M14 correction tranche: 73 Vitest, 19 course-schema, 41 Playwright E2E, 88 M04–M20 Python example tests, backend pytest 122 passed / 1 optional RLS test skipped; Biome, TypeScript, OpenAPI drift, production build, Ruff, uv lock and `git diff --check` passed.


## M15 agent-security and governance source review (2026-11-10, course 0.40.4)

- Verified all 20 M15 source occurrences across 19 unique URLs and synchronized the traceability register.
- Updated NIST Privacy Framework, SP 800-162 Update 2, SP 800-53 Release 5.2.0, AI RMF Playbook, WSTG v4.2, EU AI Act consolidated text and ISO/IEC 42001 references.
- Clarified NIST PE/PA/PEP vs generic PDP/PEP; AI RMF/Privacy Framework draft status; Annex III employment/recruitment high-risk classification caveats.
- Added fail-closed taint handling, Decimal amount checks, explicit resource ACL, approver-bound HMAC approval and atomic one-time nonce consumption; added regression tests.
- Full `pnpm acceptance:local` passed after this M15 correction tranche: 73 Vitest, 19 course-schema, 41 Playwright E2E, 88 M04–M20 Python example tests, backend pytest 122 passed / 1 optional RLS test skipped; Biome, TypeScript, OpenAPI drift, production build, Ruff, uv lock and `git diff --check` passed.


## M16 durable workflow and reliability source review (2026-11-10, course 0.40.5)

- Verified 21 M16 source occurrences across 19 unique URLs and synchronized the traceability register.
- Pinned CloudEvents to v1.0.2; clarified `specversion:"1.0"`, transactional Outbox semantics, and at-least-once Activity behavior.
- Added Temporal Worker Versioning/Event History sources and documented OpenTelemetry Messaging spans Development status.
- Implemented Full Jitter, process-local Outbox/Inbox simulation, authenticated HMAC approval event, one-time nonce consumption and stricter proposal schema tests.
- Full `pnpm acceptance:local` passed after this M16 correction tranche: 73 Vitest, 19 course-schema, 41 Playwright E2E, 88 M04–M20 Python example tests, backend pytest 122 passed / 1 optional RLS test skipped; Biome, TypeScript, OpenAPI drift, production build, Ruff, uv lock and `git diff --check` passed.


## M17 evaluation and observability source review (2026-11-10, course 0.40.6)

- Verified all 20 M17 source occurrences across 18 unique URLs and synchronized the traceability register.
- Added HumanEval finite-sample pass@k estimator alongside IID Bernoulli approximation; clarified benchmark versioning and task-clustered bootstrap.
- Updated NIST AI RMF/Playbook status and OpenTelemetry GenAI Development maturity; clarified ARES PPI human calibration.
- Hardened task schemas, judge position-swap measurement, telemetry allowlists, metric-label cardinality and SLO finite-number validation.
- Full `pnpm acceptance:local` passed after this M17 correction tranche: 73 Vitest, 19 course-schema, 41 Playwright E2E, 88 M04–M20 Python example tests, backend pytest 122 passed / 1 optional RLS test skipped; Biome, TypeScript, OpenAPI drift, production build, Ruff, uv lock and `git diff --check` passed.


## M18 AI platform and multi-tenancy source review (2026-11-10, course 0.40.7)

- Verified 21 M18 source occurrences across 19 unique URLs and synchronized the traceability register.
- Added NIST SP 800-57 Rev.6 IPD source and clarified Rev.5 final status; updated provider API and rate-limit references.
- Added signed config snapshot validation, strict route/fallback eligibility, CloudEvents usage-event payload conflict detection, Decimal billing, principal-scoped private cache keys and N+1 capacity checks.
- Full `pnpm acceptance:local` passed after this M18 correction tranche: 73 Vitest, 19 course-schema, 41 Playwright E2E, 88 M04–M20 Python example tests, backend pytest 122 passed / 1 optional RLS test skipped; Biome, TypeScript, OpenAPI drift, production build, Ruff, uv lock and `git diff --check` passed.


## M19 source audit and product-engineering corrections (2026-11-10, course 0.40.8)

- Matched 20/20 M19 source occurrences against 15 unique current claim-specific sources; six legacy/generic URLs were replaced and directly fetched successfully (HTTP 200).
- M19 examples now use Decimal for all unit economics and reject floats, bind approvals to action/expiry/idempotency fields, report SRM p-values, and require a fuller AI release manifest.
- M19 unit tests: 5 passed; all five scripts executed successfully.
- TypeScript, Biome formatting and `git diff --check` passed after this tranche. Full repository acceptance is to be rerun after M20 source review and final corrections.
- Global scoped source matching: 329/398; 69 remain pending.


## M20 Capstone source audit and evidence validation (2026-11-10, course 0.40.9)

- Matched 20/20 M20 source occurrences against 16 unique current sources; nine changed destinations were directly fetched and returned HTTP 200.
- Pinned MCP to 2026-07-28, SLSA to v1.2 and OWASP ASVS to 5.0.0. Corrected ISO/IEC/IEEE 29148 lifecycle wording: 2018 remains current published edition but is under revision; DIS Edition 3 is still in enquiry.
- Hardened the five M20 examples for typed requirement/ADR validation, unique vertical-slice paths, explicit hard-constraint decisions and a fuller reproducible defense manifest.
- M20 Python tests: 5 passed; all five example scripts executed successfully. TypeScript, Biome formatting and `git diff --check` passed after this tranche. Full repository acceptance is to be rerun.
- Global scoped source matching: 349/398; 49 remain pending.


## M01–M03 source review and full traceability closure (2026-11-10, course 0.40.9)

- M01: 15/15 source occurrences matched; M02: 16/16; M03: 20/20. Added module-level source review records.
- Updated OECD AI system definition to OECD/LEGAL/0449, PyTorch API docs, GloVe to ACL Anthology, and OpenAI token-counting/text-generation docs to current developer references.
- All 398/398 lesson-level source occurrences now have scoped claim-to-source verification notes; zero remain pending.
- Active source URL register: 287 unique URLs, 279 HTTP 200, 3 HTTP 206, 5 HTTP 403, no TLS errors, 19 redirects recorded and no confirmed HTTP 404. The five 403 endpoints are independently corroborated.
- M01–M03 source review notes distinguish primary research, official documentation and pedagogical secondary sources. Full local repository acceptance is to be rerun after the complete M01–M20 review tranche.


## Final M01–M20 local acceptance (2026-11-10, course 0.40.9)

`pnpm acceptance:local` completed successfully after all source and course corrections.

- Vitest: 73 passed across 16 files.
- Course schema validation: 19 passed.
- Playwright E2E: 41 passed.
- Python example suites M04–M20: 88 passed.
- Backend pytest: 122 passed, 1 optional PostgreSQL RLS integration test skipped because the dedicated RLS environment variables were not configured.
- Biome lint and format, TypeScript, OpenAPI 3.1 contract drift check, Vite production build, Ruff format/lint, uv lock and `git diff --check` passed.
- Full source traceability: 398/398 lesson-level occurrences have scoped claim-to-source notes; zero pending. Active URL register: 287 unique URLs, 279 HTTP 200, 3 HTTP 206, 5 HTTP 403, 19 recorded redirects and no confirmed HTTP 404 or current TLS error. The five 403 endpoints are independently corroborated and are not mislabeled as HTTP 200.
- Branch `main`, HEAD `7dcfe7a`. Worktree remains mixed with 190 status entries; the previous baseline was already mixed. No branch switch, reset, clean, commit, push or GitHub Actions run was performed.

**Acceptance boundary:** local tests establish the checked code paths and teaching examples pass in this environment. They do not constitute external peer review, production deployment, real GPU/provider validation, or the optional RLS integration test.
