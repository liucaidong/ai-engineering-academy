# Curriculum Quality Audit — 2026-11-10

- Repository: `liucaidong/ai-engineering-academy`
- Curriculum version after audit corrections: `0.40.9` (audit started from `0.39.0`)
- Scope: M01–M20 curriculum source, teacher guides, lab workbooks, source inventory and acceptance records.
- Audit type: first-pass editorial and structural audit. This is not a complete subject-matter peer review or live bibliography crawl.

## 1. Executive findings

The curriculum baseline is 0.39.0 before editorial corrections. It contains 20 modules, 100 lessons, 580 teaching sections and 100 scored assessments. After the M04 DPO/PPO comparison reference and M12 protocol-source expansion, the current source inventory is 398 HTTPS reference occurrences and 287 unique URLs. M04–M20 have five lessons and six teaching sections per lesson. These counts describe authored assets; they do not prove every claim is correct or every source is currently reachable.

The first-pass audit identified an editorial weakness in teacher materials: M07–M20 repeated the same generic learning-checkpoint prompts across all five lessons, despite covering substantially different protocols, architectures and evaluation methods. The prompts were structurally valid but insufficiently diagnostic for the lesson topic.

## 2. Completed corrections

### 2.1 Topic-specific teacher checkpoints

Replaced the generic three-part checkpoint block in each of the M07–M20 teaching guides with module-specific questions. The new checkpoints target each module's actual learning risks:

- M07: provider/runtime/protocol boundaries, schema and deferred discovery, unknown outcomes and idempotency.
- M08: evidence lineage, retrieval metrics, ACL/index staleness and evidence conflicts.
- M09: modality-specific objectives, token/frame/audio budgets and cross-modal failure modes.
- M10–M11: agent autonomy/replay/capabilities, planning DAGs, memory provenance and approval binding.
- M12–M13: MCP lifecycle/security and Agent Skills metadata, host policy and supply-chain controls.
- M14–M16: multi-agent topology/state consistency, threat-to-control mapping, durable workflow and replay semantics.
- M17–M19: statistical evaluation/Judge calibration, platform tenancy/overload, product discovery and unit economics.
- M20: requirements-to-evidence traceability, architecture fitness and reproducible defense.

Each M07–M20 guide now has five distinct checkpoint blocks. Each block is derived from that lesson's actual six teaching-section headings and asks about the core mechanism, engineering trade-off and a concrete failure/validation test. A structural uniqueness check confirmed five blocks and five unique checkpoint sets in every guide. Existing lesson-specific common-error lists and rubric mappings were retained.

### 2.2 Source inventory wording

The current source audit now describes 398 HTTPS reference occurrences and 287 unique URLs. Historical acceptance snapshots in `docs/ACCEPTANCE.md` remain unchanged because they record earlier curriculum versions (260, 265 and 270 unique URLs).

### 2.3 Live URL corrections

The first HTTP pass found two 404 responses. The NIST SP 800-162 link in M15 was changed to the directly retrievable 2019 update PDF. The AWS Saga Patterns link in M16 was changed to the current AWS Prescriptive Guidance Saga pattern page. Both replacements returned HTTP 200 on the follow-up crawl. The complete per-URL result, status, final URL, content type and request method are recorded in `reference-url-audit-2026-11-10.csv`.

The reconciled 287-URL register records 279 HTTP 200, three HTTP 206 (successful ranged PDF responses), five HTTP 403 and no TLS/transport error; 19 URLs redirect to their recorded final destinations; no confirmed HTTP 404 remains. The six NIST HEAD-only 404s were all GET 200 and are documented as false positives. The five current 403 endpoints are individually listed in the URL audit and independently corroborated through publisher/official indexed pages or official PDFs. The earlier Stanford GloVe project URL that failed TLS was replaced with the published ACL Anthology paper, which returned HTTP 200. The legacy OpenAI pricing URL was replaced with the current official developer documentation URL, which returned HTTP 200. The NIST report preserves the original HEAD-only false positives separately; the current URL audit records the GET fallback result. Independent corroboration for crawler-limited sources is not misreported as HTTP 200. A successful HTTP response does not establish that the cited page supports the exact teaching claim.

### 2.4 Claim-level and rendering corrections

- **M04:** clarified that the 6ND estimate is not a compute-optimal scaling rule and that the 1.2T-token example is an input assumption, not an optimum. Added an ICML/PMLR empirical comparison showing that DPO should not be presented as universally superior to PPO.
- **M17:** explicitly labels OpenTelemetry GenAI Semantic Conventions as Development status at the audit date; production implementations must pin the convention version and manage migrations rather than treat the attributes as stable.
- **M19–M20:** corrected double-escaped newline sequences in lesson Markdown so paragraph and list formatting renders as intended.
- **M20:** added the current ISO status note for ISO/IEC/IEEE 29148:2018: ISO says it was reviewed and confirmed in 2024 but also indicates a draft replacement is expected, so future course releases must recheck the standard's status.

## 3. Structural review results

| Area | Result | Qualification |
|---|---|---|
| Module/lesson inventory | 20 modules / 100 lessons | Based on current course source and completion report |
| Teaching-section inventory | 580 | Authored sections; not a measure of depth by itself |
| Scored assessments | 100 | One per lesson according to completion report |
| Teacher guides | 20 | M07–M20 each have five unique lesson-specific checkpoint blocks |
| Lab workbooks | 17 | M04–M20 |
| Python example suites | 17 | M04–M20 |
| Source references | 398 occurrences / 287 unique URLs | Static URL/schema audit plus the M04 PMLR reference and M12 protocol-source expansion |
| Source claim-to-evidence matching | M01–M20: 398/398 occurrences have scoped source-match notes | Not external peer review or proof of every sentence; see per-module review files |
| Live URL reachability | 279 HTTP 200; 3 HTTP 206; 5 HTTP 403; no TLS/transport error | 287 unique URLs checked on 2026-11-10 |
| Redirects | 19 | Final destinations recorded in the CSV; redirects are not automatically failures |
| Confirmed HTTP 404 | 0 after correction | Two stale URLs were replaced and rechecked |
| Real provider/GPU/production execution | Not implied | Simulation and local examples must remain clearly labeled |

## 4. M04–M20 module-by-module technical review register

| Module | Core claims checked | Review result / correction |
|---|---|---|
| M04 | Causal/MLM/Span Corruption; dense 6ND estimate; MoE active vs resident parameters; LoRA/QLoRA; RLHF/PPO/DPO/RLAIF; ECE/Brier scope | Qualified 6ND vs compute-optimal scaling; added ICML/PMLR evidence to prevent universal DPO-over-PPO claims; verified worked arithmetic and calculator assumptions |
| M05 | KV-cache formula and GiB conversion; MHA/MQA/GQA; PagedAttention block rounding; top-k/top-p; queueing model; chunked prefill vs phase disaggregation; speculative rejection correction; quantization payload | Formulas and examples checked; M/M/1 is explicitly labeled illustrative, and speculative decoding distinguishes acceptance correction from raw draft acceptance |
| M06 | Prompt contracts; few-shot coverage/order sensitivity; JSON syntax vs schema vs business validity; grammar constraints; indirect prompt injection; Judge calibration | Core distinctions and non-security-boundary caveats are present; current OpenAI prompt guidance supports code-managed prompts and regression testing |
| M07 | Provider function calling vs Host Runtime vs MCP/JSON-RPC; schema compatibility; tool routing; idempotency and unknown outcomes; RFC 9457 | Layer boundaries and retry semantics checked; timeout is not equated with failure and write operations require idempotency/state lookup |
| M08 | RAG vs long context vs fine-tuning; chunking; ANN/BM25/RRF; ACL filtering; Self-RAG/CRAG; faithfulness and citation support | Retrieval and generation metrics are separated; evidence lineage and permission filtering remain explicit |
| M09 | Contrastive image-text alignment; patch/visual token budgets; diffusion and NFE; ASR/diarization; video temporal grounding | Task-specific modality budgets and failure modes are distinguished; calculators remain labeled as synthetic estimates, not model benchmarks |
| M10 | Agent autonomy envelope; Plan/Act/Observe; durable execution/replay; capability security; outcome grading; pass^k | pass^k independence assumptions and final-state evaluation are explicit; teaching examples are not represented as production runtime |
| M11 | Planning DAG; context/state/memory/knowledge distinctions; provenance/TTL/deletion; retrieval; approval binding | Memory provenance, stale/conflicting records, tenant scope and deletion propagation are explicit; approval is bound to action parameters |
| M12 | MCP 2026-07-28 stateless core; MRTR; Streamable HTTP; cache scopes; OAuth issuer/resource binding; Tasks/Extensions/deprecations | Checked against the official 2026-07-28 release/specification; version-specific legacy handshake and modern stateless behavior are distinguished |
| M13 | Agent Skills directory/frontmatter; required/optional fields; version metadata; experimental allowed-tools; Host authorization; supply chain | Current specification distinctions are explicit; package conformance is not conflated with Runtime integration or task effectiveness |
| M14 | Multi-agent topology/cost; A2A Agent Card/Task/Message/Artifact; MCP boundary; CAS/CRDT; correlated errors and evidence ledger | Corrected A2A binding coverage to include JSON-RPC, gRPC and HTTP+JSON/REST; clarified binding/version declaration in Agent Card |
| M15 | STRIDE/ATLAS; direct/indirect injection; taint/egress; PDP/PEP and RBAC/ABAC; human oversight | NIST/OWASP/MITRE control mapping is consistent; legal examples remain explicitly non-legal-advice and require jurisdiction-specific review |
| M16 | Workflow vs Agent decision plane; Saga compensation; Outbox/CloudEvents; retries/bulkheads; durable approvals; deterministic replay/versioning | Compensation is not rollback; replay, durable wait and event idempotency boundaries are explicit |
| M17 | Eval Harness; paired trials/Wilson/bootstrap; pass@k/pass^k; Judge bias; SLOs; GenAI telemetry | Corrected the OTel GenAI convention maturity statement: relevant conventions are Development, not Stable; version pinning/migration is required |
| M18 | Control/data plane; model capability routing; RPM/TPM/concurrency; quota reservation/usage ledger; tenant isolation; fair scheduling/overload | Cost arithmetic and metering distinctions checked; provider usage is separated from internal tokenizer estimates and duplicate events must not double-charge |
| M19 | Product discovery; risk-tiered autonomy; cost per successful task; contribution margin; A/B randomization/SRM/multiple metrics | Unit-cost arithmetic checked; rubric allows optional tool/storage costs; experiment design includes randomization unit, SRM and guardrails |
| M20 | Requirements traceability; ADR; architecture fitness; vertical slice; evidence matrix; reproducible defense; ISO/SLSA references | Corrected Markdown newline escaping; updated ISO 29148 status note to track the expected replacement draft; evidence levels distinguish mock/simulation/real environment |

This register records a first-pass review of each module's central technical claims and their cited primary/official references. It is not a line-by-line certification of every sentence in all 396 reference occurrences.

## 5. Remaining editorial review work

1. **Claim-to-source traceability:** sample and then systematically review claims, equations, protocol details and numerical examples against the cited primary source; record source version/date and the exact supported claim.
2. **Assessment alignment:** verify each lesson objective is directly assessed by its prompt and rubric, and that rubric point totals and acceptance criteria are unambiguous.
3. **Experiment validity:** inspect every Python example for correct assumptions, edge cases, units, deterministic behavior and explicit limits of the teaching model.
4. **Cross-module progression:** identify duplicated explanations and prerequisite gaps across M04–M20; distinguish deliberate reinforcement from accidental repetition.
5. **Teacher-guide depth:** expand lesson-specific teaching moves, misconception probes, worked solution reasoning and grading examples where current guides remain too templated.
6. **Bibliography freshness:** the 287-URL HTTP crawl is recorded; five current 403 endpoints have independent source corroboration. Continue periodic reachability checks. Per-claim source matching is separate from HTTP reachability.

## 6. Acceptance boundary

This audit records editorial corrections and structural observations only. It does not certify all technical claims, validate every external source, establish production readiness, or replace instructor review. Any unsupported or unverified claim should be labeled and either corrected, qualified or removed before the curriculum is represented as externally peer-reviewed.



## 7. 0.39.1 acceptance evidence (previous baseline)

- 73 Vitest tests passed (16 files), including the M19/M20 Markdown newline regression test.
- 19 course-schema validation tests passed; 41 Playwright E2E tests passed.
- 88 M04–M20 Python example tests passed.
- Backend pytest: 122 passed, 1 optional RLS integration test skipped because the dedicated RLS environment was not configured for this run.
- Biome lint/format, TypeScript, OpenAPI drift, Vite production build, Ruff format/lint, uv lock and `git diff --check` passed.
- At the time of that earlier acceptance snapshot, the repository was on `main` at HEAD `7dcfe7a` with 181 mixed worktree entries. This is a historical count, not the current worktree count. No cleanup, commit, push or GitHub Actions run was performed.

The M01–M20 source-matching pass is complete and all 398 source occurrences have scoped notes. The reconciled 2026-11-10 URL snapshot has five current HTTP 403 endpoints with separately recorded independent corroboration; the earlier Stanford GloVe TLS-limited URL was replaced, and the legacy OpenAI pricing URL was replaced. Historical crawler exceptions are retained below for audit traceability. These records do not constitute external peer review or proof that every bibliography item fully supports every associated teaching claim.

## 8. Deep bibliography traceability — active register

Created `docs/CURRICULUM_CLAIM_SOURCE_TRACEABILITY.csv` as a lesson-level claim-to-source work register. It contains all 398 source occurrences across M01–M20 and records module, lesson, section headings, source title, publisher, URL, authored source note, claim to verify, review status and evidence fields. The authored source note is a review target, not proof that the source supports the claim.

### 8.1 Historical crawler-inconclusive URLs and canonical-link corrections

| Source | Original crawler result | Independent evidence | Claim-level disposition |
|---|---|---|---|
| ACM CHI 2019 — Guidelines for Human-AI Interaction | HTTP 403 | ACM-indexed metadata/abstract and independent repository record | Correct paper; abstract supports 18 general human-AI interaction guidelines and evaluation with practitioners/products. Exact guideline-by-guideline mapping remains pending. |
| MITRE ATLAS OpenClaw Investigation | HTTP 403 | Official MITRE-hosted PDF | Supports attack-chain examples involving prompt injection, credential access, malicious Skills, tool invocation and configuration abuse. |
| OECD 2024 explanatory memorandum | HTTP 403 | Official OECD publication page and PDF | Supports the updated AI-system definition context. It is explanatory material and must not be represented as a binding Recommendation itself. |
| Stanford GloVe project | TLS negotiation error | Stanford project page content indexed/retrieved independently; original paper indexed in ACL Anthology | Supports global word-word co-occurrence training and static word-vector representation. |
| OWASP LLM01:2025 Prompt Injection | HTTP 403 | Official OWASP GenAI Security Project page | Supports direct/indirect prompt injection definitions and documented impact classes. |
| OWASP Top 10 for Agentic Applications 2026 | HTTP 403 | Official OWASP GenAI Security Project page | Supports the risk-framework description for agentic applications. |
| OpenAI API pricing | Legacy URL returned HTTP 403 | Replaced by current official developer documentation URL; HTTP 200 | Current pricing reference is available; price values remain time-sensitive and must be rechecked. |

The five current crawler-inconclusive HTTP outcomes (five 403 sources) remain separately documented in the URL audit; three 206 responses are successful ranged PDF responses. Independent evidence is recorded in additional columns; none of these records has been rewritten as an HTTP 200. The earlier Stanford GloVe TLS-limited project page was replaced with the ACL Anthology paper and is no longer in the active URL register. There are no confirmed dead URLs among the five currently crawler-limited endpoints. The 398-occurrence matrix currently has scoped verification notes for all occurrences (M01: 15; M02: 16; M03: 20; M04: 21; M05: 20; M06: 21; M07: 20; M08: 19; M09: 20; M10: 20; M11: 20; M12: 24; M13: 20; M14: 20; M15: 20; M16: 21; M17: 20; M18: 21; M19: 20; M20: 20); zero occurrences remain pending claim-level review. This register is a traceability work queue, not a certification that all sources support their notes.

### 8.2 Review-state rules

- `PENDING_CLAIM_MATCH`: no source-content comparison has yet been recorded.
- `VERIFIED_*`: the named claim is supported by the cited accessible source material; the status is scoped to the explicit verified-claim field, not the entire lesson.
- A 200 response proves reachability only, not claim support.
- A search-indexed result, publisher landing page, DOI resolver, or official PDF can corroborate a source without changing the original URL crawler result.
- Where a source supports only background context, the lesson must not attribute stronger causal, quantitative, legal or normative conclusions to it.


## 9. M04 deep claim-to-source review

Completed source-content matching for all 21 M04 references across its five lessons. Each source note is supported by the cited primary paper or official documentation. No M04 source replacement or lesson correction was required in this tranche. The review records important limits: Chinchilla scaling is regime-specific; Mixtral active parameters differ from resident weights; QLoRA memory results are setup-specific; PPO/DPO results are benchmark-dependent; and HELM/model cards/datasheets are not exhaustive certification. See `docs/claim-source-reviews/M04.md` and filter the 392-row traceability register by `module=M04`.


## 10. M04 bibliography tranche and course 0.39.2

The 21 M04 source occurrences have been checked against primary papers or official documentation and are recorded as `VERIFIED_SOURCE_MATCH_M04`. Together with nine occurrences covered by independently corroborated crawler-limited sources, 30 of 392 source occurrences now have scoped verification notes; 362 remain pending. The legacy OpenAI pricing URL in M19 was replaced with the current canonical developer documentation URL. Course version was advanced to 0.39.2 for this source correction.


## 11. M05 deep claim-to-source review (course 0.39.3)

Completed source-content matching for all 20 M05 references across its five lessons. All source notes are supported by the cited primary papers or official documentation. Replaced the legacy DeepSpeed inference tutorial URL with the current official inference overview and added a lesson caveat that DeepSpeed-Inference v2 is now DeepSpeed-FastGen. The KV-cache arithmetic, sampling examples, M/M/1 teaching approximation, PagedAttention block math, speculative-decoding distribution claim and quantization payload arithmetic were checked. See `docs/claim-source-reviews/M05.md`.


## 12. M06 deep claim-to-source review (course 0.39.4)

Completed source-content matching for all 21 M06 references. Canonicalized OpenAI, Anthropic and Google documentation URLs; updated the OWASP Top 10 reference to the 2025 edition; corrected PromptBench/PromptRobust version metadata; and added primary statistical references for Wilson score intervals and bootstrap resampling. The lesson now specifies paired bootstrap over matched task units and reports the paired difference interval. See `docs/claim-source-reviews/M06.md`.


## 13. M07 deep claim-to-source review (course 0.39.5)

Completed source-content matching for all 20 M07 source occurrences. Canonicalized OpenAI, Anthropic, Stripe and OWASP API Security URLs; corrected the ToolBench/ToolLLM citation title; and added precision around MCP 2026-07-28 `_meta` requirements, JSON-RPC correlation IDs, Stripe API v1/v2 idempotency semantics and duplicate Transactional Outbox delivery. See `docs/claim-source-reviews/M07.md`.


## 14. M08 deep claim-to-source review (course 0.39.6)

Completed source-content matching for all 19 M08 references. Canonicalized Unstructured, LlamaIndex and LangChain documentation; updated OWASP to the 2025 edition; replaced the generic BERT pretraining citation with Nogueira and Cho’s direct *Passage Re-ranking with BERT* source; corrected Ragas/BEIR metadata; and clarified character-vs-token units for chunk sizing. Checked chunk-count arithmetic, vector similarity examples and the RRF answer key. See `docs/claim-source-reviews/M08.md`.

## 15. NIST source canonicalization and version update

Six NIST URLs initially returned 404 on HEAD, but all six returned 200 on GET; they were not dead links. Canonical DOI/project-page links were adopted, SP 800-53 was advanced to Release 5.2.0, SP 800-61 was updated from superseded Rev.2 to Rev.3, SP 800-57 Rev.5 was retained as the final publication with Rev.6 clearly labeled draft, and the SSDF page now notes SP 800-218A. Nine lesson-level source occurrences have scoped NIST update notes. See `docs/REFERENCE_LINK_REPAIR_REPORT.md`.


## 16. M09 deep claim-to-source review (course 0.39.7)

Completed source-content matching for all 20 M09 references. Corrected Whisper, EnCodec and Video-LLaMA paper titles; clarified NIST Privacy Framework 1.0 final versus 1.1 Initial Public Draft; checked CLIP/SigLIP/ImageBind claims, ViT patch arithmetic, diffusion/CFG equations, audio storage/WER calculations and Video-MME coverage. See `docs/claim-source-reviews/M09.md`.


## 17. M10 deep claim-to-source review (course 0.39.8)

Completed source-content matching for all 20 M10 references. Added current AgentBench v3 metadata, clarified Temporal deterministic Workflow replay vs retryable Activities, distinguished LangGraph thread checkpointers from cross-thread stores, and recorded OpenTelemetry GenAI Semantic Conventions as Development maturity rather than Stable. Checked pass^k and IID (p^k) assumptions. See `docs/claim-source-reviews/M10.md`.


## 18. M11 deep claim-to-source review (course 0.39.9)

Completed source-content matching for all 20 M11 references. Corrected Plan-and-Solve and Ragas titles; updated NIST AI RMF 1.0 revision status; documented LongMemEval v2 and LoCoMo benchmark dimensions; and qualified Mem0 performance figures as author-reported rather than independent replication. See `docs/claim-source-reviews/M11.md`.


## 19. M12 MCP 2026-07-28 protocol audit and correction (course 0.40.0)

Completed claim-to-source matching for all 24 M12 references. Rebuilt the module around the 2026-07-28 stateless protocol while retaining an explicit 2025-11-25-and-earlier legacy compatibility track. Corrected per-request metadata, optional clientInfo, server/discover, Streamable HTTP headers and subscriptions, cacheScope/ttlMs, MRTR requestState integrity, HTTP-only OAuth, issuer/resource/audience binding, current OAuth 2.1/CIMD draft status, Tasks/MCP Apps extensions and deprecated surfaces. See `docs/claim-source-reviews/M12.md`.


### M13 source-match checkpoint (2026-11-10)

- M13: 20/20 source occurrences verified against 14 unique URLs.
- Total scoped claim-to-source review: 219/396 occurrences; 177 remain pending.
- SLSA references updated from retired v1.0 to current Approved v1.2; Claude Code documentation link canonicalized.


### M14 source-match checkpoint (2026-11-10)

- M14: 20/20 source occurrences verified against 19 unique URLs.
- Total scoped claim-to-source review: 239/396 occurrences; 157 remain pending.
- A2A references are pinned to v1.0.1; the local example now validates the current AgentCard/Task/Message/Part/Artifact field shapes.


### M15 source-match checkpoint (2026-11-10)

- M15: 20/20 source occurrences verified against 19 unique URLs.
- Total scoped claim-to-source review: 252/396 occurrences; 144 remain pending.
- Current legal, privacy, NIST control, ABAC, AI RMF and incident-response source revisions are recorded in `docs/claim-source-reviews/M15.md`.


### M16 source-match checkpoint (2026-11-10)

- M16: 21/21 source occurrences verified against 19 unique URLs.
- Total scoped claim-to-source review: 272/397 occurrences; 125 remain pending.
- CloudEvents is pinned to v1.0.2; Temporal Worker Versioning/Event History and OpenTelemetry Messaging maturity are recorded in `docs/claim-source-reviews/M16.md`.


### M17 source-match checkpoint (2026-11-10)

- M17: 20/20 source occurrences verified against 18 unique URLs.
- Total scoped claim-to-source review: 292/397 occurrences; 105 remain pending.
- HumanEval pass@k estimator, NIST AI RMF revision status and OpenTelemetry GenAI Development maturity are recorded in `docs/claim-source-reviews/M17.md`.


### M18 source-match checkpoint (2026-11-10)

- M18: 21/21 source occurrences verified against 19 unique URLs.
- Total scoped claim-to-source review: 311/398 occurrences; 87 remain pending.
- NIST SP 800-57 Rev.6 IPD status, provider-native usage semantics and CloudEvents metering are recorded in `docs/claim-source-reviews/M18.md`.


### M19 source-match checkpoint (2026-11-10)

- M19: 20/20 source occurrences matched against 15 unique claim-specific URLs.
- Replaced generic/legacy source destinations with PAIR Guidebook v2, Stanford HAI's human-centered AI definition, Product Talk's Opportunity Solution Tree explanation, Microsoft HAX Toolkit, the current NIST Playbook and the Cambridge University Press book page. Six changed destinations were directly fetched and returned HTTP 200.
- M19 Python examples were hardened: finite discovery scores, action-bound approvals with expiry/idempotency, Decimal unit economics (float rejected), SRM chi-square p-values and two-proportion diagnostics, and a broader reproducible release manifest.
- Global scoped source matching: 329/398 occurrences; 69 remain pending.
- See `docs/claim-source-reviews/M19.md` for the occurrence-level review and limitations.


### M20 source-match checkpoint (2026-11-10)

- M20: 20/20 source occurrences matched against 16 unique current URLs.
- Updated PAIR v2, MADR template, OpenAI/LlamaIndex developer docs, MCP 2026-07-28, NIST Playbook, OpenTelemetry concepts, OWASP ASVS 5.0.0 and SLSA v1.2. All nine changed destinations returned HTTP 200.
- Corrected ISO 29148 status: 2018 Edition 2 remains the current published version after 2024 confirmation, but is marked for revision; DIS Edition 3 is in enquiry and is not yet a published standard.
- Hardened M20 validators for requirement metadata, ADR option structure, vertical-slice path uniqueness, hard-constraint gates and evidence-package completeness.
- Global source matching: 398/398 occurrences; 0 remain pending. See `docs/claim-source-reviews/M20.md`.


### Full claim-to-source register closure (2026-11-10)

- M01: 15/15; M02: 16/16; M03: 20/20 source occurrences matched and documented.
- All 398/398 lesson-level source occurrences now have scoped claim-to-source verification notes; zero remain pending.
- Updated older/generic OECD, PyTorch, GloVe and OpenAI documentation links to current primary sources.
- The active 287-URL crawl has 279 HTTP 200, 3 HTTP 206 (successful ranged PDFs), 5 HTTP 403 and no TLS errors; 19 final-URL redirects are recorded; no confirmed HTTP 404 remains. Five 403 endpoints are separately documented and independently corroborated.
- This closes the source-matching register only. It does not constitute independent peer review, a legal compliance opinion, or line-by-line proof of every source statement.
- See `docs/claim-source-reviews/M01.md` through `M20.md` for per-module source scope and qualifications.


## 9. Final 0.40.9 local acceptance (2026-11-10)

`pnpm acceptance:local` passed after the complete M01–M20 source-match and correction tranche:

- Vitest 73/73 (16 files); course schema 19/19; Playwright E2E 41/41.
- Python examples M04–M20: 88 passed.
- Backend pytest: 122 passed, one optional PostgreSQL RLS integration test skipped because the dedicated RLS environment was not configured.
- Biome lint/format, TypeScript, OpenAPI 3.1 drift check, Vite production build, Ruff format/lint, uv lock and `git diff --check` passed.
- Source register: 398/398 occurrences matched with scoped notes, zero pending; 287 unique active URLs, 279 HTTP 200, 3 HTTP 206, 5 HTTP 403, 19 redirects, no confirmed 404 and no active TLS failure.
- Repository remains on `main` at `7dcfe7a`; worktree remains mixed (190 status entries). No reset, clean, branch switch, commit, push or GitHub Actions run.

This acceptance is local and does not establish external peer review, production readiness, real provider/GPU behavior or PostgreSQL RLS integration in this run.
