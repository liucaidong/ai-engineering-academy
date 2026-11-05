import type { Course } from "../types/course";

/** M12 — Model Context Protocol architecture and integration engineering. */
export const flagshipM12Lessons: Course["modules"][number]["lessons"] = [
{id:"m12-01-mcp-architecture",title:"第一讲：MCP 架构、角色与协议边界",summary:"理解 Host、Client、Server 和 JSON-RPC 消息关系。",learningObjectives:["区分 MCP Host、Client、Server 职责","解释 JSON-RPC request/response/notification","区分 MCP 协议与具体工具实现"],estimatedMinutes:75,content:[
{heading:"为什么需要 MCP",body:"MCP 为模型应用与外部上下文/工具提供标准化连接方式，降低每个客户端重复适配成本。",markdown:"没有协议时，每个 Host 都需为每个工具供应商实现独立集成。MCP 定义 Host、Client、Server 角色及能力发现、工具调用、资源和提示等交互，使连接可组合。协议统一不意味着服务天然可信或安全。"},
{heading:"Host、Client 与 Server",body:"Host 管理用户交互与策略；Client 维护到 Server 的协议连接；Server 暴露能力。",markdown:"一个 Host 可管理多个 MCP Client；每个 Client 与一个 Server 会话交互。Server 可以本地进程或远程服务运行。Host 仍负责用户授权、工具策略和数据边界，不能把信任委托给 Server 自我声明。"},
{heading:"JSON-RPC 消息语义",body:"Request 需要响应，Notification 不带响应，Response 通过 id 关联请求。",markdown:"JSON-RPC request 包含 jsonrpc、method、params 和 id；notification 不包含 id；response 返回 result 或 error。并发请求需要正确关联 id，错误对象应包含 code/message/data。协议层成功只表示消息处理完成，不代表业务操作正确。"},
{heading:"协议与业务语义",body:"MCP 描述交互格式和能力模型，具体工具权限、数据语义和副作用仍由实现定义。",markdown:"工具名和 schema 不是授权凭据；资源 URI 不应自动获得任意文件访问能力；Prompt 模板也不能被视为可信策略。Host 需要明确允许连接的 Server、用户可见权限和执行审计。"},
{heading:"复现练习：逐条追踪 MCP JSON-RPC 消息与角色责任",body:"用一次工具调用标记 Host、Client、Server 和业务服务的边界。",markdown:"Host 管理用户交互与策略，Client 维护到 Server 的协议连接，Server 暴露能力。画出 initialize、能力协商、tools/list、tools/call、result/error 和关闭过程。区分带 id 且需要响应的 request、无 id 的 notification，以及通过 id 关联的 response。\\n\\n提交消息样例、角色责任矩阵和信任边界图。协议响应成功只代表消息层处理完成，不证明业务动作正确或用户有权执行。"}
],assessments:[{id:"m12-01-mcp-architecture",type:"knowledge-check",prompt:"绘制 Host—Client—Server 架构，解释 JSON-RPC request、response 和 notification 的区别，并标注授权责任。",rubric:[{criterion:"角色",description:"正确说明三类参与方职责",points:3},{criterion:"消息",description:"解释 id、result/error 和 notification",points:3},{criterion:"信任边界",description:"明确 Host 承担连接与用户授权策略",points:4}]}],sources:[
{title:"Model Context Protocol Specification",url:"https://modelcontextprotocol.io/specification",publisher:"Model Context Protocol",note:"协议角色和交互规范"},
{title:"MCP Architecture",url:"https://modelcontextprotocol.io/docs/learn/architecture",publisher:"Model Context Protocol",note:"Host/Client/Server 架构"},
{title:"JSON-RPC 2.0 Specification",url:"https://www.jsonrpc.org/specification",publisher:"JSON-RPC Working Group",note:"消息协议语义"}
]},
{id:"m12-02-capability-discovery",title:"第二讲：能力发现、Tools、Resources 与 Prompts",summary:"比较 MCP 三类核心能力和发现/调用流程。",learningObjectives:["区分 Tools、Resources 与 Prompts","解释 capability negotiation","设计能力清单和版本兼容策略"],estimatedMinutes:75,content:[
{heading:"Tools、Resources 与 Prompts",body:"Tools 代表可调用操作，Resources 提供上下文数据，Prompts 提供可复用提示模板。",markdown:"Tool 通常由模型/Host 请求执行，可能产生副作用；Resource 通过 URI 暴露可读取内容；Prompt 提供参数化模板。三者的信任、权限和审计需求不同，不能把所有能力都视为函数调用。"},
{heading:"初始化与能力协商",body:"连接建立后双方交换协议版本和 capabilities，确定可用功能。",markdown:"初始化流程包含协议版本协商、客户端/服务端信息和能力声明。Host 应检查协议版本兼容、所需能力是否存在，以及 Server 是否满足组织策略。声明能力不代表其实现经过安全审计。"},
{heading:"发现与调用生命周期",body:"Host 获取工具列表后选择能力，再通过 Client 发送调用并处理结果/错误。",markdown:"能力列表可能变化，Host 应处理 list_changed 通知或重新发现。调用前仍需校验 schema、用户授权和风险等级；调用后校验结果结构、错误和来源。不要永久缓存未经版本绑定的能力列表。"},
{heading:"资源订阅与更新",body:"支持订阅的资源可通知内容变化，但客户端仍需处理断连、重复和乱序。",markdown:"资源 URI 应限定可访问范围，内容更新需要版本/时间戳和缓存失效语义。断连后重订阅并校验当前版本；通知不能替代周期性一致性检查。"},
{heading:"复现练习：为 MCP Server 制作能力目录与兼容清单",body:"把 Tools、Resources、Prompts 分开建模，并明确版本协商和能力变化处理。",markdown:"设计一个企业文档 Server：Tool 用于搜索/导出操作，Resource 提供受 ACL 保护的文档内容，Prompt 提供可复用的审查模板。分别列出 input/output schema、URI 范围、参数和副作用。\\n\\n模拟 Server 发布新工具版本、移除可选能力和发送 list_changed 通知。Host 需要重新发现并校验兼容性，不能无限期使用旧能力缓存。提交能力清单、版本矩阵和变更处理时序图。"}
],assessments:[{id:"m12-02-mcp-capabilities",type:"design-review",prompt:"为企业文档服务器定义 Tools、Resources、Prompts 三类能力清单，并说明初始化协商、更新通知和授权策略。",rubric:[{criterion:"能力区分",description:"正确区分操作、数据和提示模板",points:3},{criterion:"协商发现",description:"描述版本协商、列表变化和缓存更新",points:3},{criterion:"安全策略",description:"定义资源范围和调用授权",points:4}]}],sources:[
{title:"MCP Specification — Tools",url:"https://modelcontextprotocol.io/specification",publisher:"Model Context Protocol",note:"工具能力定义"},
{title:"MCP Documentation — Resources",url:"https://modelcontextprotocol.io/docs/concepts/resources",publisher:"Model Context Protocol",note:"资源读取和订阅"},
{title:"MCP Documentation — Prompts",url:"https://modelcontextprotocol.io/docs/concepts/prompts",publisher:"Model Context Protocol",note:"可复用提示模板"}
]},
{id:"m12-03-transports-lifecycle",title:"第三讲：Transport、会话与连接生命周期",summary:"理解 stdio、HTTP transport、会话状态和断连恢复。",learningObjectives:["比较 stdio 与 Streamable HTTP","设计连接启动、心跳、关闭和重连","处理超时、取消与并发请求"],estimatedMinutes:80,content:[
{heading:"Transport 的职责",body:"Transport 负责消息传输和连接语义，不能与 MCP 能力本身混淆。",markdown:"stdio 适合本地子进程通信，Host 启动 Server 并通过标准输入输出交换消息；HTTP transport 适合远程服务，需处理网络认证、代理、超时和断连。传输层加密和身份验证仍需部署配置。"},
{heading:"会话生命周期",body:"连接需定义初始化、运行、关闭和异常恢复状态。",markdown:"状态示例：disconnected → connecting → initializing → ready → closing → closed。启动失败应区分进程不可执行、协议版本不兼容、认证失败和初始化超时。关闭时停止新请求并处理在途调用。"},
{heading:"并发、取消和超时",body:"请求 ID 关联响应；取消需要传播到 Server 和下游操作。",markdown:"为每个请求设置 deadline 和 cancellation token。超时不意味着 Server 没有完成副作用；写操作需要幂等键和状态查询。并发上限保护 Host/Server，队列需有界。"},
{heading:"重连与版本漂移",body:"重连后应重新协商能力并校验 Server 身份与版本。",markdown:"不要假设重连后 session state 仍存在。重新初始化、发现能力、刷新授权并恢复必要订阅。Server 更新可能改变 schema 或副作用，工具版本必须进入调用审计。"},
{heading:"复现练习：设计远程 MCP Transport 生命周期",body:"通过状态机处理连接、初始化、并发请求、取消、断连和重连。",markdown:"定义 disconnected → connecting → initializing → ready → closing → closed。为每个请求分配 id、deadline 和 cancellation token；队列设置并发上限。断连后重新认证、协商协议版本、重新发现能力并恢复订阅。若写操作超时，先查询幂等记录或业务状态，不能直接重放。\\n\\n提交状态机、超时/取消测试矩阵和 stdio 与 Streamable HTTP 的选择依据。"}
],assessments:[{id:"m12-03-transport-design",type:"design-review",prompt:"为远程 MCP Server 设计连接状态机，覆盖认证、初始化、请求超时、取消、断连重连和能力重新发现。",rubric:[{criterion:"传输选择",description:"比较本地 stdio 与远程 HTTP 约束",points:3},{criterion:"生命周期",description:"状态机覆盖正常与异常转移",points:3},{criterion:"恢复安全",description:"重连重新认证/协商并处理在途副作用",points:4}]}],sources:[
{title:"MCP Specification — Transports",url:"https://modelcontextprotocol.io/specification",publisher:"Model Context Protocol",note:"传输与消息规范"},
{title:"MCP Documentation — Transports",url:"https://modelcontextprotocol.io/docs/concepts/transports",publisher:"Model Context Protocol",note:"stdio 与 HTTP 传输"},
{title:"HTTP Semantics, RFC 9110",url:"https://www.rfc-editor.org/rfc/rfc9110",publisher:"IETF",note:"HTTP 状态和请求语义"}
]},
{id:"m12-04-security-auth",title:"第四讲：MCP 安全、身份验证与权限治理",summary:"为远程 Server、工具和资源建立最小权限与信任边界。",learningObjectives:["识别恶意 Server、工具投毒和资源越权风险","设计 OAuth/凭证与用户授权边界","建立工具执行审批和审计"],estimatedMinutes:85,content:[
{heading:"MCP 威胁模型",body:"风险来自恶意 Server、被投毒工具描述、资源越权、Prompt Injection 和凭据泄露。",markdown:"Server 元数据和工具描述属于不可信输入；名称相似或描述诱导可能导致错误调用。远程 Server 还面临网络身份伪造、token audience 混淆和凭证重放。"},
{heading:"身份与授权",body:"认证确认对端身份，授权决定主体可访问哪些工具、资源和操作。",markdown:"使用 OAuth 等机制时校验 issuer、audience、scope、expiry 和 redirect URI。不要把 Host 的用户 token 无限制转发给 Server；遵循最小权限和 token exchange。每次敏感调用应重新检查主体、资源和操作。"},
{heading:"工具投毒与用户确认",body:"工具 schema 和描述可能诱导模型提交敏感数据或执行隐藏副作用。",markdown:"对 Server 来源、发布者、版本和权限做审核；将高风险工具单独展示并要求用户确认。执行端校验参数，不信任模型解释。对于敏感数据导出、删除和写入操作，设置明确的审批与审计。"},
{heading:"安全审计与供应链",body:"MCP Server 是软件供应链组件，需要版本、依赖、签名和运行环境治理。",markdown:"记录 Server package/version、source commit、发布者、权限、网络目标、工具 schema hash 和审计结果。限制文件系统/网络/进程权限；升级前运行协议兼容和安全回归。"},
{heading:"复现练习：建立第三方 MCP Server 威胁模型",body:"从身份、scope、工具投毒、资源越权和供应链建立纵深防御。",markdown:"攻击路径包括恶意 Server 伪装、工具描述诱导模型外传数据、资源 URI 越权、token audience 混淆和恶意依赖更新。控制包括验证 issuer/audience/scope/expiry、最小权限、工具 allowlist、敏感操作审批、Server 来源与版本审查、网络出口限制和执行审计。\\n\\n提交数据流/威胁模型、攻击用例、每条路径的阻断组件和上线安全门槛。Host 不能把授权责任交给 Server 自我声明。"}
],assessments:[{id:"m12-04-mcp-threat-model",type:"design-review",prompt:"为企业 MCP Host 连接第三方 Server 建立威胁模型，覆盖身份、scope、工具投毒、资源访问和供应链，并定义上线门槛。",rubric:[{criterion:"威胁覆盖",description:"覆盖恶意 Server、工具描述、越权和凭证风险",points:3},{criterion:"身份授权",description:"验证 issuer/audience/scope 并遵循最小权限",points:3},{criterion:"治理审计",description:"记录版本、来源、审批和安全回归",points:4}]}],sources:[
{title:"MCP Security Best Practices",url:"https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices",publisher:"Model Context Protocol",note:"MCP 安全实践"},
{title:"OAuth 2.1",url:"https://oauth.net/2.1/",publisher:"OAuth Working Group",note:"授权框架"},
{title:"OWASP Top 10 for LLM Applications",url:"https://owasp.org/www-project-top-10-for-large-language-model-applications/",publisher:"OWASP",note:"工具调用和提示词风险"}
]},
{id:"m12-05-mcp-integration-operations",title:"第五讲：MCP 集成测试、运维与互操作",summary:"设计兼容性测试、Server 生命周期和生产运维控制。",learningObjectives:["构建协议一致性和互操作测试","评估工具结果、资源和通知正确性","设计 Server 部署、监控和版本升级"],estimatedMinutes:80,content:[
{heading:"协议一致性测试",body:"测试初始化、能力发现、工具调用、资源读取、通知、错误和关闭。",markdown:"测试矩阵覆盖协议版本、必需能力、非法参数、未知方法、并发请求、取消、断连和重连。Mock transport 只能验证模拟消息处理，不能证明真实部署网络与身份系统可用。"},
{heading:"互操作与兼容",body:"不同 Host/Server 对可选能力和 schema 子集的支持可能不同。",markdown:"维护 Host×Server×Protocol version 兼容矩阵。对 schema 限制、content block、错误码和通知顺序做 contract tests。升级前验证旧客户端行为和能力降级路径。"},
{heading:"运行监控与故障处理",body:"监控连接状态、请求延迟、错误率、工具调用量和资源访问审计。",markdown:"指标包括连接建立时间、初始化失败率、tool call P95、错误类别、取消率、Server restart 和资源更新延迟。日志不应暴露 token、敏感资源内容或完整个人数据。"},
{heading:"部署与运维治理",body:"Server 部署需管理版本、配置、密钥、网络策略和生命周期。",markdown:"本地 stdio 需固定可执行路径和环境变量 allowlist；远程服务需 TLS、身份验证、网络出口控制和速率限制。升级需灰度、回滚和权限差异审查。"},
{heading:"复现练习：构建 MCP 互操作与升级验收矩阵",body:"覆盖协议消息、能力差异、错误/取消和部署运维，明确 Mock 验证边界。",markdown:"建立 Host × Server × Protocol Version 矩阵，测试 initialize、tools/list、tools/call、resources/read、notification、非法参数、未知方法、并发、取消和断连重连。记录连接建立时间、初始化失败率、工具调用 P95、错误类别和资源更新延迟。\\n\\n升级前检查 schema 兼容、权限差异、Server 依赖和回滚路径。Mock transport 只能证明模拟消息行为，不证明 TLS、真实身份系统或远程网络部署通过。提交兼容矩阵、监控指标和灰度/回滚清单。"}
],assessments:[{id:"m12-05-mcp-acceptance",type:"design-review",prompt:"为一个远程 MCP 文档 Server 制定上线验收清单，包含协议兼容矩阵、错误/取消测试、身份安全、监控和升级回滚。",rubric:[{criterion:"测试矩阵",description:"覆盖初始化、发现、调用、资源、通知和异常",points:3},{criterion:"互操作",description:"定义 Host/Server/协议版本兼容策略",points:3},{criterion:"运维安全",description:"覆盖 TLS、凭证、监控和回滚",points:4}]}],sources:[
{title:"MCP Specification",url:"https://modelcontextprotocol.io/specification",publisher:"Model Context Protocol",note:"协议兼容与测试基准"},
{title:"MCP Inspector",url:"https://github.com/modelcontextprotocol/inspector",publisher:"Model Context Protocol",note:"协议交互检查工具"},
{title:"OpenTelemetry Documentation",url:"https://opentelemetry.io/docs/",publisher:"OpenTelemetry",note:"连接和调用可观测性"}
]}
];
