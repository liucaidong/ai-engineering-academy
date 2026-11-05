import type { Course } from "../types/course";

/** M07 — structured output and tool calling contracts. */
export const flagshipM07Lessons: Course["modules"][number]["lessons"] = [
{id:"m07-01-tool-call-protocol",title:"第一讲：Tool Calling 协议与控制流",summary:"理解模型提出工具调用、应用执行和结果回传的分离。",learningObjectives:["区分工具调用意图与真实执行","描述一次工具调用的请求/响应生命周期","设计工具结果和错误回传协议"],estimatedMinutes:70,content:[
{heading:"工具调用不是模型直接执行代码",body:"模型输出工具名称和参数候选，宿主应用负责验证、授权、执行和回传结果。",markdown:"典型控制流：模型响应包含 tool call → 应用解析调用 → 校验工具是否存在 → 校验参数 → 检查用户授权 → 执行工具 → 将结果作为 tool message 回传 → 模型继续生成。模型只提出调用意图，不应被描述为直接访问数据库或操作系统。"},
{heading:"工具调用状态机",body:"工具调用应具有明确状态，避免重复执行和丢失结果。",markdown:"可定义 proposed、validated、authorized、running、succeeded、failed、cancelled 状态。每次调用关联 call_id、request_id、principal、tool_version 和 deadline。状态转换必须单向且可审计；超时后不能假设副作用未发生，应查询幂等键或外部执行状态。"},
{heading:"结果回传与多轮交互",body:"工具结果应带有结构化状态和数据来源，模型后续回答仍需受证据约束。",markdown:"回传结果可包含 status、data、error_code、retryable、source_ref 和 elapsed_ms。把异常堆栈、凭据或内部路径直接暴露给模型/用户可能造成泄露。工具结果应最小化并明确是否完整、是否截断。"},
{heading:"错误与取消语义",body:"工具错误需要区分参数错误、授权失败、限流、超时和外部服务故障。",markdown:"参数错误通常不重试；授权失败应拒绝；429 可按 Retry-After 退避；网络超时要检查操作是否已执行。取消请求必须向下游传播并释放资源。重试需幂等并设置次数上限，不能把失败状态伪装成成功。"},
{heading:"复现练习：追踪一次带超时的工具调用",body:"用显式状态和调用标识复现从模型提议到外部副作用确认的完整生命周期。",markdown:"场景：用户请求查询订单并发起退款。将调用拆为 proposed → validated → authorized → running → succeeded/failed/unknown。模型提出工具与参数后，宿主检查 allowlist、Schema、用户身份；业务服务检查订单归属、状态与可退余额；执行时记录 call_id、request_id、tool_version、deadline 和稳定 idempotency key。若响应超时，状态先标记 unknown，查询执行记录后再决定是否重试。\\n\\n提交证据：状态转换表、失败状态定义和超时后的状态查询时序图。不得把 timeout 直接等同于 failed。"}
],assessments:[{id:"m07-01-tool-lifecycle",type:"design-review",prompt:"为订单查询和退款工具画出完整状态机，标记模型、宿主、授权服务和外部 API 的责任边界。",rubric:[{criterion:"控制流",description:"完整描述提出、验证、授权、执行和回传",points:4},{criterion:"状态模型",description:"状态和 call_id/request_id 设计明确",points:3},{criterion:"失败语义",description:"覆盖超时、取消、重复执行和错误分类",points:3}]}],sources:[
{title:"OpenAI Function Calling guide",url:"https://platform.openai.com/docs/guides/function-calling",publisher:"OpenAI",note:"工具调用请求与响应流程"},
{title:"Anthropic Tool Use",url:"https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview",publisher:"Anthropic",note:"工具调用生命周期"},
{title:"JSON-RPC 2.0 Specification",url:"https://www.jsonrpc.org/specification",publisher:"JSON-RPC Working Group",note:"请求、响应和错误对象"}
]},
{id:"m07-02-json-schema-validation",title:"第二讲：JSON Schema、类型约束与参数校验",summary:"把工具参数变成严格、可版本化的机器契约。",learningObjectives:["设计可校验的工具输入 schema","区分语法、类型、语义和权限验证","处理 schema 版本兼容"],estimatedMinutes:75,content:[
{heading:"工具 Schema 的设计原则",body:"工具描述应明确用途、参数、单位、默认值和副作用。",markdown:"参数 schema 定义 required、type、enum、range、format、array length 和 additionalProperties。字段名要避免歧义；金额注明币种和最小单位，时间注明时区，分页注明 cursor 语义。工具描述应短而精确，避免含糊的重叠工具。"},
{heading:"分层参数校验",body:"JSON 可解析只说明语法有效，不能证明参数合法或用户有权执行。",markdown:"校验层次：JSON parse → schema/type → domain invariant → identity/authorization → resource scope → rate limit。例：订单 ID 字符串符合 schema，但订单可能不属于当前用户；归属检查必须由可信服务执行，不能由模型判断。"},
{heading:"Schema 演进与兼容",body:"工具接口变更需要版本管理和兼容策略。",markdown:"新增可选字段通常向后兼容；删除字段、改变单位、放宽枚举或改变默认值可能破坏调用方。工具定义携带 version，服务端可在迁移期支持旧版本并记录弃用时间。模型提示和工具实现必须以同一契约发布。"},
{heading:"参数规范化与注入",body:"规范化可以减少歧义，但不能把用户文本直接拼接成 SQL、shell 或 URL。",markdown:"对数字范围、Unicode、日期、路径和 URL 执行规范化与 allowlist 校验。数据库访问使用参数化查询；命令执行使用固定可执行文件与参数数组；文件访问限制根目录并解析符号链接。Schema 验证不等于防注入。"},
{heading:"复现练习：为退款工具编写负向 Schema 测试",body:"通过边界输入区分结构校验、领域规则和授权检查。",markdown:"定义 order_id、amount、currency、reason、idempotency_key。测试缺失 order_id、amount 为字符串或非正数、currency 不在枚举、额外字段、金额超过可退余额、订单不属于当前用户。前五类属于 Schema/类型层；金额上限和订单状态属于业务层；订单归属属于授权层。每个测试写出拒绝层、稳定错误码和是否允许重试。\\n\\n提交证据：字段表、正负测试矩阵和校验顺序。金额单位必须明确是元、分还是最小货币单位。"}
],assessments:[{id:"m07-02-tool-schema",type:"code-task",prompt:"定义一个订单退款工具的 JSON Schema，并写出 schema、订单归属、金额上限、权限和幂等键校验顺序。",rubric:[{criterion:"字段契约",description:"字段类型、必填、范围、币种和额外字段策略完整",points:3},{criterion:"业务验证",description:"验证订单归属、可退款余额和状态",points:4},{criterion:"安全边界",description:"参数化访问、授权和幂等控制明确",points:3}]}],sources:[
{title:"JSON Schema Specification",url:"https://json-schema.org/specification",publisher:"JSON Schema",note:"参数结构约束"},
{title:"OpenAPI Specification",url:"https://spec.openapis.org/oas/latest.html",publisher:"OpenAPI Initiative",note:"HTTP API 契约和 schema"},
{title:"OWASP API Security Top 10",url:"https://owasp.org/API-Security/",publisher:"OWASP",note:"对象级授权与 API 风险"}
]},
{id:"m07-03-tool-selection-and-routing",title:"第三讲：工具发现、选择与路由",summary:"设计工具目录、能力描述和模型选择后的确定性校验。",learningObjectives:["设计工具注册表和元数据","分析工具描述歧义对选择的影响","实现 allowlist 路由与调用限制"],estimatedMinutes:70,content:[
{heading:"工具目录与元数据",body:"工具注册表应记录稳定 ID、版本、描述、schema、权限范围和执行环境。",markdown:"Registry 可包含 tool_id、name、description、input_schema、output_schema、owner、version、scopes、risk_level、timeout 和 availability。名称面向模型，ID 面向系统稳定引用。运行时不应仅依赖模型生成的自由文本工具名。"},
{heading:"工具选择是概率决策",body:"模型选择受描述、上下文和候选工具集合影响，容易出现相似工具混淆。",markdown:"若多个工具描述重叠，模型可能选择错误工具或填错参数。按业务能力拆分工具，避免一个万能工具承载大量副作用；将读与写分开，描述前置条件和不适用情形。通过混淆矩阵测量选择准确率和误调用成本。"},
{heading:"路由与确定性策略",body:"模型提议路由后，宿主应执行工具 allowlist、角色权限和风险策略。",markdown:"路由流程：候选工具过滤 → 模型选择 → tool_id 映射 → schema 校验 → 用户/租户授权 → 风险门禁 → 执行。对于不允许的工具，服务端拒绝而不是要求模型自行判断。高风险工具需要显式确认。"},
{heading:"工具数量、上下文与成本",body:"工具定义占用上下文，过多候选增加选择歧义和维护成本。",markdown:"按任务动态暴露最小相关工具集合；对长尾工具使用分层发现或目录检索。评测工具选择、参数完整性、成功率、错误恢复和 token 成本。不要将隐藏工具视为安全措施，权限必须在执行端验证。"},
{heading:"复现练习：用混淆矩阵评估工具路由",body:"对相似工具建立离线选择集，量化错误路由的频率和业务影响。",markdown:"案例：工具目录包含 get_order、search_orders、cancel_order、refund_order。为每个工具准备正常、相似意图、缺少必要信息和禁止场景。统计真实意图与预测工具的混淆矩阵，计算 macro accuracy、每工具 precision/recall、错误写操作率和高风险误调用成本。先做确定性候选过滤，再允许模型在最小集合中选择。\\n\\n提交证据：混淆矩阵、最常见两类混淆、工具描述修订前后对照。隐藏工具不等于授权控制，执行端仍需验证 scope。"}
],assessments:[{id:"m07-03-tool-routing",type:"design-review",prompt:"为 30 个企业工具设计分层注册表和路由策略，给出只读/写入分组、风险等级、选择评测指标和服务端拒绝规则。",rubric:[{criterion:"注册表",description:"包含 ID、版本、schema、scope 和风险元数据",points:3},{criterion:"选择评测",description:"定义选择准确率、参数完整性和误调用成本",points:3},{criterion:"执行门禁",description:"实现 allowlist、授权、确认和限流",points:4}]}],sources:[
{title:"Toolformer: Language Models Can Teach Themselves to Use Tools",url:"https://arxiv.org/abs/2302.04761",publisher:"Schick et al., NeurIPS 2023",note:"模型学习工具使用"},
{title:"Gorilla: Large Language Model Connected with Massive APIs",url:"https://arxiv.org/abs/2305.15334",publisher:"Patil et al., 2023",note:"API 检索和工具调用"},
{title:"Berkeley Function Calling Leaderboard",url:"https://gorilla.cs.berkeley.edu/leaderboard.html",publisher:"Berkeley AI Research",note:"函数调用能力评测"}
]},
{id:"m07-04-side-effects-idempotency",title:"第四讲：副作用、幂等与事务边界",summary:"为写操作工具建立防重复、补偿和审计机制。",learningObjectives:["解释至少一次调用下的重复副作用风险","设计幂等键和状态查询","区分事务、Saga 补偿与人工审批"],estimatedMinutes:80,content:[
{heading:"重试为何会重复执行",body:"调用方无法确认超时前外部副作用是否已完成，盲目重试可能重复扣款或发送。",markdown:"网络超时存在不确定窗口：服务端已提交，但响应丢失。调用方重试后可能重复执行。Exactly-once 通常不能由网络协议单独保证，需要业务幂等、去重记录和状态查询。"},
{heading:"幂等键设计",body:"幂等键把同一业务意图的重试映射到同一执行结果。",markdown:"客户端为一次业务意图生成稳定 idempotency_key；服务端在事务中记录 key、principal、参数摘要和结果。相同 key 与相同参数返回原结果；相同 key 不同参数必须拒绝。幂等记录保留期应覆盖最大重试窗口和业务争议期。"},
{heading:"事务与分布式补偿",body:"单数据库副作用可使用事务；跨服务流程通常需要 Saga、outbox 或补偿操作。",markdown:"数据库事务保证本地原子性；跨系统调用不能假设共享事务。Outbox 在同一事务写业务状态和待发布事件，再异步投递；Saga 将长流程拆成局部事务并定义补偿动作。补偿不是时间倒流，退款、撤销邮件等语义需单独定义。"},
{heading:"人工审批与审计",body:"高影响操作应把授权意图、执行参数和审批结果绑定到同一审计记录。",markdown:"审批对象应包含 actor、resource、operation、normalized_args、risk_summary、expiry 和 nonce。审批后若参数变化必须重新审批。审计记录保存决策、工具版本、幂等键、执行状态和结果引用，避免存储不必要敏感数据。"},
{heading:"复现练习：模拟重复退款与幂等并发",body:"构造响应丢失和并发重试，验证相同业务意图不会产生重复副作用。",markdown:"故障注入：服务端已创建退款，但返回响应前连接断开；调用方重试同一请求。随后模拟两个 worker 同时处理同一个 idempotency key。服务端应在事务中对 key 建立唯一约束，并持久化 principal、参数摘要、执行状态和结果引用。相同 key/相同参数返回既有结果；相同 key/不同参数拒绝；并发请求只有一个进入副作用执行路径。跨支付服务流程使用 outbox/Saga，并定义补偿语义。\\n\\n提交证据：状态表、并发时序图、唯一约束说明和重复副作用测试结果。"}
],assessments:[{id:"m07-04-idempotent-tool",type:"design-review",prompt:"设计一个会创建退款并调用支付网关的工具，说明幂等键、事务边界、超时查询、Saga 补偿和审批绑定。",rubric:[{criterion:"幂等机制",description:"定义 key、参数摘要、重复请求语义",points:3},{criterion:"事务设计",description:"区分本地事务、outbox 和跨服务补偿",points:4},{criterion:"审计审批",description:"审批绑定参数并保留可追溯记录",points:3}]}],sources:[
{title:"Making retries safe with idempotent APIs",url:"https://stripe.com/docs/idempotency",publisher:"Stripe",note:"幂等请求设计"},
{title:"Microservices Patterns: Saga",url:"https://microservices.io/patterns/data/saga.html",publisher:"microservices.io",note:"分布式事务补偿"},
{title:"Transactional Outbox",url:"https://microservices.io/patterns/data/transactional-outbox.html",publisher:"microservices.io",note:"可靠事件发布"}
]},
{id:"m07-05-tool-evaluation-security",title:"第五讲：工具调用评测与安全验收",summary:"用可重复数据集验证工具选择、参数、权限和副作用。",learningObjectives:["设计工具调用 benchmark","计算选择/参数/执行分层成功率","建立安全回归和审计证据"],estimatedMinutes:75,content:[
{heading:"工具调用评测集",body:"评测集应覆盖工具可用、不可用、相似工具、缺字段、越权和副作用边界。",markdown:"每条案例记录用户意图、允许工具集合、期望 tool_id、参数约束、权限上下文、预期执行状态和判分规则。按业务风险分层抽样，避免只评测 happy path。"},
{heading:"分层指标与错误归因",body:"工具选择正确、参数正确、执行成功和业务结果正确是不同指标。",markdown:"分别计算 selection accuracy、argument validity、authorization violation rate、execution success、business outcome success 和 duplicate side-effect rate。若工具选择正确但业务失败，应区分外部依赖故障与参数/权限错误。"},
{heading:"仿真与真实执行边界",body:"确定性模拟可测试协议与状态机，但不能证明真实外部服务可用。",markdown:"Mock 工具可验证参数校验、状态转换和错误分支；sandbox 可验证隔离执行；provider-backed 测试才覆盖真实外部 API，但需要凭据、配额、隐私和审批。报告必须明确实验模式，不能把 mock 成功描述为生产集成通过。"},
{heading:"安全验收与持续回归",body:"每次工具 schema、模型或 Prompt 更新都可能改变工具选择和副作用风险。",markdown:"安全回归覆盖越权对象访问、参数污染、重放、速率限制、审批绕过和敏感字段泄露。保存模型版本、Prompt、工具 schema、数据集和运行环境版本。高风险工具更新需人工审查和 canary。"},
{heading:"复现练习：构建工具调用分层验收集",body:"用同一批样例分别验收选择、参数、权限、执行和业务结果。",markdown:"建立正常调用、工具不可用、参数缺失、对象越权、执行后响应超时五类测试。分别计算 selection accuracy、argument validity、authorization violation rate、execution success 和 business outcome success。Mock 只验证协议与状态机；sandbox 验证隔离执行；真实 provider-backed 测试才覆盖外部 API 行为。报告必须记录执行模式、模型版本、工具 Schema 版本和环境。\\n\\n提交证据：分层指标表、失败归因和 mock/真实环境的明确边界。模拟成功不得标记为生产验收通过。"}
],assessments:[{id:"m07-05-tool-evaluation",type:"design-review",prompt:"建立工具调用评测计划，分别度量选择、参数、授权、执行和业务结果，并区分 mock 与真实服务验收。",rubric:[{criterion:"数据集",description:"覆盖正常、边界、越权和副作用案例",points:3},{criterion:"指标",description:"分层计算选择、参数、授权和结果指标",points:4},{criterion:"证据边界",description:"明确模拟/沙箱/provider-backed 验收范围",points:3}]}],sources:[
{title:"AgentBench: Evaluating LLMs as Agents",url:"https://arxiv.org/abs/2308.03688",publisher:"Liu et al., ICLR 2024",note:"Agent 与工具环境评测"},
{title:"ToolBench: Towards Foundation Models for Tool Learning",url:"https://arxiv.org/abs/2307.16789",publisher:"Qin et al., 2023",note:"工具学习与 API 调用评测"},
{title:"OWASP API Security Top 10",url:"https://owasp.org/API-Security/",publisher:"OWASP",note:"API 安全验收风险"}
]}
];
