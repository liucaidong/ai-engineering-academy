import type { Course } from "../types/course";

/** M20 — end-to-end AI Engineering Capstone. */
export const flagshipM20Lessons: Course["modules"][number]["lessons"] = [
{id:"m20-01-capstone-problem-charter",title:"第一讲：Capstone 立项——需求、范围与验收",summary:"从真实问题建立可交付的 AI 系统项目章程。",learningObjectives:["定义用户、问题、任务和非目标","将需求转成可测试验收条件","建立风险、数据和资源约束"],estimatedMinutes:90,content:[
{heading:"问题陈述与用户画像",body:"Capstone 必须从真实用户任务出发，而不是从想展示的模型技术出发。",markdown:"项目章程描述用户、工作情境、当前替代流程、痛点、失败成本和价值假设。区分直接用户、数据主体、审批者和系统运营者。"},
{heading:"需求与非目标",body:"需求应可验收，非目标用于防止项目范围无限膨胀。",markdown:"功能需求描述输入、输出和业务行为；非功能需求覆盖延迟、吞吐、可用性、安全和成本。列出不支持场景、人工接管条件和明确不做的功能。"},
{heading:"验收指标",body:"每个目标应有测量方法、数据来源和通过阈值。",markdown:"示例指标：任务成功率、证据支持率、工具执行正确率、越权率、P95 延迟、单位任务成本和人工接管率。定义样本集、分母、测量窗口和统计不确定性。"},
{heading:"风险和可行性",body:"项目范围必须与数据许可、凭证、模型可用性和执行环境相匹配。",markdown:"建立风险登记表：风险、影响、可能性、缓解、owner 和残余风险。将需要外部凭证、真实模型或生产环境的验证单独标记；没有凭据时使用明确的模拟/纸面验证，不得虚构真实集成。"},
{heading:"复现练习：编写 Capstone 项目章程与验收追踪矩阵",body:"把需求、风险和外部依赖转换为可逐项验收的项目基线。",markdown:"建立需求 ID、用户价值、验收指标、测试方法、证据位置、owner 和状态的追踪矩阵。每个目标写明分母、测量窗口和阈值；非目标、禁用场景和人工兜底也要编号。外部模型凭证、真实数据和生产环境依赖单独列出，缺失时标记 blocked/not tested。\n\n提交章程、风险登记、数据许可清单和需求—测试—证据追踪表。"}
,
{heading:"Definition of Ready/Done、需求追踪与治理节奏",body:"Capstone 需求基线需要具备可验证的 Ready/Done 条件，并把需求、风险、测试和证据串成可审计追踪链。",markdown:"为每项需求定义唯一 ID、来源、用户价值、优先级、验收条件、数据/权限约束、owner 和验证方式。Definition of Ready 要求问题、样本、依赖和成功判据清楚；Definition of Done 要求实现、测试、文档、安全检查和证据链接齐备。\n\n建立需求→设计/ADR→实现 commit→测试用例→运行结果→风险处置的 traceability matrix。使用阶段 Gate（立项、架构、垂直切片、验收、答辩）控制范围变更；每次变更评估成本、风险和对既有验收的影响。"}],assessments:[{id:"m20-01-project-charter",type:"design-review",prompt:"提交 Capstone 项目章程：用户问题、范围/非目标、验收指标、风险登记和外部依赖清单。",rubric:[{criterion:"问题与范围",description:"用户任务、痛点和非目标清楚",points:3},{criterion:"验收标准",description:"指标、分母、阈值和证据来源明确",points:4},{criterion:"风险可行性",description:"记录数据、凭证、模型和环境依赖",points:3}]}],sources:[
{title:"NIST AI Risk Management Framework",url:"https://www.nist.gov/itl/ai-risk-management-framework",publisher:"NIST",note:"项目风险章程"},
{title:"Google PAIR Guidebook",url:"https://pair.withgoogle.com/guidebook-v2/chapters",publisher:"Google",note:"PAIR Guidebook v2：User Needs、Data/Evaluation、Mental Models、Trust、Feedback/Control、Errors/Graceful Failure"},
{title:"Google SRE Workbook",url:"https://sre.google/workbook/table-of-contents/",publisher:"Google",note:"可测量可靠性目标"},
{title:"ISO/IEC/IEEE 29148:2018 Requirements Engineering",url:"https://www.iso.org/standard/72089.html",publisher:"ISO",note:"ISO/IEC/IEEE 29148:2018 Edition 2 经 2024-05 复审确认仍为现行版本；2026-02-16 标记为待修订，DIS Edition 3 已进入 enquiry 阶段，暂无固定发布日期"}
]},
{id:"m20-02-capstone-architecture",title:"第二讲：系统架构、数据流与技术决策",summary:"交付架构图、ADR、数据模型和信任边界。",learningObjectives:["设计端到端组件和数据流","记录模型、RAG、Agent 和工具选型","建立 ADR 与安全信任边界"],estimatedMinutes:90,content:[
{heading:"端到端架构",body:"架构应展示用户入口、应用服务、模型、检索、工具、数据、身份和观测。",markdown:"提交 context/container/component 视图和关键时序图。标出同步/异步路径、状态持久化、缓存、错误边界和外部依赖。"},
{heading:"模型与检索选型",body:"技术选型要依据任务评测、数据约束、延迟、成本和可维护性。",markdown:"比较托管模型与本地模型、RAG 与微调、单 Agent 与 workflow、向量与混合检索。记录选择理由、替代方案和重新评估触发条件。"},
{heading:"工具和权限设计",body:"每个工具声明输入输出、权限、副作用、超时和幂等语义。",markdown:"绘制工具信任边界，定义身份传递、对象级授权、参数校验、审批和审计。Prompt 不承担授权功能。"},
{heading:"ADR 与架构取舍",body:"架构决策记录问题背景、选项、决定、后果和复审条件。",markdown:"每项 ADR 包含状态、上下文、候选方案、决策、正负后果和验证计划。对未验证的性能或安全假设明确标注，不把设计意图写成已实现事实。"},
{heading:"复现练习：完成 Capstone 架构决策与信任边界评审",body:"通过替代方案比较和 ADR 证明架构选择有依据。",markdown:"对托管/本地模型、RAG/微调、Agent/workflow、向量/混合检索分别列出约束、成本、质量、隐私和运维影响。绘制组件图、数据流和工具时序；标出身份、租户、检索 ACL、模型、工具执行和外部服务的信任边界。\n\n每份 ADR 记录背景、候选项、决定、后果、验证计划和复审触发条件。提交至少三份 ADR 和一个明确未验证的假设清单。"}
,
{heading:"Architecture Fitness Functions、契约和数据治理",body:"架构包不只是静态图，还应包含可以持续检查的架构约束、接口契约和数据治理规则。",markdown:"将关键架构决策转成 fitness functions：模块依赖方向、租户边界、同步调用预算、数据分类、加密要求、接口兼容性和故障隔离。对 API/schema 建立 contract tests；对数据集记录来源、许可、敏感级别、保留期限、删除机制和版本。\n\nADR 应有状态（proposed/accepted/deprecated/superseded）、owner、决策日期和复审触发条件。架构图需要与实现证据对照，避免图中组件不存在或数据流没有实际调用路径。"}],assessments:[{id:"m20-02-architecture-pack",type:"design-review",prompt:"提交 Capstone 架构包：组件图、数据流、关键时序、模型/RAG/Agent 选型表、权限边界和至少三份 ADR。",rubric:[{criterion:"架构表达",description:"组件、数据流和故障边界完整",points:3},{criterion:"技术决策",description:"比较替代方案并说明约束",points:3},{criterion:"安全 ADR",description:"记录身份、工具权限和验证证据",points:4}]}],sources:[
{title:"C4 Model",url:"https://c4model.com/",publisher:"Simon Brown",note:"架构图表达"},
{title:"Architecture Decision Records",url:"https://adr.github.io/madr/decisions/adr-template.html",publisher:"ADR GitHub",note:"MADR 模板明确 Context、Decision Drivers、Considered Options、Decision Outcome、Consequences 和可选 Confirmation"},
{title:"OWASP GenAI LLM Top 10 (2026)",url:"https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/",publisher:"OWASP GenAI Security Project",note:"AI 系统威胁建模"},
{title:"arc42 Architecture Documentation",url:"https://arc42.org/overview",publisher:"arc42",note:"架构文档结构、视图和决策记录"}
]},
{id:"m20-03-capstone-implementation",title:"第三讲：模型、RAG、Agent 与工具集成",summary:"实现可运行核心流程并保留接口、数据和权限边界。",learningObjectives:["实现端到端最小业务路径","集成模型、检索和工具调用","建立错误处理、幂等和审计"],estimatedMinutes:120,content:[
{heading:"垂直切片优先",body:"先交付一条可验证的端到端路径，再扩展边界场景。",markdown:"选择最小用户旅程，完成输入、模型/检索、工具、业务结果和审计。每个组件先定义契约，避免在多个模块同时堆积未集成代码。"},
{heading:"模型与 RAG 集成",body:"模型调用应记录版本和 usage；检索结果保留来源、权限和版本。",markdown:"RAG 流程应执行 ACL filter、retrieval、rerank、context budget 和 citation validation。模型无证据时应返回 unknown/clarify，而不是编造。"},
{heading:"Agent 与工具集成",body:"Agent 决策与工具执行分离，副作用工具需要确定性授权。",markdown:"使用受限工具 allowlist、JSON Schema、超时、幂等键和审批。每次工具执行保留 request ID、参数摘要、状态和结果引用。"},
{heading:"工程质量与边界",body:"实现应有类型、测试、日志和配置管理，不把 mock 当真实服务。",markdown:"为外部服务提供 adapter 和 mock；报告标记哪些路径使用模拟数据、哪些调用真实服务。凭据、配额或模型访问缺失时，记录未验证项。"},
{heading:"复现练习：定义 Capstone 垂直切片的端到端验收",body:"从一个用户旅程验证模型、检索、工具和业务结果的真实连接。",markdown:"选取最小用户旅程，记录输入、身份、检索证据、模型版本、工具参数、业务状态变化和审计事件。每个边界定义契约和错误语义；Mock 与真实 provider 调用分别标记。工具写入必须经过服务端授权、幂等和必要审批。\n\n提交一条正常轨迹、一条失败轨迹、一条安全拒绝轨迹和对应测试证据。没有实际运行的部分不得标记 implemented/tested。"}
,
{heading:"Vertical Slice、测试金字塔与可复现构建",body:"实现阶段应先交付可运行的垂直切片，再通过分层测试和可复现构建降低集成风险。",markdown:"以用户旅程为单位贯穿 UI/API/domain/data/model/retrieval/tool/audit；每个切片包含成功、失败和权限拒绝路径。测试金字塔以大量快速单元/组件测试为底座，辅以契约/集成测试和少量真实端到端测试；避免 E2E 成为唯一反馈来源。\n\n锁定依赖、配置 schema、模型/Prompt/索引版本和测试数据快照；区分 deterministic mock 与真实 provider。构建产物记录 commit、依赖锁、SBOM/来源证明和环境摘要。缺少真实凭证或环境时明确标记 blocked/not tested，不能以 mock 结果证明外部系统可用。"}],assessments:[{id:"m20-03-implementation-review",type:"code-task",prompt:"在本地隔离仓库中实现一条最小核心垂直切片，并提交代码审查包：代码/commit、README 与复现命令、模型请求与 RAG 引用、工具 schema、服务端授权、幂等处理、正常/失败/安全拒绝测试及日志。默认可用确定性 mock，无需付费 API；若接入真实服务，单独标明 provider、模型/索引版本、凭证前提和实际执行证据。明确依赖版本、执行环境、未运行项及 mock/真实服务边界，不得把 mock 结果标记为真实集成。",rubric:[{criterion:"核心流程",description:"端到端最小路径可追踪",points:3},{criterion:"集成契约",description:"模型/检索/工具 schema 和错误语义明确",points:3},{criterion:"安全质量",description:"授权、幂等、审计和模拟边界清楚",points:4}]}],sources:[
{title:"OpenAI API Documentation",url:"https://developers.openai.com/api/docs",publisher:"OpenAI",note:"OpenAI API 当前开发文档；Responses API quickstart 与 SDK/API reference，实际字段和版本应以对应 endpoint 文档为准"},
{title:"LlamaIndex Documentation",url:"https://developers.llamaindex.ai/python/framework/",publisher:"LlamaIndex",note:"LlamaIndex Framework 文档：数据 ingestion、indexing、retrieval/query、RAG pipelines、agents 和 evaluation"},
{title:"Model Context Protocol Specification",url:"https://modelcontextprotocol.io/specification/2026-07-28",publisher:"Model Context Protocol",note:"MCP Specification 2026-07-28：Host/Client/Server、Tools/Resources/Prompts、stateless requests 与安全边界；版本化规范，不应引用未固定的 latest"},
{title:"The Practical Test Pyramid",url:"https://martinfowler.com/articles/practical-test-pyramid.html",publisher:"Martin Fowler",note:"Practical Test Pyramid：区分 unit、narrow integration、contract 和 E2E；测试比例应按风险/反馈成本裁剪，不是机械固定配比"}
]},
{id:"m20-04-capstone-evaluation-security",title:"第四讲：综合评测、安全、监控与部署",summary:"用证据验证系统质量、风险控制和运行准备度。",learningObjectives:["构建端到端评测集和回归","完成威胁模型与权限测试","设计观测、SLO、成本和部署方案"],estimatedMinutes:100,content:[
{heading:"端到端评测",body:"评测覆盖成功路径、边界、对抗输入和故障路径。",markdown:"构造固定 benchmark，包含输入、gold evidence、预期工具行为、验收标准和风险标签。分开统计检索、生成、工具和端到端成功率。"},
{heading:"安全与隐私验证",body:"威胁模型必须对应可执行测试和控制证据。",markdown:"覆盖 Prompt Injection、越权、敏感数据泄露、工具重放、租户隔离、依赖风险和资源耗尽。记录攻击载荷、预期阻断点和真实执行日志。"},
{heading:"观测与 SLO",body:"监控 Trace、质量、延迟、成本和错误恢复。",markdown:"提交 trace 样例、指标定义、告警阈值、日志脱敏和数据保留策略。SLO 同时包含服务可用性和任务质量；安全硬约束独立于错误预算。"},
{heading:"部署与运行准备",body:"部署说明必须覆盖配置、密钥、数据迁移、健康检查、回滚和事故响应。",markdown:"区分本地演示、测试环境和生产部署。提供容量假设、资源需求、依赖清单和未验证项。没有真实环境执行的部署步骤应标记为设计/说明，而不是部署成功。"},
{heading:"复现练习：执行 Capstone 安全与质量验收演练",body:"用固定 benchmark 和威胁用例验证关键控制是否生效。",markdown:"评测集覆盖正常、边界、分布外、无证据、越权、注入、工具超时和重复请求。分层报告 retrieval recall、citation support、task success、schema pass、unauthorized action、P95 latency 和 cost/task。红队用例记录载荷、预期阻断层、实际日志和影响。\n\n提交评测结果、威胁模型、trace/metrics、SLO、容量假设和部署回滚方案。将设计、静态审阅、模拟执行、真实测试和未验证分开标记。"}
,
{heading:"Evidence Matrix、风险覆盖与发布门禁",body:"综合验收需要将每个风险映射到测试方法、证据等级、通过阈值和残余风险接受人。",markdown:"建立 Requirement/Risk → Control → Test → Evidence → Decision 矩阵。按正常、边界、对抗、故障、恢复和人工接管分层；安全测试包括 prompt injection、越权、跨租户、敏感数据、工具重放和供应链；质量测试包括 retrieval/citation/task success；运行测试包括 P95/P99、并发、故障注入、成本和恢复。\n\n定义 Gate：硬性安全约束不以平均质量抵消；阻断项必须修复或由授权责任人书面接受风险。报告标明样本量、环境、版本、时间、测试工具和原始证据位置。"}],assessments:[{id:"m20-04-acceptance-pack",type:"design-review",prompt:"提交 Capstone 验收包：端到端 benchmark、威胁模型、安全测试证据、trace/metrics、SLO、成本和部署/回滚计划。逐项标记 E0–E5 证据等级，并记录数据/fixture 版本、执行环境、测试命令、预期/实际结果、失败和限制。无外部凭证时可用 deterministic mock 与本地测试验证工作流/控制逻辑，但必须区分 E2 Mock 与 E3 Local-tested；不得据此声称真实模型质量、provider 集成或目标环境通过，未运行项标记 not tested。",rubric:[{criterion:"评测",description:"包含分层 benchmark 和回归结果",points:3},{criterion:"安全",description:"威胁、测试、权限和隐私控制可追溯",points:3},{criterion:"运行准备",description:"观测、SLO、成本和回滚方案完整",points:4}]}],sources:[
{title:"NIST AI RMF Playbook",url:"https://airc.nist.gov/airmf-resources/playbook/",publisher:"NIST",note:"NIST AI RMF Playbook 为 Govern/Map/Measure/Manage 提供自愿建议；不是 checklist，AI RMF 1.0 正在修订"},
{title:"OpenTelemetry Documentation",url:"https://opentelemetry.io/docs/concepts/",publisher:"OpenTelemetry",note:"OpenTelemetry Concepts：context propagation、traces、metrics、logs、instrumentation 和 sampling"},
{title:"Google SRE Workbook",url:"https://sre.google/workbook/table-of-contents/",publisher:"Google",note:"SLO 和上线验收"},
{title:"OWASP Application Security Verification Standard",url:"https://asvs.owasp.org/",publisher:"OWASP",note:"OWASP ASVS 5.0.0（2025-05-30 发布，当前 stable）：可验证的 Web 应用/服务安全要求；不是 AI 专用风险清单"}
]},
{id:"m20-05-capstone-demo-defense",title:"第五讲：项目交付、演示与技术答辩",summary:"用可复现演示和证据说明系统能力、取舍与限制。",learningObjectives:["组织可复现演示和交付文档","解释关键架构决策和失败案例","区分已实现、已测试和未验证能力"],estimatedMinutes:90,content:[
{heading:"交付物清单",body:"完整交付包含代码、架构、数据/模型配置、评测、威胁模型和运维文档。",markdown:"交付包包含 README、架构图、ADR、API/schema、数据说明、模型版本、Prompt、测试、benchmark、trace 样例、成本估算、部署说明和已知限制。"},
{heading:"演示脚本与证据",body:"演示应覆盖正常流程、边界处理、故障和安全拒绝。",markdown:"固定演示输入、环境和版本；展示工具执行日志与来源引用。演示成功不能替代自动化测试或生产运行证明。"},
{heading:"技术答辩",body:"答辩重点是问题、证据、取舍和残余风险，而非展示模型生成得多流畅。",markdown:"解释为何选择当前模型/架构、为何不选替代方案、哪些指标支持决策、失败案例如何处理，以及成本和风险如何控制。"},
{heading:"成熟度与后续路线图",body:"明确哪些能力已实现、已静态审阅、已测试或仍未验证。",markdown:"交付报告使用状态标签：implemented、reviewed、tested、not tested、blocked。后续路线图按风险和用户价值排序，不把未实现能力写成已完成。"},
{heading:"复现练习：组织最终演示与技术答辩",body:"用可复现证据说明能力、限制、成本和残余风险。",markdown:"演示前冻结 commit、模型/Prompt/工具/索引版本和输入样例。按正常完成、部分失败、人工接管/安全拒绝顺序演示；每个结果引用真实日志、trace 或业务状态。答辩回答为何选择当前架构、替代方案为何未选、哪些指标支持决策、已知失败是什么、下一步如何降低风险。\n\n提交交付目录、演示脚本、证据索引、已实现/已测试/未验证清单和后续路线图。演示成功不等于生产部署验收。"}
,
{heading:"Reproducible Defense、证据来源与评审问责",body:"最终答辩要证明交付物可复现、结论可追溯、局限被诚实披露，并明确谁对后续风险负责。",markdown:"冻结 release commit、依赖锁、模型/Prompt/工具/索引/策略版本、数据集和演示输入；生成 evidence index，映射到真实日志、trace、测试报告、截图或业务状态。演示中区分 scripted fixture、mock、sandbox 和真实环境证据。\n\n答辩结构：用户问题与价值→架构和 ADR→核心垂直切片→质量/安全证据→成本/SLO→失败案例→未验证项→路线图。每个残余风险有 owner、影响、缓解计划和期限。Capstone 完成不等于生产认证；上线仍需独立运维、隐私、安全和业务批准。"}],assessments:[{id:"m20-05-capstone-defense",type:"design-review",prompt:"完成 Capstone 答辩包，冻结 commit、依赖锁、模型/Prompt/工具/索引版本和演示输入；演示正常/失败/安全拒绝三条路径，并为每条路径引用 evidence ID、标记 E0–E5 等级，说明执行模式、实现状态、测试证据、架构取舍和残余风险。可用 deterministic mock 演示本地逻辑，但不得将其表述为真实 provider、目标环境或生产验证；未验证项明确标记 not tested。",rubric:[{criterion:"交付完整性",description:"代码、架构、评测和运维文档齐全",points:3},{criterion:"演示证据",description:"三类流程可复现且引用真实日志",points:3},{criterion:"技术答辩",description:"清楚区分实现、测试和未验证事项",points:4}]}],sources:[
{title:"C4 Model",url:"https://c4model.com/",publisher:"Simon Brown",note:"架构沟通"},
{title:"Architecture Decision Records",url:"https://adr.github.io/madr/decisions/adr-template.html",publisher:"ADR GitHub",note:"技术决策文档"},
{title:"NIST AI RMF",url:"https://www.nist.gov/itl/ai-risk-management-framework",publisher:"NIST",note:"风险与责任说明"},
{title:"SLSA Specification v1.1",url:"https://slsa.dev/spec/v1.2/",publisher:"OpenSSF",note:"SLSA Specification v1.2（Approved，2026）：Build 与 Source tracks、provenance/attestation；不应继续把 v1.1 当成最新规范"}
]}
];
