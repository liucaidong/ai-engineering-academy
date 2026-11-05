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
