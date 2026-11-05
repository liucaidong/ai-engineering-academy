import type { Course } from "../types/course";

/** M06 — prompt engineering, structured output, security and regression evaluation. */
export const flagshipM06Lessons: Course["modules"][number]["lessons"] = [
{
id:"m06-01-instruction-specification",title:"第一讲：指令结构与任务规格",summary:"把自然语言需求转成可审查的 Prompt 契约。",learningObjectives:["拆解任务目标、输入、约束和输出","区分 system/developer/user/tool 消息职责","定义澄清、拒绝和不确定性处理"],estimatedMinutes:70,
content:[
{heading:"Prompt 是接口规格，不是咒语",body:"Prompt 定义当前上下文中的任务条件，但不能代替应用层权限、验证和业务规则。",markdown:"把提示词视为不完全确定的接口契约：输入包含任务、上下文和约束，输出是模型生成的候选结果。模型可能忽略指令、误解歧义或受到冲突内容影响，因此关键约束必须由程序验证。\n\n可审查的 Prompt 应明确目标用户、任务边界、输入字段、输出格式、禁止行为、证据要求、失败处理和示例。"},
{heading:"消息层级与职责分离",body:"System、Developer、User 和 Tool 消息承担不同来源和控制语义，不能视为普通文本标签。",markdown:"System/Developer 消息通常定义应用角色、策略和格式约束；User 消息表达当前任务和数据；Tool 消息承载外部执行结果。优先级和精确语义以目标 API 协议为准。\n\n不要把 API key、密码或授权 token 写入 Prompt。凭据应由安全的服务端凭证管理系统注入真正需要它们的执行组件。"},
{heading:"任务分解与约束表达",body:"复杂请求应拆成可观察子任务，并明确输入、输出、证据和停止条件。",markdown:"规格结构：目标 → 输入 → 前置条件 → 步骤/决策规则 → 输出 schema → 不确定性处理 → 禁止事项 → 验收标准。合同审查可拆成条款提取、原文定位、风险分类、证据引用和不确定项标记，而不是让模型直接给出无依据结论。"},
{heading:"澄清、拒绝与未知",body:"高质量指令需要明确何时澄清、拒绝或输出未知，不能强迫所有输入生成答案。",markdown:"缺少必需字段时澄清；证据不足时说明无法确认；越权任务时拒绝；工具失败时报告失败状态而不是编造成功。把“不要幻觉”变成可验证规则：事实声明附来源 ID；无来源不作断言；计算展示输入和公式；冲突证据并列呈现。"}
],
assessments:[{id:"m06-01-prompt-contract",type:"design-review",prompt:"为企业采购合同审查助手编写 Prompt 规格，定义消息职责、输入字段、证据要求、澄清/拒绝策略和验收标准。",rubric:[{criterion:"任务规格",description:"目标、输入、约束、输出和验收可操作",points:4},{criterion:"消息边界",description:"区分策略、用户数据与工具结果",points:2},{criterion:"失败分支",description:"覆盖缺失信息、证据不足、越权和工具失败",points:4}]}],
sources:[
{title:"Prompt engineering",url:"https://platform.openai.com/docs/guides/prompt-engineering",publisher:"OpenAI",note:"消息结构与提示词设计"},
{title:"Prompt engineering overview",url:"https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview",publisher:"Anthropic",note:"提示词工程方法"},
{title:"Prompt design strategies",url:"https://cloud.google.com/vertex-ai/generative-ai/docs/learn/prompts/prompt-design-strategies",publisher:"Google Cloud",note:"提示词结构与任务设计"}
]
},
{
id:"m06-02-fewshot-selection",title:"第二讲：Few-shot、示例选择与上下文组织",summary:"设计有代表性的示例集，兼顾任务覆盖和 token 预算。",learningObjectives:["区分 zero-shot、one-shot 与 few-shot","设计覆盖边界条件的示例集合","实现相关性、覆盖与冗余的选择权衡"],estimatedMinutes:70,
content:[
{heading:"In-context Learning",body:"Few-shot 把示例放入上下文，使模型在推理时参考示例模式，不等于更新模型权重。",markdown:"Zero-shot 不提供示例；one-shot 提供一个示例；few-shot 提供多个输入—输出示范。示例改变当前条件分布，但不会直接更新模型参数。示例格式、顺序、标签分布和难度都会影响结果。"},
{heading:"相关性与覆盖",body:"最相似示例不一定足够，应兼顾类别覆盖、难例、反例和输入分布。",markdown:"可将候选示例评分写成 score(e)=α·similarity+β·coverage−γ·redundancy。这是显式化取舍的启发式，不是通用最优算法。客服意图分类应覆盖高频类别、相近类别、缺失信息、拼写错误、跨语言和拒绝类别。"},
{heading:"顺序效应与反例",body:"示例顺序和类别比例可能造成位置偏差或多数类偏置，应通过排列实验评估。",markdown:"对同一示例集合随机打乱、正序和逆序运行，记录类别指标；若结果显著变化，说明系统对上下文排列敏感。反例应解释为何不匹配，避免模型过度套用正例模板。示例中的真实用户数据需脱敏并满足许可要求。"},
{heading:"上下文预算",body:"示例选择必须纳入模板开销、检索内容、工具定义和输出预留。",markdown:"若容量为 C，系统消息 S、用户输入 U、检索 R、示例 E、工具定义 T、输出预留 O 满足 S+U+R+E+T+O≤C。所有部分应使用目标 tokenizer 计量。可按任务难度动态选择示例数，预算不足时保留必要安全指令和高价值示例。"}
],
assessments:[{id:"m06-02-fewshot-design",type:"code-task",prompt:"为 8 类客服意图分类设计 few-shot 示例选择器，提交覆盖字段、相关性/覆盖/冗余评分、顺序敏感性测试和 token 预算规则。",rubric:[{criterion:"覆盖策略",description:"覆盖类别、边界和拒绝样例",points:3},{criterion:"选择机制",description:"解释相关性、覆盖和冗余权衡",points:3},{criterion:"实验预算",description:"包含顺序扰动与 tokenizer 预算",points:4}]}],
sources:[
{title:"Language Models are Few-Shot Learners",url:"https://arxiv.org/abs/2005.14165",publisher:"Brown et al., NeurIPS 2020",note:"Few-shot in-context learning"},
{title:"What Makes Good In-Context Examples for GPT-3?",url:"https://arxiv.org/abs/2101.06804",publisher:"Liu et al., 2021",note:"示例选择与相似度"},
{title:"Lost in the Middle: How Language Models Use Long Contexts",url:"https://arxiv.org/abs/2307.03172",publisher:"Liu et al., TACL 2024",note:"长上下文位置利用"}
]
},
{
id:"m06-03-structured-output",title:"第三讲：结构化输出与可验证生成",summary:"从 JSON、Schema、约束解码和业务校验构建机器可消费输出。",learningObjectives:["区分 JSON 语法、Schema 和业务语义正确","设计字段、类型、范围和枚举约束","建立解析、校验、修复与拒绝链路"],estimatedMinutes:75,
content:[
{heading:"三层正确性",body:"输出可解析不代表符合 Schema，更不代表业务事实正确。",markdown:"结构化输出有三层：语法层（能否解析 JSON）、结构层（字段、类型、枚举、必填是否符合 schema）、语义层（值是否真实、授权、一致且满足业务规则）。例如 amount=-5 是合法 JSON，但金额非负的业务约束必须拒绝。"},
{heading:"Schema 设计与演进",body:"Schema 应限制字段、类型、范围和额外字段，并明确 null、缺失和默认值语义。",markdown:"定义 required、nullable、additionalProperties、数值范围、字符串长度、数组上限和枚举。null、空字符串和字段缺失通常有不同业务语义。Schema 变更需考虑兼容性；新增可选字段通常比重命名必填字段风险低。可增加 schemaVersion。"},
{heading:"约束解码与事后校验",body:"受约束解码可降低格式错误，但仍需独立解析、类型和业务校验。",markdown:"若模型服务支持 JSON Schema constrained decoding，可限制候选 token，使输出更符合目标结构；但供应商支持的 schema 子集可能不同。推荐管线：生成 → parse → schema validate → business validate → authorization check → accept/reject。模型自称验证通过不是程序验证。"},
{heading:"修复、重试与幂等",body:"格式错误可在受控预算内修复；越权或业务错误不能靠无限重试解决。",markdown:"区分可恢复错误（JSON 截断、字段类型错误）与不可恢复错误（越权、事实缺失、业务规则冲突）。修复只发送最小必要错误信息，限制次数和 token 成本，并保存原始输出。若结果触发外部写操作，应使用幂等键、审批和事务边界。"}
],
assessments:[{id:"m06-03-schema-contract",type:"code-task",prompt:"定义退款申请 JSON Schema，并设计 parse→schema→business→authorization 校验流程；说明格式错误、业务错误和越权如何处置。",rubric:[{criterion:"Schema 完整性",description:"字段、类型、必填、范围、枚举和额外字段策略",points:4},{criterion:"校验分层",description:"区分语法、结构、语义和权限",points:3},{criterion:"失败处理",description:"重试有界、拒绝越权、写操作幂等",points:3}]}],
sources:[
{title:"JSON Schema Specification",url:"https://json-schema.org/specification",publisher:"JSON Schema",note:"结构化数据约束标准"},
{title:"Structured Outputs",url:"https://platform.openai.com/docs/guides/structured-outputs",publisher:"OpenAI",note:"Schema 约束输出接口"},
{title:"RFC 8259: The JavaScript Object Notation Data Interchange Format",url:"https://www.rfc-editor.org/rfc/rfc8259",publisher:"IETF",note:"JSON 语法标准"}
]
},
{
id:"m06-04-prompt-injection",title:"第四讲：Prompt Injection 与提示词安全",summary:"识别直接/间接注入、指令数据混淆和工具滥用。",learningObjectives:["区分直接注入与间接注入","解释指令和不可信数据混合的风险","设计非 Prompt-only 的工具权限控制"],estimatedMinutes:80,
content:[
{heading:"Prompt Injection 的根因",body:"模型把指令和数据都作为上下文 token 处理，文本标签本身不是强制信任边界。",markdown:"直接注入来自用户输入中的恶意指令；间接注入来自网页、邮件、文档、代码注释或检索片段。攻击者试图让模型忽略策略、泄露上下文或调用不应调用的工具。把文档包在 XML 标签或标注为不可信有助于表达意图，但不是安全边界。"},
{heading:"来源标记与数据隔离",body:"外部内容应作为不可信数据，保留来源并限制其影响范围。",markdown:"检索片段保留 source ID、URL、时间、权限和边界；明确内容是证据而非指令。不要把文档中的工具调用要求提升为系统命令。更重要的是架构控制：检索只读、工具 allowlist、参数 schema、服务端授权和资源访问控制。"},
{heading:"工具执行的权限边界",body:"模型提出工具调用不等于用户授权；执行前必须检查身份、资源和副作用风险。",markdown:"工具网关执行认证、授权、参数校验、资源范围限制、速率限制和审计。转账、删除、发信、权限变更等高影响动作应有二次确认或人工审批。对工具结果做数据最小化，防止秘密回显到上下文或界面。"},
{heading:"红队与纵深防御",body:"不存在单一 Prompt 补丁；需要多层控制和持续攻击测试。",markdown:"测试直接/间接注入、跨文档指令、工具参数污染、数据外带、越权读取和多轮持久化。指标包括攻击成功率、敏感数据泄露率、越权工具执行率和误拒绝率。控制包括来源治理、上下文隔离、最小权限、审批、输出过滤、监控和事故响应。"}
],
assessments:[{id:"m06-04-injection-threat-model",type:"design-review",prompt:"为可浏览网页并调用工单工具的助手绘制 Prompt Injection 威胁模型，列出五条攻击路径和对应的非 Prompt-only 控制。",rubric:[{criterion:"威胁覆盖",description:"覆盖直接/间接注入、数据外带和工具滥用",points:3},{criterion:"信任边界",description:"标记用户、网页、检索、模型和工具执行边界",points:3},{criterion:"控制有效性",description:"提供服务端授权、最小权限、审批和审计",points:4}]}],
sources:[
{title:"OWASP Top 10 for LLM Applications",url:"https://owasp.org/www-project-top-10-for-large-language-model-applications/",publisher:"OWASP",note:"LLM 应用威胁分类"},
{title:"LLM01: Prompt Injection",url:"https://genai.owasp.org/llmrisk/llm01-prompt-injection/",publisher:"OWASP GenAI Security Project",note:"直接和间接提示词注入"},
{title:"The Instruction Hierarchy: Training LLMs to Prioritize Privileged Instructions",url:"https://arxiv.org/abs/2404.13208",publisher:"Wallace et al., 2024",note:"指令层级与优先级研究"}
]
},
{
id:"m06-05-prompt-evaluation",title:"第五讲：Prompt 评测、版本管理与回归",summary:"建立分层测试集、可信评分器和提示词发布流程。",learningObjectives:["设计正常、边界和对抗测试集","比较规则、人评和 LLM-as-a-Judge","建立版本元数据、canary 和回滚门槛"],estimatedMinutes:80,
content:[
{heading:"Prompt 质量的任务指标",body:"提示词质量应按任务目标评估，不能凭单个示例或主观感觉判断。",markdown:"指标可包括分类准确率、抽取 F1、Schema 通过率、引用支持率、工具选择正确率、拒答正确率、成本和延迟。测试集覆盖常见、边界、对抗和分布外输入；冻结数据版本，避免调优过程逐渐记住测试样例。"},
{heading:"规则、人评与 LLM Judge",body:"规则适合可验证属性；人工适合复杂质量；LLM Judge 需要校准并检查偏差。",markdown:"精确匹配、schema、引用存在性和工具参数可用确定性程序评分。开放式质量可用 rubric 和双人评审。LLM Judge 可能有位置偏差、长度偏好、自偏好和提示词敏感性。应使用人工标注基准校准，交换候选顺序并报告一致率；Judge 分数不是客观真值。"},
{heading:"消融实验与错误分类",body:"一次改变一个关键变量，才能判断 Prompt 改动是否产生收益。",markdown:"对 system instruction、示例数量、检索片段顺序、输出 schema 和拒绝规则分别做消融。按理解错误、证据缺失、格式错误、工具选择错误、注入成功、过度拒绝和成本超限分类失败。分层报告避免平均分掩盖高风险子群退化。"},
{heading:"版本发布与回滚",body:"Prompt、模型、工具 schema、检索策略和评测数据共同决定行为，应组合版本化。",markdown:"每版保存 Prompt 文本、变量 schema、owner、变更理由、模型兼容范围、测试集版本、评测结果和发布日期。使用 canary 观察质量、成本和安全指标；达到门槛后扩大流量，否则回滚。Prompt 更新需重跑安全回归、schema 测试和代表性任务集。"}
],
assessments:[{id:"m06-05-prompt-release",type:"design-review",prompt:"为客服 Agent 制定 Prompt 发布流水线，包含测试集分层、规则/人工/LLM 评分、位置偏差检查、版本元数据和回滚门槛。",rubric:[{criterion:"数据与指标",description:"覆盖正常、边界、对抗输入并定义任务指标",points:3},{criterion:"评分可信度",description:"组合规则、人评与校准后的 LLM Judge",points:3},{criterion:"发布治理",description:"具备版本追踪、canary、监控和回滚门槛",points:4}]}],
sources:[
{title:"A Survey on Evaluation of Large Language Models",url:"https://arxiv.org/abs/2307.03109",publisher:"Chang et al., 2023",note:"LLM 评测方法综述"},
{title:"Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena",url:"https://arxiv.org/abs/2306.05685",publisher:"Zheng et al., NeurIPS 2023",note:"LLM Judge 及其偏差"},
{title:"PromptBench: Towards Evaluating the Robustness of Large Language Models on Adversarial Prompts",url:"https://arxiv.org/abs/2306.04528",publisher:"Zhu et al., 2023",note:"对抗提示词鲁棒性评测"}
]
}
];
