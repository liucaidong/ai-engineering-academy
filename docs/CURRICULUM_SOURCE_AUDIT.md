# 课程参考来源静态审计

## 1. 范围

扫描 M01–M20 旗舰教材 TypeScript 源文件中的结构化来源条目，统计 title、url、publisher 和 note 字段，并检查 URL 是否为绝对 HTTPS 地址。

## 2. 统计结果

| 指标 | 结果 |
|---|---:|
| 模块数 | 20 |
| 教材讲次数 | 100 |
| 来源条目总数 | 398 |
| 全课程唯一 URL 数 | 287 |
| 重复 URL 的额外出现次数 | 111 |
| 非 HTTPS / 非绝对 URL | 0 |
| title/url/publisher/note 字段 | 静态结构检查通过 |

| 模块 | 来源条目 | 模块内唯一 URL |
|---|---:|---:|
| M01 | 15 | 11 |
| M02 | 16 | 12 |
| M03 | 20 | 18 |
| M04 | 21 | 21 |
| M05 | 20 | 18 |
| M06 | 21 | 21 |
| M07 | 20 | 19 |
| M08 | 19 | 19 |
| M09 | 20 | 20 |
| M10 | 20 | 14 |
| M11 | 20 | 16 |
| M12 | 24 | 23 |
| M13 | 20 | 14 |
| M14 | 20 | 19 |
| M15 | 20 | 19 |
| M16 | 21 | 19 |
| M17 | 20 | 18 |
| M18 | 21 | 19 |
| M19 | 20 | 15 |
| M20 | 20 | 16 |

## 3. 重复引用解释

重复 URL 主要来自同一篇基础论文、标准或官方文档被多个讲次复用。它不等同于失效链接，也不必然是错误引用；但模块内重复比例较高时，应检查来源是否支持该讲的具体论点，避免用通用框架文档替代专门技术来源。

模块内重复相对较多的主题包括 M01（AI 系统定义/风险治理）、M02（Transformer 原始论文）、M12（MCP 规范）、M13（Skill 规范与版本/供应链）、M19（AI 产品设计与治理）和 M20（Capstone 架构/治理）。后续文献维护应优先检查来源多样性和论点对应关系。

## 4. 来源质量审查规则

1. **权威性**：优先原始论文、标准组织、官方规范、维护者文档和正式技术报告。
2. **论点匹配**：来源应支持具体公式、协议语义、威胁或工程实践，而不只是主题相近。
3. **版本与时效**：API、产品文档、价格、协议和安全建议应记录访问日期/版本。
4. **书目信息**：保留作者、发布机构、会议/期刊或规范版本。
5. **证据等级**：区分原始研究结论、厂商文档、二手解释和教学类比。
6. **可复现性**：论文/文档中的实验设置、模型版本和参数须与教材数值示例区分。

## 5. 在线验证边界

本文件记录的是来源条目的结构和 URL 形式静态审计，**不包含在线 HTTP 检查结果**。288 个唯一 URL 的在线初检结果、最终跳转地址和检查方式另见 [课程质量审计](./CURRICULUM_QUALITY_AUDIT.md) 及 [逐 URL 检查明细](./reference-url-audit-2026-11-10.csv)。在线可达性不等于具体段落匹配；付费墙、版本迁移和来源对具体论点的支持程度仍需人工核验。

课程中涉及模型 API、协议、价格和产品文档的内容，应以对应供应商/标准组织当前版本为准。

## 6. Claim-to-source traceability register

`CURRICULUM_CLAIM_SOURCE_TRACEABILITY.csv` records all 398 lesson-level source occurrences and their authored source notes as claims requiring verification. At the initial deep-review checkpoint, seven crawler-inconclusive URLs had independently corroborated source identities and nine source occurrences had scoped verification notes. After the M04 and M05 deep-review tranches, 50/396 source occurrences had scoped verification notes and 342 remained pending claim-to-source matching. This is a work register, not a claim that all 397 citations have been semantically verified.


The reconciled 287-URL register on 2026-11-10 records 279 HTTP 200, 3 HTTP 206 (successful ranged PDF responses), 5 HTTP 403 and no TLS/transport error; 19 URLs redirect to their recorded final destinations. No confirmed HTTP 404 remains. The five 403 sources are separately documented and independently corroborated. The original HTTP result and independent evidence are recorded separately in `reference-url-audit-2026-11-10.csv`. The legacy OpenAI pricing URL was replaced by the current official developer documentation URL.


### M04 deep-review checkpoint

All 21 M04 source occurrences were compared with the cited primary papers or official documentation. The source notes are supported within the scope recorded in `docs/claim-source-reviews/M04.md`; no M04 bibliography replacement was required. The 396-row register records these 21 occurrences as `VERIFIED_SOURCE_MATCH_M04`.


M04 checkpoint: 30/396 source occurrences had scoped verification notes (21 M04 source matches plus nine occurrences covered by independently corroborated crawler-limited sources); 362 remained pending at that checkpoint.


### M05 deep-review checkpoint

All 20 M05 source occurrences were matched to primary papers or official documentation. The legacy DeepSpeed inference tutorial link was replaced with the current official inference overview; the lesson explicitly flags the DeepSpeed-Inference v2 → DeepSpeed-FastGen transition. The register recorded 50/392 occurrences with scoped verification notes and 342 pending at the M05 checkpoint.


The M05 tranche completed 20/20 source matches. The official DeepSpeed inference reference now points to the current inference overview, and the lesson flags the DeepSpeed-Inference v2 → DeepSpeed-FastGen transition.


### M06 deep-review checkpoint

All 21 M06 source occurrences were matched to primary papers, standards or official documentation. Canonicalized OpenAI, Anthropic, Google and OWASP URLs; updated the PromptBench v1 / PromptRobust v5 citation metadata; and added Wilson score interval and bootstrap references. The paired-comparison guidance now specifies resampling matched task units. M06 checkpoint: 70/396 source occurrences had scoped verification notes; 322 remained pending at that checkpoint.


### M07 deep-review checkpoint

All 20 M07 source occurrences were matched to primary papers, official specifications or current vendor documentation. Canonicalized OpenAI, Anthropic, Stripe and OWASP URLs; corrected ToolBench/ToolLLM metadata; and clarified MCP `_meta`, JSON-RPC ID semantics, Stripe API v1/v2 idempotency and outbox duplicate delivery. M07 checkpoint: 90/396 source occurrences have scoped verification notes; 302 remain pending at that checkpoint.


### M08 deep-review checkpoint

All 19 M08 source occurrences were matched to primary papers or current official documentation. Canonicalized Unstructured, LlamaIndex and LangChain documentation; updated OWASP to 2025; replaced the generic BERT citation with the direct BERT passage-reranking paper; and clarified character-vs-token chunk sizing. M08 checkpoint: 109/392 occurrences had scoped verification notes; 283 remained pending.

### NIST source update checkpoint

Six NIST URLs that first returned HEAD 404 were all confirmed GET 200. The links were canonicalized, SP 800-53 updated to Release 5.2.0, SP 800-61 updated from superseded Rev.2 to Rev.3, and SP 800-57 Rev.5 explicitly distinguished from the Rev.6 draft. Nine lesson-level rows were marked `VERIFIED_NIST_SOURCE_UPDATE`. Current register: 118/396 source occurrences have scoped verification notes; 274 remain pending.

Latest reconciled URL audit: 287 unique URLs; 279 HTTP 200, 3 HTTP 206, 5 HTTP 403, no TLS/transport errors, 19 redirects recorded by final URL, and no confirmed HTTP 404.


### M09 deep-review checkpoint

All 20 M09 source occurrences were matched to primary papers or official standards. Corrected Whisper, EnCodec and Video-LLaMA paper titles and clarified NIST Privacy Framework 1.0 final versus 1.1 Initial Public Draft. Checked contrastive alignment, ViT patch arithmetic, DDPM/CFG equations, PCM storage, WER and video-frame sampling examples. M09 checkpoint: 138/396 source occurrences have scoped verification notes; 254 remain pending.


### M10 deep-review checkpoint

All 20 M10 source occurrences were matched to primary papers or current official documentation. Current AgentBench v3 metadata, Temporal replay/Activity retry semantics, LangGraph checkpointer/store scope and OpenTelemetry GenAI convention Development maturity are now explicit. The pass^k (p^k) example is qualified by IID assumptions. M10 checkpoint: 157/396 source occurrences have scoped verification notes; 235 remain pending.


### M11 deep-review checkpoint

All 20 M11 source occurrences were matched to primary papers, official NIST guidance or current runtime documentation. Corrected Plan-and-Solve/Ragas metadata; clarified NIST AI RMF 1.0 revision status, LongMemEval v2/LoCoMo benchmark dimensions and Mem0 author-reported results. M11 checkpoint: 177/396 source occurrences have scoped verification notes; 215 remain pending.


### M12 MCP 2026-07-28 deep-review checkpoint

All 24 M12 source occurrences were matched to the versioned MCP specification, official extensions, IETF drafts, OWASP and HTTP/JSON-RPC standards. The module now distinguishes legacy initialize/session from modern per-request metadata, server/discover, Streamable HTTP headers/subscriptions, cache hints, MRTR, HTTP-only OAuth and optional Tasks/MCP Apps extensions. OAuth 2.1 draft-17 and CIMD draft-03 are correctly labeled Internet-Drafts. M12 checkpoint: 201/396 source occurrences have scoped verification notes; 195 remain pending.

All 20 M13 source occurrences were matched to the Agent Skills specification, Anthropic/Claude Code runtime documentation, OpenAI Agents SDK, LangGraph, OWASP, NIST and current SLSA v1.2. The review distinguishes standard frontmatter from organization-defined registry contracts, Host-specific fields, skills-ref demonstration-only scope, and separate trigger/routing metric denominators. M13 checkpoint: 219/396 source occurrences have scoped verification notes; 177 remain pending.

All 20 M14 source occurrences were matched to the current A2A v1.0.1 specification, AutoGen, Google ADK, Anthropic research, distributed-systems papers and agent benchmarks. The A2A example now checks supportedInterfaces, nested TaskState, ROLE_* and Part oneof; shared-state/evidence and tracing lessons distinguish process-local demos, provenance, custom spans and sensitive-data capture. M14 checkpoint: 239/396 source occurrences have scoped verification notes; 157 remain pending.

All 20 M15 source occurrences were matched to current NIST, OWASP, MITRE, ISO and EUR-Lex sources. The review updated NIST SP 800-162 Update 2, Privacy Framework 1.0/1.1 status, AI RMF revision status, SP 800-53 Release 5.2.0 baseline scope, the 2026 consolidated AI Act, and WSTG v4.2. Example fixes make unknown taint sources/destinations fail closed, use Decimal for payment limits, bind approvals to authenticated approver/action/expiry and atomically consume nonces, and clarify incident-checklist limits. M15 checkpoint: 252/396 source occurrences have scoped verification notes; 144 remain pending.

Latest full URL register: 287 unique URLs; 279 HTTP 200, 3 HTTP 206, 5 HTTP 403, no TLS/transport errors, 19 redirects recorded by final URL, and no confirmed HTTP 404.


All 21 M16 source occurrences were matched to workflow orchestration, Temporal, Durable Task, Saga/Outbox, CloudEvents v1.0.2, retry/resilience, NIST and OpenTelemetry sources. The examples now include an in-memory Outbox/Inbox boundary, Full Jitter, signed approval events with one-time nonce consumption, and stricter workflow proposal validation. Temporal Worker Versioning and Event History references were added; OpenTelemetry Messaging spans are labeled Development. M16 checkpoint: 272/397 source occurrences have scoped verification notes; 125 remain pending.


All 20 M17 source occurrences were matched to HELM, Anthropic eval guidance, dataset documentation, HumanEval, LLM-as-a-Judge/G-Eval/ARES/Prometheus papers, NIST AI RMF, OpenTelemetry and Google SRE/Evidently sources. The review distinguishes IID pass@k from HumanEval finite-sample estimation, notes ARES PPI human calibration, and records OpenTelemetry GenAI conventions as Development. M17 examples now enforce typed task contracts, finite statistical inputs, paired judge position swaps, telemetry allowlists and finite SLO calculations. M17 checkpoint: 292/397 source occurrences have scoped verification notes; 105 remain pending.


All 21 M18 source occurrences were matched to current Google/Kubernetes/NIST, provider API, gateway, metering, SaaS and SRE sources. Added NIST SP 800-57 Rev.6 IPD status and clarified that Rev.5 remains the final baseline; strengthened signed control-plane snapshots, route fallback checks, CloudEvents usage-event idempotency, Decimal settlement, object-level tenant authorization, principal-scoped cache keys and N+1 capacity. M18 checkpoint: 311/398 source occurrences had scoped verification notes before M19 review.


## M19 source-match checkpoint (2026-11-10)

All 20 M19 source occurrences were matched to 15 unique current claim-specific sources. Replaced the generic Stanford HAI home page, legacy PAIR guidebook, Product Talk landing page, Microsoft Research project page, legacy NIST Playbook path and generic experimentguide root with claim-specific Stanford HAI, PAIR v2, Product Talk, Microsoft HAX, current NIST Playbook and Cambridge University Press pages. Verified the six changed destinations by direct GET; all returned HTTP 200. M19's examples now use Decimal unit economics, approval action binding with expiry/idempotency, SRM p-values and expanded AI release manifests. Global scoped claim/source matching is now 329/398 occurrences; 69 remain pending.


## M20 source-match checkpoint (2026-11-10)

All 20 M20 source occurrences were matched to 16 unique current sources. Updated PAIR to Guidebook v2, ADR to the MADR template, OpenAI and LlamaIndex to current developer documentation, MCP to the versioned 2026-07-28 specification, NIST Playbook to the current AIRC path, OpenTelemetry to its concepts documentation, ASVS to the stable 5.0.0 site, and SLSA to Approved v1.2. Nine changed destinations returned HTTP 200. ISO/IEC/IEEE 29148:2018 remains the current published standard after 2024 confirmation but is now marked for revision; DIS Edition 3 is in enquiry, not yet a published standard. Global source matching is 398/398 occurrences; 0 remain pending.


## M01–M03 source-match checkpoint and full register closure (2026-11-10)

- M01: 15/15 source occurrences matched to 11 unique URLs.
- M02: 16/16 source occurrences matched to 12 unique URLs.
- M03: 20/20 source occurrences matched to 18 unique URLs.
- Updated OECD AI definition source to the in-force OECD/LEGAL/0449 Recommendation, PyTorch to current `docs.pytorch.org`, GloVe to its ACL Anthology paper, and OpenAI token-counting/text-role links to current developer documentation.
- Replaced the Stanford GloVe project-page dependency with the published ACL Anthology paper, eliminating the prior TLS-limited endpoint from the active source register. The OECD explanatory memorandum remains HTTP 403 but its source identity and definition are independently corroborated against the in-force OECD legal instrument and OECD 2026 guidance.
- All 398/398 lesson-level source occurrences now have scoped claim-to-source verification notes; zero remain pending. This is source matching, not external peer review or sentence-by-sentence proof of every claim.
