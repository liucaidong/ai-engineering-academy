import type { Course } from "../types/course";

/** M16 — workflow orchestration and deterministic process engineering. */
export const flagshipM16Lessons: Course["modules"][number]["lessons"] = [
{id:"m16-01-workflow-vs-agent",title:"第一讲：Workflow 与 Agent 的边界",summary:"选择确定性编排或自主决策，设计混合控制流。",learningObjectives:["比较 workflow、state machine 和 Agent","识别适合确定性流程的业务约束","设计受限 Agent 节点"],estimatedMinutes:70,content:[
{heading:"Workflow 的确定性",body:"Workflow 预先定义步骤、分支和失败处理，适合可审计的业务流程。",markdown:"Workflow 将业务过程表示为有向状态和转移。输入满足条件时进入确定步骤；分支由规则、事件或审批决定。其优势是可预测、易测试、易审计；局限是面对开放式任务时需要显式建模大量分支。"},
{heading:"Agent 的动态决策",body:"Agent 在运行时选择下一步行动，适合输入不完整或需要探索的任务。",markdown:"Agent 可在受限工具集合中根据观察选择动作，但其输出不确定，需要预算、权限、终止和验证。不要因为流程包含 LLM 节点就把整个系统称为自主 Agent。"},
{heading:"混合编排模式",body:"外层 workflow 控制状态和权限，内层 Agent 处理有限范围的模糊任务。",markdown:"例如理赔流程由 workflow 控制受理、身份校验、审批和付款；Agent 只负责归纳材料和提出风险标签。Agent 输出必须经 schema、证据和业务规则校验后才能推进状态。"},
{heading:"选择决策矩阵",body:"根据确定性、风险、可逆性、任务开放程度和审计要求选择编排方式。",markdown:"高风险、强监管、可明确规则的步骤优先 workflow；开放式资料探索可使用受限 Agent；副作用执行和权限决策应留在确定性服务。复杂系统通常组合两者，而不是追求全 Agent 化。"}],assessments:[{id:"m16-01-orchestration-choice",type:"design-review",prompt:"为保险理赔设计 workflow/Agent 混合架构，标出确定性状态、Agent 节点、人工审批和不可由模型决定的步骤。",rubric:[{criterion:"边界",description:"正确区分确定流程和开放式决策",points:3},{criterion:"控制",description:"权限、状态推进和审批由确定性组件控制",points:4},{criterion:"验证",description:"Agent 输出有 schema、证据和业务校验",points:3}]}],sources:[
{title:"Workflow Patterns",url:"https://www.enterpriseintegrationpatterns.com/patterns/messaging/",publisher:"Enterprise Integration Patterns",note:"企业消息与流程模式"},
{title:"LangGraph Workflows and Agents",url:"https://docs.langchain.com/oss/python/langgraph/workflows-agents",publisher:"LangChain",note:"确定性工作流与 Agent"},
{title:"Temporal Documentation",url:"https://docs.temporal.io/workflows",publisher:"Temporal",note:"持久化工作流执行"}
]},
{id:"m16-02-orchestration-patterns",title:"第二讲：编排模式、状态图与事件驱动",summary:"比较顺序、并行、分支、事件驱动和 Saga 编排。",learningObjectives:["绘制 workflow DAG/state graph","选择同步或异步事件模式","处理分支合流和补偿"],estimatedMinutes:75,content:[
{heading:"顺序、分支与并行",body:"顺序流程适合强依赖步骤，分支由条件决定，并行用于独立子任务。",markdown:"DAG 节点表示任务，边表示依赖。并行分支汇合前需定义 all/any/quorum 条件、超时和部分失败策略。无依赖的任务可并行，但共享资源需控制竞争。"},
{heading:"事件驱动编排",body:"事件将服务解耦，但带来重复、乱序和最终一致性问题。",markdown:"事件包含 event_id、aggregate_id、version、occurred_at 和 schema_version。消费者应幂等处理，使用 outbox 避免数据库提交与消息发布之间的双写不一致。"},
{heading:"Saga 与补偿",body:"跨服务长事务通过局部事务和补偿动作管理，而非假设全局 ACID。",markdown:"Saga 由 T1→T2→T3 组成；若 T3 失败，执行 C2、C1 补偿。补偿可能是退款、释放库存或标记人工处理，不等于恢复到从未发生。补偿自身也可能失败，需要重试和审计。"},
{heading:"状态与事件版本",body:"持久化状态必须有版本和合法转移，防止重复事件推进错误状态。",markdown:"状态更新使用 expected_version 做乐观并发控制。事件 schema 变更采用兼容策略；消费者忽略未知字段可以兼容新增字段，但不能默默接受语义变化。"}],assessments:[{id:"m16-02-event-orchestration",type:"design-review",prompt:"设计订单履约的事件驱动 Saga，包含库存、支付、物流、补偿、事件幂等和版本控制。",rubric:[{criterion:"流程建模",description:"依赖、并行和合流条件清楚",points:3},{criterion:"补偿",description:"为局部事务定义补偿及补偿失败处理",points:4},{criterion:"一致性",description:"包含 outbox、幂等和版本控制",points:3}]}],sources:[
{title:"Saga Pattern",url:"https://microservices.io/patterns/data/saga.html",publisher:"microservices.io",note:"分布式事务模式"},
{title:"Transactional Outbox",url:"https://microservices.io/patterns/data/transactional-outbox.html",publisher:"microservices.io",note:"可靠事件发布"},
{title:"CloudEvents Specification",url:"https://cloudevents.io/",publisher:"Cloud Native Computing Foundation",note:"事件封装标准"}
]},
{id:"m16-03-retries-timeouts-compensation",title:"第三讲：重试、超时、熔断与补偿",summary:"构建有界重试和故障隔离，避免级联故障。",learningObjectives:["区分可重试和不可重试错误","计算退避和 deadline budget","设计熔断、限流和补偿"],estimatedMinutes:80,content:[
{heading:"重试语义",body:"只有可恢复且幂等的操作才适合自动重试。",markdown:"网络超时不代表服务端未执行。对写操作使用幂等键和状态查询；对 4xx 业务错误通常不重试；对 429/部分 5xx 可按策略退避。重试必须设置次数和总时间上限。"},
{heading:"指数退避与抖动",body:"指数退避降低同步重试风暴，随机抖动分散客户端重试时间。",markdown:"delay_n=min(cap,base×2^n)+jitter。例：base=0.5s，n=3，cap=5s，则基础延迟 4s，再加入抖动。deadline 必须包含排队、重试和执行时间，不能每次重试重置总超时。"},
{heading:"Circuit Breaker 与 Bulkhead",body:"熔断器阻止持续请求故障依赖，Bulkhead 限制单一资源池的故障传播。",markdown:"Circuit breaker 有 closed/open/half-open 状态；失败率或连续失败达到阈值后 open，等待后半开探测。Bulkhead 将线程、连接池或并发额度隔离，避免一个下游耗尽全局资源。"},
{heading:"补偿与人工恢复",body:"无法自动恢复时应记录部分完成状态并交给人工处理。",markdown:"补偿动作应有独立状态、幂等键、重试预算和失败告警。对于不可逆副作用，不应伪装为可自动回滚；应提供人工处置指引和业务对账。"}],assessments:[{id:"m16-03-resilience-policy",type:"code-task",prompt:"为支付依赖设计 timeout、retry、backoff、circuit breaker 和 bulkhead 参数，说明哪些错误不重试以及如何处理超时后状态未知。",rubric:[{criterion:"错误分类",description:"区分参数、授权、限流、超时和服务故障",points:3},{criterion:"预算",description:"退避有界且共享总 deadline",points:3},{criterion:"隔离恢复",description:"包含熔断、隔离、幂等查询和人工补偿",points:4}]}],sources:[
{title:"Google SRE Book: Addressing Cascading Failures",url:"https://sre.google/sre-book/addressing-cascading-failures/",publisher:"Google",note:"级联故障和过载控制"},
{title:"AWS Builders' Library: Timeouts, retries, and backoff with jitter",url:"https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/",publisher:"Amazon Web Services",note:"超时和重试策略"},
{title:"Resilience4j Documentation",url:"https://resilience4j.readme.io/",publisher:"Resilience4j",note:"熔断、限流和隔离实现"}
]},
{id:"m16-04-human-approval-audit",title:"第四讲：人工审批、审计与流程可追溯",summary:"把人工决策、策略检查和审计证据纳入工作流。",learningObjectives:["设计审批节点与超时状态","绑定审批主体和参数","构建可追溯事件日志"],estimatedMinutes:75,content:[
{heading:"审批节点是状态而非弹窗",body:"审批必须作为持久化状态进入 workflow，支持等待、拒绝、撤回和超时。",markdown:"状态可包括 awaiting_approval、approved、rejected、expired 和 cancelled。等待期间任务可暂停；恢复时重新检查权限和业务前置条件。"},
{heading:"审批绑定",body:"审批应绑定主体、资源、动作和规范化参数摘要。",markdown:"记录 approver、requester、resource、action、args_hash、policy_version、expires_at 和 nonce。审批后参数改变必须重新审批，避免 TOCTOU。"},
{heading:"审计事件与可追溯",body:"事件日志记录决策、状态转移和外部副作用，形成可复核时间线。",markdown:"每个事件包含 event_id、correlation_id、actor、action、before/after version、policy decision、tool reference 和 timestamp。日志应防篡改、最小化敏感字段并设置访问控制。"},
{heading:"可解释的流程结果",body:"交付报告应说明已完成步骤、未完成步骤、审批和外部证据。",markdown:"区分 completed、partial、blocked 和 failed。报告引用真实系统状态和事件 ID；不能由模型生成一段自然语言就宣称流程完成。"}],assessments:[{id:"m16-04-approval-audit",type:"design-review",prompt:"为供应商付款 workflow 设计审批状态机、参数摘要绑定、过期处理和审计事件结构。",rubric:[{criterion:"审批状态",description:"包含批准、拒绝、过期、撤回和恢复",points:3},{criterion:"参数绑定",description:"绑定主体、资源、动作和 args hash",points:3},{criterion:"审计",description:"记录策略版本、状态转移和副作用引用",points:4}]}],sources:[
{title:"NIST SP 800-53 Rev. 5",url:"https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final",publisher:"NIST",note:"访问控制和审计控制"},
{title:"Temporal Workflows",url:"https://docs.temporal.io/workflows",publisher:"Temporal",note:"持久化等待和状态恢复"},
{title:"OpenTelemetry Documentation",url:"https://opentelemetry.io/docs/",publisher:"OpenTelemetry",note:"跨服务追踪"}
]},
{id:"m16-05-workflow-testing",title:"第五讲：Workflow 测试、版本与生产治理",summary:"通过状态覆盖、故障注入和回放验证编排可靠性。",learningObjectives:["设计状态/转移覆盖测试","区分模拟、集成和生产验收","建立 workflow 版本升级和回滚"],estimatedMinutes:80,content:[
{heading:"状态与转移覆盖",body:"测试不仅覆盖 happy path，还要覆盖每个状态、异常转移和并发竞争。",markdown:"测试矩阵包括正常完成、拒绝、超时、重试耗尽、重复事件、乱序事件、补偿失败、撤权和取消。检查不变量，例如付款前必须已审批、同一订单只能成功扣款一次。"},
{heading:"时间与故障注入",body:"定时器、重试和异步回调需要可控时钟与故障注入。",markdown:"使用可控时钟测试 deadline、lease 和 backoff；注入下游超时、响应丢失、重复消息和进程重启。模拟测试只验证定义的模型，不证明真实网络或供应商可用。"},
{heading:"版本兼容与回放",body:"Workflow 版本变更可能影响历史执行，需定义兼容和迁移策略。",markdown:"长期运行任务可能跨越多个版本。为流程定义 version，兼容旧历史或显式迁移 checkpoint。回放需避免重新触发外部副作用，使用 side-effect record 或模拟执行。"},
{heading:"生产治理",body:"上线需监控队列、等待、失败、补偿和人工审批积压。",markdown:"监控 workflow start/completion、state duration、retry count、compensation failure、approval wait 和 stuck execution。定义 SLO、告警和事故 owner；版本发布采用灰度和回滚。"}],assessments:[{id:"m16-05-workflow-acceptance",type:"design-review",prompt:"为付款工作流制定测试和上线计划，覆盖状态转移、重复事件、补偿失败、版本回放、SLO 和回滚。",rubric:[{criterion:"测试覆盖",description:"覆盖正常、异常、并发和副作用路径",points:3},{criterion:"版本安全",description:"处理历史任务兼容和回放副作用",points:3},{criterion:"运维",description:"定义指标、告警、owner 和回滚",points:4}]}],sources:[
{title:"Temporal Documentation",url:"https://docs.temporal.io/",publisher:"Temporal",note:"持久化执行与版本管理"},
{title:"Google SRE Workbook",url:"https://sre.google/workbook/table-of-contents/",publisher:"Google",note:"SLO 和故障演练"},
{title:"Workflow Patterns",url:"https://www.enterpriseintegrationpatterns.com/patterns/messaging/",publisher:"Enterprise Integration Patterns",note:"编排和消息模式"}
]}
];
