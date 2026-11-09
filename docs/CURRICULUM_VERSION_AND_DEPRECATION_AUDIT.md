# M01–M20 协议、标准、API 与弃用状态审计

> 审计基准：2026-11-10。此报告按模块归纳 claim-source reviews 中的版本敏感来源；不把滚动文档误写成固定版本，也不把草案、实验性字段或 Development 规范标为最终/稳定。

## 1. 审计口径

本轮对 M01–M20 的 20 份 claim-source review 和课程目录进行版本敏感内容复核。课程来源追溯表共 400 条 source occurrences、288 个唯一 URL；URL 状态表含 292 个唯一 URL。数量代表来源记录和 URL 去重统计，不代表 400 条主张均已获得第三方独立认证。

分类规则：

- **固定版本规范/标准**：记录版本号、发布日期和官方状态；若存在更高版本或修订草案，说明是否已取代当前发布版。
- **Internet-Draft / IPD / DIS**：必须明确标注 Draft，不得称为 RFC、Final 或已批准国际标准。
- **Experimental / Development**：明确标注实验性或开发中；不得当作稳定 API/schema 合同。
- **滚动 API/SDK 文档**：文档没有一个全局固定版本时，标注为 rolling documentation；实际项目必须锁定 SDK/package version、model ID/snapshot、endpoint/API version、region、deployment mode 和核验日期。
- **历史论文/基准**：保留论文版本和修订日期；实验结果不得泛化为当前供应商 API 能力或 SLA。

## 2. M01–M20 模块版本矩阵

| 模块 | 固定版本/标准/研究版本 | 滚动 API、SDK 或动态资源 | 状态与教学边界 |
|---|---|---|---|
| M01 | OECD/LEGAL/0449 于 2023-11 更新 AI system definition、2024-05 修订 Recommendation；NIST AI RMF 1.0 为当前已发布基线；OWASP GenAI LLM Top 10 2026 于 2026-08-04 发布 | Google ML Crash Course、scikit-learn stable docs | OECD Recommendation 是政策建议而非通用技术分类；NIST AI RMF 1.0 自愿使用且正在修订；OWASP 2026 是风险分类，不是完整威胁模型或认证 |
| M02 | Vaswani et al. Transformer（NeurIPS 2017）；FlashAttention-2（ICLR 2024）；RoPE、GQA 等按对应论文限定 | PyTorch `MultiheadAttention` stable API、SDPA 优化行为随安装版本/后端变化 | Mask shape、`batch_first`、布尔 mask 语义和优化路径必须按项目实际 PyTorch 版本验证；浏览器实验不是 GPU benchmark |
| M03 | Gemini 1.5 technical report（2024）；LongBench（ACL 2024）；Llama 3 8B model card 是特定模型资产 | OpenAI Responses API/token-counting docs、Hugging Face tokenizer/chat-template docs | Gemini 1.5 长上下文结果是历史研究结果，不是当前 API context window/SLA；模型/tokenizer serialization 需逐模型验证；Responses API 文档为滚动文档 |
| M04 | GPT-3（2020）、Chinchilla（2022）、The Pile（2021）、BERT（2018）、T5（2019）、DPO/LoRA 等论文按原论文版本引用 | Hugging Face TRL、PEFT 文档 | TRL trainer、PEFT target modules 和 API 行为随库版本/模型架构变化；真实实现必须锁定 package/commit 与基础模型 revision |
| M05 | Speculative Decoding（2022）、DistServe（OSDI 2024）等论文 | Transformers GenerationConfig、vLLM、TensorRT-LLM、DeepSpeed inference docs | generation defaults/feature support 与模型/版本/硬件后端相关；DeepSpeed-Inference v2 已转为 DeepSpeed-FastGen，旧 `init_inference` 教程是 legacy API，不得当成当前入口 |
| M06 | JSON Schema 2020-12 是当前发布 dialect；RFC 8259；OWASP GenAI LLM Top 10 2026；PromptRobust v5（原 PromptBench 标题沿革） | OpenAI Structured Outputs、Anthropic/Google structured-output docs | Provider strict schema 只支持各自子集；JSON 合法、schema 合法、业务合法是不同层次；PromptRobust v5 题名与版本应按当前论文元数据引用 |
| M07 | MCP Specification `2026-07-28`；OpenAPI `3.2.1`（2026-09-10）；JSON Schema 2020-12；RFC 9457；OWASP API Security Top 10 2023；AgentBench arXiv v3（2025-10-04）；BFCL V4（2026-04-12） | OpenAI Function Calling/Programmatic Tool Calling、Anthropic Advanced Tool Use、Stripe idempotency API docs | MCP 版本语义按 2026-07-28 固定；OpenAPI `latest` 是滚动入口，契约应锁版本；OWASP API Security Top 10 2023 仍为该项目最新发布版；Stripe idempotency 保留/重放行为按 API version 验证 |
| M08 | OWASP GenAI LLM Top 10 2026；Ragas arXiv v2（2025-04-28）；BEIR/BERT reranking 论文 | LlamaIndex Node Parser、LangChain、Unstructured 文档 | Chunker/parser API 与默认值随版本变化；RAGAS/ARES 是诊断性评测，不证明来源真实、当前或授权正确 |
| M09 | NIST Privacy Framework 1.0 是当前已发布版本；1.1 为 Initial Public Draft（意见期 2025-06-13 结束）；Qwen2.5-VL report（2025-02）；Video-MME arXiv v3（2025-05-30） | 多模态 provider API/model cards | Privacy Framework 1.1 不得称 Final；模型报告的分辨率、token、视频能力是特定模型/配置结果，不是全行业 API 保证 |
| M10 | AgentBench arXiv v3（2025-10-04）；τ-bench（2024）；OWASP GenAI LLM Top 10 2026；OpenTelemetry GenAI conventions | LangGraph、Temporal Workflows/SDK、OpenTelemetry SDK/Collector | LangGraph/Temporal 是滚动文档，实际 SDK 和 Worker Deployment Versioning 行为需按版本/部署模式核验；GenAI semantic conventions 在独立仓库且为 Development；core semconv v1.42.0 已弃用并迁移旧 `gen_ai.*` 定义 |
| M11 | NIST AI RMF 1.0 当前已发布但正在修订；Tree of Thoughts arXiv v2（2023-12-03）；Plan-and-Solve v3（2023-05-26）；MemGPT v2（2024-02-12）；LongMemEval v2（2025-03-04）；AgentBench v3（2025-10-04） | Temporal Workflows、memory framework docs | 论文/基准修订号只约束对应研究资产；不能据论文分数推断当前模型/Agent 性能；NIST Playbook 是自愿建议，不是强制 checklist |
| M12 | MCP Specification `2026-07-28`；legacy compatibility baseline `2025-11-25`；OAuth 2.1 `draft-ietf-oauth-v2-1-17`（2026-10-30 更新，Active Internet-Draft）；CIMD `draft-ietf-oauth-client-id-metadata-document-03`（2026-11-02，Active Internet-Draft） | MCP Python SDK、Inspector、Tasks/MCP Apps extensions | OAuth 2.1 draft-17 与 CIMD draft-03 都不是 RFC；MCP 2026-07-28 与 legacy initialize/session 模型必须分开；Roots、Sampling、Logging、DCR、legacy HTTP+SSE 标记 deprecated，新实现不得依赖这些旧 surface |
| M13 | Agent Skills Specification；SLSA v1.2 Approved（v1.0 Retired）；NIST SP 800-218 v1.1 Final、SP 800-218A Final、SP 800-218 Rev.1/v1.2 Draft（2025-12-17）；OWASP GenAI LLM Top 10 2026、Agentic Applications Top 10 2026 | OpenAI Agents SDK、LangGraph | Agent Skills `allowed-tools` 是 experimental；`version` 不是标准顶层字段；SLSA provenance 证明来源/构建可追溯性，不证明运行时安全；SSDF v1.2 尚非 Final |
| M14 | A2A v1.0.1（2026-05-26，当前 GitHub latest release）；AgentBench、SWE-bench、τ-bench 等固定论文/benchmark revisions | AutoGen v0.4+、Google ADK、OpenAI Agents SDK tracing | A2A v1.0.1 AgentCard 使用 `supportedInterfaces`；wire `A2A-Version` 按 major.minor（1.0）协商，不把 patch 号当协议 wire version；教学代码不是完整 A2A conformance implementation |
| M15 | NIST AI RMF 1.0（修订中）；Privacy Framework 1.0 / 1.1 IPD；SP 800-53 Release 5.2.0（2025-08-27）；SP 800-162 Update 2 Final；SP 800-61 Rev.3 Final（2025）；OWASP WSTG v4.2 Stable、v5.0 Development；OWASP ASVS 5.0.0 Stable（2025-05-30）；OWASP GenAI LLM/Agentic Top 10 2026；ISO/IEC 42001:2023；EU AI Act consolidated text 2026-07-27 | European Commission AI Act implementation guidance | AI Act 一般适用 2026-08-02；Annex III 高风险规则 2027-12-02；Annex I 产品相关高风险规则 2028-08-02（AI Omnibus 生效后）；招聘/筛选是否落入高风险须按 intended purpose、法定条件和例外作法律判断 |
| M16 | CloudEvents Core v1.0.2 是当前发布版本；CloudEvents `specversion` 值仍为字符串 `"1.0"`；NIST SP 800-53 Release 5.2.0 | Temporal Worker Versioning、AWS Step Functions Retry/Catch、Azure Durable Task、OpenTelemetry Messaging conventions | Temporal/Azure workflow replay 和 retry API 不可互换；OpenTelemetry Messaging spans semantic conventions 当前 Development，既有 instrumentation 在标记 Stable 前不应随意改变默认输出版本；Full Jitter 示例不是 Resilience4j 实现 |
| M17 | NIST AI RMF 1.0 当前发布且修订中；OpenTelemetry GenAI conventions 独立仓库；core semantic-conventions v1.42.0 deprecates/moves old `gen_ai.*` definitions | HELM dashboard、OpenTelemetry SDK/Collector、Prometheus | GenAI conventions 当前 Development，不是 Stable；main core repo 的旧 `gen_ai.*` 定义是迁移/弃用记录，不能当当前规范；动态 benchmark dashboard 必须记录 suite/scenario/model/retrieval date |
| M18 | NIST SP 800-57 Part 1 Rev.5 Final；Rev.6 Initial Public Draft（2025-12-05，意见期 2026-02-05 结束，尚未发现 Final）；CloudEvents v1.0.2；OpenTelemetry GenAI Development | OpenAI Responses API、Anthropic Messages API、LiteLLM、OpenMeter、OPA | Provider usage/cache fields 不可假设同构；OpenAI/Anthropic API 和 LiteLLM/OpenMeter docs 是滚动文档；币种 minor-unit exponent 应来自版本化 ISO 4217 registry；Rev.6 IPD 不得替代 Rev.5 Final |
| M19 | NIST AI RMF 1.0 当前发布且修订中；Microsoft Experimentation Platform 2026 research article；DORA Continuous Delivery capability | OpenAI pricing page、cloud/provider pricing | Pricing 是 live/time-sensitive，不是教材常数；记录 model、region、modality、token class、cache treatment、currency、discount、effective timestamp；示例数字只用于计算教学 |
| M20 | ISO/IEC/IEEE 29148:2018 Edition 2 仍为当前已发布 International Standard，2024 confirmed，2026-02-16 标记 to be revised；DIS 29148 为 draft；MCP `2026-07-28`；SLSA v1.2 Approved；OWASP ASVS 5.0.0 Stable；OWASP GenAI LLM Top 10 2026 | OpenAI API、LlamaIndex docs | ISO DIS 新版未批准前不得称已取代 2018；Provider API/SDK quickstarts 是滚动文档，Capstone 必须在证据 manifest 锁定 endpoint/model/SDK/runtime/config version |

## 3. 已确认的弃用、草案与不稳定状态

| 项目 | 当前状态 | 教材处理 |
|---|---|---|
| MCP Roots / Sampling / Logging / DCR / legacy HTTP+SSE | MCP `2026-07-28` Deprecated Features Registry 明确弃用 | 仅保留迁移/兼容讨论；新实现不以此为依赖 |
| OAuth 2.1 draft-17 / CIMD draft-03 | Active Internet-Drafts，非 RFC | 明确标注 draft 编号、发布日期和核验日期 |
| Agent Skills `allowed-tools` | Experimental | 不把它当作强制、跨 Host 通用的安全授权机制 |
| NIST SSDF v1.2 / SP 800-57 Rev.6 | Initial Public Draft | 同时保留当前 Final 基线（SSDF 1.1/800-218A、SP 800-57 Rev.5） |
| NIST Privacy Framework 1.1 | Initial Public Draft / Coming soon | 以 1.0 为当前已发布版本 |
| NIST AI RMF 1.0 | 当前已发布版本，NIST 正在修订 | 不将未来修订版提前写成 Final |
| OWASP WSTG v5.0 | Development；v4.2 为当前稳定版本 | 课程安全测试基线固定 v4.2 |
| OpenTelemetry GenAI conventions | 专用仓库 Development | 记录 schema URL、instrumentation version 和迁移策略 |
| OpenTelemetry core `gen_ai.*` | core semantic-conventions v1.42.0 已弃用并迁移 | 使用独立 GenAI conventions repository，不把旧 core registry 当当前规范 |
| OpenTelemetry Messaging spans | Development | 不假定稳定默认值；按 instrumentation release 和 `OTEL_SEMCONV_STABILITY_OPT_IN` 迁移 |
| DeepSpeed-Inference v2 | 转为 DeepSpeed-FastGen；旧教程为 legacy API | 教材使用当前官方 inference overview，并标明旧 API 迁移 |
| ISO/IEC/IEEE 29148 DIS | 新版处于 Draft/修订流程 | 2018 Edition 2 仍是当前已发布版；DIS 不得称 Final |
| OWASP GenAI LLM Top 10 2025 | Previous release | 当前课程主张使用 2026；2025 只保留历史版本记录 |

## 4. 滚动 API/SDK 的版本锁定规则

供应商 API、SDK、模型目录、价格页和框架文档经常更新，不能只写“current/latest”作为永久依据。所有实际执行项目/Capstone 证据至少记录：

1. Provider、API endpoint/API version、model ID 或不可变 model snapshot；
2. SDK/package name、精确版本、lockfile 或 commit SHA；
3. region、deployment mode、feature flags、tool/schema version；
4. 文档 URL、访问/核验日期、价格有效时间和计费单位；
5. 实际运行结果、request ID/trace ID（脱敏）和测试环境；
6. 弃用/迁移风险、fallback 和 rollback 计划。

PyTorch、TRL、PEFT、Transformers、vLLM、TensorRT-LLM、LangGraph、Temporal、AutoGen、Google ADK、OpenAI Responses/Agents API、Anthropic Messages API、LiteLLM、OpenMeter、AWS/Azure/GCP 文档均按此规则处理。课程没有将这些滚动文档伪装成一个固定的全局 SDK 版本；未在示例中调用真实供应商服务的地方，也不宣称完成真实 API 集成验收。

## 5. 审计结论

- M01–M20 的固定协议/标准/研究版本已按模块归类；草案、Experimental、Development、Deprecated、Stable/Approved 和 rolling documentation 状态均已显式区分。
- OWASP GenAI LLM Top 10 2026、EU AI Act AI Omnibus 适用日期、OpenTelemetry GenAI 迁移/弃用、NIST SP 800-57 Rev.6 IPD 等本轮发现的版本变化已同步到对应 claim-source review、教师材料、课程数据或来源追溯记录。
- 对滚动 API/SDK，不存在一个适用于所有用户和部署的固定版本；项目执行时必须按第 4 节锁定实际运行版本。
- 本报告不代表法律意见、第三方合规认证或生产环境集成验收；涉及法规适用性、供应商 API 和安全标准时，发布前仍须按具体司法辖区/部署版本复核。
