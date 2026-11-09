# M01–M20 最终编辑审校与发布就绪报告

> 审校基准：2026-11-10；范围：M01–M20 教材、教师指南、实验工作簿、评价体系和课程级文档。本文记录编辑治理决策，不代表第三方认证或生产系统验收。

## 1. 审校结论

课程内容已具备进入冻结候选阶段的结构条件：20 个模块、100 个 lesson、100 个 assessment；20 份教师指南和 20 份实验工作簿均已存在。全部本轮课程编辑完成后重新执行了 `pnpm acceptance:local`，退出码 0；Biome、TypeScript、OpenAPI、Vitest、Course Schema、Vite build、Playwright、M04–M20 Python 示例、Ruff 和后端 pytest 均通过。后端 pytest 为 122 passed、1 skipped（专用 PostgreSQL RLS 环境未配置）。验收报告写入本文后，重新执行 Markdown 相对链接检查和 `git diff --check`。

**结论：教材内容可进入“候选冻结（freeze candidate）”，但不能标记为正式发布或外部认证通过。** 正式冻结前仍需完成本报告第 7 节的最后检查，并处理第 8 节列出的证据限制。

## 2. 课程规模与交付完整性

| 项目 | 当前核验值 | 编辑结论 |
|---|---:|---|
| 模块 | 20（M01–M20） | 完整 |
| Lessons | 100（每模块 5） | 完整 |
| Assessments | 100（每模块 5） | 完整 |
| 模块 Rubric | 每项合计 10 分 | 结构核验通过 |
| 教师指南 | 20 份 | 完整 |
| 实验工作簿 | 20 份 | 完整 |
| 教学资产版本标记 | 40 份教师指南/工作簿均标记 0.40.9 | 统一完成 |
| Python 示例 | 17 组（M04–M20） | 与课程范围一致；M01–M03 使用概念/手算工作簿 |
| 课程来源记录 | 400 条 occurrence / 288 个唯一 source URL（claim/source traceability register）；URL 状态审计表另含 292 个唯一 URL | 有逐项范围说明；不等于第三方逐条认证 |

## 3. 统一术语与编辑规范

本轮将 `docs/GLOSSARY.md` 作为术语裁决入口。新增或修改课程内容时遵守以下约定：

| 概念 | 统一写法 | 避免的混用 |
|---|---|---|
| Model/System Evaluation | 模型/系统评测 | 不与学习者评价混用 |
| Learner Assessment | 学习者评价 / 课程评价 | 不笼统写成模型评测 |
| Rubric | 评分量规 | 避免同一表格中混用“评分细则/评分标准/量规”而不定义 |
| Metric | 指标 | 不把指标、目标值和验收门槛混为一谈 |
| Fine-tuning | 微调（Fine-tuning） | 后续正文统一写“微调” |
| Prompt Injection | 提示词注入（Prompt Injection） | 不混用“提示注入/指令注入”作为同义主术语 |
| Tool Calling | 工具调用（Tool Calling） | 不与工具执行混为一谈；调用请求须经宿主校验和授权 |
| Agent / Multi-Agent | Agent / Multi-Agent（多 Agent） | 不在同一语境交替使用“智能体/代理/Agent” |
| Skill / Skills | Skill / Skills；Skill 包 | 不暗示 Skill 本身授予执行权限 |
| Context Window | 上下文窗口（Context Window） | 不与上下文预算（Token Budget）混用 |
| Observability | 可观测性（Observability） | 不等同于监控（Monitoring） |
| Tenant | 租户（Tenant） | 不与用户、组织或工作区无条件互换 |
| Workflow | 工作流（Workflow） | 不与 Agent Runtime 或普通脚本等同 |

编辑规则：
- 中文叙述使用简体中文；协议、API、模型架构和标准名称保留官方英文拼写及大小写。
- 首次出现的核心术语使用“中文（English）”或“English（中文）”，同一章节后续保持一种写法。
- 数学变量使用斜体，向量/矩阵按章节约定统一；公式必须定义变量、单位、假设和适用范围。
- 区分理论复杂度、估算值、合成数据结果、模拟结果、本机实测和生产观测；不得跨证据等级推断。
- 版本敏感的协议、模型 API、价格和安全分类必须注明版本/核验日期，并优先链接官方规范或官方文档。

## 4. 评价术语与 Rubric 对齐

- **评测（Evaluation）**：评价模型、检索、Agent 或系统输出/行为的质量，报告数据集、指标、基线、样本量、置信区间或局限。
- **评价（Assessment）**：评价学习者是否达到课程目标，依据学习任务和交付证据作出判断。
- **评分量规（Rubric）**：描述评价维度、等级/分值和可观察证据的评分工具。
- **验收门槛（Acceptance Gate）**：必须满足的通过条件；安全和证据诚信硬门槛不能由总分补偿。

每个 assessment 的评分项必须能追溯到实际提交物；不能仅凭“解释清楚”“架构合理”等主观形容词给分。统一 100 分框架用于跨模块能力视角，模块级 10 分 Rubric 保留原始粒度，不做机械重复计分。E0–E5 证据等级只描述证据强度，不代表课程成绩等级。

## 5. 五个 HTTP 403 来源的替代证据与使用边界

HTTP 403 是本地抓取器对原始 URL 的访问结果，不是来源无效的判定。原始状态必须保留；替代材料只能支持其实际覆盖的主张，不得把替代证据写成原页面已成功抓取。

| 来源 | 当前限制与可用证据 | 课程使用规则 / 替代方案 |
|---|---|---|
| ACM CHI 2019, *Guidelines for Human-AI Interaction* | DOI/ACM 页面 403；ACM 索引元数据与 OpenAIRE 独立记录可核对论文身份及摘要级信息 | 仅据摘要陈述“提出 18 项一般性指南并经过实践者/产品评估”；不要声称已逐条核验全文。Microsoft HAX Toolkit 与 Google PAIR Guidebook 可作为可访问的设计实践补充，但不是该论文的等价替代。 |
| MITRE ATLAS OpenClaw Investigation | MITRE HTML 页面 403；MITRE 官方托管 PDF 可读取 | 将官方 PDF 作为内容核验主入口，HTML 页面只作出版信息入口。攻击链主张限定在 PDF 实际记录的提示词注入、凭据访问、恶意 Skill/供应链、工具调用和配置滥用。 |
| OECD 2024 Explanatory Memorandum | OECD HTML 页面 403；官方 DOI、出版页及官方 PDF 可独立核验 | 以官方 DOI/PDF 为首选入口。明确它是解释性备忘录，不是 OECD Recommendation 本身；法规/政策效力应引用正式法律文书。 |
| OWASP LLM01:2025 Prompt Injection（历史版本） | 历史 2025 专题页面 403；状态仅保留为旧版 URL 抓取记录 | 仅支持历史版本的来源审计；不得作为当前课程版本。当前基线改为 OWASP LLM01:2026，已在 §6.3 记录官方 canonical source 与 HTTP 200 核验。 |
| OWASP Top 10 for Agentic Applications 2026 | 专题资源页面 403；官方 OWASP 项目索引可提供框架身份的独立索引证据，MITRE ATLAS/NIST 可补充通用威胁背景 | 可称为 OWASP 发布的 Agentic 应用风险框架；具体条目、排序和控制映射须以专题原文为准。不得用 MITRE/NIST 通用分类冒充 2026 OWASP Top 10 的逐项内容，也不得称其为认证标准。 |

逐条 URL 状态、证据 URL 和核验备注以 `docs/reference-url-audit-2026-11-10.csv` 为准。当前快照：288 个唯一 source URL（claim/source traceability register）；URL 状态审计表另含 292 个唯一 URL，284 HTTP 200、3 HTTP 206、5 HTTP 403；无确认 404、无当前 TLS/传输错误。HTTP 状态和 claim-level 支持度是两个独立维度。

## 6. 交叉引用与内容边界

- `docs/CURRICULUM.md` 是课程导航入口；学习路径、跨模块审计、评价框架、Capstone 对齐和整改报告作为其配套治理文档。
- `docs/GLOSSARY.md` 是术语定义入口；`docs/LEARNER_GUIDE.md` 与 `docs/TEACHING_PLAYBOOK.md` 继续链接该术语表。
- 每个模块的教师指南、实验工作簿、课程目录和来源审查记录应保持模块 ID 一致；工作簿是实践补充，不替代正式 assessment。
- M01–M03 工作簿主要使用手算、概念实验和本地玩具数据；不得暗示它们运行了真实模型或厂商 tokenizer。
- M09 多模态教学侧重系统工程、对齐、评测、预算与隐私，不宣称覆盖多模态基础模型训练全栈。
- M14 要求与单 Agent baseline 比较；没有可测量净收益时，不把 Multi-Agent 当作默认架构。
- M20 Capstone 的 Mock、模拟、本机和目标环境证据必须按 E0–E5 如实标注；课程通过不等于生产上线许可。

### 6.1 版本敏感内容抽样核验（2026-11-10）

本轮对 M12、M13、M16、M17 的版本敏感主张做了官方来源抽样核验，结果与课程内容一致，但不代表 M01–M20 全部版本敏感内容已审完：

| 项目 | 官方状态 | 教材使用边界 |
|---|---|---|
| MCP Specification `2026-07-28` | 官方发布版本；引入 stateless protocol core、每请求自描述、`server/discover`、`Mcp-Method`/`Mcp-Name` headers、MRTR、cache hints 和扩展框架 | M12 应明确区分 modern `2026-07-28` 与 legacy `2025-11-25` 及以前的 initialize/session 生命周期；不能把 SDK 内部 session 对象等同 wire-level protocol session。官方发布说明：[2026-07-28 Specification](https://blog.modelcontextprotocol.io/posts/2026-07-28/) |
| OAuth 2.1 `draft-ietf-oauth-v2-1-17` | IETF Datatracker 标记 Active Internet-Draft；发布日期 2026-10-31、last updated 2026-10-30；尚非 RFC | 教材可以称 draft-17 / Internet-Draft，不得称为已发布 RFC 或最终标准。[IETF Datatracker](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-17) |
| OAuth Client ID Metadata Document `draft-ietf-oauth-client-id-metadata-document-03` | IETF Datatracker 标记 Active Internet-Draft；发布日期 2026-11-02；尚非 RFC | 保留 draft-03 和工作草案状态，避免把 CIMD 描述为已定稿 RFC。[IETF Datatracker](https://datatracker.ietf.org/doc/draft-ietf-oauth-client-id-metadata-document/03/) |
| Agent Skills Specification | 当前规范明确 `SKILL.md` 主文件建议少于 500 行，正文建议少于 5,000 tokens；均为建议，不是硬性格式限制；`allowed-tools` 为 experimental | M13 的长度建议与规范一致；仍须区分开放格式、Host/Runtime 行为和组织自定义 metadata。[Agent Skills Specification](https://agentskills.io/specification) |
| OpenTelemetry GenAI Semantic Conventions | 已迁移至独立 `semantic-conventions-genai` 仓库；官方文档状态为 Development；旧 `opentelemetry.io/docs/specs/semconv/gen-ai/` 页面为迁移提示，不再维护 | M17 的 Development 判断正确；已将 claim-source review 改为新仓库文档，并在 URL register 中保留旧 URL 的 HTTP 200，同时记录它只是 move notice，不是当前规范内容。[官方 GenAI conventions](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/README.md) |
| CloudEvents Core Specification | 官方规格仓库列出的最新发布版本为 v1.0.2；main 分支包含工作草案，不能把 main 上的未发布变更当成 v1.0.2 | M16 已引用固定版本 v1.0.2；事件中的 `specversion` 值仍为 `"1.0"`。[CloudEvents specification v1.0.2](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md) |
| NIST SSDF | SP 800-218 v1.1 和 SP 800-218A 为 Final；SP 800-218 Rev. 1（v1.2）已于 2025-12-17 发布 Draft，仍非 Final | M13 已补充 draft 状态，避免把 v1.2 草案误写为正式版本。[NIST SSDF Publications](https://csrc.nist.gov/projects/ssdf/publications) |
| SLSA | 官方 v1.2 规范页面标记 Status: Approved；v1.2 是当前发布版本 | M13 的 v1.2 Approved 状态正确；Build/Source provenance 只能支持来源与构建可追溯性，不能证明包内容或运行时安全。[SLSA v1.2](https://slsa.dev/spec/v1.2/) |

以上八个版本敏感条目的当前状态已抽样核验，课程中的相关状态说明与官方资料一致。完整版本敏感主张审查仍未关闭，特别是 NIST/OWASP/ISO、云厂商 API 和框架 SDK 的持续变更。

### 6.2 计算题抽样复核与修正

| 模块/练习 | 独立复算结果 | 结论 |
|---|---|---|
| M02 Attention | logits `[1/√2, 0]` 的 Softmax 约为 `[0.6698, 0.3302]`；输出约为 `[1.3395, 1.3209]` | 手算公式与张量维度正确 |
| M03 Embedding | `32,000 × 4,096 = 131,072,000` 参数；BF16 payload `262,144,000` bytes = `0.262144 GB` = `0.244140625 GiB` | 正确，且不含优化器/梯度/运行时内存 |
| M04 Training FLOPs | `6ND`：7B × 1.2T = `5.04×10²²` FLOPs；13B × 2.6T = `2.028×10²³` FLOPs | 正确，保留教学近似边界 |
| M04 LoRA | 单个 4096×4096 矩阵、rank 16：`2×4096×16 = 131,072` 参数，占原矩阵 `0.78125%`；7B 理想 INT4 payload 约 3.5 GB | 正确，不等于完整训练显存 |
| M05 KV Cache | 32 层、8 KV heads、128 head dim、16,384 tokens、BF16：2 GiB/请求；batch 4 为 8 GiB；16,385 tokens、block 16 时容量 16,400 tokens | 正确，不含 allocator/runtime 等开销 |
| M05 M/M/1 | μ=20、λ=15：W=0.2s、Wq=0.15s；λ=19：W=1.0s、Wq=0.95s | 正确，前提为 Poisson 到达和指数服务时间 |
| M08 Chunking | D=10,000、C=500：overlap 50 → 23 chunks、11,100 实际索引 token、1,100 重复 token（11%）、11,500 固定容量槽位、400 padding；overlap 100 → 25 chunks、12,400 实际索引 token、2,400 重复 token（24%）、12,500 槽位、100 padding | **已修正**：此前将 `chunk_count × chunk_size` 作为近似索引 token slots，未区分实际 token、重叠重复与末块填充；现已拆分计算并加入测试 |
| M09 ViT/Audio | 384² 输入：patch 16 → 576 patches、序列 641、pairs 410,881；patch 8 → 2,304 patches、序列 2,369、pairs 5,612,161；合并序列 pair 比约 13.66×，纯 patch-only 为 16×；16 kHz/16-bit/mono/60s PCM = 1,920,000 bytes | 正确；已在工作簿和测试中明确 CLS/text token 的固定开销；PCM 为 1.92 MB（十进制），不含容器/编码开销 |
| M17 Evaluation | 80/100 Wilson 95% 区间约 `[0.7112, 0.8666]`；IID pass@3（p=.8）=.992，pass^3=.512；HumanEval pass@5（n=10,c=3）约 .9167 | 正确，教材已区分 IID 理论式与有限样本无偏估计器 |
| M19 Unit Economics | 模型成本 0.04；含工具/存储/人工/重试单次成本 0.28；85/100 成功时成本/成功任务约 0.3294；贡献毛利 44%；固定成本 10,000、单价 .5 时盈亏平衡 45,455 个任务 | 正确，使用 Decimal 和单一币种假设 |

这是一轮高风险公式与示例抽样，不等于所有模块全部手算题均已逐条复核。M08 的代码、单元测试、工作簿口径和 README 已同步修订。

### 6.3 版本审计追加核验（2026-11-10）

本轮继续全量扫描 M01–M20 的 claim/source review、课程目录和教师材料，发现 OWASP GenAI LLM Top 10 在 2026-08-04 发布 2026 版后，部分课程仍将 2025 版滚动入口描述为“当前版本”。这属于版本过期，不是风险分类本身完全失效。已将当前教学主张统一迁移至 2026 版，并保留 2025 版作为历史版本记录。

| 项目 | 2026-11-10 核验结果 | 已采取的处理 |
|---|---|---|
| OWASP GenAI LLM Top 10 | 官方仓库明确 2026-08-04 发布版为 Current release，2025 为 Previous release；2026 条目包括 LLM01:2026 Prompt Injection、Sensitive Information Disclosure、Excessive Agency、Supply Chain、Data and Model Poisoning、Unbounded Consumption、Misinformation、Hidden Context Exposure、Vector and Embedding Weaknesses、Improper Output Handling | M01、M06、M08、M10、M12、M13、M15、M20 的当前来源记录与课程数据改为 2026 版；结构化 source traceability CSV 同步更新；2025 旧 URL 及历史审计叙述保留，不覆盖历史抓取结果 |
| OWASP LLM01 Prompt Injection | 官方 2026 canonical source 为 `2026/final/LLM01_PromptInjection.md`，名称为 LLM01:2026 | M06/M15 的具体条目链接改为 2026 canonical file；本机 HEAD 检查 HTTP 200 |
| OpenTelemetry GenAI Semantic Conventions | core semantic-conventions v1.42.0 已将原 `gen_ai.*` attributes/metrics/events/spans 标记 deprecated 并迁移；旧 `opentelemetry.io/docs/specs/semconv/gen-ai/` 是迁移提示；当前 GenAI 内容在独立 `semantic-conventions-genai` 仓库，状态 Development | M10/M18 改为当前仓库文档并补充 v1.42.0 弃用边界；M17 记录 core v1.42.0 release note 和专用仓库 Development 状态；source traceability CSV 同步；旧 URL 的 HTTP 200 仅表示 move notice 可访问 |
| OpenAPI Specification | v3.2.1，2026-09-10 发布 | 原 M07 版本和发布日期记录核验正确 |
| A2A Protocol | GitHub 官方 release v1.0.1，2026-05-26 发布 | 原 M14 v1.0.1 版本固定核验正确；协议请求协商使用 major.minor，不应把 patch 号写入 wire version |
| NIST AI RMF | AI RMF 1.0 仍在修订；NIST AI RMF Playbook 是自愿建议，不是完整检查表 | 原 M01/M11/M20 状态核验正确 |
| NIST Privacy Framework | 1.0 为当前已发布版本；1.1 仍标记为 Initial Public Draft / Coming soon | 原 M09 状态核验正确 |
| EU AI Act / AI Omnibus | 2026-07-27 consolidated text is current; general applicability 2026-08-02; Annex III high-risk rules 2027-12-02; Annex I product-related high-risk rules 2028-08-02 | M15 已新增欧委会正式实施时间表来源；教师指南、工作簿、课程数据和 claim traceability 同步具体日期；具体用途分类仍需法务审查 |

官方核验入口：[European Commission AI Act timeline](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai)、[AI Omnibus entry into force](https://digital-strategy.ec.europa.eu/en/news/ai-omnibus-enters-force)、[OWASP 2026 repository](https://github.com/GenAI-Security-Project/GenAI-LLM-Top10)、[OWASP 2026 publication](https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/)、[OWASP LLM01:2026](https://github.com/GenAI-Security-Project/GenAI-LLM-Top10/blob/main/2026/final/LLM01_PromptInjection.md)、[OpenTelemetry GenAI conventions](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/README.md)、[OpenAPI 3.2.1](https://spec.openapis.org/oas/v3.2.1.html)、[A2A v1.0.1 release](https://github.com/a2aproject/A2A/releases/tag/v1.0.1)、[NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework)、[NIST Privacy Framework 1.1](https://www.nist.gov/privacy-framework/new-projects/privacy-framework-version-11)。

本轮版本修订仅关闭上述具体来源的版本问题；不能据此勾选“全量协议/标准/模型 API 已全部审完”。其余模块的云厂商 API、模型 API、框架 SDK 和标准仍需逐项完成版本/弃用状态核验。

### 6.4 M01–M20 计算题逐模块复核

已新增[计算题审计报告](CURRICULUM_CALCULATION_AUDIT.md)，对 M01–M20 工作簿的显式计算任务、数值示例和 M04–M20 Python 示例公式/测试断言进行逐模块复核。M01/M12 无独立数值算题，M20 的 75/100 是非补偿式课程门槛。M08 已修复 chunking 统计口径；M09 新增 patch=8 的完整序列与 attention-pair 断言，并澄清纯 patch-only 与含 CLS/text token 的增长比。其余列出的定量结果独立复算一致。88 项 Python 示例测试全部通过。复核范围与假设见计算题审计报告；不将合成数据/公式测试解释为真实服务性能证据。

### 6.5 协议、标准、API 与弃用状态全量分类

已新增[版本与弃用审计报告](CURRICULUM_VERSION_AND_DEPRECATION_AUDIT.md)，按 M01–M20 逐模块记录固定协议/标准/研究版本、发布日期、Stable/Approved/Final/Draft/Experimental/Development/Deprecated 状态，以及滚动 API/SDK 的版本锁定规则。专项修订包括 MCP 2026-07-28 与 legacy 2025-11-25 分界、OAuth 2.1 draft-17/CIMD draft-03 的 Active Internet-Draft 状态、SSDF v1.2 与 SP 800-57 Rev.6 的 IPD 状态、WSTG v4.2/v5.0、OWASP LLM 2026、EU AI Act AI Omnibus 日期、OpenTelemetry core v1.42.0 的 `gen_ai.*` 弃用迁移及 GenAI/Messaging conventions 的 Development 状态。供应商 API/SDK/价格页按 rolling documentation 管理，实际项目必须锁定 model/endpoint/SDK/package/region/日期；不虚构全局固定版本。

### 6.6 全模块证据等级一致性审计

已新增[全课程统一证据等级与 M01–M20 证据边界](CURRICULUM_EVIDENCE_LEVELS.md)，定义 E0–E5，并逐模块标注当前课程资产等级、模拟/Mock 范围和不得推断事项。20 份实验工作簿与 20 份教师指南均已加入统一证据标记/评分说明。当前教学资产主要覆盖 E1–E3；没有证据将整套课程标为 E4/E5。真实 Provider、目标环境和生产观测必须单独提供证据；PostgreSQL RLS 专项仍是 skipped。

### 6.7 工作区差异与发布边界

已完成[工作区最终差异盘点](CURRICULUM_WORKTREE_INVENTORY_2026-11-10.md)：当前 `main` / HEAD `7dcfe7a4e9259e71b00e337ead867d0ab77d18c2`，`git status --short` 目录折叠 205 项，完整展开 351 项；150 个 tracked 文件有未暂存差异，201 个 untracked 文件，0 staged、0 deleted、0 renamed。差异横跨 backend OIDC/tenant/RLS、frontend、curriculum、docs、examples、lockfiles 和工程配置，不是单一课程审计变更集。清单记录全部路径；无法仅凭 Git 状态归因每个文件的历史来源，因此不执行 stage/commit/push/reset/clean/delete。课程内容可维持 Freeze Candidate，但工作区尚不适合形成单一发布提交。

## 7. 候选冻结清单

正式冻结前逐项确认：

- [x] 所有 20 个模块的标题、ID、先修依赖与学习路径图一致：已将课程目录、学习路径表和 Mermaid 依赖图逐模块比较；53 条直接依赖边全部一致。
- [x] 100 个 assessment 的评分项与对应 Rubric 一一对应：已从 M01–M20 源数据解析 100 个唯一 Assessment ID，每项 Rubric 合计 10 分；20 份教师指南均含 5 个正式作业参考解答章节。
- [x] 教师指南和实验工作簿的相对链接、模块链接和来源链接无损坏：最终检查覆盖 93 份 Markdown、156 个相对链接，0 个损坏。
- [x] M01–M20 固定协议/标准/研究版本、发布日期、弃用/草案/Experimental/Development/Stable/Approved 状态已逐模块分类；滚动 API/SDK 已明确标注并规定项目级版本锁定要求，见[版本与弃用审计报告](CURRICULUM_VERSION_AND_DEPRECATION_AUDIT.md)。
- [x] M01–M20 工作簿显式计算题、数值示例与 M04–M20 Python 计算示例已按 `docs/CURRICULUM_CALCULATION_AUDIT.md` 逐模块复核；M08 口径修复、M09 attention-pair 边界测试已加入；88 项 Python 示例测试通过。统计假设、单位、分母和模拟边界有记录。
- [x] M01–M20 的 Mock、模拟、静态审阅、本地测试、目标环境测试和生产观测均按统一 E0–E5 标准区分；20 份工作簿与 20 份教师指南已加入模块级证据边界。当前资产只支持 E1–E3，未把任何模块误标为 E4/E5。
- [x] 五个 HTTP 403 来源保留原始状态，并按第 5 节限定主张范围；未将替代证据冒充原始页面全文。
- [x] M20 安全硬门槛、证据诚信门槛和 Capstone 评分门槛没有被平均分覆盖；已核对 E0–E5、Gate 2 E3、本地证据要求及 75/100 教学门槛。
- [x] 最终本机验收在本轮 40 份教学资产版本标记统一、依赖图修订、M08 Chunking 计算修正、M13 SSDF 状态补充及 M17 官方来源迁移修正后重新执行：`pnpm acceptance:local` 退出码 0；Biome、TypeScript、OpenAPI、73 Vitest、19 Course Schema、Vite build、41 Playwright、88 Python 示例（含 M08 新增断言）、Ruff 及后端 122 passed / 1 skipped。
- [x] 已完成完整工作区路径清单和状态盘点（150 tracked、201 untracked、0 staged/deleted/renamed）；由于包含多个工程范围，保留全部差异，不提交、不推送、不 reset、不 clean、不删除。

## 8. 未关闭的发布风险

1. 五个历史 HTTP 403 来源的原始页面无法由本地抓取器直接读取；独立证据支持范围有限，尤其 ACM 论文的逐条指南映射和 OWASP 历史 2025 专题页面的细节不能据摘要/索引推断。OWASP 2026 LLM Top 10 及 LLM01:2026 已另行核验并记录为 HTTP 200 的当前来源。
2. 400 条来源 occurrence 均有 scoped notes，不等于 400 条来源主张都经过第三方独立复核；来源审查记录是可追溯工作底稿。
3. 课程质量分数是内部审计判断，不是同行评审、认证或外部教学效果研究。
4. PostgreSQL RLS 专项集成测试因缺少专用环境变量而跳过；不得宣称该专项已在本轮真实数据库环境验证。
5. 最新完整 `pnpm acceptance:local` 已在 M08 Chunking 口径修复、M09 patch=8 attention-pair 边界测试、OWASP 2026、EU AI Act 时间表、OpenTelemetry v1.42.0 弃用迁移和课程数据修订后执行并通过（41 Playwright、88 Python、122 backend passed / 1 skipped）。随后仅新增/修订审计 Markdown 与证据等级说明；最终 Markdown 检查为 93 files / 156 relative links / 0 broken，`git diff --check` 通过。
6. 本机工作区含既有混合变更；本阶段没有提交或推送，因此本报告和相关修改只代表本地工作区状态，不代表 GitHub 远端已发布版本。

## 9. 冻结决策记录

当前决策为 **Freeze Candidate / Not Yet Released**。满足第 7 节清单、重新执行最终本机验收、核对差异清单并由项目负责人确认后，方可将状态升级为课程冻结版本。不得将候选冻结、课程完成、测试通过、来源可访问和生产就绪视为同一结论。


## 10. Post-commit baseline revalidation (2026-11-10)

本节是对 §6.7、§7 和 §8 中历史工作区快照的后续补充；不改写当时的审计记录。

- 当前分支：`develop`；本地 HEAD：`80bf7ab5f06bd9ff5802e43e814ed507479ee352`（`chore: finalize curriculum and engineering baseline`）。
- 远程核对基线：`origin/develop` 与本地 HEAD 一致；`main` 保留为稳定基线，未删除或改写。
- 本次复核开始时工作区干净：`git status --short --branch` 仅显示 `## develop...origin/develop`。
- 在上述提交基线上重新执行 `pnpm acceptance:local`，退出码 0：Biome lint 57 files、Biome format 56 files、TypeScript、OpenAPI 3.1.0（12 paths）、Vitest 73 passed、Course Schema 19 passed、Vite production build、Playwright 41 passed、M04–M20 Python examples 88 passed、Ruff 63 files、Backend pytest 122 passed / 1 skipped。
- 唯一跳过项仍为需专用 PostgreSQL RLS 环境配置的可选集成测试；不得将其描述为已通过。
- 本次验收未调用 GitHub Actions。验收脚本生成的构建产物和临时测试输出须按仓库忽略规则处理；本节不宣称已进行生产部署或外部同行评审。

**更新后的状态：** M01–M20 教材候选冻结清单已完成，且最新 `develop` 提交基线的本机验收再次通过。课程内容可提交项目负责人作冻结决策；本报告仍不把候选冻结自动等同于正式发布、生产就绪或外部认证。
