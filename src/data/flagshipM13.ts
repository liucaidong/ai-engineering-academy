import type { Course } from "../types/course";

/** M13 — reusable Agent Skills and capability packaging. */
export const flagshipM13Lessons: Course["modules"][number]["lessons"] = [
{id:"m13-01-skill-contract",title:"第一讲：Skill 概念、边界与能力契约",summary:"定义可发现、可组合、可维护的 Agent 能力包。",learningObjectives:["区分 Skill、Tool、Prompt 和 Workflow","定义 Skill 输入输出和前置条件","设计能力边界与完成标准"],estimatedMinutes:70,content:[
{heading:"Skill 是能力包而非万能 Prompt",body:"Skill 将领域流程、知识、约束和资源组织成可复用能力单元。",markdown:"Tool 是执行接口；Prompt 是模型指令；Workflow 是编排；Skill 通常封装任务知识、步骤、示例、资源和可调用工具引用。不同平台的 Skill 具体格式并不统一，必须以实际运行时契约为准。"},
{heading:"输入输出契约",body:"Skill 应声明输入、输出、前置条件、权限和失败语义。",markdown:"定义 skill_id、version、description、input_schema、output_schema、preconditions、required_scopes、side_effects、timeouts 和 completion_criteria。没有明确输出契约的 Skill 难以组合、测试和升级。"},
{heading:"能力边界与职责",body:"Skill 不应绕过 Host 权限，也不应把未知副作用隐藏在文档步骤中。",markdown:"Skill 可以建议调用工具，但所有工具仍由 Host/runtime 验证和执行。声明只读或写入行为、数据来源、网络/文件访问和人工审批要求。把不可验证的能力描述为“自动完成”会误导用户。"},
{heading:"完成标准与可组合性",body:"可组合 Skill 需要确定性输入输出、错误分类和明确的终止条件。",markdown:"一个 Skill 的输出可作为另一个 Skill 的输入，但必须检查 schema 兼容、来源可信度、版本和权限。复合流程应显式定义失败回退，不能假设上游文本一定符合下游格式。"},
{heading:"复现练习：把代码审查能力定义为 Skill 契约",body:"将自然语言能力描述转换为可发现、可调用和可验收的接口。",markdown:"定义 skill_id、version、description、input_schema、output_schema、preconditions、required_scopes、side_effects、timeouts 和 completion_criteria。输入包括仓库引用、目标分支和审查范围；输出包括发现项、文件/行证据、严重级别和未覆盖项。Skill 可以建议调用测试或扫描工具，但不能自行授予仓库写权限。\\n\\n提交证据：契约表、正反触发样例、权限清单和完成判定规则。"}
],assessments:[{id:"m13-01-skill-contract",type:"design-review",prompt:"为“代码仓库安全审查”Skill 定义输入/输出 schema、前置条件、权限、副作用、错误码和完成标准。",rubric:[{criterion:"能力定位",description:"清楚区分 Skill 与 Tool/Prompt/Workflow",points:2},{criterion:"契约",description:"输入输出、前置条件和终止条件明确",points:4},{criterion:"边界",description:"声明权限、副作用和失败语义",points:4}]}],sources:[
{title:"Agent Skills",url:"https://agentskills.io/home",publisher:"Agent Skills",note:"开放 Skill 格式和概念"},
{title:"Claude Code Skills",url:"https://docs.anthropic.com/en/docs/claude-code/skills",publisher:"Anthropic",note:"Skill 文件组织和触发机制"},
{title:"OpenAI Agents SDK",url:"https://openai.github.io/openai-agents-python/",publisher:"OpenAI",note:"Agent 工具与能力编排参考"}
]},
{id:"m13-02-skill-packaging",title:"第二讲：Skill 包结构、资源与元数据",summary:"设计文件布局、入口文档、资源引用和元数据校验。",learningObjectives:["组织 Skill 文件与资源目录","定义元数据和入口说明","控制资源引用和文件访问边界"],estimatedMinutes:75,content:[
{heading:"包结构与入口",body:"Skill 包应有稳定入口、元数据、任务说明和必要资源。",markdown:"常见结构包含 SKILL.md、references/、scripts/ 和 assets/。入口文档说明何时使用、输入要求、执行步骤和输出格式；参考资料按需加载，避免每次把全部内容塞入上下文。"},
{heading:"元数据与发现",body:"名称、描述、标签和版本决定 Skill 是否能被正确发现。",markdown:"元数据可包括 name、description、version、compatibility、license、allowed-tools 和 tags。描述应说明适用任务与不适用情形，避免关键词堆砌或虚假能力声明。"},
{heading:"资源加载与路径安全",body:"资源引用必须限制在包目录和允许路径内。",markdown:"对相对路径进行规范化，拒绝路径穿越、符号链接逃逸和未授权网络引用。脚本执行要显式列出解释器、依赖、网络和文件权限；仅有脚本文件不代表它已经在安全沙箱运行。"},
{heading:"上下文渐进加载",body:"按需加载 references 可减少 token 成本并降低无关信息干扰。",markdown:"入口仅保留路由和关键规则；详细 API、长示例和领域资料放入 references。通过测试测量 Skill 触发准确率、加载 token、遗漏率和错误调用率。"},
{heading:"复现练习：构造可验证的 Skill 包目录",body:"从入口文档、参考资料、脚本和资产设计可维护的包结构。",markdown:"示例目录包含 SKILL.md、references/、scripts/、assets/ 和依赖锁文件。入口说明适用任务、不适用情形、必需输入、执行步骤和输出格式；长篇 API 说明放 references 按需加载。对相对路径做规范化，拒绝路径穿越、符号链接逃逸和未授权网络引用。\\n\\n提交目录树、元数据清单、资源加载图和脚本权限说明。仅存在脚本文件不代表脚本已在安全沙箱运行。"}
],assessments:[{id:"m13-02-skill-package",type:"code-task",prompt:"为数据分析 Skill 设计目录树和元数据，包含入口、参考资料、脚本、依赖清单及路径访问约束。",rubric:[{criterion:"包结构",description:"入口、references、scripts 和 assets 职责清晰",points:3},{criterion:"元数据",description:"名称、版本、适用范围和兼容信息完整",points:3},{criterion:"安全",description:"路径、网络、依赖和脚本权限受控",points:4}]}],sources:[
{title:"Agent Skills Specification",url:"https://agentskills.io/specification",publisher:"Agent Skills",note:"Skill 元数据和目录约定"},
{title:"Claude Code Skills",url:"https://docs.anthropic.com/en/docs/claude-code/skills",publisher:"Anthropic",note:"渐进式加载和资源组织"},
{title:"The Twelve-Factor App",url:"https://12factor.net/",publisher:"12factor.net",note:"配置与部署边界参考"}
]},
{id:"m13-03-skill-composition",title:"第三讲：Skill 组合、路由与冲突处理",summary:"通过前置条件、依赖和输出契约组合多项能力。",learningObjectives:["设计 Skill 依赖图","处理同名/重叠能力冲突","定义组合流程中的错误传播"],estimatedMinutes:75,content:[
{heading:"组合模型",body:"多个 Skill 可串联、并行或由路由器按任务选择，但依赖必须显式声明。",markdown:"串联要求上游输出满足下游输入 schema；并行要求任务独立且共享资源安全；路由则根据任务类型选择一个能力。使用 DAG 表达依赖，检测循环和缺失节点。"},
{heading:"路由与触发",body:"Skill 描述决定可发现性，运行时应有确定性约束和冲突处理。",markdown:"当多个 Skill 都匹配时，比较任务适配、版本兼容、权限和风险；不确定时请求澄清。不能让模型自由选择高权限 Skill 而跳过策略层。"},
{heading:"版本与依赖冲突",body:"Skill 依赖的工具 schema、模型能力和资源版本可能漂移。",markdown:"依赖清单记录 skill version、tool version、schema hash 和兼容范围。锁定经过验证的版本；升级前运行 contract tests。冲突时应明确拒绝、降级或要求人工处理。"},
{heading:"错误传播与补偿",body:"组合流程需定义失败隔离、重试、补偿和部分结果。",markdown:"区分输入校验失败、工具失败、上游无结果和业务拒绝。可重试错误按策略退避；不可重试错误向上传播结构化状态。对已产生副作用的前序 Skill 需要补偿或人工接管。"},
{heading:"复现练习：将软件交付流程建模为 Skill DAG",body:"用输入输出契约和版本约束组合多个 Skill，并定义失败传播。",markdown:"流程为需求分析 → 代码实现 → 测试 → 安全审查 → 发布说明。每个节点定义 input/output schema、tool dependencies、required scopes、版本和完成条件。测试与安全审查可并行，但发布说明必须等待两者结果。若测试失败，发布节点不得执行；若安全审查发现高危问题，流程进入人工处理。\\n\\n提交 DAG、schema 兼容表、版本锁定文件和重试/补偿策略。检查循环依赖和上游输出不符合下游契约的情况。"}
],assessments:[{id:"m13-03-skill-composition",type:"design-review",prompt:"将“需求分析→代码实现→测试→安全审查→发布说明”设计为 Skill DAG，标注依赖、权限和失败补偿。",rubric:[{criterion:"依赖图",description:"节点和依赖正确，无循环",points:3},{criterion:"契约兼容",description:"上游输出满足下游输入并锁定版本",points:3},{criterion:"失败治理",description:"定义重试、补偿和部分结果",points:4}]}],sources:[
{title:"Agent Skills Specification",url:"https://agentskills.io/specification",publisher:"Agent Skills",note:"能力包契约"},
{title:"LangGraph Workflows and Agents",url:"https://docs.langchain.com/oss/python/langgraph/workflows-agents",publisher:"LangChain",note:"工作流和 Agent 组合"},
{title:"Semantic Versioning 2.0.0",url:"https://semver.org/",publisher:"Tom Preston-Werner",note:"能力包版本兼容"}
]},
{id:"m13-04-skill-security-supply-chain",title:"第四讲：Skill 安全与供应链治理",summary:"审查第三方 Skill、脚本依赖、数据外传和权限声明。",learningObjectives:["建立 Skill 威胁模型","审计脚本、依赖和网络访问","制定来源、签名和升级政策"],estimatedMinutes:80,content:[
{heading:"Skill 攻击面",body:"Skill 文档、脚本、资源和依赖都可能承载恶意指令或代码。",markdown:"风险包括 Prompt Injection、数据外传、依赖投毒、路径穿越、命令执行和凭据窃取。Markdown 指令也可能诱导 Agent 调用高权限工具，因此 Skill 来源必须视为供应链输入。"},
{heading:"最小权限与执行隔离",body:"Skill 声明的权限应由运行时强制实施，而不是依赖作者承诺。",markdown:"默认禁止网络、文件写入和子进程；按任务逐项授权。脚本在隔离环境执行，限制 CPU、内存、时间、文件系统和网络出口。敏感凭证通过短期、最小 scope 的方式提供。"},
{heading:"来源与依赖审计",body:"发布物应可追溯到作者、版本、源码、依赖和构建过程。",markdown:"保存仓库 URL、commit SHA、release tag、依赖锁文件、许可证、文件摘要和安全审查记录。升级时比较文件差异与权限变化；高风险变更需要重新审批。"},
{heading:"撤销与事故响应",body:"发现恶意 Skill 后应能停止调用、撤销凭证并追查影响范围。",markdown:"维护禁用清单和版本撤销机制。事故响应包括隔离 Skill、撤销 token、审计执行轨迹、识别外传数据、通知受影响主体并恢复安全版本。"},
{heading:"复现练习：审计第三方 Skill 的供应链攻击面",body:"将文档指令、脚本、依赖、文件和网络权限纳入同一威胁模型。",markdown:"场景：第三方 Skill 声称需要读取仓库并访问网络。检查仓库来源、commit SHA、release tag、许可证、依赖锁文件、脚本行为、网络目标和文件访问范围。默认禁止网络和文件写入；确需使用时按任务最小授权。构造路径穿越、依赖投毒、凭据读取和数据外传测试。\\n\\n提交软件物料清单、权限差异、文件摘要、威胁模型和撤销步骤。来源可信不代表每个版本都安全。"}
],assessments:[{id:"m13-04-skill-threat-model",type:"design-review",prompt:"对一个可读写仓库并访问网络的第三方 Skill 做威胁建模，提出权限、依赖、来源和撤销控制。",rubric:[{criterion:"攻击面",description:"覆盖指令、脚本、依赖、路径和网络",points:3},{criterion:"预防控制",description:"最小权限、隔离和凭证保护具体",points:4},{criterion:"响应",description:"包含撤销、追踪和事故处理",points:3}]}],sources:[
{title:"OWASP Top 10 for LLM Applications",url:"https://owasp.org/www-project-top-10-for-large-language-model-applications/",publisher:"OWASP",note:"Agent 与工具供应链风险"},
{title:"SLSA",url:"https://slsa.dev/spec/v1.0/",publisher:"OpenSSF",note:"软件供应链来源证明"},
{title:"NIST Secure Software Development Framework",url:"https://csrc.nist.gov/Projects/ssdf",publisher:"NIST",note:"安全开发与供应链实践"}
]},
{id:"m13-05-skill-testing-governance",title:"第五讲：Skill 测试、发布与目录治理",summary:"建立触发、执行、组合和升级的自动化评测流程。",learningObjectives:["构建 Skill 触发与执行测试集","定义兼容性和安全回归指标","设计目录发布、弃用和撤销流程"],estimatedMinutes:80,content:[
{heading:"Skill 测试金字塔",body:"测试应覆盖元数据、文件结构、schema、脚本、组合流程和真实任务行为。",markdown:"静态检查验证元数据和路径；单元测试验证脚本和参数；contract tests 验证工具接口；集成测试验证 Host 发现与调用；任务评测验证用户目标完成。不同层级的通过不能互相替代。"},
{heading:"触发与执行指标",body:"Skill 是否被正确选中与执行结果是否正确是两类指标。",markdown:"指标包括 trigger precision/recall、wrong-skill rate、task success、tool violation、token overhead、latency 和 regression rate。按任务类别、语言和用户权限分层。"},
{heading:"发布与兼容策略",body:"Skill 发布应包含版本、变更摘要、兼容范围和回滚点。",markdown:"采用 SemVer 时，破坏输入输出契约的变更应提升 major；兼容功能增加可提升 minor；修复提升 patch。升级前运行依赖矩阵和安全回归；灰度后监控误触发和失败率。"},
{heading:"目录治理与生命周期",body:"Skill 目录需要 owner、审核、弃用、撤销和维护期限。",markdown:"登记 owner、支持状态、最后审查时间、许可和兼容平台。无维护能力或存在严重漏洞的 Skill 应禁用或归档。目录搜索结果不应将未经审核的社区能力标记为可信。"},
{heading:"复现练习：建立 Skill Registry 的准入与回滚门禁",body:"把触发准确率、契约兼容和供应链审核纳入发布生命周期。",markdown:"测试分层包含元数据静态检查、路径检查、脚本单测、tool contract、Host 集成和真实任务行为。指标包括 trigger precision/recall、wrong-skill rate、task success、tool violation、token overhead 和 latency。版本升级前比较 schema、scope、依赖和资源差异；灰度后若误触发或安全指标回退则撤销版本。\\n\\n提交准入清单、SemVer 变更规则、owner/审核责任、弃用日期和回滚演练。未经审核的社区 Skill 不得标记为可信。"}
],assessments:[{id:"m13-05-skill-release",type:"design-review",prompt:"制定企业 Skill Registry 的准入、测试、SemVer、灰度、弃用和撤销规则，并定义核心质量指标。",rubric:[{criterion:"测试策略",description:"覆盖静态、契约、集成和任务行为",points:3},{criterion:"发布治理",description:"定义版本兼容、灰度和回滚",points:3},{criterion:"目录责任",description:"明确 owner、审核、撤销和维护期限",points:4}]}],sources:[
{title:"Agent Skills Specification",url:"https://agentskills.io/specification",publisher:"Agent Skills",note:"格式兼容和验证"},
{title:"Semantic Versioning 2.0.0",url:"https://semver.org/",publisher:"Tom Preston-Werner",note:"版本升级规则"},
{title:"SLSA",url:"https://slsa.dev/spec/v1.0/",publisher:"OpenSSF",note:"供应链发布可信度"}
]}
];
