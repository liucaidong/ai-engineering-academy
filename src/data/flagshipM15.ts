import type { Course } from "../types/course";

/** M15 — AI/Agent security, authorization, human approval and governance. */
export const flagshipM15Lessons: Course["modules"][number]["lessons"] = [
{id:"m15-01-ai-threat-model",title:"第一讲：AI 系统威胁建模与风险分类",summary:"把模型、数据、工具、运行时和供应链纳入统一威胁模型。",learningObjectives:["识别 AI 应用资产、主体和信任边界","应用 STRIDE/攻击树分析风险","定义风险等级和安全目标"],estimatedMinutes:75,content:[
{heading:"资产与攻击面",body:"AI 系统资产包括模型、Prompt、数据、检索索引、工具、凭证、日志和用户状态。",markdown:"威胁建模从资产、主体、入口、信任边界和副作用开始。攻击面包含用户输入、检索文档、模型输出、工具参数、插件/Skill、MCP Server、训练数据和部署供应链。"},
{heading:"STRIDE 与 AI 特有风险",body:"传统威胁分类仍适用，同时需关注 Prompt Injection、模型滥用和输出不可信。",markdown:"STRIDE 包含 Spoofing、Tampering、Repudiation、Information Disclosure、Denial of Service、Elevation of Privilege。AI 特有风险可映射到这些类别：注入导致篡改决策，工具越权导致提权，Prompt/日志泄露导致信息披露，长上下文和循环调用导致资源耗尽。"},
{heading:"风险评估",body:"风险由威胁可能性、影响、暴露面和控制有效性共同决定。",markdown:"可使用 risk=likelihood×impact 的定性/半定量矩阵，但要说明评分规则和不确定性。影响考虑机密性、完整性、可用性、财务、法律和用户伤害。高影响场景应采用保守阈值和人工评审。"},
{heading:"安全目标与边界",body:"安全目标必须转化为可验证的系统控制和验收条件。",markdown:"示例目标：用户只能读取有权文档；Agent 不得执行未经批准的退款；敏感数据不进入不必要日志；资源耗尽有上限。每项目标指定 owner、控制点、测试证据和残余风险。"}],assessments:[{id:"m15-01-threat-model",type:"design-review",prompt:"为企业知识 Agent 绘制数据流和信任边界，使用 STRIDE 分类至少八项威胁并排序风险。",rubric:[{criterion:"资产边界",description:"覆盖模型、Prompt、数据、工具和凭证",points:3},{criterion:"威胁分析",description:"分类并解释威胁路径与影响",points:4},{criterion:"控制验收",description:"为高风险项定义可验证控制",points:3}]}],sources:[
{title:"NIST AI Risk Management Framework",url:"https://www.nist.gov/itl/ai-risk-management-framework",publisher:"NIST",note:"AI 风险治理框架"},
{title:"OWASP Top 10 for LLM Applications",url:"https://owasp.org/www-project-top-10-for-large-language-model-applications/",publisher:"OWASP",note:"LLM 应用风险分类"},
{title:"STRIDE Threat Modeling",url:"https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats",publisher:"Microsoft",note:"传统威胁建模分类"}
]},
{id:"m15-02-prompt-data-security",title:"第二讲：Prompt Injection、数据泄露与隐私",summary:"保护模型上下文、检索数据和用户敏感信息。",learningObjectives:["区分直接/间接注入和数据外带","设计数据最小化与脱敏策略","验证 RAG/Agent 的访问控制"],estimatedMinutes:80,content:[
{heading:"直接与间接 Prompt Injection",body:"恶意指令可来自用户，也可隐藏在网页、文档、邮件和代码中。",markdown:"模型可能把检索内容当作指令。文本标签不能构成强制隔离。将外部内容视为不可信证据，并通过服务端策略限制可调用工具和数据访问。"},
{heading:"数据泄露路径",body:"敏感信息可能经 Prompt、工具结果、日志、缓存、训练数据或第三方服务外泄。",markdown:"建立数据分类：公开、内部、机密、个人敏感。对每类定义可发送模型范围、脱敏规则、存储期限和访问审批。只把完成任务所需的最小数据传给模型或外部工具。"},
{heading:"隐私保护与日志治理",body:"日志要支持审计但不能无限复制原始个人数据。",markdown:"采用字段级脱敏、访问控制、加密、短保留期限和审计。对日志中的 Prompt/response 设置采样和敏感字段过滤；避免把完整文件、凭证和个人标识写入 trace。删除请求需传播到索引、缓存和派生摘要。"},
{heading:"访问控制与租户隔离",body:"权限过滤必须在可信数据层执行，而不是让模型自行判断。",markdown:"每次检索和工具访问绑定 principal、tenant、resource 和 action。采用 deny-by-default、对象级授权和租户隔离。缓存键纳入身份/权限版本，避免权限变更后继续返回旧结果。"}],assessments:[{id:"m15-02-data-leakage",type:"design-review",prompt:"为多租户 RAG Agent 制定数据分级、Prompt Injection 防护、日志脱敏、缓存隔离和删除传播方案。",rubric:[{criterion:"威胁路径",description:"覆盖注入、检索越权和日志/工具泄露",points:3},{criterion:"隐私控制",description:"定义最小化、脱敏、保留和删除",points:3},{criterion:"授权隔离",description:"检索前授权、租户隔离和缓存键策略",points:4}]}],sources:[
{title:"OWASP LLM01: Prompt Injection",url:"https://genai.owasp.org/llmrisk/llm01-prompt-injection/",publisher:"OWASP GenAI Security Project",note:"提示词注入风险"},
{title:"NIST Privacy Framework",url:"https://www.nist.gov/privacy-framework",publisher:"NIST",note:"隐私风险管理"},
{title:"NIST SP 800-53 Rev. 5",url:"https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final",publisher:"NIST",note:"访问控制、审计和数据保护"}
]},
{id:"m15-03-tool-authorization",title:"第三讲：工具权限、最小权限与安全执行",summary:"建立身份、授权、参数约束和高风险操作门禁。",learningObjectives:["区分认证、授权和审批","设计 RBAC/ABAC 与对象级权限","建立工具沙箱和副作用控制"],estimatedMinutes:80,content:[
{heading:"认证、授权和审批",body:"认证回答主体是谁，授权回答能做什么，审批确认特定高风险动作。",markdown:"身份 principal 应贯穿用户、Agent、工具和审计记录。授权按 resource/action/scope 判断；审批绑定一次具体操作和参数。用户已登录不代表 Agent 获得全部权限。"},
{heading:"RBAC 与 ABAC",body:"RBAC 按角色授予权限，ABAC 根据主体、资源、动作和环境属性决策。",markdown:"RBAC 易管理但角色膨胀；ABAC 更灵活但策略复杂。对象级授权要验证资源归属，不能仅验证用户拥有某个通用角色。策略应 deny-by-default 并记录决策依据。"},
{heading:"工具沙箱与输入验证",body:"工具执行环境限制文件、网络、进程和资源，并对参数做确定性校验。",markdown:"命令执行使用固定可执行文件和参数数组，避免 shell 拼接；文件路径规范化并限制根目录；网络访问使用出口 allowlist；数据库使用参数化查询。容器并不自动等于强隔离，应评估内核共享和逃逸风险。"},
{heading:"高风险动作控制",body:"删除、支付、外发、权限修改等动作需要更严格的门禁和审计。",markdown:"高风险动作执行前展示目标、规范化参数、影响和不可逆性；审批后参数摘要必须一致。使用幂等键、限额、双人复核和可追溯执行记录。"}],assessments:[{id:"m15-03-tool-permission",type:"design-review",prompt:"为 Agent 的文件、邮件和支付工具设计 RBAC/ABAC 策略，列出高风险动作审批和沙箱边界。",rubric:[{criterion:"身份授权",description:"区分认证、授权和对象级访问",points:3},{criterion:"执行隔离",description:"限制文件、网络、进程和资源",points:3},{criterion:"审批审计",description:"参数绑定审批、幂等和审计完整",points:4}]}],sources:[
{title:"NIST SP 800-207: Zero Trust Architecture",url:"https://csrc.nist.gov/pubs/sp/800/207/final",publisher:"NIST",note:"零信任与持续授权"},
{title:"OWASP Authorization Cheat Sheet",url:"https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html",publisher:"OWASP",note:"授权设计实践"},
{title:"NIST SP 800-190: Application Container Security Guide",url:"https://csrc.nist.gov/pubs/sp/800/190/final",publisher:"NIST",note:"容器安全边界"}
]},
{id:"m15-04-output-safety-governance",title:"第四讲：模型输出风险、内容安全与治理",summary:"管理不可信输出、偏差、错误建议和高影响决策。",learningObjectives:["建立输出验证和内容风险分级","评估偏差、鲁棒性和不当拒绝","设计人工监督和申诉机制"],estimatedMinutes:75,content:[
{heading:"输出是候选结果",body:"模型输出需要验证事实、权限、格式和业务影响。",markdown:"生成内容可能包含虚构事实、错误代码、偏见、恶意链接或不安全建议。输出检查包括来源核验、schema、业务规则、内容政策和风险等级；模型自我评价不能作为唯一依据。"},
{heading:"偏差与公平性",body:"数据分布和标注规范可能使不同群体出现性能差异。",markdown:"按适用群体和场景分层评测 false positive/negative、拒答率和任务成功率。避免收集不必要敏感属性；若需要公平性审计，明确合法依据、数据治理和统计限制。"},
{heading:"高影响场景的人类监督",body:"医疗、金融、招聘和法律等高影响决策需要明确责任主体与人工复核。",markdown:"界定模型仅提供信息还是参与决策；确保人工审阅者有足够信息、权限和时间，不把自动建议包装成最终决定。记录覆盖范围、申诉路径和纠错机制。"},
{heading:"政策与标准映射",body:"治理要求应转化为责任、流程、证据和持续改进。",markdown:"将风险登记、数据治理、模型评估、供应商管理、事件响应和变更审批映射到组织政策。不同司法辖区的法律义务不同，课程示例不是法律意见；上线前需法务/合规评审。"}],assessments:[{id:"m15-04-output-governance",type:"design-review",prompt:"为招聘筛选辅助工具建立输出安全与治理框架，包含偏差评测、人工复核、申诉、责任和审计证据。",rubric:[{criterion:"输出风险",description:"识别事实、偏见和高影响错误",points:3},{criterion:"人工监督",description:"定义真实复核、责任和申诉机制",points:4},{criterion:"治理证据",description:"建立政策映射、审计和持续改进",points:3}]}],sources:[
{title:"NIST AI Risk Management Framework",url:"https://www.nist.gov/itl/ai-risk-management-framework",publisher:"NIST",note:"治理、映射、测量和管理"},
{title:"EU AI Act",url:"https://eur-lex.europa.eu/eli/reg/2024/1689/oj",publisher:"European Union",note:"风险分类和高风险系统义务"},
{title:"ISO/IEC 42001:2023",url:"https://www.iso.org/standard/81230.html",publisher:"ISO",note:"AI 管理体系标准"}
]},
{id:"m15-05-security-testing-incident",title:"第五讲：安全测试、审计与事件响应",summary:"建立红队、控制验证、风险接受和事故闭环。",learningObjectives:["设计 AI/Agent 红队测试集","定义安全指标和发布门槛","建立事件响应、取证和复盘"],estimatedMinutes:85,content:[
{heading:"红队测试范围",body:"测试应覆盖提示词注入、越权、数据泄露、工具滥用、拒绝绕过和资源耗尽。",markdown:"用攻击树组织测试，记录前置条件、攻击载荷、预期控制和实际结果。区分模型层拒绝与系统层阻断；真实工具执行日志是判断副作用是否发生的证据。"},
{heading:"安全指标与门槛",body:"安全指标要衡量攻击成功和控制失效，而不只是拒答文本。",markdown:"指标包括 attack success rate、unauthorized tool execution、sensitive data exposure、policy bypass、false refusal、recovery time 和 audit completeness。高风险工具可要求未授权执行为零，并设定明确置信区间和样本量。"},
{heading:"事件响应与取证",body:"发生事件后应隔离影响、保全证据、撤销凭证并识别数据暴露范围。",markdown:"事件流程：检测 → 分级 → 遏制 → 根因分析 → 恢复 → 通知/报告 → 复盘。保留 trace、模型/Prompt/工具版本、授权决策、数据访问记录和时间线；日志需防篡改并控制敏感内容。"},
{heading:"风险接受与持续治理",body:"残余风险需要有权责任人、期限、补偿控制和复审条件。",markdown:"风险接受记录包含风险描述、影响、可能性、控制现状、残余风险、批准人和到期日。模型、工具、数据、Prompt 或供应商变更都可能使风险评估失效，需要重新审查。"}],assessments:[{id:"m15-05-security-acceptance",type:"design-review",prompt:"为可执行外部写操作的 Agent 建立安全发布门槛和事件响应手册，包含红队案例、指标、证据保全和风险接受流程。",rubric:[{criterion:"红队覆盖",description:"攻击场景覆盖注入、越权、泄露和滥用",points:3},{criterion:"门槛指标",description:"定义可量化安全指标和发布阈值",points:3},{criterion:"事件闭环",description:"包含遏制、取证、恢复和责任审批",points:4}]}],sources:[
{title:"NIST AI RMF Playbook",url:"https://airc.nist.gov/AI_RMF_Knowledge_Base/Playbook",publisher:"NIST",note:"AI 风险管理实践"},
{title:"OWASP Web Security Testing Guide",url:"https://owasp.org/www-project-web-security-testing-guide/",publisher:"OWASP",note:"安全测试方法"},
{title:"NIST SP 800-61 Rev. 2: Computer Security Incident Handling Guide",url:"https://csrc.nist.gov/pubs/sp/800/61/r2/final",publisher:"NIST",note:"事件响应流程"}
]}
];
