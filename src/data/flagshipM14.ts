import type { Course } from "../types/course";

/** M14 — multi-agent collaboration, coordination and evaluation. */
export const flagshipM14Lessons: Course["modules"][number]["lessons"] = [
{id:"m14-01-multiagent-patterns",title:"第一讲：Multi-Agent 协作模型与适用边界",summary:"比较 Manager、分层、群组和流水线协作拓扑。",learningObjectives:["比较单 Agent 与多 Agent 的成本/收益","识别常见协作拓扑","判断何时不应采用 Multi-Agent"],estimatedMinutes:70,content:[
{heading:"多 Agent 不等于更聪明",body:"多 Agent 增加并行视角，也引入通信、协调、冲突和成本。",markdown:"将任务拆分给多个角色只有在子任务相对独立、输出可验证且协调成本可控时才有收益。多个 Agent 可能共享同一模型偏差，重复搜索或互相强化错误。先建立单 Agent baseline，再证明多 Agent 带来可测量增益。"},
{heading:"Manager/Worker 拓扑",body:"Manager 负责分解、分派和综合，Worker 在受限领域完成子任务。",markdown:"Manager-worker 适合可分解任务；层级结构可管理大量子任务，但层级越深，错误传播和延迟越大。Manager 不应仅凭 Worker 自评判定完成，应检查证据和验收结果。"},
{heading:"Peer 与流水线拓扑",body:"Peer-to-peer 允许 Agent 协商；流水线按阶段传递结构化结果。",markdown:"Peer 协作适合多视角讨论，但可能出现循环辩论和冲突；流水线易审计但上游错误会传递到下游。选择拓扑时明确权威来源、冲突仲裁者和终止条件。"},
{heading:"采用多 Agent 的判据",body:"只有当并行化、专业化或独立验证收益超过通信与协调成本时才采用。",markdown:"评估任务可分解性、子任务耦合、独立工具权限、延迟预算、成本上限和错误恢复。若任务短小、强顺序依赖或共享状态频繁，多 Agent 往往不如单 Agent/workflow。"}],assessments:[{id:"m14-01-topology-choice",type:"design-review",prompt:"对市场研究、代码审查和订单退款三个任务分别选择单 Agent、Manager/Worker、Peer 或流水线，并解释成本与风险。",rubric:[{criterion:"拓扑理解",description:"正确比较至少三种拓扑",points:3},{criterion:"任务匹配",description:"基于依赖、并行性和独立验证做选择",points:4},{criterion:"成本风险",description:"考虑通信、延迟、冲突和终止",points:3}]}],sources:[
{title:"AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation",url:"https://arxiv.org/abs/2308.08155",publisher:"Wu et al., 2023",note:"多 Agent 对话框架"},
{title:"CAMEL: Communicative Agents for Mind Exploration of Large Scale",url:"https://arxiv.org/abs/2303.17760",publisher:"Li et al., 2023",note:"角色协作和通信"},
{title:"MetaGPT: Meta Programming for A Multi-Agent Collaborative Framework",url:"https://arxiv.org/abs/2308.00352",publisher:"Hong et al., ICLR 2024",note:"软件团队式 Agent 协作"}
]},
{id:"m14-02-task-routing-protocol",title:"第二讲：专家分工、任务路由与消息协议",summary:"设计 Agent 角色、任务合同和结构化消息。",learningObjectives:["定义 Agent 角色与能力边界","设计任务消息和结果 schema","建立路由和重新分派策略"],estimatedMinutes:75,content:[
{heading:"角色与能力目录",body:"角色定义应声明专业范围、可用工具、权限和交付物。",markdown:"Agent registry 可包含 agent_id、role、capabilities、tools、scopes、model/version、budget 和 owner。角色不能只是人格描述；必须与可验证能力和授权关联。"},
{heading:"任务消息协议",body:"结构化消息减少自由文本歧义并支持审计。",markdown:"Task message 可包含 task_id、parent_id、sender、recipient、goal、inputs、constraints、deadline、budget 和 acceptance_criteria。Result 包含 status、artifacts、evidence_refs、confidence 和 unresolved_items。"},
{heading:"路由与负载分配",body:"路由根据任务类型、能力、权限、负载和成本选择 Agent。",markdown:"可采用规则路由或模型分类器，但最终执行仍需权限检查。负载均衡可按队列长度、估计 token、历史延迟和失败率分配。高风险任务不应仅由成本最低 Agent 承担。"},
{heading:"重试、重新分派与重复任务",body:"重新分派必须处理任务幂等、结果版本和已完成副作用。",markdown:"为任务设置稳定 task_id 和 attempt_id；重新分派时检查上次执行状态。对只读任务可重试；对写操作必须使用幂等键或人工核对。结果冲突时保留多个版本供仲裁。"}],assessments:[{id:"m14-02-agent-protocol",type:"code-task",prompt:"设计研究 Agent 团队的 Task/Result JSON 契约和路由规则，包含 deadline、budget、evidence_refs 和重新分派策略。",rubric:[{criterion:"角色目录",description:"能力、工具、权限和预算明确",points:2},{criterion:"消息协议",description:"任务与结果字段支持追踪和验收",points:4},{criterion:"路由恢复",description:"考虑负载、权限、幂等和结果冲突",points:4}]}],sources:[
{title:"AutoGen Documentation",url:"https://microsoft.github.io/autogen/stable/",publisher:"Microsoft",note:"Agent 消息与协作"},
{title:"A2A Protocol",url:"https://a2a-protocol.org/latest/",publisher:"Linux Foundation",note:"Agent-to-Agent 互操作协议"},
{title:"Google Agent Development Kit",url:"https://google.github.io/adk-docs/",publisher:"Google",note:"Agent 路由和编排"}
]},
{id:"m14-03-shared-state-coordination",title:"第三讲：共享状态、一致性与冲突协调",summary:"控制共享记忆、并发写入和多方结果冲突。",learningObjectives:["比较共享状态与消息传递","识别竞态和死锁条件","设计冲突检测与仲裁机制"],estimatedMinutes:80,content:[
{heading:"共享状态与消息传递",body:"共享状态便于协作但扩大耦合；消息传递更易隔离但需要显式同步。",markdown:"共享黑板可保存任务事实、证据和状态；消息传递通过事件交换信息。共享写入需版本控制和并发策略；消息系统需处理重复、乱序和丢失。"},
{heading:"并发与竞态",body:"多个 Agent 同时修改同一任务对象可能覆盖更新或形成不一致。",markdown:"使用 optimistic concurrency：更新时带 expected_version；版本不匹配则拒绝并重新读取。对集合更新使用原子操作或事务。事件消费者通过 event_id 去重，避免重复应用。"},
{heading:"死锁与活锁",body:"循环等待资源会形成死锁，持续重试但不推进会形成活锁。",markdown:"死锁可由资源等待环导致；避免方式包括统一锁顺序、超时、租约和减少共享锁。活锁可通过重试退避、进度检测和最大轮数控制。Agent 对话轮数上限不能替代依赖图分析。"},
{heading:"冲突检测与仲裁",body:"不同 Agent 的事实或建议冲突时，必须依据证据和权威来源仲裁。",markdown:"将冲突拆为事实冲突、解释分歧和策略冲突。比较来源权威、时间、直接性和可复核性；保留反对意见和证据链接。无法解决时上报人工，不应由 Manager 随意投票决定事实。"}],assessments:[{id:"m14-03-coordination",type:"design-review",prompt:"设计共享研究黑板的数据模型，说明并发版本、事件去重、死锁预防和冲突仲裁规则。",rubric:[{criterion:"一致性",description:"定义版本控制和原子更新",points:3},{criterion:"并发安全",description:"处理重复事件、死锁或活锁",points:3},{criterion:"冲突仲裁",description:"按来源证据而非简单多数票解决",points:4}]}],sources:[
{title:"The Chandy-Lamport Algorithm for Distributed Snapshots",url:"https://lamport.azurewebsites.net/pubs/chandy.pdf",publisher:"Chandy and Lamport, 1985",note:"分布式状态快照"},
{title:"Designing Data-Intensive Applications",url:"https://dataintensive.net/",publisher:"Martin Kleppmann, O'Reilly",note:"一致性、复制和消息处理"},
{title:"A2A Protocol",url:"https://a2a-protocol.org/latest/",publisher:"Linux Foundation",note:"Agent 消息互操作"}
]},
{id:"m14-04-debate-verification",title:"第四讲：协作讨论、独立验证与结果综合",summary:"避免多 Agent 共识幻觉，使用独立证据验证。",learningObjectives:["区分辩论、投票和独立验证","设计证据驱动的综合流程","评估相关错误与模型同质性"],estimatedMinutes:75,content:[
{heading:"多 Agent 共识的局限",body:"多个 Agent 可能共享模型、数据和提示偏差，意见一致不等于独立证据。",markdown:"若 Agent 使用相同模型和相同上下文，错误高度相关；简单多数票不能降低共同偏差。独立验证应使用不同证据源、工具或检查器，并明确其独立性程度。"},
{heading:"辩论与批判角色",body:"批判 Agent 可寻找反例和遗漏，但必须要求可核验依据。",markdown:"采用 proposal → critique → revision → verification 流程。批判输出标记 claim、evidence、counterexample 和 severity。不能把无证据的反对意见当成事实。"},
{heading:"综合与证据账本",body:"Manager 综合结果时应保留来源、冲突、置信边界和未解决项。",markdown:"建立 claim ledger：claim_id、claim、supporting_refs、contradicting_refs、status、reviewer 和 timestamp。最终报告只把已核验声明写成事实；推断和建议单独标记。"},
{heading:"独立验证与停止",body:"关键结论应由外部测试、数据库约束或权威来源验证。",markdown:"对代码由测试/静态分析验证；对财务由账本核对；对文档事实由原文定位。停止条件包括证据充分、边际收益低、预算耗尽或需要人工裁决。"}],assessments:[{id:"m14-04-evidence-synthesis",type:"design-review",prompt:"设计一个多 Agent 技术尽调流程，包含 proposal、critique、独立验证、claim ledger 和冲突上报。",rubric:[{criterion:"流程",description:"阶段和角色职责清晰",points:3},{criterion:"证据账本",description:"声明与支持/反对来源可追溯",points:4},{criterion:"停止仲裁",description:"定义证据门槛和人工裁决",points:3}]}],sources:[
{title:"Debate Helps Weak-to-Strong Generalization",url:"https://arxiv.org/abs/2407.04622",publisher:"Irving et al., 2024",note:"模型辩论与监督研究"},
{title:"Improving Factuality and Reasoning in Language Models through Multiagent Debate",url:"https://arxiv.org/abs/2305.14325",publisher:"Du et al., 2023",note:"多 Agent 辩论实验"},
{title:"Chain-of-Verification Reduces Hallucination in Large Language Models",url:"https://arxiv.org/abs/2309.11495",publisher:"Dhuliawala et al., 2023",note:"分解声明并独立验证"}
]},
{id:"m14-05-multiagent-evaluation-cost",title:"第五讲：Multi-Agent 评测、成本与可靠性",summary:"用同任务 baseline 证明协作系统的净收益。",learningObjectives:["设计单 Agent 对照实验","计算多 Agent token 与延迟成本","评估协作失败和安全边界"],estimatedMinutes:80,content:[
{heading:"单 Agent Baseline",body:"多 Agent 方案必须与同预算或同质量目标的单 Agent 方案对照。",markdown:"固定任务集、模型版本、工具、预算和验收标准，比较 task success、事实支持率、工具正确率、延迟和成本。若多 Agent 只提高输出长度而不提高任务成功，不构成收益。"},
{heading:"成本与延迟模型",body:"总成本包括各 Agent 输入/输出 token、工具调用、协调轮次和重复工作。",markdown:"C_total=Σᵢ(input_tokensᵢ×price_in+output_tokensᵢ×price_out)+tool_cost。并行执行的 wall time 近似受最长分支和协调阶段影响；串行链路则累加。重试和辩论轮次必须计入。"},
{heading:"协作可靠性指标",body:"测量任务成功、冲突率、重复劳动、死锁、权限违规和人工接管。",markdown:"指标包括 success rate、handoff failure、duplicate work、conflict resolution rate、deadlock/timeout rate、tool violation、P95 latency 和 cost per success。按任务难度分层，避免平均值掩盖退化。"},
{heading:"上线门槛",body:"多 Agent 上线需要证明净收益并建立预算、终止和审计机制。",markdown:"定义每任务最大 Agent 数、最大轮次、token/tool budget、deadline 和停止条件。保留 trace、消息和 claim ledger；对严重越权设零容忍门槛。未证明收益时优先使用更简单的 workflow。"}],assessments:[{id:"m14-05-multiagent-benchmark",type:"design-review",prompt:"设计单 Agent 与 4-Agent 研究团队的对照 benchmark，计算成本/成功任务并定义延迟、冲突和安全门槛。",rubric:[{criterion:"对照公平",description:"任务集、模型/工具和预算基线明确",points:3},{criterion:"成本分析",description:"计入所有 Agent、重试和工具成本",points:3},{criterion:"可靠性",description:"包含冲突、死锁、权限和人工接管指标",points:4}]}],sources:[
{title:"AgentBench: Evaluating LLMs as Agents",url:"https://arxiv.org/abs/2308.03688",publisher:"Liu et al., ICLR 2024",note:"Agent 任务评测"},
{title:"SWE-bench: Can Language Models Resolve Real-World GitHub Issues?",url:"https://arxiv.org/abs/2310.06770",publisher:"Jimenez et al., ICLR 2024",note:"软件工程 Agent 真实任务评测"},
{title:"τ-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains",url:"https://arxiv.org/abs/2406.12045",publisher:"Yao et al., 2024",note:"Agent 工具交互与状态一致性"}
]}
];
