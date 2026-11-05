import type { Course } from "../types/course";

/** M11 — planning, memory and state management for agents. */
export const flagshipM11Lessons: Course["modules"][number]["lessons"] = [
{id:"m11-01-task-planning",title:"第一讲：任务分解与计划表示",summary:"把自然语言目标转换为可检查的任务图。",learningObjectives:["区分目标、子任务、依赖和验收条件","比较线性计划、DAG 和动态重规划","识别计划幻觉和不可执行步骤"],estimatedMinutes:75,content:[
{heading:"目标规格化",body:"计划质量取决于目标是否可观察、可验证并包含非目标。",markdown:"把“完成供应商尽调”拆成主体确认、资料收集、风险筛查、证据核对和报告生成。每个子任务定义输入、输出、依赖、完成条件和失败分支。没有验收条件的子任务无法可靠判断完成。"},
{heading:"线性计划与 DAG",body:"线性计划简单但串行；DAG 显示并行任务和依赖关系。",markdown:"若任务 A、B 独立，C 依赖二者，则 A 与 B 可并行，C 等待两者完成。DAG 需要检测环、不可达节点和资源冲突。计划执行器只调度依赖满足的节点。"},
{heading:"计划生成与验证",body:"模型生成的计划必须经过工具可用性、权限、前置条件和成本验证。",markdown:"验证每步是否存在对应工具、输入是否可获得、权限是否满足、是否有不可逆副作用以及是否超预算。计划应携带 evidence requirement 和 rollback strategy。模型提出的“已完成”不能替代外部状态查询。"},
{heading:"动态重规划",body:"观察变化、工具失败或新证据可能要求更新计划。",markdown:"重规划时保留已确认完成节点，标记失效节点和原因，并重新计算依赖。禁止悄悄丢弃未完成目标；保存 plan_version 和变更差异，避免重复执行已提交副作用。"},
{heading:"复现练习：将供应商尽调目标编译成任务 DAG",body:"把目标、子任务、依赖和完成条件写成可执行计划契约。",markdown:"目标拆为主体确认、资料收集、制裁筛查、财务核验、证据交叉验证和报告生成。资料收集与制裁筛查可并行；综合风险判断依赖前述结果。每个节点声明输入、输出、工具、权限、完成条件和失败分支。\\n\\n检查 DAG 是否有环、缺失依赖、不可达节点和资源冲突。若工具不存在或权限不足，计划应在执行前失败或请求授权。提交至少 8 个节点的 DAG、节点契约和一次动态重规划差异。"}
],assessments:[{id:"m11-01-plan-dag",type:"design-review",prompt:"把供应商尽调任务建模为 DAG，至少 8 个节点，标出并行路径、依赖、完成条件和重规划规则。",rubric:[{criterion:"分解质量",description:"目标拆分完整且每步有输入输出",points:3},{criterion:"依赖建模",description:"DAG 无环且并行关系正确",points:3},{criterion:"验证恢复",description:"包含权限、前置条件和重规划策略",points:4}]}],sources:[
{title:"Tree of Thoughts: Deliberate Problem Solving with Large Language Models",url:"https://arxiv.org/abs/2305.10601",publisher:"Yao et al., NeurIPS 2023",note:"搜索式推理和候选路径评估"},
{title:"LLMCompiler: An LLM Compiler for Parallel Function Calling",url:"https://arxiv.org/abs/2312.04511",publisher:"Kim et al., 2023",note:"任务 DAG 与并行执行"},
{title:"Plan-and-Solve Prompting",url:"https://arxiv.org/abs/2305.04091",publisher:"Wang et al., 2023",note:"先规划后求解"}
]},
{id:"m11-02-memory-types",title:"第二讲：Memory 类型与存储边界",summary:"区分工作记忆、会话状态、长期记忆和外部知识库。",learningObjectives:["区分 context、state、memory 与 knowledge base","设计记忆写入和读取条件","分析遗忘、过期和敏感信息风险"],estimatedMinutes:75,content:[
{heading:"四种不同的记忆对象",body:"上下文是当前模型输入，状态是任务当前值，记忆是跨步骤保留的信息，知识库是可检索的外部资料。",markdown:"Context 随请求传入；State 支撑状态机转移；Memory 保存对未来任务有用的经验或偏好；Knowledge Base 保存来源可追溯的文档。把四者混为一谈会导致过期数据、隐私泄露和不可控上下文增长。"},
{heading:"短期与长期记忆",body:"短期记忆服务于当前任务；长期记忆应经过筛选、来源和生命周期治理。",markdown:"短期状态可以存当前计划、最近工具结果和待确认字段；长期记忆适合保存稳定偏好、已验证项目约束和可复用事实。长期记忆写入需要来源、置信度、时间戳、适用范围和删除策略。"},
{heading:"读写策略",body:"记忆读取应按相关性、时效和权限过滤；写入应避免把模型猜测固化为事实。",markdown:"写入门槛可要求显式用户确认、可信工具来源或多次稳定观察。读取时检查 owner/tenant、TTL、版本和敏感级别。冲突记忆需保留来源并请求确认，不能简单覆盖。"},
{heading:"遗忘、修正与删除",body:"记忆系统需要 TTL、过期、撤回和可审计删除传播。",markdown:"为记忆定义 created_at、last_verified_at、expires_at、source_ref 和 retention class。用户更正应标记旧事实失效并更新下游索引/缓存。删除必须覆盖主存储、检索索引、派生摘要和备份策略所允许的范围，并说明无法即时清除的副本。"},
{heading:"复现练习：制定 Agent Memory 写入与读取策略",body:"区分当前上下文、任务状态、长期记忆和可追溯知识库。",markdown:"以研究 Agent 为例：当前问题和最近工具观察属于 context；当前计划和待办属于 state；用户明确确认的稳定格式偏好可成为 memory；论文原文和机构资料应保存在带来源的 knowledge base。\\n\\n每条长期记忆记录 owner、source_ref、created_at、last_verified_at、expires_at、sensitivity 和 confidence。写入前检查来源与稳定性；读取时执行权限、时效和相关性过滤。提交分类表、写入门槛、冲突处理和过期策略。"}
],assessments:[{id:"m11-02-memory-policy",type:"design-review",prompt:"为个人研究 Agent 设计短期状态与长期记忆策略，定义写入门槛、来源、TTL、冲突解决和删除传播。",rubric:[{criterion:"类型边界",description:"区分上下文、状态、记忆和知识库",points:3},{criterion:"生命周期",description:"定义写入、读取、验证、TTL 和冲突",points:4},{criterion:"隐私删除",description:"覆盖敏感信息、删除和派生索引",points:3}]}],sources:[
{title:"Generative Agents: Interactive Simulacra of Human Behavior",url:"https://arxiv.org/abs/2304.03442",publisher:"Park et al., UIST 2023",note:"记忆流、反思和计划"},
{title:"MemGPT: Towards LLMs as Operating Systems",url:"https://arxiv.org/abs/2310.08560",publisher:"Packer et al., 2023",note:"分层上下文与记忆管理"},
{title:"Mem0: Building Production-Ready AI Agents with Scalable Long-Term Memory",url:"https://arxiv.org/abs/2504.19413",publisher:"Chhikara et al., 2025",note:"长期记忆工程研究"}
]},
{id:"m11-03-retrieval-and-consolidation",title:"第三讲：记忆检索、摘要与巩固",summary:"控制记忆增长并保持可追溯、可纠错的长期上下文。",learningObjectives:["设计语义/关键词/时间检索策略","解释记忆摘要的信息损失","建立记忆合并与冲突检测"],estimatedMinutes:75,content:[
{heading:"记忆检索策略",body:"记忆召回需结合语义相关性、实体、时间和任务状态。",markdown:"可采用 hybrid retrieval：语义向量找近义内容，关键词精确匹配 ID/名称，时间过滤保证时效，再按权限过滤。检索结果必须带 source_ref 和时间，不要只返回无来源摘要。"},
{heading:"摘要与压缩",body:"摘要减少 token 消耗，但会丢失细节、限定条件和不确定性。",markdown:"摘要应保留事实、条件、例外、来源和未解决问题。对金额、日期、版本、否定和责任主体等关键字段采用结构化保留，而不是只生成自然语言摘要。原始记录保留可回溯引用。"},
{heading:"记忆巩固与冲突",body:"重复观察可合并，但冲突信息必须保留来源和时间。",markdown:"记忆巩固可合并重复项、提升稳定事实、淘汰过期内容。冲突检测比较实体、属性、时间和来源可信度。不能仅按最新写入覆盖，因为较新的信息可能是低可信推断。"},
{heading:"检索质量评估",body:"记忆系统要评估正确召回、过期召回、无关召回和遗漏。",markdown:"构造 query→gold memory 集，评估 Recall@k、MRR、stale recall rate、source attribution 和 token cost。还要测试相似用户/租户数据隔离，防止跨主体召回。"},
{heading:"复现练习：设计记忆检索、摘要与冲突解决",body:"用可验证证据控制记忆召回，不让摘要把推测固化为事实。",markdown:"准备 20 条记忆，其中包含重复事实、过期偏好、来源冲突和一条用户更正。检索时按 owner/tenant 和敏感级别过滤，再按相关性与时效排序。摘要必须保留 source_ref 和时间，不得把“曾经发生”改写成“当前仍然成立”。\\n\\n对冲突事实并列来源并请求确认；更正后将旧记录标记 superseded，并更新索引与缓存。提交检索结果、摘要前后对照、冲突决策表和删除传播范围。"}
],assessments:[{id:"m11-03-memory-retrieval",type:"code-task",prompt:"为项目记忆设计 hybrid retrieval 与冲突检测流程，定义 5 个字段、检索排序和 stale memory 评测指标。",rubric:[{criterion:"检索设计",description:"融合语义、关键词、时间和权限",points:3},{criterion:"压缩巩固",description:"保留条件、来源并检测冲突",points:3},{criterion:"评测",description:"定义 Recall、过期率、归因和隔离测试",points:4}]}],sources:[
{title:"MemGPT: Towards LLMs as Operating Systems",url:"https://arxiv.org/abs/2310.08560",publisher:"Packer et al., 2023",note:"分层记忆检索"},
{title:"Lost in the Middle: How Language Models Use Long Contexts",url:"https://arxiv.org/abs/2307.03172",publisher:"Liu et al., TACL 2024",note:"上下文有效利用"},
{title:"RAGAS: Automated Evaluation of Retrieval Augmented Generation",url:"https://arxiv.org/abs/2309.15217",publisher:"Es et al., 2023",note:"检索增强质量评测"}
]},
{id:"m11-04-human-feedback-state",title:"第四讲：人类反馈、审批与持久化状态",summary:"把人类决策纳入计划更新和记忆生命周期。",learningObjectives:["设计 human-in-the-loop 状态","绑定审批对象与参数摘要","处理用户更正和任务恢复"],estimatedMinutes:75,content:[
{heading:"Human-in-the-loop 的触发条件",body:"高风险、低证据、权限不明或模型分歧时应暂停并请求人类决策。",markdown:"触发规则可基于风险等级、置信证据、动作可逆性、数据敏感级别和业务阈值。人工介入不是装饰性确认，而是状态机中的显式等待状态。"},
{heading:"审批对象绑定",body:"审批必须绑定具体主体、资源、操作和规范化参数，避免审批后参数被替换。",markdown:"审批记录包含 approver、principal、resource、operation、normalized_args_hash、risk summary、expires_at 和 nonce。执行前重新计算参数摘要；不一致则要求重新审批。"},
{heading:"状态持久化与恢复",body:"任务暂停后恢复时必须检查状态版本、权限、外部副作用和期限。",markdown:"保存 checkpoint、pending approval、tool call references、plan version 和 deadline。恢复后重新验证用户身份和授权；若外部动作状态未知，先查询幂等记录或业务状态，不盲目重放。"},
{heading:"反馈进入记忆的门槛",body:"用户纠正可更新当前任务状态，但长期记忆写入应按敏感性和稳定性单独判断。",markdown:"将一次性更正用于当前任务，不自动推断为长期偏好。对稳定偏好可询问是否保存；对敏感或高风险信息不应未经明确同意持久化。记忆更新保留来源、时间和撤回路径。"},
{heading:"复现练习：把 Human Approval 建模为可恢复状态",body:"审批必须绑定主体、资源、操作和参数摘要，恢复时重新校验。",markdown:"状态流：awaiting_approval → approved/rejected/expired/cancelled → executing。审批对象包含 approver、principal、resource、operation、normalized_args_hash、expires_at 和 nonce。若审批后金额或目标资源变化，参数摘要不匹配，必须重新审批。\\n\\n任务暂停后恢复时重新检查用户身份、权限、期限和外部副作用状态。用户一次性纠正只用于当前任务，不自动写成长期记忆。提交状态机、审批数据结构和过期/撤权测试。"}
],assessments:[{id:"m11-04-approval-state",type:"design-review",prompt:"设计一个采购审批 Agent 的等待/批准/拒绝状态机，定义审批参数绑定、过期、恢复复核和反馈记忆规则。",rubric:[{criterion:"HITL 状态",description:"定义触发条件和审批状态转移",points:3},{criterion:"防篡改",description:"审批绑定主体、资源和参数摘要",points:4},{criterion:"恢复与记忆",description:"恢复时复核权限且不擅自持久化敏感信息",points:3}]}],sources:[
{title:"Human-in-the-Loop Machine Learning",url:"https://www.manning.com/books/human-in-the-loop-machine-learning",publisher:"Robert Munro, Manning",note:"人机协作数据与决策"},
{title:"NIST AI Risk Management Framework",url:"https://www.nist.gov/itl/ai-risk-management-framework",publisher:"NIST",note:"人工监督与风险治理"},
{title:"Temporal Workflows",url:"https://docs.temporal.io/workflows",publisher:"Temporal",note:"持久化等待和恢复"}
]},
{id:"m11-05-planning-memory-evaluation",title:"第五讲：Planning 与 Memory 综合评测",summary:"评估计划质量、记忆可靠性、恢复能力和资源成本。",learningObjectives:["构建规划与记忆基准任务","定义计划执行和记忆召回指标","设计错误注入与人工复核"],estimatedMinutes:80,content:[
{heading:"计划质量指标",body:"计划需要评估可执行性、依赖正确性、覆盖率和重规划效率。",markdown:"指标可包括 goal coverage、dependency validity、tool feasibility、plan edit distance、completion rate 和 wasted actions。计划看起来合理不等于可执行。"},
{heading:"记忆质量指标",body:"记忆系统既要找回正确内容，也要避免陈旧、错误和越权召回。",markdown:"评估 Recall@k、precision、stale recall、contradiction rate、source attribution 和 deletion propagation。对记忆写入也评估 false memory rate 与 unsupported inference rate。"},
{heading:"端到端基准与故障注入",body:"测试计划错误、工具超时、记忆冲突、用户更正和任务恢复。",markdown:"每个 benchmark 固定初始状态、权限、工具行为和预期终态。注入过期 checkpoint、记忆冲突、撤权和部分副作用，检查 Agent 是否安全暂停或恢复。"},
{heading:"发布门槛与持续改进",body:"计划器或记忆策略变更需要离线回归和线上监控。",markdown:"保存模型、Prompt、memory schema、retriever、数据快照和运行时版本。设定最低任务完成率、最大 stale recall、零严重越权和 token 成本阈值；出现回归时回滚到已验证版本。"},
{heading:"复现练习：建立 Planning 与 Memory 的独立评测",body:"分别测量计划可执行性、记忆召回质量、陈旧记忆和删除传播。",markdown:"计划指标包括 goal coverage、dependency validity、tool feasibility、completion rate 和 wasted actions；记忆指标包括 Recall@k、precision、stale recall、contradiction rate、source attribution、false memory rate 和 deletion propagation。不要用单一任务成功率掩盖记忆系统错误。\\n\\n固定初始状态和权限，注入过期 checkpoint、记忆冲突、用户更正、撤权和删除请求。提交基准数据结构、指标定义、故障注入和发布门槛。"}
],assessments:[{id:"m11-05-memory-capstone",type:"design-review",prompt:"为长期运行的研究 Agent 设计规划/记忆评测基准，提交数据集结构、指标、四类故障注入和发布门槛。",rubric:[{criterion:"基准任务",description:"覆盖计划执行、记忆读写和更正",points:3},{criterion:"指标体系",description:"计划质量和记忆质量指标分离",points:3},{criterion:"安全恢复",description:"覆盖撤权、冲突、删除和恢复",points:4}]}],sources:[
{title:"AgentBench: Evaluating LLMs as Agents",url:"https://arxiv.org/abs/2308.03688",publisher:"Liu et al., ICLR 2024",note:"Agent 任务评测"},
{title:"τ-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains",url:"https://arxiv.org/abs/2406.12045",publisher:"Yao et al., 2024",note:"工具与用户交互基准"},
{title:"Mem0: Building Production-Ready AI Agents with Scalable Long-Term Memory",url:"https://arxiv.org/abs/2504.19413",publisher:"Chhikara et al., 2025",note:"长期记忆评估与实现"}
]}
];
