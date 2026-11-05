# Changelog

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
