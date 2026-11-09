# AI Engineering Academy — Flagship Curriculum Completion Report

- Repository: liucaidong/ai-engineering-academy
- Branch: main
- Curriculum version: 0.40.9
- Report date: 2026-11-10
- Scope: instructional content, curriculum registration, course documentation and changelog only.

## 1. Executive summary

M01–M20 are registered as a 20-module curriculum. M01–M03 retain their existing flagship content and were not overwritten. M04–M20 are five-lesson flagship modules. M04–M20 now contain six substantive sections per lesson after the 0.23.0–0.39.0 deepening passes. Each lesson has a scored assessment and at least three topic-matched source references.

| Metric | M01–M03 | M04–M20 | Total |
|---|---:|---:|---:|
| Modules | 3 | 17 | 20 |
| Lessons | 15 | 85 | 100 |
| Teaching sections | 70 | 510 | 580 |
| Scored assessments | 15 | 85 | 100 |
| Source references | 51 | 345 | 396 |

These are authored-source counts. They do not imply all references were live-link checked or that the application was built or executed.

## 2. Module inventory

| Module | Status | Lessons | Sections | Assessments | References | Core scope |
|---|---|---:|---:|---:|---:|---|
| M01 | Existing flagship retained | 5 | 24 | 5 | 15 | AI/ML/DL/LLM foundations, learning, neural networks, capability boundaries and AI system design |
| M02 | Existing flagship retained | 5 | 21 | 5 | 16 | Transformer, Attention, masks, positional mechanisms, blocks and inference complexity |
| M03 | Existing flagship retained | 5 | 25 | 5 | 20 | Tokenization, embeddings, context budgets, context engineering and tokenizer practice |
| M04 | Flagship deepened (0.23.0) | 5 | 30 | 5 | 21 | Pretraining objectives/data, architecture/MoE, SFT/LoRA/QLoRA, RLHF/PPO/DPO/RLAIF, calibration/release governance |
| M05 | Flagship deepened (0.24.0) | 5 | 30 | 5 | 20 | Prefill/Decode, PagedAttention, sampling/constraints, continuous batching/chunked prefill, disaggregation, speculative decoding/quantization, goodput/SLO |
| M06 | Flagship deepened (0.25.0) | 5 | 30 | 5 | 21 | Prompt manifest, Few-shot coverage, grammar/schema validation, BIPIA-style injection red-team, Judge calibration and rollback |
| M07 | Flagship deepened (0.26.0) | 5 | 30 | 5 | 20 | Protocol layers, Strict Schema, deferred discovery, programmatic calling, idempotency and evidence-level evaluation |
| M08 | Flagship deepened (0.27.0) | 5 | 30 | 5 | 19 | RAG/Long Context/Fine-tuning boundaries, hierarchical chunking, index consistency, corrective retrieval and grounded evaluation |
| M09 | Flagship deepened (0.28.0) | 5 | 30 | 5 | 20 | Contrastive alignment, dynamic vision tokens, latent diffusion/NFE, streaming ASR and video temporal grounding |
| M10 | Flagship deepened (0.29.0) | 5 | 30 | 5 | 20 | Autonomy envelope, verifiable Agent loop, durable replay, capability security and pass^k evaluation |
| M11 | Flagship deepened (0.30.0) | 5 | 30 | 5 | 20 | Formal plan DAGs, temporal/provenance-aware memory, evidence-preserving retrieval, approval binding and long-term evaluation |
| M12 | Flagship deepened (0.31.0; source-audited 0.40.0) | 5 | 30 | 5 | 24 | 2026-07-28 stateless MCP, discovery/cache hints, Streamable HTTP/MRTR, OAuth hardening and Extensions/Tasks governance |
| M13 | Flagship deepened (0.32.0) | 5 | 30 | 5 | 20 | Open Agent Skills format, metadata conformance, progressive disclosure, DAG contract compatibility, supply-chain security and layered evaluation |
| M14 | Flagship deepened (0.33.0) | 5 | 30 | 5 | 20 | Topology economics, A2A protocol boundaries, CAS/shared evidence state, independent claim verification and trace-based cost evaluation |
| M15 | Flagship deepened (0.34.0) | 5 | 30 | 5 | 20 | MITRE ATLAS/STRIDE, taint/egress controls, PDP/PEP, RBAC/ABAC, action-bound approvals, risk-tiered HITL and incident response |
| M16 | Flagship deepened (0.35.0) | 5 | 30 | 5 | 20 | Control/Decision Plane, Saga/Outbox/CloudEvents, Retry Budget, durable approvals/trace and replay/versioning |
| M17 | Flagship deepened (0.36.0) | 5 | 30 | 5 | 20 | Eval Harness/outcome grading, paired statistics, Judge calibration, GenAI telemetry and Quality SLO/Burn Rate |
| M18 | Flagship deepened (0.40.7) | 5 | 30 | 5 | 21 | Desired State, Gateway routing/rate limits, usage ledger, SaaS tenancy and fair scheduling/overload control |
| M19 | Flagship deepened and source-audited (0.40.8) | 5 | 30 | 5 | 20 | Continuous discovery, risk-tiered HITL, cost per successful task, experiment quality and release lifecycle |
| M20 | Flagship deepened (0.39.0) | 5 | 30 | 5 | 20 | Definition of Ready/Done, architecture fitness, vertical slice/testing, evidence matrix and reproducible defense |

## 3. Teaching progression

- M01–M03 establish AI systems, Transformer internals and model input representation.
- M04–M05 cover model training/adaptation and inference/serving.
- M06–M09 cover prompt interfaces, tools, knowledge retrieval and multimodal systems.
- M10–M16 cover Agent runtime, planning/memory, MCP, reusable Skills, multi-agent coordination, security and deterministic orchestration.
- M17–M18 establish quality measurement, observability and platform architecture.
- M19–M20 connect engineering capability to product delivery and an end-to-end capstone.

The existing module IDs, titles, level assignments and prerequisite declarations were retained. Suggested topic coverage was mapped into the repository's established curriculum rather than replacing its module taxonomy.

## 4. Existing lab reuse

No lab or runtime was added. Relevant existing labs remain registered:

| Existing lab | Declared execution mode | Related modules |
|---|---|---|
| Transformer Lab | Existing registry declaration | M02 |
| Tokenizer Lab | browser-local | M03 |
| Tool Calling Lab | Existing registry declaration | M07 |
| RAG Lab | Existing registry declaration | M08 |
| Agent Lab | Existing registry declaration | M10–M11 |
| MCP Lab | Existing registry declaration | M12–M13 |
| Multi-Agent Lab | simulation | M14 |
| Evaluation Lab | simulation | M17 |

Labs are referenced only as declared by the existing registry. Simulations are not represented as real model inference, GPU execution, provider-backed calls or production integration.

## 5. Editorial and static review

- M04–M20 each contain five lessons with at least five substantive sections per lesson. M04–M20 have six sections per lesson in versions 0.23.0–0.39.0; all modules retain measurable objectives and one scored assessment per lesson.
- M04, M05, M07, M09, M10, M11, M13, M14, M15, M16, M17, M18, M19 and M20 each contain 20 topic-matched references; M12 contains 24 after its protocol-source expansion, while M06 and M08 contain 19.
- Mathematical and engineering examples include training FLOPs, LoRA parameter counts, KV Cache capacity, sampling probabilities, chunk counts, similarity/RRF, ViT token counts, audio data size, retry backoff and unit economics.
- Design trade-offs, failure modes, security boundaries and evaluation methods are included.
- M01–M03 instructional content was retained; an earlier source-level newline-escaping normalization was applied to keep Markdown string literals valid.
- Existing Schema v1 was reused; no schema migration was introduced.
- Existing prerequisite declarations were retained.
- Source URLs are authored as absolute HTTPS URLs. No claim is made that all 389 links were individually fetched or live-link verified.

A source-preserving syntax normalization was applied to M01–M10 flagship files: accidental double-escaped newline sequences in Markdown string values were normalized to the intended escaped newline sequences. This preserves the intended runtime Markdown paragraphs. M11–M20 use valid single-line string literals. This source normalization does not replace compiler/build verification.

### M04–M06 practical-depth revision (0.13.0)

- Added 15 practical teaching sections: five per lesson across M04–M06.
- Added worked calculations, traceable assumptions, failure cases and explicit evidence expectations.
- M04–M06 teaching-section count increased from 60 to 75; course-wide section count increased from 410 to 425.
- Lesson, assessment and reference counts are unchanged.
- Schema, prerequisites and existing labs are unchanged.

### M07–M09 practical-depth revision (0.14.0)

- Added 15 practical teaching sections: five per lesson across M07–M09.
- Added tool state/timeout and idempotency cases, RAG traceability/retrieval calculations, and multimodal alignment/cost/privacy exercises.
- M07–M09 teaching-section count increased from 60 to 75; course-wide section count increased from 425 to 440.
- Lesson, assessment and reference counts are unchanged.
- Schema, prerequisites and existing labs are unchanged.

### M10–M12 practical-depth revision (0.15.0)

- Added 15 practical teaching sections: five per lesson across M10–M12.
- Added Agent contract/trace/recovery/isolation exercises, memory provenance and approval exercises, and MCP protocol/security/interoperability exercises.
- M10–M12 teaching-section count increased from 60 to 75; course-wide section count increased from 440 to 455.
- Lesson, assessment and reference counts are unchanged.
- Schema, prerequisites and existing labs are unchanged.

### M13–M15 practical-depth revision (0.16.0)

- Added 15 practical teaching sections: five per lesson across M13–M15.
- Added Skill package/supply-chain exercises, Multi-Agent consistency and cost comparisons, and AI security threat/incident exercises.
- M13–M15 teaching-section count increased from 60 to 75; course-wide section count increased from 455 to 470.
- Lesson, assessment and reference counts are unchanged.
- Schema, prerequisites and existing labs are unchanged.

### M16–M18 practical-depth revision (0.17.0)

- Added 15 practical teaching sections: five per lesson across M16–M18.
- Added workflow Saga/retry/replay exercises, evaluation/observability calibration exercises, and AI platform routing/quota/tenant reliability exercises.
- M16–M18 teaching-section count increased from 60 to 75; course-wide section count increased from 470 to 485.
- Lesson, assessment and reference counts are unchanged.
- Schema, prerequisites and existing labs are unchanged.

### M19–M20 practical-depth revision (0.18.0)

- Added 10 practical teaching sections: five per lesson across M19–M20.
- Added AI product discovery/economics/experimentation exercises and a requirement-to-evidence Capstone delivery/defense sequence.
- M19–M20 teaching-section count increased from 40 to 50; course-wide section count increased from 485 to 495.
- M05–M20 contain five lessons and five substantive teaching sections per lesson; M04 was subsequently expanded to six sections per lesson in version 0.23.0.
- Lesson, assessment and reference counts are unchanged; Schema, prerequisites and existing labs are unchanged.

## 6. Validation status

| Check | Status | Qualification |
|---|---|---|
| Read latest GitHub main before each batch | Completed | Main head re-read before each batch commit |
| Preserve M01–M03 | Completed at instructional-content level | Existing lesson content retained; earlier newline-escaping source normalization is documented above |
| M04–M20 registration | Runtime validation passed | Imports, module objectives, lesson selectors and course schema validated |
| Lesson/assessment/rubric ID invariants | Completed | Course validator passed; 100 lesson IDs and 100 assessment IDs remain unique |
| Prerequisite references/cycle detection | Completed | Course validator passed; prerequisite declarations were retained |
| Source URL syntax | Completed static audit | 389 absolute HTTPS source entries; live HTTP crawl not performed |
| Lab references | Completed | Existing lab IDs retained; no new runtime lab registered |
| TypeScript compilation/build | Passed | Local production build completed |
| Course validator | Passed | 19 validation tests passed |
| Unit tests | Passed | 72 Vitest tests passed |
| E2E/browser acceptance | Passed | 41 Playwright E2E tests passed, including M04–M20 content rendering and lazy module-loading checks |
| M04–M20 Python examples | Passed | 88 standard-library unit tests passed across M04–M20; all five M20 Capstone scripts executed |
| Backend tests | Passed with one skip | 122 passed, 1 skipped (optional RLS integration configuration) |
| GitHub Actions / CI | Not executed | No workflow triggered, per project constraint |

The 0.39.0 source scan counts 100 lessons, 100 assessments, 580 teaching sections and 389 source references across M01–M20, with 275 unique URLs. M04–M20 each have 30 teaching sections; M04/M05/M07/M09/M10/M11/M12/M13/M14/M15/M16/M17/M18/M19/M20 have 20 references each, M06/M08 have 19. Full `pnpm acceptance:local` passed: 72 Vitest tests, 19 course-validation tests, 41 Playwright E2E tests, 88 M04–M20 Python example tests, 122 backend tests passed and 1 optional RLS integration test skipped. Biome, TypeScript, production build, OpenAPI drift, Ruff, uv lock and `git diff --check` passed. GitHub Actions was not triggered. The URL audit remains a syntax/structure audit, not a live-link availability check.

## 7. Unresolved verification items

1. Perform a live-link audit of the 275 unique source URLs and record inaccessible, redirected or version-migrated references.
2. Manually review rendered long-form Markdown, especially formulas, tables and wide code blocks, on desktop and narrow mobile viewports.
3. Confirm course lab labels continue to describe simulation/browser-local behavior accurately; no new runtime lab was introduced in this revision.
4. The normal learner module view currently renders only the first lesson (selectedLessons[0]); all five lessons for M04–M20 are present in course data and the full-course authoring payload, but lesson-level navigation is not exposed in the learner view. This application-surface limitation was intentionally left unchanged in this courseware-only pass.

## 8. M04–M06 instructor material expansion (0.19.0)

Added three standalone teaching guides under `docs/teaching-guides/`:

- M04: pretraining objective and data governance, architecture/MoE accounting, SFT/loss masking/LoRA derivation, PPO/DPO, evaluation and release evidence.
- M05: KV cache capacity derivation, sampling probability calculations, continuous batching and queue governance, quantization/speculative decoding, serving capacity and SLO review.
- M06: prompt contracts, few-shot coverage, structured-output validation layers, prompt-injection threat modeling, evaluation calibration and release/rollback governance.

Each guide includes pre-class preparation, a teaching path, formative checkpoints with instructor notes, post-class review, a worked reference solution for all five formal module assessments, rubric alignment and common-error analysis. These are authored teaching materials; they do not alter course runtime behavior.

## 9. Final scope statement

This delivery is a curriculum-content expansion and documentation update. Local course validation, frontend build, unit tests, browser E2E and the new M04–M07 teaching examples have passed as recorded in section 6. It does not claim production deployment, real provider-backed tool integration or GitHub Actions/CI success. No new platform feature, backend service or runtime lab was added.


## 10. M07–M20 instructor material completion (0.20.0)

Added 14 standalone teaching guides for M07–M20, completing the teacher-guide series across M04–M20.

- Coverage: 14 modules, 70 lessons and 70 formal assessment reference solutions.
- Each guide includes prerequisite preparation, a five-lesson teaching path, technical explanation, formative checkpoints, post-class review, worked answers, original Rubric criteria/points, common errors and a grading summary.
- Reference answers were authored against the module assessment prompts and source Rubrics; they are exemplars, not exclusive accepted solutions.
- The guide index now lists M04–M20 (17 guides total). M01–M03 content remains retained and unchanged.
- Curriculum version updated to 0.20.0. Course Schema, lesson/assessment IDs, prerequisites, lab registry and platform scope were not changed.
- This is documentation authoring and source review only. No CI, build, E2E, local runtime or live provider integration tests were run.


## 11. M01–M03 instructor materials and course-wide teaching package (0.21.0)

Added instructor guides for M01–M03, completing teacher-guide coverage across the entire M01–M20 curriculum.

- M01–M03: 15 formal assessment reference solutions, with original prompts, Rubric criteria and points retained.
- Total teacher-guide coverage: 20 modules, 100 lessons, 100 formal assessments and 100 reference solutions.
- Added a 24-week course delivery playbook, learner handbook, cross-course glossary and source-reference static audit.
- As of curriculum version 0.21.0, the course source inventory contained 306 reference entries and 204 unique URLs; all authored URLs are absolute HTTPS. This is a syntax/structure audit, not a live-link availability check.
- M01–M03 reference solutions include worked examples for learning/generalization, attention matrices, tensor shapes, embedding storage and context-budget calculations. For M02 assessment 1, the guide supplies a reproducible example matrix because the formal prompt refers to “given matrices” without embedding numeric values in the prompt text.
- Updated curriculum content version to 0.21.0. No course Schema, Lesson IDs, Assessment IDs, prerequisites, Lab Registry, frontend/backend feature or runtime behavior changed.

## 12. Remaining verification boundary

The earlier 0.21.0 report recorded outstanding local verification; the 0.30.0 full local acceptance pass is now complete, including M08–M11 rendering and Python examples. Remaining verification is a live HTTP audit of the 234 unique reference URLs and manual editorial review of rendered long-form Markdown on target devices.


## 13. Assessment input completeness correction (0.22.0)

The M02 first Attention assessment previously referred to “given matrices” without embedding numeric matrix values in the learner-facing prompt. The prompt now explicitly supplies Q=K=[[1,0],[0,1]] and V=[[1,0],[0,2]], matching the worked Softmax and weighted-output calculation in the instructor guide. Assessment ID and Rubric remain unchanged. Curriculum version is 0.22.0.

## 14. M04 flagship courseware deepening (0.23.0)

Expanded M04 from five to six teaching sections per lesson while retaining the five lesson IDs, five assessment IDs, assessment Rubrics and prerequisite declarations.

- Added explicit comparison of Causal LM, Masked LM and Span Corruption, and separated architecture, objective and compute-structure taxonomies.
- Added QLoRA resource accounting, including NF4/double quantization/paged optimizer context and the distinction between quantized weight payload and peak VRAM.
- Added RLAIF and Constitutional AI, clarifying the different levels occupied by feedback processes, PPO and DPO.
- Added calibration and subgroup-evaluation guidance, including the limits of applying classification ECE to free-form generation.
- Added a learner-facing five-experiment workbook and five Python standard-library teaching calculators under `examples/m04/`, with five unit tests.
- Added five topic-matched primary/official references: BERT, T5, GShard, QLoRA and Constitutional AI. Course source inventory is now 311 entries and 208 unique URLs.
- Updated M04 learning objectives, course version and teaching-resource navigation. No platform feature, backend service or runtime lab was added.

**Local verification:** `pnpm acceptance:local` passed. Results: 72 Vitest tests, 19 course-validation tests, 25 Playwright E2E tests, 5 M04 Python example tests, 122 backend tests passed and 1 optional RLS test skipped. TypeScript production build, Biome checks, OpenAPI drift check, Ruff checks and `git diff --check` passed. GitHub Actions was not triggered.

The Python calculators are pedagogical models, not full model-training implementations or measured GPU benchmarks. The source-reference audit checks HTTPS structure and counts; it does not assert all 212 URLs were individually fetched.

## 15. M05 inference and serving courseware deepening (0.24.0)

Expanded M05 from five to six teaching sections per lesson while retaining its five lesson IDs, five assessment IDs, Rubrics and prerequisite declarations.

- Added Paged KV Cache block allocation, tail-block fragmentation, prefix reuse compatibility and cache isolation.
- Added the distinction among sampling policy, grammar-constrained decoding, Schema validation and business validation.
- Added Chunked Prefill and Prefill/Decode disaggregation, distinguishing them from iteration-level Continuous Batching.
- Added Speculative Decoding acceptance/rejection math, AWQ/quantization evaluation gates, Goodput, SLO-aware admission control and open-loop load-test requirements.
- Corrected the M/M/1 distinction between system time W and queue wait Wq.
- Added a five-experiment learner workbook and five Python standard-library calculators under `examples/m05/`, with five unit tests.
- Added topic-matched research sources for PagedAttention, Sarathi-Serve, DistServe, Splitwise and AWQ. Course source inventory is now 316 entries and 212 unique URLs.
- Updated M05 learning objectives, teacher guide, course version, source audit and teaching-resource navigation. No new runtime lab or platform feature was added.

**Local verification:** `pnpm acceptance:local` passed. Results: 72 Vitest tests, 19 course-validation tests, 26 Playwright E2E tests, 10 M04/M05 Python example tests, 122 backend tests passed and 1 optional RLS test skipped. TypeScript production build, Biome checks, OpenAPI drift check, Ruff checks and `git diff --check` passed. GitHub Actions was not triggered.

The M05 calculators use simplified analytical models. M/M/1 is not a production LLM workload simulator; the capacity calculator is not a GPU benchmark; speculative acceptance math is not a full decoding runtime. All results are teaching estimates.

## 16. M06 Prompt engineering courseware deepening (0.25.0)

Expanded M06 from five to six teaching sections per lesson while retaining its five lesson IDs, five assessment IDs, Rubrics and prerequisite declarations.

- Added versioned Prompt manifests that bind prompt hash, model/provider, tool Schema, retrieval snapshot, sampling configuration, evaluation dataset and rollback target.
- Added coverage-constrained Few-shot selection, diversity/contrastive examples, token-budget accounting and order-perturbation testing.
- Added Grammar-Constrained Decoding and clarified that syntactic constraints do not replace full Schema, business and authorization validation.
- Added BIPIA-style direct/indirect injection coverage, tool-execution evidence and non-Prompt-only trust-boundary controls.
- Added LLM Judge calibration, pairwise order swaps, verbosity/self-preference diagnostics and Wilson/bootstrap uncertainty reporting.
- Added a five-experiment learner workbook and five Python standard-library calculators under `examples/m06/`, with five unit tests.
- Added four topic-matched sources: Grammar-Constrained Decoding, BIPIA, Anthropic prompt-injection mitigation guidance and G-Eval. Course source inventory is now 320 entries and 216 unique URLs.
- Updated M06 learning objectives, teacher guide, course version, source audit and teaching-resource navigation. No new runtime lab, model integration or platform feature was added.

**Local verification:** `pnpm acceptance:local` passed. Results: 72 Vitest tests, 19 course-validation tests, 27 Playwright E2E tests, 15 M04–M06 Python example tests, 122 backend tests passed and 1 optional RLS test skipped. TypeScript production build, Biome checks, OpenAPI drift check, Ruff checks and `git diff --check` passed. GitHub Actions was not triggered.

The M06 scripts use deterministic teaching examples; they do not execute a real model, prove prompt robustness, or perform production authorization. Red-team coverage must be executed against the actual application and tool boundary before any security claim.

## 17. M07 Tool Calling and execution-contract courseware deepening (0.26.0)

Expanded M07 from five to six teaching sections per lesson while retaining its five lesson IDs, five assessment IDs, Rubrics and prerequisite declarations.

- Clarified the protocol stack: provider Function/Tool Calling API, Host Runtime, MCP Tools and JSON-RPC have distinct responsibilities and identifiers.
- Added provider-specific Strict Schema compatibility checks and explicit server-side business/authorization validation.
- Added deferred tool discovery, dynamic registry search, Programmatic Tool Calling and context/cost/security trade-offs.
- Added unknown outcome recovery, idempotency-key semantics, RFC 9457 machine-readable errors and transaction/compensation boundaries.
- Added layered tool evaluation and evidence grades for static checks, mock, sandbox, provider-backed and production canary.
- Added a five-experiment learner workbook and five Python standard-library teaching calculators under `examples/m07/`, with five unit tests.
- Added five official/standards references: MCP Tools specification, OpenAI Function Calling, Anthropic Advanced Tool Use, OpenAI Programmatic Tool Calling and RFC 9457. Course source inventory is now 325 entries and 221 unique URLs.
- Updated M07 learning objectives, teacher guide, course version, source audit and teaching-resource navigation. No new runtime lab or platform feature was added.

**Local verification:** `pnpm acceptance:local` passed. Results: 72 Vitest tests, 19 course-validation tests, 28 Playwright E2E tests, 20 M04–M07 Python example tests, 122 backend tests passed and 1 optional RLS test skipped. TypeScript production build, Biome checks, OpenAPI drift check, Ruff checks and `git diff --check` passed. GitHub Actions was not triggered.

The M07 examples use an in-memory idempotency ledger and simplified registry/schema models. They are not production middleware, do not connect to an MCP Server or external provider, and do not prove real-world authorization or exactly-once side effects.


## 18. M08 RAG production retrieval and evidence courseware deepening (0.27.0)

Expanded M08 from five to six substantive teaching sections per lesson while retaining its five lesson IDs, five assessment IDs, Rubrics, prerequisite declarations and existing simulated RAG lab.

- Added a decision framework for RAG, Long Context and Fine-tuning, including update frequency, citation requirements, ACL granularity, context cost and behavioral adaptation.
- Added Parent-Child and Hierarchical Retrieval, structure-preserving table/code chunking, RAPTOR context and ACL inheritance across parent/child records.
- Added multi-index consistency across BM25, vector, metadata and ACL stores, version/hash binding, tombstone propagation and pre-filter/post-filter trade-offs.
- Added Corrective RAG and Self-RAG boundaries, retry budgets, evidence conflict handling, fallback and abstention.
- Added explicit definitions for Recall@k, MRR, nDCG, claim-level faithfulness, citation precision, answer correctness and abstention accuracy, with slice-based evaluation and human calibration.
- Added a five-experiment learner workbook and five Python standard-library teaching calculators under `examples/m08/`, with five unit tests.
- Added four topic-matched research sources: RAPTOR, Self-RAG, HyDE and Corrective RAG. Course source inventory is now 329 entries and 225 unique URLs.
- Updated the M08 teacher guide, teaching-resource index, curriculum map, source audit, acceptance script and curriculum version. No new runtime lab, external vector database, model integration or platform feature was added.

**Local verification:** `pnpm acceptance:local` passed. Results: 72 Vitest tests, 19 course-validation tests, 29 Playwright E2E tests, 25 M04–M08 Python example tests, 122 backend tests passed and 1 optional RLS test skipped. Biome, TypeScript, production build, OpenAPI drift, Ruff and `git diff --check` passed. GitHub Actions was not triggered.

The Python examples use synthetic documents and simplified BM25/RRF/citation/metric models. They do not execute embeddings, ANN, a real vector database, provider-backed generation, production ACL enforcement or semantic entailment. Citation ID resolution is not proof that cited evidence supports a claim. No live-link HTTP audit of the 225 unique URLs was performed.


## 19. M09 Multimodal representation and temporal systems courseware deepening (0.28.0)

Expanded M09 from five to six substantive teaching sections per lesson while retaining its five lesson IDs, five assessment IDs, Rubrics, prerequisite declarations and existing simulation scope.

- Added contrastive vs generative multimodal alignment, temperature, negative-sample quality, false negatives and SigLIP pairwise sigmoid objective.
- Added native aspect ratio, Patch n' Pack, dynamic visual resolution, tiling/crop failure modes and visual token/attention budgeting.
- Added Latent Diffusion boundaries, sampler/NFE accounting, CFG implementation cost and controlled quality/latency experiments.
- Added streaming ASR chunk/look-ahead trade-offs, partial/stable/final transcript semantics, diarization boundaries and task-specific latency metrics.
- Added video event coverage, temporal grounding, frame sampling bias, source timestamps and benchmark leakage controls.
- Added a five-experiment learner workbook and five Python standard-library teaching calculators under `examples/m09/`, with five unit tests.
- Added five topic-matched primary research references: SigLIP, NaViT, DPM-Solver, SeamlessM4T and Video-MME. Course source inventory is now 334 entries and 230 unique URLs.
- Normalized double-escaped Markdown newlines in M09 source strings; runtime rendering now preserves intended paragraph breaks. Updated M09 teacher guide, curriculum map, guide index, source audit, acceptance script and curriculum version. No new runtime lab, media upload, external model or platform feature was added.

**Local verification:** `pnpm acceptance:local` passed. Results: 72 Vitest tests, 19 course-validation tests, 30 Playwright E2E tests, 30 M04–M09 Python example tests, 122 backend tests passed and 1 optional RLS test skipped. TypeScript production build, Biome checks, OpenAPI drift check, Ruff checks and `git diff --check` passed. GitHub Actions was not triggered.

The Python calculators use synthetic matrices and deterministic analytical estimates. They do not train CLIP/SigLIP, execute a ViT or diffusion model, run ASR/TTS/diarization, or benchmark a video model. The event-capture probability assumes ideal periodic point sampling with random event phase. No live-link HTTP audit of the 230 unique URLs was performed.


## 20. M10 Agent Runtime and execution reliability courseware deepening (0.29.0)

Expanded M10 from five to six substantive teaching sections per lesson while retaining its five lesson IDs, five assessment IDs, Rubrics, prerequisite declarations and existing simulated Agent Runtime lab.

- Added the Agent Runtime as a control plane and defined autonomy envelopes across task scope, resource permissions, action risk, approval points, time/turn/tool/cost budgets and stop conditions.
- Added structured Plan/Act/Observe traces, observation trust boundaries, postcondition verification, unknown outcomes, repeated-action detection and no-progress termination.
- Added Durable Execution concepts: event history, deterministic replay, Activity/Tool retry, checkpointing, idempotency keys, operation ledgers, reconciliation and workflow versioning.
- Added capability-based authorization, task-scoped short-lived permissions, Agent-Computer Interface design, sandbox/network/secret boundaries and untrusted observation handling.
- Added outcome-based Agent evaluation, AgentBench and tau-bench context, pass^k, state-diff evaluation, human intervention, latency and cost per successful task.
- Added a five-experiment learner workbook and five Python standard-library teaching calculators under `examples/m10/`, with five unit tests.
- Added five topic-matched references: ReAct, AgentBench, Temporal Workflow documentation, SWE-agent and tau-bench. Course source inventory is now 339 entries and 231 unique URLs.
- Normalized double-escaped Markdown newlines in M10 source strings; updated teacher guide, curriculum map, teaching-resource index, source audit, acceptance script and curriculum version. No new runtime tool, sandbox, Temporal service, model integration or platform feature was added.

**Local verification:** `pnpm acceptance:local` passed. Results: 72 Vitest tests, 19 course-validation tests, 31 Playwright E2E tests, 35 M04–M10 Python example tests, 122 backend tests passed and 1 optional RLS test skipped. TypeScript production build, Biome checks, OpenAPI drift check, Ruff checks and `git diff --check` passed. GitHub Actions was not triggered.

The examples use synthetic traces, an in-memory idempotency ledger, simplified path-scope policy and illustrative evaluation statistics. They do not implement a production Agent Runtime, secure sandbox, capability broker, durable event store or real tool execution. pass^k and Wilson intervals require an appropriate sampling design; the toy values are not a benchmark result. No live-link HTTP audit of the 231 unique URLs was performed.


## 21. M11 Planning, Memory and durable user-state courseware deepening (0.30.0)

Expanded M11 from five to six substantive teaching sections per lesson while retaining its five lesson IDs, five assessment IDs, Rubrics, prerequisite declarations and existing lab registry.

- Added formal action schemas with parameters, preconditions, effects, costs and resource constraints; distinguished natural-language plan translation from planner search and verification.
- Added provenance- and time-aware Memory Record design, including tenant/user scope, source event IDs, confidence, sensitivity, consent basis, valid time, recorded time, supersession and deletion state.
- Added evidence-preserving retrieval and consolidation, recency/salience/confidence scoring, temporal conflict resolution and source-linked summaries; distinguished Generative Agents memory/reflection patterns from MemGPT virtual context management.
- Added approval binding to actor, tenant, action digest, resource scope, state/policy version and expiry; added memory write consent, correction/supersession and deletion propagation.
- Added independent Planning and Memory evaluation dimensions, including plan feasibility, precondition violations, temporal accuracy, knowledge updates, abstention, stale memory and deletion compliance; added LongMemEval and LoCoMo references.
- Added a five-experiment learner workbook and five Python standard-library teaching calculators under `examples/m11/`, with five unit tests.
- Added five topic-matched research references: LLM+P, MemGPT, Generative Agents, LongMemEval and LoCoMo. Course source inventory is now 344 entries and 234 unique URLs.
- Normalized double-escaped Markdown newlines in M11 source strings; updated teacher guide, curriculum map, teaching-resource index, source audit, acceptance script and curriculum version. No new persistent memory service, planner engine, approval service or platform feature was added.

**Local verification:** `pnpm acceptance:local` passed. Results: 72 Vitest tests, 19 course-validation tests, 32 Playwright E2E tests, 40 M04–M11 Python example tests, 122 backend tests passed and 1 optional RLS test skipped. TypeScript production build, Biome checks, OpenAPI drift check, Ruff checks and `git diff --check` passed. GitHub Actions was not triggered.

The examples use synthetic DAGs, memory records, retrieval scores, SHA-256 action digests and deterministic metric calculations. They do not implement an optimal planner, durable memory database, authenticated approval workflow, real vector retrieval or privacy/deletion compliance. Evaluation values are teaching examples, not benchmark results. No live-link HTTP audit of the 234 unique URLs was performed.


## 22. M12 MCP 2026-07-28 protocol and integration courseware deepening (0.31.0)

Expanded M12 from five to six substantive teaching sections per lesson while retaining its five lesson IDs, five assessment IDs, Rubrics, prerequisites and existing lab registration.

- Rebuilt the protocol version model around two eras: 2025-11-25 and earlier handshake revisions versus the 2026-07-28 stateless revision. Clarified initialize/notifications/initialized versus server/discover and per-request protocol metadata.
- Added capability discovery and cache semantics for Tools, Resources, Prompts, list/read/discover results, ttlMs, cacheScope, private authorization-context isolation and deterministic catalog behavior.
- Added modern Streamable HTTP request/response semantics, header-based Mcp-Method/Mcp-Name routing, no protocol-level session requirement, request-scoped SSE and Multi Round-Trip Requests (MRTR).
- Added OAuth hardening: authorization-response issuer validation (RFC 9207), resource/audience binding, issuer-bound client credentials, CIMD migration from deprecated DCR, and explicit confused-deputy/token-passthrough threats.
- Added the formal Extensions model, Tasks migration from experimental core to io.modelcontextprotocol/tasks, MCP Apps extension boundaries, and deprecation governance for Roots, Sampling, Logging and legacy HTTP+SSE.
- Added a five-experiment learner workbook and five Python standard-library teaching calculators under `examples/m12/`, with five unit tests. The exercises cover version eras, cache isolation, HTTP envelope consistency, OAuth claim checks and extension gating.
- Added five official MCP references for the 2026-07-28 specification, Tools, Streamable HTTP, Authorization and the maintainer release announcement. Course source inventory is now 349 entries and 238 unique URLs.
- Updated M12 teacher guide, curriculum map, teaching-resource index, source audit, acceptance script and course version to 0.31.0. No real MCP server, OAuth provider, remote transport or new platform feature was implemented.

**Local verification:** `pnpm acceptance:local` passed with exit code 0. Results: 72 Vitest tests across 16 files, 19 course-validation tests, 33 Playwright E2E tests, 45 M04–M12 Python example tests, 122 backend tests passed and 1 optional RLS test skipped. TypeScript production build, Biome lint/format, OpenAPI drift check, Ruff format/lint, uv lock check and `git diff --check` passed. GitHub Actions was not triggered.

The examples use synthetic messages and simplified deterministic checks. They do not implement a conformant MCP client/server, actual Streamable HTTP/SSE or MRTR streaming, OAuth authorization-code flow, JWT signature validation, PKCE, a real shared cache, extension execution or MCP Apps sandbox. Passing unit tests establish only the teaching calculator behavior, not protocol conformance or production security. No live-link HTTP audit of the 238 unique URLs was performed.


## 23. M13 Agent Skills format, runtime boundaries and governance courseware deepening (0.32.0)

Expanded M13 from five to six substantive teaching sections per lesson while retaining its five lesson IDs, five assessment IDs, Rubrics, prerequisites and existing curriculum registration.

- Distinguished Agent Skills open package format from Host/Runtime integration and task effectiveness; clarified that format portability does not guarantee identical trigger, tool, script, permission or sandbox behavior across implementations.
- Corrected the metadata model against the current Agent Skills Specification: name/description are required; license/compatibility/metadata are optional; allowed-tools is experimental; version is not a standard top-level frontmatter field and belongs in an organization-defined metadata key if used.
- Added the three-stage Progressive Disclosure model, context-budget measurement, main SKILL.md size guidance, focused reference files and shallow relative-path references.
- Deepened Skill DAG composition with typed input/output contracts, data/control dependencies, parallel-safety requirements, version locking, retry/fallback/compensation and manual handoff boundaries.
- Expanded the threat model for malicious instructions, indirect prompt injection, scripts, dependencies, path traversal, network exfiltration and credential access. Reaffirmed that Skill metadata does not grant permissions; Host/Runtime policy must enforce capabilities.
- Added layered validation and evaluation: skills-ref format checks, positive/hard-negative trigger sets, trigger precision/recall, wrong-skill rate, task success, tool violations, token overhead, latency and rollback governance.
- Added a five-experiment workbook, five standard-library calculators and a complete sample Skill package under examples/m13/repository-security-review/, including SKILL.md, references, a deterministic report-shape validator and synthetic report fixture.
- Added five topic-matched official/standards references: Anthropic Agent Skills design article, Agent Skills skills-ref reference validator, Anthropic advanced tool use, OWASP Top 10 for Agentic Applications 2026 and Anthropic Agent Skills evaluation guidance. Course source inventory is now 354 entries and 241 unique URLs.
- Updated M13 teacher guide, curriculum map, teaching-resource index, source audit, acceptance script and course version to 0.32.0. No Agent Runtime, registry service, sandbox or platform feature was implemented.

**Local verification:** `pnpm acceptance:local` passed with exit code 0. Results: 72 Vitest tests across 16 files, 19 course-schema validation tests, 34 Playwright E2E tests (including M13 lesson rendering), 52 M04–M13 Python example tests, 122 backend tests passed and 1 optional RLS test skipped. M13's seven tests cover metadata constraints, optional fields, progressive-disclosure budget, DAG cycle/missing-node checks, path/symlink rejection, trigger metrics and the sample Skill report validator. The sample report validator and package manifest command were also executed directly. Biome, TypeScript, production build, OpenAPI drift, Ruff, uv lock check and final `git diff --check` passed. GitHub Actions was not triggered.

The calculators are deterministic teaching models. The metadata checker does not parse YAML or replace skills-ref; token estimates are not model-tokenizer measurements; the DAG checker does not execute workflows; the manifest is not an SBOM, signature or SLSA provenance; the sample report validator checks shape but not evidence truth; and the capability policy is not an OS sandbox. Real Skill acceptance still requires testing on each target Host for trigger quality, permissions, script isolation, external references and task outcomes. No live-link HTTP audit of the 241 unique URLs was performed.


## 24. M14 Multi-Agent coordination, A2A boundaries and evidence-based evaluation deepening (0.33.0)

Expanded M14 from five to six substantive teaching sections per lesson while retaining its five lesson IDs, five assessment IDs, Rubrics, prerequisites and existing lab registration.

- Added a topology decision framework across routing, parallel fan-out/fan-in, orchestrator-worker, handoffs, evaluator-optimizer and deterministic workflows. Introduced explicit coordination-tax accounting for model calls, tools, retries, barriers, synthesis and critical-path latency.
- Clarified three separate protocol layers: internal Runtime Task/Result contracts, A2A remote Agent-to-Agent interoperability, and MCP model-to-tool/context interoperability. Added Agent Card, Task, Message, Part and Artifact responsibilities and the distinction between communication messages and durable deliverables.
- Deepened shared-state engineering with append-only evidence events, stable event IDs, optimistic concurrency/CAS, stale-write rejection, idempotent consumers and explicit criteria for choosing single-writer, transactions or CRDTs.
- Added independent verification and correlated-error analysis. Claim Ledger records support/contradiction sources, verification method, reviewer and unresolved status; model/prompt/tool/data-source overlap is made visible rather than assuming multiple agents are statistically independent.
- Added paired baseline/candidate benchmark design, Wilson binomial intervals, P95 latency, tool/coordination costs, conflict/duplicate-work/handoff failure metrics, trace spans and cost per successful task.
- Added a five-experiment workbook and five standard-library Python teaching calculators under examples/m14/, with five unit tests.
- Added five topic-matched references: Anthropic Building Effective Agents, A2A Core Concepts, the Dynamo distributed key-value store paper, Anthropic's multi-agent research system engineering report, and OpenAI Agents SDK tracing documentation. Course source inventory is now 359 entries and 246 unique URLs.
- Updated M14 teacher guide, curriculum map, teaching-resource index, source audit, acceptance script and course version to 0.33.0. No Agent Runtime, A2A server, distributed state service, trace backend or platform feature was implemented.

**Local verification:** `pnpm acceptance:local` passed with exit code 0. Results: 72 Vitest tests across 16 files, 19 course-schema validation tests, 35 Playwright E2E tests (including M14 lesson rendering), 57 M04–M14 Python example tests, 122 backend tests passed and 1 optional RLS test skipped. M14's five tests cover topology cost/latency, A2A object shapes, CAS/idempotency, claim evidence/diversity, Wilson intervals, P95 and cost per success. All five M14 calculators executed. Biome, TypeScript, production build, OpenAPI drift, Ruff, uv lock check and `git diff --check` passed. GitHub Actions was not triggered.

The examples are synthetic teaching models. The A2A validator is not an official SDK or conformance test; SharedState is single-process and not a distributed database; evidence source counts do not prove statistical independence; Wilson intervals do not replace representative paired experiments; and the cost calculator does not connect to live provider billing. Real deployment requires authenticated A2A endpoints, durable state, concurrency controls, real traces, representative benchmark sets and runtime authorization. No live-link HTTP audit of the 246 unique URLs was performed.


## 25. M15 Agentic security, authorization and human oversight courseware deepening (0.34.0)

Expanded M15 from five to six substantive teaching sections per lesson while retaining its five lesson IDs, five assessment IDs, Rubrics, prerequisites and existing lab registration.

- Added MITRE ATLAS attack-chain modeling and STRIDE mapping for prompt injection, context poisoning, tool invocation, credential exposure, audit tampering and resource exhaustion. Clarified vulnerability, threat scenario, risk and control as distinct concepts.
- Deepened indirect Prompt Injection and data-exfiltration defenses with source provenance, taint labels, object-level RAG authorization, context/data boundary controls, server-side tool enforcement, egress policy, DLP and privacy-aware trace/log handling.
- Added PDP/PEP authorization architecture and explicit RBAC/ABAC/ReBAC roles. Covered principal/tenant/resource/action/environment binding, delegated identity scope, deny-by-default, reauthorization, action-digest binding, expiry and nonce-based approval replay prevention.
- Expanded risk-tiered human oversight: impact, reversibility, sensitivity and external side effects determine automation, sampled review, explicit approval or dual approval. Approval interfaces must show exact target, normalized arguments, consequence, evidence and policy rationale.
- Added Agentic red-team coverage for direct/indirect injection, cross-tenant access, credential exposure, approval tampering, tool misuse, exfiltration, sandbox escape and cost harvesting. Added attack-success, unauthorized-execution, sensitive-exposure and mean-time-to-contain metrics plus incident containment/recovery stages.
- Added a five-experiment workbook and five standard-library teaching calculators under examples/m15/, with six unit tests.
- Added five topic-matched references: MITRE ATLAS, OWASP Top 10 for Agentic Applications 2026, NIST SP 800-162 ABAC, NIST AI 600-1 Generative AI Profile and MITRE's OpenClaw investigation. Course source inventory is now 364 entries and 250 unique URLs.
- Updated M15 teacher guide, curriculum map, teaching-resource index, source audit, acceptance script and course version to 0.34.0. No production PDP/PEP, IAM integration, DLP gateway, sandbox, SIEM/SOC workflow or platform feature was implemented.

**Local verification:** `pnpm acceptance:local` passed with exit code 0. Results: 72 Vitest tests across 16 files, 19 course-schema validation tests, 36 Playwright E2E tests (including M15 lesson rendering), 63 M04–M15 Python example tests, 122 backend tests passed and 1 optional RLS test skipped. M15's six tests cover STRIDE mapping/risk score, taint and egress, PDP/ABAC tenant checks, HMAC action-bound approval/expiry/replay, oversight tiers and red-team/incident metrics. All five M15 calculators executed. Biome, TypeScript, production build, OpenAPI drift, Ruff, uv lock check and `git diff --check` passed. GitHub Actions was not triggered.

The examples use synthetic inputs and are not a security certification. Taint labels are caller-supplied, authorization policies are simplified, the HMAC key is a demonstration secret, oversight tiers are teaching heuristics, and incident metrics depend on correctly labeled test cases. Real deployment requires a managed key service, durable one-time nonce storage, real identity and policy enforcement, OS/runtime isolation, DLP/egress controls, protected audit logs, red-team testing and legal/privacy review. No live-link HTTP audit of the 250 unique URLs was performed.


## 26. M16 Durable Workflow, Saga and replay-governance courseware deepening (0.35.0)

Expanded M16 from five to six substantive teaching sections per lesson while retaining its five lesson IDs, five assessment IDs, Rubrics, prerequisites and existing lab registration.

- Strengthened the Workflow Control Plane / Agent Decision Plane boundary: workflow owns state transitions, deadlines, authorization, approvals, retries and side effects; Agent nodes return bounded proposals validated by schemas, evidence and business rules.
- Added durable orchestration semantics: event history, checkpoint/replay, deterministic command ordering, nondeterministic Activity boundaries, at-least-once activity execution and idempotent external side effects.
- Deepened distributed Saga design with local transactions, forward recovery, compensation, transactional outbox/inbox, CloudEvents source/id deduplication and schema versioning. Clarified that compensation is a new business action, not an ACID rollback.
- Added bounded resilience engineering: error taxonomy, retry budget, exponential backoff/jitter, total deadline, unknown write outcome handling, circuit breaker, bulkhead, rate limiting and retry amplification.
- Added durable approval wait states and audit/trace correlation: action digest, requester/approver separation, policy version, expiry, approval event, trace/correlation/causation IDs and recovery after process restart.
- Added deterministic replay and Workflow Versioning: replay compatibility, version routing, old-history preservation, side-effect isolation and historical execution testing.
- Added a five-experiment workbook and five standard-library Python teaching calculators under examples/m16/, with five unit tests.
- Added five topic-matched references: Azure Durable Orchestrations, AWS Saga Patterns, AWS Step Functions error handling, OpenTelemetry messaging spans and Temporal Workflow Definition. Course source inventory is now 369 entries and 255 unique URLs.
- Updated M16 teacher guide, curriculum map, teaching-resource index, source audit, acceptance script and course version to 0.35.0. No Temporal/Azure/AWS workflow engine, message broker, durable state store or trace backend was implemented.

**Local verification:** `pnpm acceptance:local` passed with exit code 0. Results: 72 Vitest tests across 16 files, 19 course-schema validation tests, 37 Playwright E2E tests (including M16 lesson rendering), 68 M04–M16 Python example tests, 122 backend tests passed and 1 optional RLS test skipped. M16's five tests cover workflow guards, CloudEvents validation/deduplication, Saga compensation order, retry/circuit-breaker behavior, durable approval event binding and replay/version compatibility. All five M16 calculators executed. Biome, TypeScript, production build, OpenAPI drift, Ruff, uv lock check and `git diff --check` passed. GitHub Actions was not triggered.

The examples are deterministic teaching models. They do not provide persistent workflow history, broker guarantees, distributed transactions, production retry scheduling, authenticated approval events or Temporal/Azure replay conformance. Real deployment requires target-engine integration tests, durable state, idempotent activities, outbox/inbox transactions, real trace propagation, workflow versioning and failure injection. No live-link HTTP audit of the 255 unique URLs was performed.


## 27. M17 Evaluation, Judge calibration and GenAI observability courseware deepening (0.36.0)

Expanded M17 from five to six substantive teaching sections per lesson while retaining its five lesson IDs, five assessment IDs, Rubrics, prerequisites and existing lab registration.

- Added a consistent evaluation object model: Task, Trial, Grader, Transcript/Trace, Outcome and Evaluation Harness. Distinguished component, agent/workflow, end-to-end outcome and online evaluation; separated capability evaluation from regression evaluation.
- Deepened statistical design with paired baseline/candidate tasks, Wilson intervals, task-clustered bootstrap, pass@k/pass^k semantics, sample-size disclosure, stratification, multiple-comparison awareness and dataset contamination/leakage controls.
- Added LLM Judge calibration: deterministic/model/human grader roles, rubric anchors, pairwise A/B order swaps, position/length/self-preference biases, confusion matrices, Cohen's kappa, abstention and re-calibration after model/rubric changes.
- Added OpenTelemetry GenAI semantic attributes for model/provider/operation/token usage/tool/retrieval/error spans, plus trace/metric/log separation, low-cardinality metrics, sensitive-content minimization, redaction, sampling and retention policy.
- Added task-quality SLI/SLO, error-budget remaining, multi-window burn-rate alerting, shadow/canary evaluation, drift monitoring and offline-regression feedback loops. Explicitly separated safety hard constraints from aggregate quality budgets.
- Added a five-experiment workbook and five standard-library evaluation/telemetry calculators under examples/m17/, with five unit tests.
- Added five topic-matched references: Anthropic Demystifying Evals for AI Agents, HumanEval pass@k paper, Prometheus LLM Judge paper, OpenTelemetry GenAI Semantic Conventions and Google SRE Alerting on SLOs. Course source inventory is now 374 entries and 260 unique URLs.
- Updated M17 teacher guide, curriculum map, teaching-resource index, source audit, acceptance script and course version to 0.36.0. No evaluation service, grader platform, trace collector or production SLO monitor was implemented.

**Local verification:** `pnpm acceptance:local` passed with exit code 0. Results: 72 Vitest tests across 16 files, 19 course-schema validation tests, 38 Playwright E2E tests (including M17 lesson rendering), 73 M04–M17 Python example tests, 122 backend tests passed and 1 optional RLS test skipped. M17's five tests cover task/outcome grading, Wilson and paired-bootstrap calculations, pass@k/pass^k, Judge confusion/kappa/position bias, GenAI attribute privacy/cardinality and SLO/error-budget/burn-rate calculations. All five M17 calculators executed. Biome, TypeScript, production build, OpenAPI drift, Ruff, uv lock check and `git diff --check` passed. GitHub Actions was not triggered.

The examples are synthetic teaching models. Bootstrap is a simple task-level resampling illustration; pass@k/pass^k assume simplified independent trials; Cohen's kappa depends on label prevalence; the telemetry model does not connect to an OpenTelemetry SDK/Collector; and SLO examples omit production low-traffic and alert-suppression complexity. Real evaluation requires representative tasks, human-calibrated graders, versioned datasets, privacy-reviewed traces, production SLO windows and controlled online experiments. No live-link HTTP audit of the 260 unique URLs was performed.


## 28. M18 AI Platform architecture courseware deepening (0.37.0)

Expanded M18 from five to six substantive teaching sections per lesson, retaining its five lesson IDs, five assessment IDs, prerequisite declarations and existing AI Platform lab registration.

- Deepened Control Plane/Data Plane separation with desired/observed-state reconciliation, signed/versioned/TTL-bounded configuration snapshots, atomic rollout, canary and rollback behavior.
- Added Model Gateway request lifecycle, capability/region/policy/health-aware routing, safe fallback constraints, provider adapter boundaries and Local versus Global rate limiting.
- Added Usage Event Ledger, CloudEvents source+id idempotency, quota reservation/settlement, transactional outbox, price-version accounting and provider invoice reconciliation.
- Compared Silo/Pool/Bridge tenancy models and defined trusted tenant-context propagation across cache, vector retrieval, object storage, queues, logs and metering.
- Added weighted fair scheduling, admission control, load shedding, capacity headroom, failure-domain and RTO/RPO reasoning.
- Added five guided experiments and five dependency-free Python examples with five unit tests under examples/m18/.
- Added five topic-matched sources: Kubernetes Cluster Architecture, Envoy Gateway Rate Limiting, AWS Well-Architected SaaS Lens, OpenMeter Usage Events and Google SRE Handling Overload. Course source inventory is now 379 entries and 265 unique URLs.
- Updated M18 teaching guide, experiment workbook, resource index, curriculum map, static source audit, acceptance script and course version to 0.37.0. No live gateway, billing ledger, tenant-isolation runtime or production scheduler was implemented.

**Teaching-code limitations:** the examples use synthetic data. Snapshot verification assumes a trusted verifier and does not implement cryptographic signatures; gateway routing is static and does not coordinate distributed quotas; metering deduplication is in-memory rather than durable; tenant context assumes authenticated claims were validated upstream; and weighted scheduling is a teaching approximation rather than production DRR/WFQ. Production acceptance must test real authentication, cross-tenant negative cases, transactional idempotency, distributed rate limits, provider invoice reconciliation and overload recovery.

**Local verification:** M18's five Python unit tests and all five example scripts passed independently. The full 0.37.0 local acceptance run is recorded below after execution. GitHub Actions was not triggered.


## 29. M19 AI product engineering and delivery courseware deepening (0.38.0)

Expanded M19 from five to six substantive teaching sections per lesson while retaining all five lesson IDs, assessment IDs, rubrics and prerequisites.

- Added Opportunity Solution Tree and continuous discovery: outcome → opportunity → solution → assumption test, with desirability/feasibility/viability and risk hypotheses.
- Added risk-tiered autonomy, reversibility and action-bound human approvals; distinguished preview/confirm, human approval, dual control and prohibited automation.
- Added Cost per Successful Task, retries, human review, contribution margin, marginal costs, break-even volume, price versions and sensitivity analysis.
- Added experimentation governance: randomization unit, SRM, interference, primary/guardrail/diagnostic metrics, multiple comparisons and offline/shadow/canary sequence.
- Added complete AI Product Release Manifest and compatibility/rollback/retirement requirements for code, model, Prompt, tool schema, retrieval index, dataset, evaluator, policy and price table.
- Added a five-experiment workbook and five dependency-free Python examples with five unit tests under examples/m19/.
- Added five topic-matched references: Product Talk Continuous Discovery Habits, ACM CHI Human-AI Interaction Guidelines, AWS Well-Architected Cost Optimization, Microsoft Research Treatment Effect Assessment at Scale and DORA Continuous Delivery. Curriculum source inventory is now 384 entries and 270 unique URLs.
- Updated M19 teacher guide, workbook, resource index, curriculum map, static source audit, acceptance script and course version to 0.38.0. No product analytics service, billing platform, experimentation platform or release controller was implemented.

**Teaching-code limitations:** discovery priority is a heuristic, not product-market-fit evidence; human-control rules are not an authorization engine; unit economics depends on attribution and verified-success definitions; the SRM calculator does not implement a complete experiment statistics package; and release-manifest checks do not validate data/schema migration compatibility. Production decisions require representative user research, finance-approved cost allocation, pre-registered experiments, privacy/security review and rollback drills.

**Local verification:** M19's five Python unit tests and all five example scripts passed independently. Full 0.38.0 acceptance is pending the final run.


## 30. M20 Capstone end-to-end engineering and evidence governance deepening (0.39.0)

Expanded M20 from five to six substantive teaching sections per lesson while retaining all five lesson IDs, assessment IDs, rubrics and prerequisite relationships.

- Added Definition of Ready/Done, unique requirement IDs, owner/acceptance/verification fields, risk register and requirement→ADR→implementation→test→evidence traceability.
- Added architecture fitness functions, contract tests, ADR lifecycle, data provenance/licensing/retention and architecture-to-implementation consistency checks.
- Added vertical-slice delivery, practical test pyramid, mock-versus-real integration boundaries, reproducible builds, dependency lock and supply-chain evidence.
- Added Evidence Matrix mapping requirement/risk→control→test→evidence grade→decision owner, including hard security gates and residual-risk acceptance.
- Added reproducible defense package, frozen version manifest, evidence index, scripted/mock/target-environment distinctions and accountable roadmap/retirement decisions.
- Added five Capstone Gate experiments, five dependency-free Python examples and five unit tests under examples/m20/.
- Added five topic-matched references: ISO/IEC/IEEE 29148, arc42, Practical Test Pyramid, OWASP ASVS and SLSA v1.1. Curriculum source inventory is now 389 entries and 275 unique URLs.
- Updated M20 teacher guide, Capstone workbook, resource index, curriculum map, source audit, acceptance script and course version to 0.39.0. No new product runtime, deployment service or CI workflow was introduced.

**Teaching-code limitations:** requirement/ADR scripts validate field completeness, not correctness; vertical-slice checks do not authenticate log evidence; evidence grades are an educational rubric, not a security certification; defense readiness does not imply production approval. Real projects must validate source evidence, target environment, privacy, security, performance, resilience, cost and operational ownership.

**Local verification:** M20's five Python unit tests and all five example scripts passed independently. Full 0.39.0 local acceptance is pending final execution.


## 31. M04–M20 technical quality audit corrections (0.39.1)

Completed a first-pass module-by-module technical review of M04–M20. The review register, source-access findings and acceptance boundary are documented in `docs/CURRICULUM_QUALITY_AUDIT.md`.

- M04: clarified that 6ND is a rough dense-model compute estimate rather than a compute-optimal scaling rule; added the ICML/PMLR DPO-vs-PPO comparative study and qualified claims of algorithmic superiority.
- M14: corrected A2A protocol coverage to include the three standard bindings (JSON-RPC, gRPC and HTTP+JSON/REST), plus Agent Card `supportedInterfaces`/`protocolBinding`/`protocolVersion` semantics.
- M17: explicitly records that OpenTelemetry GenAI Semantic Conventions remain Development status at the audit date and must be version-pinned.
- M19/M20: fixed double-escaped Markdown newlines and added a regression test; M20 records the current ISO/IEC/IEEE 29148:2018 status and expected replacement-draft watch item.
- Updated the current source inventory to 390 HTTPS reference occurrences and 276 unique URLs. The live HTTP scan returned 272 HTTP 200, 3 HTTP 403 and 1 TLS error, with 47 redirects and no remaining confirmed 404. The PMLR reference added for M04 returned HTTP 200.
- Structural alignment audit passed for M04–M20: each module has five lessons, 30 teaching sections, five scored assessments with 10-point rubric totals, one teacher guide, one lab workbook and five Python example scripts. M07–M20 teacher guides now have five unique lesson-specific checkpoint blocks each (70 distinct blocks).

**Audit boundary:** this is a first-pass technical review of central claims and cited primary/official references, not a line-by-line verification of all 390 source occurrences. Four URL checks remain inconclusive due to access restrictions or TLS negotiation. Synthetic teaching calculators and local acceptance do not prove real provider, GPU or production execution.

**Local acceptance:** final 0.39.1 acceptance results are recorded in `docs/ACCEPTANCE.md`. GitHub Actions was not triggered; no commit or push was performed.


**Final 0.39.1 local acceptance:** 73 Vitest tests passed (16 files), 19 course-schema tests passed, 41 Playwright E2E tests passed, 88 M04–M20 Python example tests passed, and backend pytest reported 122 passed / 1 optional RLS test skipped. Biome lint/format, TypeScript, OpenAPI drift, production build, Ruff, uv lock and `git diff --check` passed. No GitHub Actions run, commit or push was performed.


## 32. M04 deep bibliography verification and canonical reference correction (0.39.2)

- Completed claim-to-source matching for all 21 M04 references across five lessons. Every source note is supported within the scope recorded in `docs/claim-source-reviews/M04.md`; no M04 bibliography replacement was required.
- Added `docs/CURRICULUM_CLAIM_SOURCE_TRACEABILITY.csv`, containing all 390 lesson-level source occurrences across 276 unique URLs. 30 source occurrences now have scoped verification notes (21 M04 matches plus nine occurrences covered by independently corroborated crawler-limited sources); 360 remain pending.
- Replaced the legacy OpenAI API pricing link in M19 with the current canonical official developer documentation URL. Course version advanced to 0.39.2.
- Full 276-URL recrawl returned 270 HTTP 200, 5 HTTP 403, 1 TLS error and 46 redirects; six crawler-limited endpoints were independently corroborated. No confirmed remaining HTTP 404.
- `pnpm acceptance:local` passed: 73 Vitest, 19 course-schema, 41 Playwright E2E, 88 M04–M20 Python example tests, and backend pytest 122 passed / 1 optional RLS test skipped. Biome, TypeScript, OpenAPI drift, production build, Ruff, uv lock and `git diff --check` passed.
- No GitHub Actions run, commit, push or destructive repository operation was performed.

**Audit boundary:** only M04 has completed the deep source-by-source tranche so far. The other 360 source occurrences remain in the traceability queue; this work does not certify the entire bibliography or constitute external peer review.


## 33. M05 deep bibliography verification and DeepSpeed reference correction (0.39.3)

- Completed claim-to-source matching for all 20 M05 references. Detailed claim scope and qualifications are recorded in `docs/claim-source-reviews/M05.md`.
- Replaced the legacy DeepSpeed inference tutorial link with the current official inference overview and clarified in the lesson that DeepSpeed-Inference v2 is now DeepSpeed-FastGen.
- Checked KV-cache formulas and worked capacity examples, MHA/MQA/GQA differences, top-k/top-p calculations, M/M/1 teaching approximations, PagedAttention block rounding, speculative decoding distribution preservation and theoretical quantization payload arithmetic.
- The claim-to-source register now records 50/390 occurrences with scoped verification notes; 340 remain pending.
- `pnpm acceptance:local` passed: 73 Vitest, 19 course-schema, 41 Playwright E2E, 88 M04–M20 Python example tests, backend pytest 122 passed / 1 optional RLS test skipped. Biome, TypeScript, OpenAPI drift, production build, Ruff, uv lock and `git diff --check` passed.
- No GitHub Actions run, commit, push or destructive repository operation was performed.

**Audit boundary:** the deep source-matching work is complete for M04 and M05 only. The remaining 340 source occurrences are still queued; the curriculum must not be described as having a fully verified bibliography or external peer review.


## 34. M06 deep bibliography verification and statistical-method correction (0.39.4)

- Completed source-content matching for all 21 M06 references across its five lessons. See `docs/claim-source-reviews/M06.md`.
- Canonicalized OpenAI, Anthropic and Google documentation URLs; updated OWASP Top 10 to the 2025 edition; corrected PromptBench v1 / PromptRobust v5 title/version metadata.
- Added Brown, Cai and DasGupta for Wilson score intervals and Efron for bootstrap methods. Clarified paired bootstrap must resample matched task units and estimate paired differences.
- Updated traceability inventory to 392 occurrences / 279 unique URLs. 70 occurrences have scoped verification notes; 322 remain pending.
- Full URL recrawl: 272 HTTP 200, 6 HTTP 403, 1 TLS error, 44 redirects; all seven crawler-limited sources were independently corroborated.
- Local acceptance will be recorded after the current full run. No GitHub Actions, commit, push or destructive repository operation was performed.

**Audit boundary:** deep source matching is complete for M04–M06 only. The remaining 322 occurrences are pending; this is not full-bibliography certification or external peer review.


## 35. M07 deep bibliography verification and tool-calling contract corrections (0.39.5)

- Completed claim-to-source matching for all 20 M07 source occurrences. See `docs/claim-source-reviews/M07.md`.
- Canonicalized OpenAI, Anthropic, Stripe and OWASP API Security URLs; corrected the citation metadata for arXiv:2307.16789 to ToolLLM (which contains the ToolBench dataset).
- Clarified MCP 2026-07-28 required `_meta` fields, JSON-RPC request ID versus business idempotency key, Stripe API v1/v2 replay/retention semantics and duplicate Transactional Outbox relay behavior.
- Traceability inventory remains 392 source occurrences / 278 unique URLs. 90 occurrences have scoped verification notes; 302 remain pending.
- URL recrawl: 271 HTTP 200, 6 HTTP 403, 1 TLS error, 40 redirects; all seven crawler-limited sources independently corroborated.
- `pnpm acceptance:local` passed: 73 Vitest, 19 course-schema, 41 Playwright E2E, 88 M04–M20 Python example tests, backend pytest 122 passed / 1 optional RLS test skipped. Biome, TypeScript, OpenAPI drift, production build, Ruff, uv lock and `git diff --check` passed. No GitHub Actions, commit, push or destructive repository operation was performed.

**Audit boundary:** deep source matching is complete for M04–M07 only. The remaining 302 source occurrences are pending; this is not full-bibliography certification or external peer review.


## 36. M08 deep bibliography review and NIST source version updates (0.39.6)

- Completed source-content matching for all 19 M08 references. See `docs/claim-source-reviews/M08.md`.
- Corrected canonical documentation links for Unstructured, LlamaIndex and LangChain; updated OWASP to the 2025 edition; replaced a generic BERT pretraining reference with the direct passage-reranking paper; clarified token-vs-character chunk size and added RRF answer-key arithmetic.
- Canonicalized six NIST references across M10/M13/M15/M16/M18. SP 800-53 now references Release 5.2.0; SP 800-61 Rev.2 was superseded by Rev.3; SP 800-57 Rev.5 remains final while Rev.6 is labeled draft; SSDF notes SP 800-218A.
- The six NIST URLs that initially returned HEAD 404 all returned GET 200; they were false positives rather than dead links. The audit now retries GET after HEAD errors.
- Traceability: 392 occurrences / 278 unique URLs; 118 occurrences have scoped verification notes and 274 remain pending. Latest crawl: 268 HTTP 200, 3 HTTP 206, 6 HTTP 403, 1 TLS error, 39 redirects, no confirmed 404.
- `pnpm acceptance:local` passed: 73 Vitest, 19 course-schema, 41 Playwright E2E, 88 M04–M20 Python example tests, backend pytest 122 passed / 1 optional RLS test skipped. Biome, TypeScript, OpenAPI drift, production build, Ruff, uv lock and `git diff --check` passed. No GitHub Actions, commit, push or destructive repository operation was performed.

**Audit boundary:** deep source matching is complete for M04–M08; the remaining 274 occurrences are pending. This is not full-bibliography certification or external peer review.


## 37. M09 deep bibliography verification and multimodal version notes (0.39.7)

- Completed source-content matching for all 20 M09 references. See `docs/claim-source-reviews/M09.md`.
- Corrected Whisper, EnCodec and Video-LLaMA citation titles to match current paper metadata. Clarified NIST Privacy Framework 1.0 final vs 1.1 Initial Public Draft.
- Checked contrastive alignment claims, ViT patch arithmetic, DDPM/CFG equations, audio PCM storage and WER calculations, and video-frame sampling coverage.
- Traceability inventory: 392 source occurrences / 278 unique URLs. 138 occurrences have scoped verification notes; 254 remain pending.
- `pnpm acceptance:local` passed: 73 Vitest, 19 course-schema, 41 Playwright E2E, 88 M04–M20 Python example tests, backend pytest 122 passed / 1 optional RLS test skipped. Biome, TypeScript, OpenAPI drift, production build, Ruff, uv lock and `git diff --check` passed. No GitHub Actions, commit, push or destructive repository operation was performed.

**Audit boundary:** deep source matching is complete for M04–M09. The remaining 254 source occurrences are pending; this is not full-bibliography certification or external peer review.


## 38. M10 deep bibliography verification and runtime semantics (0.39.8)

- Completed source-content matching for all 20 M10 references. See `docs/claim-source-reviews/M10.md`.
- Clarified current AgentBench v3, Temporal deterministic Workflow replay vs retryable Activities, LangGraph checkpointer vs store, and OpenTelemetry GenAI conventions at Development maturity.
- Checked the pass^k definition and IID (p^k) simplification; maintained postcondition verification and idempotent retry/reconciliation requirements.
- Traceability inventory: 392 occurrences / 278 unique URLs; 157 occurrences have scoped verification notes and 235 remain pending. URL crawl: 268 HTTP 200, 3 HTTP 206, 6 HTTP 403, 1 TLS error, 39 redirects and no confirmed 404.
- `pnpm acceptance:local` passed: 73 Vitest, 19 course-schema, 41 Playwright E2E, 88 M04–M20 Python example tests, backend pytest 122 passed / 1 optional RLS test skipped. Biome, TypeScript, OpenAPI drift, production build, Ruff, uv lock and `git diff --check` passed. No GitHub Actions, commit, push or destructive repository operation was performed.

**Audit boundary:** deep source matching is complete for M04–M10. The remaining 235 source occurrences are pending; this is not full-bibliography certification or external peer review.


## 39. M11 deep bibliography verification and memory-evaluation boundaries (0.39.9)

- Completed source-content matching for all 20 M11 references. See `docs/claim-source-reviews/M11.md`.
- Clarified Plan-and-Solve prompting vs Tree of Thoughts search vs LLM+P/PDDL classical planning; updated NIST AI RMF revision status; recorded LongMemEval v2 and LoCoMo benchmark properties; and qualified Mem0 performance results as author-reported.
- Traceability inventory: 392 source occurrences / 278 unique URLs. 177 occurrences have scoped verification notes; 215 remain pending.
- `pnpm acceptance:local` passed: 73 Vitest, 19 course-schema, 41 Playwright E2E, 88 M04–M20 Python example tests, backend pytest 122 passed / 1 optional RLS test skipped. Biome, TypeScript, OpenAPI drift, production build, Ruff, uv lock and `git diff --check` passed. No GitHub Actions, commit, push or destructive repository operation was performed.

**Audit boundary:** deep source matching is complete for M04–M11. The remaining 215 source occurrences are pending; this is not full-bibliography certification or external peer review.


## 40. M12 MCP stateless protocol, authorization and extension audit (0.40.0)

- Completed source-content matching for all 24 M12 references. See `docs/claim-source-reviews/M12.md`.
- Rebuilt the module around the 2026-07-28 stateless protocol, with explicit legacy handshake compatibility. Corrected per-request metadata, `server/discover`, Streamable HTTP headers/subscriptions, cache hints, MRTR, HTTP-only OAuth, OAuth 2.1/CIMD draft status, issuer/resource/audience binding, Tasks/MCP Apps and deprecated features.
- Traceability inventory: 396 source occurrences / 285 unique URLs; 201 occurrences have scoped verification notes and 195 remain pending. Latest URL crawl: 275 HTTP 200, 3 HTTP 206, 6 HTTP 403, 1 TLS error, 34 redirects and no confirmed 404.
- Local acceptance will be recorded after the current run. No GitHub Actions, commit, push or destructive repository operation was performed.

**Audit boundary:** deep source matching is complete for M04–M12. The remaining 195 source occurrences are pending; this is not full-bibliography certification or external peer review.


## 41. M12 extension-scope and citation reconciliation (0.40.1)

- Rechecked the Tasks extension against its current official overview: task-augmented execution is currently documented for `tools/call` only. Updated course content, workbook, teacher guide and the executable matrix to reject Tasks on `prompts/get` and `resources/read`.
- Clarified Tasks capability declaration in modern per-request metadata plus server `server/discover`; there is no separate per-tool warmup or additional per-request flag.
- Updated MCP Apps to its current official extension documentation and clarified UI capability advertisement, sandboxed iframe isolation and progressive fallback to ordinary tool results.
- Corrected OAuth 2.1 draft-17 update date to 2026-10-30 and reconciled the traceability CSV to all 24 current M12 source records and canonical extension URLs.
- Current source inventory: 396 occurrences / 285 unique URLs; M12 contributes 24 occurrences / 23 module-unique URLs.
- Full `pnpm acceptance:local` passed: 73 Vitest, 19 course-schema, 41 Playwright E2E, 88 Python example tests, backend pytest 122 passed / 1 optional RLS test skipped; Biome, TypeScript, OpenAPI drift, production build, Ruff, uv lock and `git diff --check` passed.
- No GitHub Actions, commit, push, branch switch or destructive cleanup was performed.


## 42. M13 Agent Skills claim/source review and technical corrections (0.40.2)

- Completed 20/20 M13 source-occurrence reviews across 14 unique URLs; synchronized every M13 row in the claim/source traceability register.
- Distinguished standard Agent Skills frontmatter from organization-defined registry contracts and clarified Claude Code-specific frontmatter/permission behavior.
- Updated SLSA references from retired v1.0 to current Approved v1.2; documented Build/Source provenance limits.
- Clarified skills-ref is demonstration-only, not production; added OpenAI Agents SDK and Anthropic advanced tool-use scope qualifications.
- Corrected binary FPR, false-trigger share and multi-Skill wrong-selection metric denominators; expanded Python tests.
- Global scoped source matching now 219/396 occurrences; 177 remain pending.
- Full `pnpm acceptance:local` passed: 73 Vitest, 19 course-schema, 41 Playwright E2E, 88 Python examples, backend pytest 122 passed / 1 optional RLS test skipped; Biome, TypeScript, OpenAPI drift, production build, Ruff, uv lock and `git diff --check` passed.
- No GitHub Actions, commit, push, branch switch or destructive cleanup was performed.


## 43. M14 multi-agent source review and A2A v1.0.1 alignment (0.40.3)

- Completed 20/20 M14 source-occurrence reviews across 19 unique URLs; synchronized the traceability register and created `docs/claim-source-reviews/M14.md`.
- Pinned A2A sources to v1.0.1 and aligned the example validator with `supportedInterfaces`, three core bindings, nested TaskState, ROLE_USER/ROLE_AGENT and Part oneof.
- Corrected bibliographic titles for CAMEL, Chandy–Lamport and the weak-judge/strong-agent oversight paper.
- Strengthened single-process CAS atomicity with a thread lock and changed evidence deduplication to declared source lineage; clarified neither proves distributed consistency or statistical independence.
- Corrected OpenAI Agents SDK tracing claims: artifact spans are custom; sensitive generation/function data may be captured by default; ZDR constraints apply.
- Global scoped source matching now 239/396 occurrences; 157 remain pending.
- Full `pnpm acceptance:local` passed: 73 Vitest, 19 course-schema, 41 Playwright E2E, 88 Python examples, backend pytest 122 passed / 1 optional RLS test skipped; Biome, TypeScript, OpenAPI drift, production build, Ruff, uv lock and `git diff --check` passed.
- No GitHub Actions, commit, push, branch switch or destructive cleanup was performed.


## 44. M15 agent-security and governance source review (0.40.4)

- Completed 20/20 M15 source-occurrence reviews across 19 unique URLs and created `docs/claim-source-reviews/M15.md`.
- Updated Privacy Framework, SP 800-162 Update 2, AI RMF Playbook, OWASP WSTG v4.2, EU AI Act consolidated text and ISO/IEC 42001 links/status.
- Clarified AI RMF 1.0 revision status, Privacy Framework 1.1 IPD status, SP 800-53 Release 5.2.0 baseline scope and NIST PE/PA/PEP terminology.
- Hardened examples: fail-closed taint provenance/egress, Decimal payment limits, resource ACL, approver/action/expiry-bound HMAC approval with atomic nonce consumption, and incident checklist prerequisites.
- Global scoped source matching now 252/396 occurrences; 144 remain pending.
- Full `pnpm acceptance:local` passed: 73 Vitest, 19 course-schema, 41 Playwright E2E, 88 Python examples, backend pytest 122 passed / 1 optional RLS test skipped; Biome, TypeScript, OpenAPI drift, production build, Ruff, uv lock and `git diff --check` passed.
- No GitHub Actions, commit, push, branch switch or destructive cleanup was performed.


## 45. M16 durable workflow and reliability source review (0.40.5)

- Completed 21/21 M16 source-occurrence reviews across 19 unique URLs; created `docs/claim-source-reviews/M16.md`.
- Pinned CloudEvents to v1.0.2 and clarified that event `specversion` remains `"1.0"`; updated NIST SP 800-53 to the Release 5.2.0 announcement.
- Added Temporal Worker Versioning and Event History references; clarified Activity retries, replay-safe code and Pinned/Auto-Upgrade deployment behavior.
- Updated retry example to Full Jitter; documented simplified circuit-breaker limits and OpenTelemetry Messaging conventions Development status.
- Added in-memory Outbox/Inbox transaction-boundary demonstration and signed approval events bound to approver, action, expiry, policy version, trace and one-time nonce.
- Global scoped source matching now 272/397 occurrences; 125 remain pending.
- Full `pnpm acceptance:local` passed: 73 Vitest, 19 course-schema, 41 Playwright E2E, 88 Python examples, backend pytest 122 passed / 1 optional RLS test skipped; Biome, TypeScript, OpenAPI drift, production build, Ruff, uv lock and `git diff --check` passed.
- No GitHub Actions, commit, push, branch switch or destructive cleanup was performed.


## 46. M17 evaluation and observability source review (0.40.6)

- Completed 20/20 M17 source-occurrence reviews across 18 unique URLs; created `docs/claim-source-reviews/M17.md`.
- Distinguished IID pass@k/pass^k from HumanEval's finite-sample unbiased pass@k estimator.
- Clarified ARES PPI's human calibration set, Prometheus evaluator publication, NIST AI RMF revision and OpenTelemetry GenAI Development maturity.
- Hardened eval task contracts, statistical input validation, paired judge position-bias measurement, telemetry attribute/metric-label allowlists and SLO calculations.
- Global scoped source matching now 292/397 occurrences; 105 remain pending.
- Full `pnpm acceptance:local` passed: 73 Vitest, 19 course-schema, 41 Playwright E2E, 88 Python examples, backend pytest 122 passed / 1 optional RLS test skipped; Biome, TypeScript, OpenAPI drift, production build, Ruff, uv lock and `git diff --check` passed.
- No GitHub Actions, commit, push, branch switch or destructive cleanup was performed.


## 47. M18 AI platform and multi-tenancy source review (0.40.7)

- Completed 21/21 M18 source-occurrence reviews across 19 unique URLs; created `docs/claim-source-reviews/M18.md`.
- Added NIST SP 800-57 Rev.6 Initial Public Draft source; confirmed Rev.5 remains the published final baseline as of 2026-11-10.
- Updated LiteLLM Router Reliability, OpenAI Responses, Anthropic Messages and Stripe rate-limit sources.
- Hardened HMAC-signed config snapshots, provider route/fallback policy checks, CloudEvents usage metering with payload-conflict detection and Decimal settlement, object-level tenant ACL/cache isolation, and N+1 capacity calculation.
- Global scoped source matching now 311/398 occurrences; 87 remain pending.
- Full `pnpm acceptance:local` passed: 73 Vitest, 19 course-schema, 41 Playwright E2E, 88 Python examples, backend pytest 122 passed / 1 optional RLS test skipped; Biome, TypeScript, OpenAPI drift, production build, Ruff, uv lock and `git diff --check` passed.
- No GitHub Actions, commit, push, branch switch or destructive cleanup was performed.


## 48. M19 claim-to-source audit and engineering corrections (0.40.8)

- Matched all 20 M19 source occurrences to 15 current, claim-specific primary/official URLs; replaced six generic or legacy destinations.
- Added `docs/claim-source-reviews/M19.md` with claim scope, source qualifications and implementation boundaries.
- Hardened M19 Python examples: finite assumption scores; action-bound approvals with expiry/idempotency; Decimal-only unit-cost arithmetic; SRM chi-square p-values and two-proportion diagnostics; expanded release manifests covering container/runtime/provider/model/Prompt/tool/API/index/embedding/evaluation/policy/price/feature flags/environment.
- Updated M19 teacher guide, lab workbook and source annotations.
- Global source traceability: 329/398 occurrences have scoped verification notes; 69 remain pending.
- Course version: 0.40.8. No GitHub Actions, commit, push, branch switch or destructive cleanup was performed.


## 49. M20 Capstone source audit and evidence-validator corrections (0.40.9)

- Matched all 20 M20 source occurrences against 16 current sources; replaced nine generic/legacy destinations and pinned MCP 2026-07-28, SLSA v1.2 and OWASP ASVS 5.0.0.
- Corrected ISO/IEC/IEEE 29148:2018 lifecycle wording: 2018 Edition 2 remains the current published standard after 2024 confirmation, but ISO marked it for revision in February 2026; DIS Edition 3 is in enquiry and is not yet a published standard.
- Added `docs/claim-source-reviews/M20.md` with claim-to-source evidence and qualifications.
- Hardened M20 examples: typed requirement metadata, ADR option structure, unique success/failure/security-denial evidence paths, explicit hard-constraint gate decisions and expanded defense manifests.
- Global scoped source matching: 349/398 occurrences; 49 remain pending.
- Course version: 0.40.9. No GitHub Actions, commit, push, branch switch or destructive cleanup was performed.


## 50. Full curriculum claim-to-source register closure (0.40.9)

- Completed the remaining M01–M03 source matching: M01 15/15 (11 unique URLs), M02 16/16 (12 unique URLs), M03 20/20 (18 unique URLs).
- Current source traceability register: 398/398 lesson-level occurrences have scoped verification notes; zero pending.
- Added `docs/claim-source-reviews/M01.md`, `M02.md` and `M03.md`; all 20 modules now have per-module source review records.
- Replaced older OECD, PyTorch, Stanford GloVe and OpenAI token-counting/text-guide links with current primary sources.
- Active URL register: 287 unique URLs; 279 HTTP 200, 3 HTTP 206, 5 HTTP 403, no TLS errors, 19 redirects recorded, and no confirmed HTTP 404. The five 403 sources are independently corroborated.
- Source matching closure is not external peer review or proof that every sentence has been independently reproduced.


## 51. Final M01–M20 local acceptance (0.40.9)

`pnpm acceptance:local` passed after the complete source register closure and M17–M20 technical corrections:

- Vitest: 73 passed (16 files); course schema: 19 passed; Playwright E2E: 41 passed.
- Python example suites M04–M20: 88 passed.
- Backend pytest: 122 passed, 1 optional RLS integration test skipped because the dedicated RLS environment was not configured.
- Biome lint/format, TypeScript, OpenAPI 3.1 contract check, production build, Ruff format/lint, uv lock and `git diff --check` passed.
- Source traceability: 398/398 occurrences with scoped notes; zero pending. Active URL register: 287 unique URLs, 279 HTTP 200, 3 HTTP 206, 5 HTTP 403, 19 redirects, no confirmed 404 or active TLS error.
- Branch `main`, HEAD `7dcfe7a`; worktree remains mixed (190 status entries). No reset/clean, branch switch, commit, push or GitHub Actions run.

Local acceptance does not imply external peer review, real GPU/provider validation, production deployment or a passing optional PostgreSQL RLS integration test.


## 52. Post-commit curriculum baseline revalidation (2026-11-10)

- Development baseline: `develop` at `80bf7ab5f06bd9ff5802e43e814ed507479ee352`; `origin/develop` matched local HEAD at the start of this revalidation. `main` remains preserved as the stable baseline.
- Worktree was clean before acceptance; this supersedes earlier sections that describe the pre-governance mixed worktree as the current state. Those earlier sections remain historical snapshots.
- Re-ran `pnpm acceptance:local` against the committed baseline; exit code 0.
- Results: Biome lint 57 files; Biome format 56 files; TypeScript passed; OpenAPI 3.1.0 with 12 paths in sync; Vitest 73 passed; Course Schema 19 passed; Vite production build passed; Playwright 41 passed; M04–M20 Python examples 88 passed; Ruff format 63 files and lint passed; backend pytest 122 passed, 1 optional PostgreSQL RLS integration test skipped because its dedicated environment was not configured.
- No GitHub Actions workflow was run. This revalidation does not establish production deployment, external peer review, real provider/GPU validation, or PostgreSQL RLS integration acceptance.
- Curriculum source matching remains 398/398 occurrences with scoped verification notes; this is traceability closure, not independent certification of every source claim.
