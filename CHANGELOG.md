## 0.40.9 — 2026-11-10

- M20: matched 20/20 source occurrences against 16 current sources; added the occurrence-level review register.
- Pinned Capstone references to MCP 2026-07-28, SLSA v1.2 and OWASP ASVS 5.0.0; corrected ISO 29148 revision lifecycle status.
- Hardened M20 validators for requirement metadata, ADR options, evidence paths, hard-constraint gates and defense package completeness.
- Global scoped source matching: 398/398 occurrences; zero remain pending.

- Completed M01–M03 source matching: 51 lesson-level occurrences across the three modules; full course register now 398/398 with zero pending.
- Updated OECD AI definition, PyTorch, GloVe and OpenAI token-counting/text-generation sources; added M01–M03 review files.
- Active URL register: 287 unique URLs; 279 HTTP 200, 3 HTTP 206, 5 HTTP 403, no TLS errors, 19 redirects, no confirmed 404.
- Final `pnpm acceptance:local` passed: 73 Vitest, 19 schema, 41 Playwright E2E, 88 Python example tests, backend pytest 122 passed / 1 optional RLS skip; Biome, TypeScript, OpenAPI drift, Vite build, Ruff, uv lock and `git diff --check` passed.
- No commit, push, branch switch, destructive cleanup or GitHub Actions run.

## 0.40.8 — 2026-11-10

- M19: matched 20/20 source occurrences to 15 current claim-specific sources; added the occurrence-level review register.
- M19 examples: finite discovery scoring, approval expiry/idempotency binding, Decimal unit economics, SRM p-values/two-proportion diagnostics, and a fuller reproducible release manifest.
- Updated M17–M19 teaching guides and source registers; global scoped source matching is 329/398 (69 pending).

## 0.40.7 — 2026-11-10

### AI platform and multi-tenancy review
- Verified all 21 M18 source occurrences across 19 unique URLs; created a dedicated claim/source review.
- Added NIST SP 800-57 Rev.6 IPD source; confirmed Rev.5 remains the final published baseline as of 2026-11-10.
- Updated LiteLLM, OpenAI Responses, Anthropic Messages and Stripe rate-limit references.
- Hardened HMAC config snapshots, route/fallback checks, CloudEvents metering, Decimal settlement, tenant object ACL/cache keys and N+1 capacity calculation.
- Global scoped source matching: 311/398 occurrences; 87 remain pending.
- Full `pnpm acceptance:local` passed: 73 Vitest, 19 course-schema, 41 Playwright E2E, 88 Python examples, backend pytest 122 passed / 1 optional RLS test skipped; Biome, TypeScript, OpenAPI drift, production build, Ruff, uv lock and `git diff --check` passed.

## 0.40.6 — 2026-11-10

### Evaluation and observability review
- Verified all 20 M17 source occurrences across 18 unique URLs and created a dedicated claim/source review.
- Distinguished IID pass@k from HumanEval's finite-sample unbiased estimator; documented task-level bootstrap and judge-bias limits.
- Clarified NIST AI RMF revision, voluntary Playbook and OpenTelemetry GenAI Development status.
- Hardened task contracts, paired judge order-bias tests, telemetry allowlists and finite SLO calculations.
- Global scoped source matching: 292/397 occurrences; 105 remain pending.
- Full `pnpm acceptance:local` passed: 73 Vitest, 19 course-schema, 41 Playwright E2E, 88 Python examples, backend pytest 122 passed / 1 optional RLS test skipped; Biome, TypeScript, OpenAPI drift, production build, Ruff, uv lock and `git diff --check` passed.

## 0.40.5 — 2026-11-10

### Durable workflow and reliability review
- Verified all 21 M16 source occurrences across 19 unique URLs; created a dedicated claim/source review.
- Pinned CloudEvents to v1.0.2, clarified the `specversion:"1.0"` attribute and updated NIST SP 800-53 Release 5.2.0 source.
- Added Temporal Worker Versioning/Event History sources and clarified Activity retries, replay compatibility and OpenTelemetry Messaging Development status.
- Added in-memory Outbox/Inbox, Full Jitter and signed approval-event/one-time nonce examples with regression tests.
- Global scoped source matching: 272/397 occurrences; 125 remain pending.
- Full `pnpm acceptance:local` passed: 73 Vitest, 19 course-schema, 41 Playwright E2E, 88 Python examples, backend pytest 122 passed / 1 optional RLS test skipped; Biome, TypeScript, OpenAPI drift, production build, Ruff, uv lock and `git diff --check` passed.

## 0.40.4 — 2026-11-10

### Agent security, privacy and governance review
- Verified all 20 M15 source occurrences across 19 unique URLs and created a dedicated claim/source review.
- Updated current NIST Privacy Framework, SP 800-162 Update 2, SP 800-53 Release 5.2.0, AI RMF Playbook, OWASP WSTG v4.2, EU AI Act and ISO/IEC 42001 references.
- Hardened taint/egress fail-closed behavior, Decimal payment checks, resource ACLs, approver-bound HMAC approvals and atomic one-time nonce consumption.
- Global scoped source matching: 252/396 occurrences; 144 remain pending.
- Full `pnpm acceptance:local` passed: 73 Vitest, 19 course-schema, 41 Playwright E2E, 88 Python examples, backend pytest 122 passed / 1 optional RLS test skipped; Biome, TypeScript, OpenAPI drift, production build, Ruff, uv lock and `git diff --check` passed.

## 0.40.3 — 2026-11-10

### Multi-Agent and A2A v1.0.1 technical review
- Verified all 20 M14 source occurrences across 19 unique URLs; created a dedicated claim/source review report.
- Pinned A2A sources to v1.0.1 and updated the example to validate supportedInterfaces, core protocol bindings, TaskState, ROLE_* and Part oneof.
- Strengthened process-local CAS atomicity and source-lineage evidence deduplication tests.
- Corrected OpenAI Agents SDK tracing semantics, including custom artifact spans, sensitive-data capture and ZDR limitations.
- Global scoped source matching: 239/396 occurrences; 157 remain pending.
- Full `pnpm acceptance:local` passed: 73 Vitest, 19 course-schema, 41 Playwright E2E, 88 Python examples, backend pytest 122 passed / 1 optional RLS test skipped; Biome, TypeScript, OpenAPI drift, production build, Ruff, uv lock and `git diff --check` passed.

## 0.40.2 — 2026-11-10

### Agent Skills source and technical review
- Verified all 20 M13 source occurrences across 14 unique URLs and synchronized the claim/source traceability register.
- Updated SLSA v1.0 (Retired) to current Approved v1.2; canonicalized Claude Code Skills documentation.
- Distinguished Agent Skills standard fields from organization-defined registry contracts and Claude Code-specific runtime fields.
- Clarified skills-ref demonstration-only scope and the limits of runtime/tool-orchestration references.
- Added separate binary trigger FPR, false-trigger share and multi-Skill routing error metrics with regression coverage.
- Global scoped source matching: 219/396 occurrences; 177 remain pending.
- Full `pnpm acceptance:local` passed: 73 Vitest, 19 course-schema, 41 Playwright E2E, 88 Python examples, backend pytest 122 passed / 1 optional RLS test skipped; Biome, TypeScript, OpenAPI drift, production build, Ruff, uv lock and `git diff --check` passed.

## 0.40.1 — 2026-11-10

### MCP extension-scope and source reconciliation
- Limited Tasks task-augmented execution to the currently documented `tools/call` request and added negative regression tests for `prompts/get` and `resources/read`.
- Clarified per-request Tasks capability advertisement and server discovery; documented MCP Apps Host capability advertisement and progressive fallback.
- Corrected OAuth 2.1 draft-17 update date, canonicalized Tasks/MCP Apps source URLs and synchronized all 24 M12 source-traceability rows.
- Updated current course source inventory to 396 occurrences / 285 unique URLs (M12: 24 occurrences / 23 unique URLs).
- Full `pnpm acceptance:local` passed: 73 Vitest, 19 course-schema, 41 Playwright E2E, 88 Python example tests, backend pytest 122 passed / 1 optional RLS integration test skipped; Biome, TypeScript, OpenAPI drift, production build, Ruff, uv lock and `git diff --check` passed.

## 0.40.0 — 2026-11-10

### MCP 2026-07-28 stateless protocol and security correction
- Completed claim-to-source matching for all 24 M12 references and added `docs/claim-source-reviews/M12.md`.
- Rebuilt the lifecycle around modern stateless requests (per-request `_meta`, optional `clientInfo`, `server/discover`) while retaining legacy 2025-11-25-and-earlier initialize/session compatibility.
- Corrected Streamable HTTP POST headers, request-scoped SSE, `subscriptions/listen`, no GET/session endpoint, MRTR inputRequired/requestState integrity and cache `ttlMs`/`cacheScope` semantics.
- Clarified HTTP-only MCP Authorization, OAuth 2.1 draft-17 and CIMD draft-03 status, `iss`/`resource`/audience validation, token passthrough prohibition and CIMD SSRF controls.
- Added primary source links for versioning, caching, MRTR, Tasks, MCP Apps and deprecated feature registry; clarified optional extension negotiation and deprecation status.
- Traceability register: 201/396 source occurrences have scoped verification notes; 195 remain pending. URL audit: 275 HTTP 200, 3 HTTP 206, 6 HTTP 403, 1 TLS error, 34 redirects and no confirmed 404.
- `pnpm acceptance:local` is run after this tranche; GitHub Actions, commit and push remain disabled.

## 0.39.9 — 2026-11-10

### M11 planning and long-term memory source review
- Completed claim-to-source matching for all 20 M11 references and added `docs/claim-source-reviews/M11.md`.
- Corrected Plan-and-Solve and Ragas titles; clarified Tree of Thoughts vs prompting vs PDDL/classical planning boundaries.
- Updated NIST AI RMF 1.0 status (published framework under revision; 2026 critical-infrastructure profile remains a concept note).
- Added LongMemEval v2 and LoCoMo benchmark dimensions; qualified Mem0 latency/accuracy/token claims as author-reported results requiring independent reproduction.
- Traceability register: 177/392 source occurrences have scoped verification notes; 215 remain pending. URL audit unchanged: 268 HTTP 200, 3 HTTP 206, 6 HTTP 403, 1 TLS error, 39 redirects and no confirmed 404.
- `pnpm acceptance:local` passed: 73 Vitest, 19 course-schema, 41 Playwright E2E, 88 Python example tests, 122 backend tests passed / 1 optional RLS test skipped; Biome, TypeScript, OpenAPI drift, production build, Ruff, uv lock and diff checks passed. GitHub Actions, commit and push remain disabled.

## 0.39.8 — 2026-11-10

### M10 agent runtime and observability source review
- Completed claim-to-source matching for all 20 M10 references and added `docs/claim-source-reviews/M10.md`.
- Added current AgentBench v3 metadata; clarified Temporal deterministic Workflow replay vs retryable Activities and LangGraph thread-scoped checkpointer vs cross-thread store.
- OpenTelemetry GenAI Semantic Conventions are explicitly marked Development, not Stable; production guidance now pins convention/instrumentation versions and requires schema migration management.
- Checked pass^k and the IID (p^k) formula assumptions; retained environment-state postcondition verification and retry reconciliation requirements.
- Traceability register: 157/392 source occurrences have scoped verification notes; 235 remain pending. URL audit remains 278 URLs: 268 HTTP 200, 3 HTTP 206, 6 HTTP 403, 1 TLS error, 39 redirects and no confirmed 404.
- `pnpm acceptance:local` passed: 73 Vitest, 19 course-schema, 41 Playwright E2E, 88 Python example tests, 122 backend tests passed / 1 optional RLS test skipped; Biome, TypeScript, OpenAPI drift, production build, Ruff, uv lock and diff checks passed. GitHub Actions, commit and push remain disabled.

## 0.39.7 — 2026-11-10

### M09 multimodal source and version accuracy
- Completed claim-to-source matching for all 20 M09 references and added `docs/claim-source-reviews/M09.md`.
- Corrected paper metadata: Whisper is the model name, not part of the paper title; EnCodec is the codec name, not part of the paper title; Video-LLaMA citation now uses its full current title.
- Clarified NIST Privacy Framework 1.0 is the published framework and 1.1 remains an Initial Public Draft, not a final standard.
- Checked CLIP/SigLIP/ImageBind alignment claims, ViT patch/token calculations, DDPM and CFG equations, audio PCM storage, WER and video-frame sampling coverage.
- Traceability register: 138/392 source occurrences have scoped verification notes; 254 remain pending. URL crawl unchanged: 268 HTTP 200, 3 HTTP 206, 6 HTTP 403, 1 TLS error, 39 redirects and no confirmed 404.
- `pnpm acceptance:local` passed: 73 Vitest, 19 course-schema, 41 Playwright E2E, 88 Python example tests, 122 backend tests passed / 1 optional RLS test skipped; Biome, TypeScript, OpenAPI drift, production build, Ruff, uv lock and diff checks passed. GitHub Actions, commit and push remain disabled.

## 0.39.6 — 2026-11-10

### M08 retrieval correctness and NIST reference currency
- Completed claim-to-source matching for all 19 M08 references and added `docs/claim-source-reviews/M08.md`.
- Canonicalized Unstructured, LlamaIndex and LangChain documentation; updated OWASP to its 2025 edition; replaced the generic BERT citation with the direct *Passage Re-ranking with BERT* paper; corrected Ragas/BEIR titles.
- Clarified that LangChain RecursiveCharacterTextSplitter defaults to character length, not token length; token budgets require a tokenizer-aware length function. Verified chunk-count, vector-similarity and RRF examples.
- Canonicalized six NIST references. Updated SP 800-53 to Release 5.2.0 and superseded SP 800-61 Rev.2 with Rev.3; retained SP 800-57 Rev.5 as final while labeling Rev.6 as draft; noted SP 800-218A.
- Six NIST URLs had HEAD-only 404 results but all returned GET 200; they were false positives, not dead links. The crawl now retries GET after HEAD errors.
- Traceability register: 118/392 source occurrences have scoped verification notes; 274 remain pending. URL audit: 268 HTTP 200, 3 HTTP 206, 6 HTTP 403, 1 TLS error, 39 redirects, no confirmed 404.
- `pnpm acceptance:local` passed: 73 Vitest, 19 course-schema, 41 Playwright E2E, 88 Python example tests, 122 backend tests passed / 1 optional RLS test skipped; Biome, TypeScript, OpenAPI drift, production build, Ruff, uv lock and diff checks passed. GitHub Actions, commit and push remain disabled.

## 0.39.5 — 2026-11-10

### M07 tool-calling protocol and side-effect semantics
- Completed claim-to-source matching for all 20 M07 source occurrences and added `docs/claim-source-reviews/M07.md`.
- Canonicalized OpenAI Function Calling, Anthropic Tool Use, Stripe Idempotency and OWASP API Security links.
- Corrected the arXiv citation: arXiv:2307.16789 is ToolLLM; ToolBench is its dataset/benchmark.
- Clarified MCP 2026-07-28 required `_meta`, JSON-RPC correlation ID vs business idempotency key, Stripe API v1/v2 retry semantics and duplicate Transactional Outbox delivery.
- Traceability register: 90/392 occurrences have scoped verification notes; 302 remain pending. Current 278-URL recrawl: 271 HTTP 200, 6 HTTP 403, 1 TLS error, 40 redirects; all seven crawler-limited sources independently corroborated.
- `pnpm acceptance:local` passed: 73 Vitest, 19 course-schema, 41 Playwright E2E, 88 Python example tests, 122 backend tests passed / 1 optional RLS test skipped; Biome, TypeScript, OpenAPI drift, production build, Ruff, uv lock and diff checks passed. GitHub Actions, commit and push remain disabled.

## 0.39.4 — 2026-11-10

### M06 prompt engineering, safety and evaluation references
- Completed source-content matching for all 21 M06 references and added `docs/claim-source-reviews/M06.md`.
- Canonicalized OpenAI, Anthropic and Google prompt/structured-output documentation URLs; updated OWASP Top 10 to its 2025 edition.
- Updated the adversarial-prompt paper title to current arXiv v5 PromptRobust while recording its v1 PromptBench title history.
- Added Brown et al. for Wilson score intervals and Efron for bootstrap methods; clarified paired bootstrap must resample matched task units and report paired differences.
- The traceability register now has 70/392 source occurrences with scoped verification notes; 322 remain pending.
- Current 279-URL recrawl: 272 HTTP 200, 6 HTTP 403, 1 TLS error, 44 redirects. All seven crawler-limited sources were independently corroborated.
- `pnpm acceptance:local` passed: 73 Vitest, 19 course-schema, 41 Playwright E2E, 88 Python example tests, 122 backend tests passed / 1 optional RLS test skipped; Biome, TypeScript, OpenAPI drift, production build, Ruff, uv lock and diff checks passed. GitHub Actions, commit and push remain disabled.

## 0.39.3 — 2026-11-10

### M05 inference reference currency
- Completed source-content matching for all 20 M05 references and added `docs/claim-source-reviews/M05.md`.
- Replaced the legacy DeepSpeed inference tutorial URL with the current official inference overview. Added a clear note that DeepSpeed-Inference v2 is now DeepSpeed-FastGen and that old `init_inference` tutorials are legacy API examples.
- Verified KV-cache formulas, MHA/MQA/GQA distinctions, sampling calculations, queueing examples, PagedAttention block arithmetic, speculative decoding distribution preservation and theoretical quantization payloads.
- The claim-to-source register now has 50/390 scoped verified source occurrences; 340 remain pending.
- Local acceptance passed: 73 Vitest, 19 course-schema, 41 Playwright E2E, 88 Python example tests, 122 backend tests passed / 1 optional RLS test skipped; Biome, TypeScript, OpenAPI drift, production build, Ruff, uv lock and diff checks passed.
- No platform feature or backend behavior changed; no GitHub Actions, commit or push was performed.

## 0.39.2 — 2026-11-10

### Bibliography traceability and source correction
- Replaced the legacy M19 OpenAI API pricing URL with the current canonical official developer documentation URL; pricing remains explicitly time-sensitive.
- Added a lesson-level claim-to-source register covering all 390 source occurrences / 276 unique URLs. Completed the first deep bibliography tranche for all 21 M04 references against primary papers and official documentation.
- Independently corroborated six crawler-limited sources while preserving their original HTTP 403/TLS outcomes separately from independent evidence.
- Recorded the full 276-URL recrawl: 270 HTTP 200, 5 HTTP 403, 1 TLS error, 46 redirects and no confirmed remaining 404.
- Local acceptance passed: 73 Vitest, 19 course-schema, 41 Playwright E2E, 88 Python example tests, 122 backend tests passed / 1 optional RLS test skipped; Biome, TypeScript, OpenAPI drift, production build, Ruff, uv lock and diff checks passed.
- No platform feature or backend behavior changed; no GitHub Actions, commit or push was performed.

## 0.22.0 — 2026-11-06

### Assessment clarity correction
- Made the M02 first Attention assessment fully reproducible by adding explicit 2×2 Q/K/V matrices to the learner-facing prompt.
- Synchronized the M02 instructor reference solution with the exact learner prompt; lesson and assessment IDs and rubric weights remain unchanged.
- Updated curriculum content version to 0.22.0. No schema, prerequisite, lab registry, platform feature or runtime change.
- Documentation/source-only correction; no CI, build, unit test, E2E or browser execution.

## 0.21.0 — 2026-11-06

### Curriculum completion and teaching resources
- Completed instructor guides for M01–M03, bringing full teacher-guide coverage to M01–M20.
- Added 15 lesson-level formal assessment reference solutions for M01–M03, preserving original prompts and rubric point allocations.
- Added a course-wide instructor playbook with a 24-week pacing plan, lesson delivery template, eight lab execution-mode boundaries, assessment policy and Capstone review evidence.
- Added a learner handbook, cross-course glossary and static source audit: 306 reference entries, 204 unique URLs, all authored as absolute HTTPS URLs. Live HTTP reachability is not claimed.
- Expanded the teacher-guide index and synchronized README/CURRICULUM navigation.
- Updated curriculum content version to 0.21.0. No course Schema, lesson IDs, assessment IDs, prerequisites, lab registry, platform features or runtime behavior changed.
- No CI, build, unit test, E2E, browser or local runtime command was executed.

## 0.20.0 — 2026-11-06

### Teaching materials
- Completed instructor teaching guides for M07–M20 in one curriculum documentation pass.
- Added 14 guides covering 70 lessons and 70 formal assessment reference solutions, each aligned to the source module's original prompts and rubric point allocations.
- Guides include prerequisite preparation, lesson flow, technical explanations, formative checkpoints, review tasks, worked solutions, rubric alignment, common-error analysis and grading summaries.
- Expanded the guide index to cover M04–M20 (17 guides total); M01–M03 flagship content remains unchanged.
- Updated curriculum version to 0.20.0. No course Schema, lesson IDs, assessment IDs, prerequisites, lab registry, platform features or runtime behavior were changed.
- No CI, build, E2E or local runtime tests were run as part of this documentation-only change.

## 0.19.0 — 2026-11-06

### Teaching materials
- Added instructor teaching guides for M04–M06.
- Each guide includes pre-class preparation, lesson flow, worked mathematical derivations where relevant, formative checkpoints with instructor notes, post-class review, a worked reference solution for each formal assessment, rubric alignment and common-error analysis.
- M04 covers NLL/pretraining compute, MoE parameter accounting, SFT/loss masking/LoRA, PPO/DPO and release evidence.
- M05 covers KV cache capacity, temperature/top-k/top-p, continuous batching, quantization/speculative decoding and serving capacity/SLOs.
- M06 covers prompt contracts, few-shot coverage, JSON/schema/business/authorization validation, prompt-injection defense and prompt evaluation/release governance.
- Added a teaching-guide index. No course Schema, lesson IDs, assessment IDs, prerequisites, lab registry or platform features were changed.
- Updated curriculum version to 0.19.0.

## 0.18.0 — 2026-11-06

### Course content
- Deepened all 10 lessons in M19–M20 with a fifth practical section, completing the practical-depth pass across M04–M20.
- M19 adds falsifiable AI product hypotheses, trust-calibrated UX/HITL, unit-economics sensitivity analysis, A/B experiment design and full product lifecycle governance.
- M20 adds a requirement-to-evidence traceability matrix, architecture/ADR review, vertical-slice acceptance, security/quality rehearsal and reproducible capstone defense.
- Updated curriculum version to 0.18.0. Existing Schema, prerequisites, lab registry and platform scope remain unchanged.

## 0.17.0 — 2026-11-06

### Course content
- Deepened all 15 lessons in M16–M18 with a fifth practical section focused on deterministic workflow orchestration, evaluation/observability and AI platform engineering.
- M16 adds workflow/Agent boundary decisions, event-driven Saga, retry/deadline calculations, approval binding and state/replay testing.
- M17 adds layered evaluation metrics, benchmark uncertainty, LLM Judge calibration, GenAI trace design and online quality SLOs.
- M18 adds control/data-plane boundaries, model capability routing, quota/cost calculations, tenant/secret isolation and gateway reliability reviews.
- Updated curriculum version to 0.17.0. Existing Schema, prerequisites, lab registry and platform scope remain unchanged.

## 0.16.0 — 2026-11-06

### Course content
- Deepened all 15 lessons in M13–M15 with a fifth practical section focused on reusable Skills, Multi-Agent coordination and AI security governance.
- M13 adds Skill contracts, package/path review, composition DAGs, third-party supply-chain audits and Registry release gates.
- M14 adds single-Agent baselines, Task/Result protocols, shared-state concurrency, evidence-led arbitration and cost-per-success comparisons.
- M15 adds STRIDE threat registers, indirect-injection attack tracing, RBAC/ABAC approval binding, high-impact human review and red-team incident exercises.
- Updated curriculum version to 0.16.0. Existing Schema, prerequisites, lab registry and platform scope remain unchanged.

## 0.15.0 — 2026-11-06

### Course content
- Deepened all 15 lessons in M10–M12 with a fifth practical section focused on Agent runtime, planning/memory and MCP integration.
- M10 adds verifiable Agent contracts, bounded execution traces, checkpoint recovery, multi-tenant runtime isolation and fault-injection acceptance.
- M11 adds task-DAG construction, memory write/read policy, retrieval/conflict handling, approval-state recovery and separate planning/memory benchmarks.
- M12 adds JSON-RPC responsibility tracing, capability/version catalogs, transport lifecycle tests, third-party Server threat modeling and interoperability gates.
- Updated curriculum version to 0.15.0. Existing Schema, prerequisites, lab registry and platform scope remain unchanged.

## 0.14.0 — 2026-11-06

### Course content
- Deepened all 15 lessons in M07–M09 with a fifth practical section focused on reproducible protocol, retrieval and multimodal engineering exercises.
- M07 adds tool-call timeout/state tracing, negative Schema tests, routing confusion matrices, idempotent concurrency and layered acceptance metrics.
- M08 adds end-to-end evidence tracing, chunk-overlap calculations, exact-vs-ANN retrieval diagnostics, RRF ranking and ACL/cache regression gates.
- M09 adds cross-modal timeline design, ViT token-cost calculations, CFG quality/diversity experiments, streaming-ASR data budgets and video sampling/privacy reviews.
- Updated curriculum version to 0.14.0. Existing Schema, prerequisites, lab registry and platform scope remain unchanged.

## 0.13.0 — 2026-11-06

### Course content
- Deepened all 15 lessons in M04–M06 with a fifth practical section focused on reproducible engineering exercises, worked calculations, expected evidence and common failure modes.
- M04 adds auditable training-compute calculations, MoE parameter accounting, SFT loss-mask walkthroughs, PPO/DPO comparison and model-release evidence chains.
- M05 adds KV capacity calculations, sampling walkthroughs, continuous-batching timelines, fair quantization comparisons and serving-capacity reviews.
- M06 adds prompt-contract acceptance cases, few-shot coverage/ordering experiments, layered JSON validation, indirect-injection threat tracing and prompt-release regression gates.
- Updated the curriculum version to 0.13.0. Existing Schema, prerequisites, lab registry and platform scope remain unchanged.

# Changelog

## 0.12.0 — 2026-11-06

### Course content
- Normalized Markdown paragraph line breaks in flagship TypeScript content files as escaped string newlines, preserving rendered lesson text and keeping string literals syntactically valid.
- Rebuilt M19–M20 as five-lesson flagship modules with four substantive sections per lesson, five scored assessments and 15 source references per module.
- M19 covers product discovery, AI UX/Human-in-the-Loop, unit economics, product experiments, release operations and lifecycle governance.
- M20 provides a five-stage end-to-end Capstone from charter and architecture through implementation, evaluation/security/deployment and technical defense.
- Added the M01–M20 completion report and synchronized curriculum documentation/version.
- No platform feature, backend API, database, migration, runtime or CI workflow was added.

## 0.11.0 — 2026-11-06

### Course content
- Rebuilt M16–M18 as five-lesson flagship modules with four substantive sections per lesson, five scored assessments and 15 references per module.
- M16 covers Workflow/Agent boundaries, event orchestration, Saga, retries, circuit breakers, approvals, audit and replay testing.
- M17 covers evaluation taxonomy, benchmark/statistical design, LLM Judge calibration, GenAI observability and online quality SLOs.
- M18 covers platform planes, model gateway/routing, quotas/metering, tenant isolation, secret brokering, policy control and platform reliability.
- No platform APIs, backend components, runtime, or CI workflow were added; all content is instructional.

## 0.10.0 — 2026-11-06

### Course content
- Rebuilt M13–M15 as five-lesson flagship modules with four substantive sections per lesson, five scored assessments and 15 references per module.
- M13 covers Skill contracts, package structure, progressive resource loading, composition, supply-chain security and registry governance.
- M14 covers collaboration topology, task/message protocols, shared-state consistency, evidence-based arbitration and single-Agent baselines/cost evaluation.
- M15 covers AI threat modeling, prompt/data security, identity and authorization, high-impact output governance, red teaming and incident response.
- No platform, backend, execution runtime, or CI workflow was added.

## 0.9.0 — 2026-11-06

### Course content
- Rebuilt M10–M12 as five-lesson flagship modules, each with four substantive sections, five scored assessments and 15 source references.
- M10 covers Agent boundaries, Plan/Act/Observe loops, runtime state machines, checkpoint recovery, context/tool isolation and reliability.
- M11 covers task DAGs, dynamic replanning, memory types, retrieval/consolidation, human approval, deletion and evaluation.
- M12 covers MCP roles and JSON-RPC, capability discovery, transports/session lifecycle, authentication/authorization and interoperability operations.
- Reused existing Agent and MCP labs; no platform, backend, runtime, or CI changes.

## 0.8.0 — 2026-11-06

### Course content
- Rebuilt M07–M09 as five-lesson flagship modules with four substantive sections per lesson, five scored assessments per module, and 45 source references.
- M07 covers tool-call lifecycle, strict parameter contracts, tool discovery/routing, idempotency/transactions, and safety evaluation.
- M08 covers ingestion/chunking, embeddings/ANN, hybrid retrieval/RRF/reranking, evidence citations, ACLs, and production RAG evaluation.
- M09 covers multimodal fusion, ViT patch calculations, diffusion objectives, audio tokenization/ASR/TTS, synchronization, privacy, and cost.
- Reused existing Tool Calling and RAG labs; no new lab runtime, platform, backend, or CI workflow was added.

## 0.7.0 — 2026-11-06

### Course content
- Rebuilt M04–M06 as five-lesson flagship modules with four substantive sections per lesson and one scored assessment per lesson (15 assessments total).
- M04 covers autoregressive pretraining objectives, data governance, architecture families and MoE, SFT/LoRA, RLHF/PPO/DPO, and model release evaluation.
- M05 covers Prefill/Decode, KV Cache capacity, decoding distributions, continuous batching, speculative decoding, quantization, parallel serving and reliability.
- M06 covers task specifications, few-shot selection, structured output validation, prompt injection threat modeling, and prompt regression/version governance.
- Added 45 paper/official-document references across the three modules and updated module objectives and curriculum version.
- Reused existing curriculum schema and labs; no platform, backend, runtime, or CI changes.

## 0.6.0 — 2026-11-06

### Course content
- Rebuilt M03 as a five-lesson flagship sequence covering text/token boundaries, BPE/WordPiece/Unigram, special tokens, embeddings, weight tying, context budgets, context engineering, RAG and long-context trade-offs.
- Added worked token-budget and embedding parameter/storage calculations, five scored assessments, and primary research/documentation references.
- Connected M03 to the existing browser-local toy Tokenizer Lab; explicitly documented that it does not reproduce production tokenizer outputs or provider token counts.
- Expanded M03 learning objectives and documented its teaching sequence and instructional boundaries.
- No platform features, backend capabilities, lab runtime, or CI workflows were added.

## 0.5.0 — 2026-11-06

### Course content
- Rebuilt M02 as a five-lesson flagship sequence covering scaled dot-product attention, multi-head attention, masks, positional mechanisms, Transformer blocks, complexity, KV Cache and FlashAttention.
- Added worked matrix examples, tensor-shape derivations, practical exercises, five scored assessments and primary research/documentation references.
- Connected M02 to the existing browser-local Transformer Attention Lab; no new lab runtime or platform capability was introduced.
- Expanded M02 learning objectives and documented its teaching sequence in the curriculum guide.

## 0.4.0 — 2026-11-06

### Course content
- Rebuilt M01 as a five-lesson flagship foundation sequence: AI system concepts, how machine learning learns, neural networks and LLMs, model capability boundaries, and end-to-end AI system design.
- Expanded M01 into 24 substantive teaching sections with worked examples, equations, comparison tables, practical transfer exercises, scored rubrics, and primary references.
- Replaced the single introductory lesson with a progressive learning path and a final AI system blueprint assignment.
- No platform features, backend capabilities, or runtime integrations were added.

This file records user-visible curriculum and platform changes.

## 0.3.1

- Added a browser-local course authoring workspace with JSON import/export, schema validation and local draft persistence.
- Reject unknown keys throughout the course object graph instead of silently stripping imported data.
- Enforced the 2 MiB authoring limit using UTF-8 byte length, including multibyte text.
- Improved validation feedback with actionable schema paths.
- Expanded authoring E2E coverage for invalid drafts, local persistence and accessibility.
- Added UTF-8 byte-count unit tests.
- Normalized the M01–M20 curriculum copy toward Simplified Chinese (zh-CN).

## 0.3.0

- Established the version-1 course schema and legacy payload migration.
- Delivered the 20-module curriculum, browser-local learning progress and assessment self-review.
- Implemented eight local teaching labs and the initial Playwright acceptance suite.
