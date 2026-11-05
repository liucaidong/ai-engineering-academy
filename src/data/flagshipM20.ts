import type { Course } from "../types/course";

/** M20 — end-to-end AI Engineering Capstone. */
export const flagshipM20Lessons: Course["modules"][number]["lessons"] = [
{id:"m20-01-capstone-problem-charter",title:"第一讲：Capstone 立项——需求、范围与验收",summary:"从真实问题建立可交付的 AI 系统项目章程。",learningObjectives:["定义用户、问题、任务和非目标","将需求转成可测试验收条件","建立风险、数据和资源约束"],estimatedMinutes:90,content:[
{heading:"问题陈述与用户画像",body:"Capstone 必须从真实用户任务出发，而不是从想展示的模型技术出发。",markdown:"项目章程描述用户、工作情境、当前替代流程、痛点、失败成本和价值假设。区分直接用户、数据主体、审批者和系统运营者。"},
{heading:"需求与非目标",body:"需求应可验收，非目标用于防止项目范围无限膨胀。",markdown:"功能需求描述输入、输出和业务行为；非功能需求覆盖延迟、吞吐、可用性、安全和成本。列出不支持场景、人工接管条件和明确不做的功能。"},
{heading:"验收指标",body:"每个目标应有测量方法、数据来源和通过阈值。",markdown:"示例指标：任务成功率、证据支持率、工具执行正确率、越权率、P95 延迟、单位任务成本和人工接管率。定义样本集、分母、测量窗口和统计不确定性。"},
{heading:"风险和可行性",body:"项目范围必须与数据许可、凭证、模型可用性和执行环境相匹配。",markdown:"建立风险登记表：风险、影响、可能性、缓解、owner 和残余风险。将需要外部凭证、真实模型或生产环境的验证单独标记；没有凭据时使用明确的模拟/纸面验证，不得虚构真实集成。"}],assessments:[{id:"m20-01-project-charter",type:"design-review",prompt:"提交 Capstone 项目章程：用户问题、范围/非目标、验收指标、风险登记和外部依赖清单。",rubric:[{criterion:"问题与范围",description:"用户任务、痛点和非目标清楚",points:3},{criterion:"验收标准",description:"指标、分母、阈值和证据来源明确",points:4},{criterion:"风险可行性",description:"记录数据、凭证、模型和环境依赖",points:3}]}],sources:[
{title:"NIST AI Risk Management Framework",url:"https://www.nist.gov/itl/ai-risk-management-framework",publisher:"NIST",note:"项目风险章程"},
{title:"Google PAIR Guidebook",url:"https://pair.withgoogle.com/guidebook/",publisher:"Google",note:"以用户任务定义 AI 产品"},
{title:"Google SRE Workbook",url:"https://sre.google/workbook/table-of-contents/",publisher:"Google",note:"可测量可靠性目标"}
]},
{id:"m20-02-capstone-architecture",title:"第二讲：系统架构、数据流与技术决策",summary:"交付架构图、ADR、数据模型和信任边界。",learningObjectives:["设计端到端组件和数据流","记录模型、RAG、Agent 和工具选型","建立 ADR 与安全信任边界"],estimatedMinutes:90,content:[
{heading:"端到端架构",body:"架构应展示用户入口、应用服务、模型、检索、工具、数据、身份和观测。",markdown:"提交 context/container/component 视图和关键时序图。标出同步/异步路径、状态持久化、缓存、错误边界和外部依赖。"},
{heading:"模型与检索选型",body:"技术选型要依据任务评测、数据约束、延迟、成本和可维护性。",markdown:"比较托管模型与本地模型、RAG 与微调、单 Agent 与 workflow、向量与混合检索。记录选择理由、替代方案和重新评估触发条件。"},
{heading:"工具和权限设计",body:"每个工具声明输入输出、权限、副作用、超时和幂等语义。",markdown:"绘制工具信任边界，定义身份传递、对象级授权、参数校验、审批和审计。Prompt 不承担授权功能。"},
{heading:"ADR 与架构取舍",body:"架构决策记录问题背景、选项、决定、后果和复审条件。",markdown:"每项 ADR 包含状态、上下文、候选方案、决策、正负后果和验证计划。对未验证的性能或安全假设明确标注，不把设计意图写成已实现事实。"}],assessments:[{id:"m20-02-architecture-pack",type:"design-review",prompt:"提交 Capstone 架构包：组件图、数据流、关键时序、模型/RAG/Agent 选型表、权限边界和至少三份 ADR。",rubric:[{criterion:"架构表达",description:"组件、数据流和故障边界完整",points:3},{criterion:"技术决策",description:"比较替代方案并说明约束",points:3},{criterion:"安全 ADR",description:"记录身份、工具权限和验证证据",points:4}]}],sources:[
{title:"C4 Model",url:"https://c4model.com/",publisher:"Simon Brown",note:"架构图表达"},
{title:"Architecture Decision Records",url:"https://adr.github.io/",publisher:"ADR GitHub",note:"决策记录实践"},
{title:"OWASP Top 10 for LLM Applications",url:"https://owasp.org/www-project-top-10-for-large-language-model-applications/",publisher:"OWASP",note:"AI 系统威胁建模"}
]},
{id:"m20-03-capstone-implementation",title:"第三讲：模型、RAG、Agent 与工具集成",summary:"实现可运行核心流程并保留接口、数据和权限边界。",learningObjectives:["实现端到端最小业务路径","集成模型、检索和工具调用","建立错误处理、幂等和审计"],estimatedMinutes:120,content:[
{heading:"垂直切片优先",body:"先交付一条可验证的端到端路径，再扩展边界场景。",markdown:"选择最小用户旅程，完成输入、模型/检索、工具、业务结果和审计。每个组件先定义契约，避免在多个模块同时堆积未集成代码。"},
{heading:"模型与 RAG 集成",body:"模型调用应记录版本和 usage；检索结果保留来源、权限和版本。",markdown:"RAG 流程应执行 ACL filter、retrieval、rerank、context budget 和 citation validation。模型无证据时应返回 unknown/clarify，而不是编造。"},
{heading:"Agent 与工具集成",body:"Agent 决策与工具执行分离，副作用工具需要确定性授权。",markdown:"使用受限工具 allowlist、JSON Schema、超时、幂等键和审批。每次工具执行保留 request ID、参数摘要、状态和结果引用。"},
{heading:"工程质量与边界",body:"实现应有类型、测试、日志和配置管理，不把 mock 当真实服务。",markdown:"为外部服务提供 adapter 和 mock；报告标记哪些路径使用模拟数据、哪些调用真实服务。凭据、配额或模型访问缺失时，记录未验证项。"}],assessments:[{id:"m20-03-implementation-review",type:"code-task",prompt:"实现或提交核心垂直切片的代码审查包：模型请求、RAG 引用、工具 schema、授权、幂等、错误路径和 mock/真实服务边界。",rubric:[{criterion:"核心流程",description:"端到端最小路径可追踪",points:3},{criterion:"集成契约",description:"模型/检索/工具 schema 和错误语义明确",points:3},{criterion:"安全质量",description:"授权、幂等、审计和模拟边界清楚",points:4}]}],sources:[
{title:"OpenAI API Documentation",url:"https://platform.openai.com/docs/",publisher:"OpenAI",note:"模型调用接口参考"},
{title:"LlamaIndex Documentation",url:"https://docs.llamaindex.ai/",publisher:"LlamaIndex",note:"RAG 数据和检索实现"},
{title:"Model Context Protocol Specification",url:"https://modelcontextprotocol.io/specification",publisher:"Model Context Protocol",note:"工具/资源协议集成"}
]},
{id:"m20-04-capstone-evaluation-security",title:"第四讲：综合评测、安全、监控与部署",summary:"用证据验证系统质量、风险控制和运行准备度。",learningObjectives:["构建端到端评测集和回归","完成威胁模型与权限测试","设计观测、SLO、成本和部署方案"],estimatedMinutes:100,content:[
{heading:"端到端评测",body:"评测覆盖成功路径、边界、对抗输入和故障路径。",markdown:"构造固定 benchmark，包含输入、gold evidence、预期工具行为、验收标准和风险标签。分开统计检索、生成、工具和端到端成功率。"},
{heading:"安全与隐私验证",body:"威胁模型必须对应可执行测试和控制证据。",markdown:"覆盖 Prompt Injection、越权、敏感数据泄露、工具重放、租户隔离、依赖风险和资源耗尽。记录攻击载荷、预期阻断点和真实执行日志。"},
{heading:"观测与 SLO",body:"监控 Trace、质量、延迟、成本和错误恢复。",markdown:"提交 trace 样例、指标定义、告警阈值、日志脱敏和数据保留策略。SLO 同时包含服务可用性和任务质量；安全硬约束独立于错误预算。"},
{heading:"部署与运行准备",body:"部署说明必须覆盖配置、密钥、数据迁移、健康检查、回滚和事故响应。",markdown:"区分本地演示、测试环境和生产部署。提供容量假设、资源需求、依赖清单和未验证项。没有真实环境执行的部署步骤应标记为设计/说明，而不是部署成功。"}],assessments:[{id:"m20-04-acceptance-pack",type:"design-review",prompt:"提交 Capstone 验收包：端到端 benchmark、威胁模型、安全测试证据、trace/metrics、SLO、成本和部署/回滚计划。",rubric:[{criterion:"评测",description:"包含分层 benchmark 和回归结果",points:3},{criterion:"安全",description:"威胁、测试、权限和隐私控制可追溯",points:3},{criterion:"运行准备",description:"观测、SLO、成本和回滚方案完整",points:4}]}],sources:[
{title:"NIST AI RMF Playbook",url:"https://airc.nist.gov/AI_RMF_Knowledge_Base/Playbook",publisher:"NIST",note:"AI 风险评估与管理"},
{title:"OpenTelemetry Documentation",url:"https://opentelemetry.io/docs/",publisher:"OpenTelemetry",note:"系统观测"},
{title:"Google SRE Workbook",url:"https://sre.google/workbook/table-of-contents/",publisher:"Google",note:"SLO 和上线验收"}
]},
{id:"m20-05-capstone-demo-defense",title:"第五讲：项目交付、演示与技术答辩",summary:"用可复现演示和证据说明系统能力、取舍与限制。",learningObjectives:["组织可复现演示和交付文档","解释关键架构决策和失败案例","区分已实现、已测试和未验证能力"],estimatedMinutes:90,content:[
{heading:"交付物清单",body:"完整交付包含代码、架构、数据/模型配置、评测、威胁模型和运维文档。",markdown:"交付包包含 README、架构图、ADR、API/schema、数据说明、模型版本、Prompt、测试、benchmark、trace 样例、成本估算、部署说明和已知限制。"},
{heading:"演示脚本与证据",body:"演示应覆盖正常流程、边界处理、故障和安全拒绝。",markdown:"固定演示输入、环境和版本；展示工具执行日志与来源引用。演示成功不能替代自动化测试或生产运行证明。"},
{heading:"技术答辩",body:"答辩重点是问题、证据、取舍和残余风险，而非展示模型生成得多流畅。",markdown:"解释为何选择当前模型/架构、为何不选替代方案、哪些指标支持决策、失败案例如何处理，以及成本和风险如何控制。"},
{heading:"成熟度与后续路线图",body:"明确哪些能力已实现、已静态审阅、已测试或仍未验证。",markdown:"交付报告使用状态标签：implemented、reviewed、tested、not tested、blocked。后续路线图按风险和用户价值排序，不把未实现能力写成已完成。"}],assessments:[{id:"m20-05-capstone-defense",type:"design-review",prompt:"完成 Capstone 答辩包，演示正常/失败/安全拒绝三条路径，并说明实现状态、测试证据、架构取舍和残余风险。",rubric:[{criterion:"交付完整性",description:"代码、架构、评测和运维文档齐全",points:3},{criterion:"演示证据",description:"三类流程可复现且引用真实日志",points:3},{criterion:"技术答辩",description:"清楚区分实现、测试和未验证事项",points:4}]}],sources:[
{title:"C4 Model",url:"https://c4model.com/",publisher:"Simon Brown",note:"架构沟通"},
{title:"Architecture Decision Records",url:"https://adr.github.io/",publisher:"ADR GitHub",note:"技术决策文档"},
{title:"NIST AI RMF",url:"https://www.nist.gov/itl/ai-risk-management-framework",publisher:"NIST",note:"风险与责任说明"}
]}
];
