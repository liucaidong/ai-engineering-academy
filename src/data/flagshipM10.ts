import type { Course } from "../types/course";

/** M10 — agent fundamentals and runtime architecture. */
export const flagshipM10Lessons: Course["modules"][number]["lessons"] = [
{id:"m10-01-agent-model",title:"第一讲：Agent 基本模型与自主性边界",summary:"定义 Agent、环境、目标、观察、行动和终止条件。",learningObjectives:["区分 LLM 应用、workflow 与 Agent","建立 observation/action/state 模型","定义自主性和人工监督边界"],estimatedMinutes:70,content:[
{heading:"Agent 的工程定义",body:"Agent 在目标和约束下观察环境、选择行动并根据反馈迭代。",markdown:"可将 Agent 抽象为 (S,A,O,T,R)：状态 S、行动 A、观察 O、转移 T、奖励/目标 R。LLM 可承担部分决策，但环境状态、工具执行和权限由运行时系统管理。单次模型调用或固定 Prompt 并不自动构成 Agent。"},
{heading:"Agent、Workflow 与普通应用",body:"Workflow 的控制流通常预先定义；Agent 在运行时根据观察选择下一步行动。",markdown:"确定性 workflow 适合步骤明确、审计要求高的流程；Agent 适合输入不完整、需要动态选择工具或迭代探索的任务。生产系统常采用混合方式：外层确定性状态机约束，内层模型在有限动作集合中决策。"},
{heading:"自主性等级与权限边界",body:"自主性应按行动影响、可逆性和失败成本分级，而不是简单追求完全自主。",markdown:"可将动作分为只读、可逆写入、高影响写入和不可逆操作。只读可自动执行；低风险写入可按策略执行；高影响操作需要审批；不可逆操作需要强制确认或禁止。权限必须由服务端实施。"},
{heading:"目标、约束和停止条件",body:"Agent 必须有可验证的完成条件、预算上限和停止策略。",markdown:"目标应转为验收条件，如工单状态变更且审计记录存在。停止条件包括成功、不可恢复错误、预算耗尽、超时、用户取消和人工接管。没有停止条件的 Agent 可能陷入循环、重复调用工具或无限消耗 token。"}],assessments:[{id:"m10-01-agent-boundary",type:"design-review",prompt:"将一个差旅报销助手拆分为 workflow 与 Agent 决策部分，定义状态、动作、观察、权限等级和停止条件。",rubric:[{criterion:"系统抽象",description:"明确状态、观察、动作和环境反馈",points:3},{criterion:"控制流取舍",description:"区分确定性步骤和模型决策步骤",points:3},{criterion:"权限终止",description:"定义动作分级、预算和停止条件",points:4}]}],sources:[
{title:"ReAct: Synergizing Reasoning and Acting in Language Models",url:"https://arxiv.org/abs/2210.03629",publisher:"Yao et al., ICLR 2023",note:"推理与行动交替模式"},
{title:"Generative Agents: Interactive Simulacra of Human Behavior",url:"https://arxiv.org/abs/2304.03442",publisher:"Park et al., UIST 2023",note:"记忆、计划与反思 Agent"},
{title:"AgentBench: Evaluating LLMs as Agents",url:"https://arxiv.org/abs/2308.03688",publisher:"Liu et al., ICLR 2024",note:"Agent 环境与任务评测"}
]},
{id:"m10-02-agent-loop",title:"第二讲：Planning、Execution 与 Observation 循环",summary:"构建受限 Agent loop，理解 ReAct、计划执行和观察反馈。",learningObjectives:["描述 plan/act/observe 循环","设计动作 schema 和观察摘要","识别循环、重复和错误传播"],estimatedMinutes:75,content:[
{heading:"循环的最小结构",body:"Agent loop 将模型决策、工具执行和环境反馈连接起来。",markdown:"循环：构造上下文 → 选择动作 → 校验动作 → 执行 → 收集观察 → 更新状态 → 判断终止。每轮应记录 step_id、action、tool_call_id、输入摘要、结果、耗时和预算变化。"},
{heading:"ReAct 与显式计划",body:"ReAct 交替产生推理线索与行动；显式计划把复杂目标拆为可检查子任务。",markdown:"计划可以表示为 DAG：节点为任务，边为依赖。每个节点定义输入、输出、完成条件和失败策略。计划不是事实，执行后必须根据工具观察更新；计划偏离时记录原因。"},
{heading:"观察与状态压缩",body:"工具返回可能很长或包含噪声，运行时需提取与下一步决策相关的信息。",markdown:"观察摘要应保留事实、来源、错误码、时间和关键 ID，避免把全部日志注入上下文。摘要不能改变工具结果的含义；必要时保留原始结果引用供审计。"},
{heading:"循环检测与预算",body:"步数、token、工具次数和墙钟时间预算共同限制 Agent 资源消耗。",markdown:"可设置 max_steps、max_tool_calls、max_tokens、deadline 和 per-tool timeout。循环检测可基于重复状态 hash、重复动作签名或无进展计数。预算耗尽时返回 partial result 和原因，不伪装为任务完成。"}],assessments:[{id:"m10-02-agent-loop",type:"code-task",prompt:"为“查找订单并判断是否符合退款条件”设计 Agent loop 伪代码，包含状态更新、重复动作检测、超时和停止条件。",rubric:[{criterion:"循环结构",description:"包含决策、校验、执行、观察和状态更新",points:4},{criterion:"计划状态",description:"计划节点具有依赖和完成条件",points:2},{criterion:"资源控制",description:"实现步数、调用次数、超时和循环检测",points:4}]}],sources:[
{title:"ReAct: Synergizing Reasoning and Acting in Language Models",url:"https://arxiv.org/abs/2210.03629",publisher:"Yao et al., 2023",note:"推理行动循环"},
{title:"LLMCompiler: An LLM Compiler for Parallel Function Calling",url:"https://arxiv.org/abs/2312.04511",publisher:"Kim et al., 2023",note:"任务 DAG 与并行工具执行"},
{title:"LangGraph Documentation",url:"https://docs.langchain.com/oss/python/langgraph/overview",publisher:"LangChain",note:"状态图与 Agent runtime"}
]},
{id:"m10-03-runtime-state-machine",title:"第三讲：Runtime 状态机与执行调度",summary:"把 Agent 执行建模为可恢复、可审计的状态机。",learningObjectives:["定义状态、事件和合法转移","区分同步、异步和并行工具执行","设计 checkpoint 与恢复策略"],estimatedMinutes:80,content:[
{heading:"状态机建模",body:"显式状态机避免 Agent 运行状态散落在 Prompt 和临时变量中。",markdown:"状态示例：created、planning、awaiting_approval、executing、observing、completed、failed、cancelled。事件包括 plan_ready、tool_succeeded、tool_failed、approval_granted 和 deadline_exceeded。每个转移定义守卫条件和副作用。"},
{heading:"并行执行与依赖",body:"独立任务可并行执行，有依赖的任务必须等待前置结果。",markdown:"将计划表示为有向无环图，只有所有前置节点完成后才能调度节点。并行执行需设置并发上限、取消传播和结果合并策略；共享可变状态应避免无锁并发写。"},
{heading:"Checkpoint 与恢复",body:"Checkpoint 保存足以恢复任务的状态快照，但不应盲目保存秘密或超大工具数据。",markdown:"保存 workflow version、state version、completed step IDs、pending actions、tool call references、budget、deadline 和 event cursor。恢复时校验工具版本、用户权限和外部副作用状态，不能简单重放所有动作。"},
{heading:"持久化与一致性",body:"运行时状态与工具副作用之间需要一致性策略。",markdown:"采用事件日志可重建状态，但事件必须幂等且有序；checkpoint 减少重放成本。对外部副作用使用幂等键和执行状态查询。不要把“写入 checkpoint 成功”当作外部工具已成功。"}],assessments:[{id:"m10-03-runtime-state",type:"design-review",prompt:"为一个多步骤采购 Agent 绘制状态机和事件表，定义 checkpoint 字段、恢复规则和并行依赖。",rubric:[{criterion:"状态转移",description:"状态、事件、守卫和终止状态完整",points:3},{criterion:"恢复设计",description:"checkpoint 包含版本、步骤、预算和调用引用",points:4},{criterion:"一致性",description:"处理副作用幂等和恢复前权限复核",points:3}]}],sources:[
{title:"Durable Execution",url:"https://docs.temporal.io/workflows",publisher:"Temporal",note:"可恢复工作流和状态持久化"},
{title:"LangGraph Persistence",url:"https://docs.langchain.com/oss/python/langgraph/persistence",publisher:"LangChain",note:"checkpoint 与状态恢复"},
{title:"Workflow Patterns",url:"https://www.enterpriseintegrationpatterns.com/patterns/messaging/",publisher:"Enterprise Integration Patterns",note:"消息与流程集成模式"}
]},
{id:"m10-04-context-tool-runtime",title:"第四讲：Context、工具注册与 Runtime 安全",summary:"设计上下文装配、工具生命周期和运行时隔离。",learningObjectives:["设计上下文组装和 token 预算","管理工具注册、超时和版本","建立 runtime 隔离和资源限制"],estimatedMinutes:80,content:[
{heading:"上下文是运行时资源",body:"Agent 上下文由系统策略、计划、历史、工具定义和观察组成，必须显式预算。",markdown:"上下文装配按优先级保留安全策略、当前目标、必要状态和证据；旧历史可摘要或引用外部存储。每次调用记录 token 估算和实际用量，避免无界增长。"},
{heading:"工具生命周期管理",body:"工具需要注册、发现、校验、授权、执行、取消和退役流程。",markdown:"工具定义应绑定 tool_id、version、schema、scope、risk、timeout、owner 和 health。调用时重新校验用户权限，不能只在 Agent 创建时授权一次。"},
{heading:"Runtime 隔离",body:"Agent runtime 应限制文件、网络、进程、CPU、内存和执行时间。",markdown:"对代码执行和浏览器自动化使用隔离环境、allowlist、短期凭证和资源 quota。默认拒绝网络和文件访问；需要外部副作用时显式授权。模拟 runtime 不等于操作系统沙箱。"},
{heading:"多租户与上下文泄露",body:"会话状态、缓存、工具凭证和检索结果必须按用户/租户隔离。",markdown:"所有状态键包含 tenant/principal；缓存命中前验证权限；checkpoint 和 trace 采用访问控制与保留期限。禁止将跨用户历史拼接进同一上下文。日志应脱敏并记录访问审计。"}],assessments:[{id:"m10-04-runtime-security",type:"design-review",prompt:"为多租户 Agent runtime 设计上下文预算、工具注册表、隔离策略、凭证生命周期和租户状态隔离。",rubric:[{criterion:"上下文",description:"明确优先级、压缩和 token 预算",points:2},{criterion:"工具治理",description:"包含版本、scope、timeout 和重新授权",points:3},{criterion:"隔离安全",description:"覆盖租户、缓存、凭证和执行资源隔离",points:5}]}],sources:[
{title:"OWASP Top 10 for LLM Applications",url:"https://owasp.org/www-project-top-10-for-large-language-model-applications/",publisher:"OWASP",note:"Agent 工具和运行时安全"},
{title:"NIST SP 800-190: Application Container Security Guide",url:"https://csrc.nist.gov/pubs/sp/800/190/final",publisher:"NIST",note:"容器隔离风险"},
{title:"OpenTelemetry GenAI Semantic Conventions",url:"https://opentelemetry.io/docs/specs/semconv/gen-ai/",publisher:"OpenTelemetry",note:"GenAI 调用观测字段"}
]},
{id:"m10-05-agent-reliability",title:"第五讲：Agent 可靠性、故障恢复与验收",summary:"用任务成功率、轨迹审计和故障注入验证 Agent。",learningObjectives:["设计 Agent 任务级评测","分类规划、工具、状态和模型故障","建立恢复、人工接管和审计指标"],estimatedMinutes:80,content:[
{heading:"Agent 成功不是单次回答质量",body:"Agent 任务成功需要目标达成、约束遵守和副作用正确。",markdown:"指标包括 task success、步骤效率、工具选择正确率、权限违规率、重复副作用率、人工接管率、token 成本和 P95 完成时间。成功定义必须由业务验收条件决定。"},
{heading:"轨迹与可复现评测",body:"执行轨迹记录模型决策、工具参数、观察、状态转移和预算变化。",markdown:"trace 应关联 trace_id、run_id、step_id、model/version、prompt version、tool version、input/output 摘要和耗时。对敏感内容脱敏；保留足以定位失败的来源和状态引用。"},
{heading:"故障注入与恢复",body:"注入工具超时、模型不可用、重复响应和审批超时，验证状态机是否安全终止。",markdown:"测试应覆盖工具 429/500、网络超时但副作用已提交、checkpoint 过期、用户撤权、模型输出非法 action 和预算耗尽。恢复后必须复核权限和外部执行状态。"},
{heading:"人工接管与上线门槛",body:"高风险或低置信场景应暂停自动执行并把证据交给人工。",markdown:"定义审批队列、上下文摘要、证据引用、待确认参数、超时和拒绝语义。上线门槛至少包含任务成功率、严重安全事件为零、成本/延迟上限和恢复演练记录。"}],assessments:[{id:"m10-05-agent-acceptance",type:"design-review",prompt:"为采购 Agent 制定验收方案，包含任务成功定义、执行轨迹字段、五类故障注入和人工接管门槛。",rubric:[{criterion:"指标",description:"任务成功、效率、安全、成本和延迟定义清楚",points:3},{criterion:"故障覆盖",description:"包含超时副作用、撤权、非法动作和预算耗尽",points:4},{criterion:"接管治理",description:"定义证据包、审批和上线门槛",points:3}]}],sources:[
{title:"AgentBench: Evaluating LLMs as Agents",url:"https://arxiv.org/abs/2308.03688",publisher:"Liu et al., ICLR 2024",note:"Agent 任务评测"},
{title:"τ-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains",url:"https://arxiv.org/abs/2406.12045",publisher:"Yao et al., 2024",note:"真实业务工具交互评测"},
{title:"OpenTelemetry Documentation",url:"https://opentelemetry.io/docs/",publisher:"OpenTelemetry",note:"Trace 与运行观测"}
]}
];
