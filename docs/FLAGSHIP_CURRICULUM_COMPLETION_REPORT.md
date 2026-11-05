# AI Engineering Academy — Flagship Curriculum Completion Report

- Repository: liucaidong/ai-engineering-academy
- Branch: main
- Curriculum version: 0.14.0
- Report date: 2026-11-06
- Scope: instructional content, curriculum registration, course documentation and changelog only.

## 1. Executive summary

M01–M20 are registered as a 20-module curriculum. M01–M03 retain their existing flagship content and were not overwritten. M04–M20 are five-lesson flagship modules. M04–M09 now contain five substantive sections per lesson, including reproducible practical exercises; M10–M20 retain four substantive sections per lesson. Each lesson has a scored assessment and three topic-matched source references.

| Metric | M01–M03 | M04–M20 | Total |
|---|---:|---:|---:|
| Modules | 3 | 17 | 20 |
| Lessons | 15 | 85 | 100 |
| Teaching sections | 70 | 370 | 440 |
| Scored assessments | 15 | 85 | 100 |
| Source references | 51 | 255 | 306 |

These are authored-source counts. They do not imply all references were live-link checked or that the application was built or executed.

## 2. Module inventory

| Module | Status | Lessons | Sections | Assessments | References | Core scope |
|---|---|---:|---:|---:|---:|---|
| M01 | Existing flagship retained | 5 | 24 | 5 | 15 | AI/ML/DL/LLM foundations, learning, neural networks, capability boundaries and AI system design |
| M02 | Existing flagship retained | 5 | 21 | 5 | 16 | Transformer, Attention, masks, positional mechanisms, blocks and inference complexity |
| M03 | Existing flagship retained | 5 | 25 | 5 | 20 | Tokenization, embeddings, context budgets, context engineering and tokenizer practice |
| M04 | Flagship built + practical depth | 5 | 25 | 5 | 15 | Pretraining/data, architecture families and MoE, SFT/LoRA, RLHF/PPO/DPO, model evaluation |
| M05 | Flagship built + practical depth | 5 | 25 | 5 | 15 | Prefill/Decode, KV Cache, decoding, batching, speculative decoding, quantization and serving |
| M06 | Flagship built + practical depth | 5 | 25 | 5 | 15 | Prompt specifications, few-shot, structured output, injection defense and regression evaluation |
| M07 | Flagship built + practical depth | 5 | 25 | 5 | 15 | Tool-call protocol, schema validation, discovery/routing, idempotency and safety evaluation |
| M08 | Flagship built + practical depth | 5 | 25 | 5 | 15 | RAG pipeline, chunking, embeddings/ANN, hybrid retrieval/reranking and production evaluation |
| M09 | Flagship built + practical depth | 5 | 25 | 5 | 15 | Multimodal fusion, ViT, diffusion, audio tokenization/ASR/TTS and system engineering |
| M10 | Flagship built | 5 | 20 | 5 | 15 | Agent boundaries, execution loop, runtime state machine, context/tool security and reliability |
| M11 | Flagship built | 5 | 20 | 5 | 15 | Planning DAGs, memory types, retrieval/consolidation, human approval and evaluation |
| M12 | Flagship built | 5 | 20 | 5 | 15 | MCP architecture, capabilities, transports, authentication/authorization and operations |
| M13 | Flagship built | 5 | 20 | 5 | 15 | Skill contracts, packaging, composition, supply-chain security and registry governance |
| M14 | Flagship built | 5 | 20 | 5 | 15 | Multi-Agent topologies, task protocols, shared state, evidence arbitration and cost evaluation |
| M15 | Flagship built | 5 | 20 | 5 | 15 | Threat modeling, privacy, tool authorization, output governance and incident response |
| M16 | Flagship built | 5 | 20 | 5 | 15 | Workflow/Agent boundary, event orchestration, resilience, approvals and workflow testing |
| M17 | Flagship built | 5 | 20 | 5 | 15 | Evaluation taxonomy, benchmarks, LLM Judge, observability and online quality SLOs |
| M18 | Flagship built | 5 | 20 | 5 | 15 | Platform planes, model gateway, quotas/metering, tenancy/security and reliability |
| M19 | Flagship built | 5 | 20 | 5 | 15 | Product discovery, AI UX/HITL, unit economics, experiments and delivery lifecycle |
| M20 | Flagship built | 5 | 20 | 5 | 15 | Capstone charter, architecture, implementation, evaluation/security/deployment and defense |

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

- M04–M09 each contain five lessons with five substantive sections per lesson; M10–M20 each contain five lessons with four substantive sections per lesson. All have measurable objectives and one scored assessment with a rubric.
- Each new module contains 15 lesson-level source references.
- Mathematical and engineering examples include training FLOPs, LoRA parameter counts, KV Cache capacity, sampling probabilities, chunk counts, similarity/RRF, ViT token counts, audio data size, retry backoff and unit economics.
- Design trade-offs, failure modes, security boundaries and evaluation methods are included.
- M01–M03 instructional content was retained; an earlier source-level newline-escaping normalization was applied to keep Markdown string literals valid.
- Existing Schema v1 was reused; no schema migration was introduced.
- Existing prerequisite declarations were retained.
- Source URLs are authored as absolute HTTPS URLs. No claim is made that all 306 links were individually fetched or live-link verified.

A source-preserving syntax normalization was applied to M01–M06 flagship files: literal line breaks inside double-quoted Markdown string values were converted to escaped newline sequences. This preserves the intended runtime Markdown paragraphs. M07–M20 already used valid single-line string literals. This source normalization does not replace compiler/build verification.

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

## 6. Validation status

| Check | Status | Qualification |
|---|---|---|
| Read latest GitHub main before each batch | Completed | Main head re-read before each batch commit |
| Preserve M01–M03 | Completed at instructional-content level | Existing lesson content retained; earlier newline-escaping source normalization is documented above |
| M04–M20 registration | Static review completed | Imports, module objectives and lesson selectors updated |
| Lesson/assessment/rubric ID invariants | Static source scan completed; runtime validator not executed | 100 lesson IDs and 100 assessment IDs are unique; no duplicate rubric criterion names were found within authored assessments |
| Prerequisite references/cycle detection | Declarations retained | No prerequisite edge changed; validator not executed |
| Source URL syntax | Editorial/static review | Absolute HTTPS authored; no full live-link crawl |
| Lab references | Static review | Only existing lab IDs referenced |
| TypeScript compilation/build | Not executed | No local compiler/build |
| Course validator | Not executed | npm run validate:course intentionally not run |
| Unit tests | Not executed | npm test intentionally not run |
| E2E/browser acceptance | Not executed | npm run test:e2e intentionally not run |
| GitHub Actions / CI | Not executed | No workflow added or intentionally triggered |

The static source scan counted 100 lessons, 100 assessments, 440 teaching sections and 306 source references across M01–M20. M04–M09 each have five lessons, 25 sections, five assessments and 15 HTTPS source references; M10–M20 each have five lessons, 20 sections, five assessments and 15 HTTPS source references. The scan also found no duplicate lesson IDs, assessment IDs or rubric criterion names. This is a source-level consistency check, not execution of the Zod validator or TypeScript compiler.

## 7. Unresolved verification items

1. Run the course validator locally to confirm all Zod invariants against the assembled course object.
2. Run TypeScript compilation/build to catch syntax, import and type errors not provable through Git Data API static review.
3. Run unit and browser acceptance tests when local verification is authorized.
4. Perform a live-link audit of references and record inaccessible or redirected sources.
5. Review rendered Markdown in the frontend, especially math notation, tables and long-form sections.
6. Confirm every lab is displayed with its actual declared execution mode and without implying production model execution.

## 8. Final scope statement

This delivery is a curriculum-content expansion and documentation update. It does not claim platform feature completion, backend implementation, production deployment, CI success, local test success or browser acceptance. Completed work is limited to content authoring, curriculum registration, documentation/changelog updates, GitHub commits and the editorial/static review described above.
