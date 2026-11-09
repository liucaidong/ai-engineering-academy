# M12 教师教学指南与作业参考解答

> 课程版本：0.40.9

> **证据评阅：** 教师应按[全课程证据等级](../CURRICULUM_EVIDENCE_LEVELS.md)区分设计、静态审阅、模拟/Mock、本地测试、目标环境测试和生产观测；只为实际覆盖范围授予等级。

>
> 用于教师备课、助教批改和学生复习；参考解答不是唯一可接受答案。

## 使用方式

- 建议每讲 75–90 分钟；先从真实案例提出问题，再推导机制，最后审阅工程证据。
- 课前让学生写下假设；课堂结束前提交公式、架构图、状态图、测试记录或决策日志。
- **教学主线：** MCP 规范定义互操作消息与能力发现，但协议兼容不等于 Server 可信；Host 仍负责用户授权、身份、工具策略和审计。
- 评分先检查边界、假设、单位、失败路径和证据，再检查表达完整性。

## 模块先修与教学准备

- **先修知识：** JSON-RPC、HTTP/stdio、OAuth、TLS、无状态服务与 API 版本兼容
- **教师准备：** 准备一个最小正例、一个失败案例和一份可审计输出；区分模型推断、宿主控制、业务规则与外部系统状态。
- **贯穿案例：** MCP 协议与集成 的作业均要求说明输入、状态、权限、输出、成本和异常处理。

## 第一讲：MCP 架构、角色与协议边界

### 课前准备

- 复习：JSON-RPC、HTTP/stdio、OAuth、TLS、会话管理与 API 版本兼容
- 预读主题：为什么需要 MCP、Host、Client 与 Server、JSON-RPC 消息语义、协议与业务语义、复现练习：逐条追踪 MCP JSON-RPC 消息与角色责任。
- 准备一个成功路径和一个失败路径，要求学生比较其状态、权限和恢复差异。

### 教学路径与关键讲解

1. **概念建立：** 讲解 为什么需要 MCP、Host、Client 与 Server、JSON-RPC 消息语义，先定义对象、边界和数据流。
2. **工程深化：** 以 协议与业务语义 为切入点讨论异常、权限、成本或可维护性，并指出由哪个可信组件执行控制。
3. **实践复现：** 复现练习：逐条追踪 MCP JSON-RPC 消息与角色责任。先独立推导，再对照参考解答检查假设与边界。
4. **证据要求：** 提交物包含输入/假设、处理步骤、结果、失败路径、版本和未验证项。

### 学习检查点（含教师提示）

- **核心机制：** 围绕「为什么需要 MCP」与「Host、Client 与 Server」，能否解释本讲的关键机制并写出必要公式、状态或数据流？要求说明变量/参与方及适用假设。
- **工程权衡：** 针对「JSON-RPC 消息语义」与「协议与业务语义」，能否比较不同实现的质量、成本、延迟或安全取舍，并说明何时不应采用？
- **验证与失效：** 围绕「复现练习：逐条追踪 MCP JSON-RPC 消息与角色责任」和「MCP 双时代协议模型：Handshake 与 Stateless Request Envelope」，能否设计一个边界/故障/对抗测试，明确预期结果、证据和通过标准？
### 课后复习

- 不看讲义重画本讲数据流/状态图，并逐项标记可信边界。
- 为一个失败案例写出根因、检测信号、恢复动作和防复发测试。
- 将结论转化为一条可自动检查的验收条件。

### 正式作业参考解答

**原始作业：** 绘制 Host—Client—Server 架构，解释 JSON-RPC request、response 和 notification 的区别，并标注授权责任。

**参考解答与推理：** Host 管理用户体验、连接策略和信任决策；Client 是协议通信逻辑组件；Server 暴露 tools/resources/prompts。注意 SDK 内部 ClientSession/transport connection 不等于 wire-level protocol session：2026-07-28 modern protocol 无协议级 session，2025-11-25 及以前 legacy 才有 initialize/initialized 握手和可选 Mcp-Session-Id。JSON-RPC request 有 id 并期待 response；notification 无 id、无需 response；response 对应 result 或 error。Host 决定连接和用户授权，Server 负责资源/工具业务校验。

**原始 Rubric 对照（满分 10 分）：**

- **角色（3 分）：** 正确说明三类参与方职责。要求提交物中有直接证据支持该项结论。

- **消息（3 分）：** 解释 id、result/error 和 notification。要求提交物中有直接证据支持该项结论。

- **信任边界（4 分）：** 明确 Host 承担连接与用户授权策略。要求提交物中有直接证据支持该项结论。

**常见错误与纠正：**

- 把 JSON-RPC notification 当 request；把 legacy initialize 当作 modern 必需握手；把 protocol compatibility 当 trust；断连后假设 modern server session 仍存在；盲目重放在途写操作。
- 只写术语、不展示推导或数据来源；要求补充中间步骤和可复核依据。
- 把设计、模拟和真实执行混为一谈；要求显式标注验证等级。

## 第二讲：能力发现、Tools、Resources 与 Prompts

### 课前准备

- 复习：JSON-RPC、HTTP/stdio、OAuth、TLS、会话管理与 API 版本兼容
- 预读主题：Tools、Resources 与 Prompts、初始化与能力协商、发现与调用生命周期、资源订阅与更新、复现练习：为 MCP Server 制作能力目录与兼容清单。
- 准备一个成功路径和一个失败路径，要求学生比较其状态、权限和恢复差异。

### 教学路径与关键讲解

1. **概念建立：** 讲解 Tools、Resources 与 Prompts、初始化与能力协商、发现与调用生命周期，先定义对象、边界和数据流。
2. **工程深化：** 以 资源订阅与更新 为切入点讨论异常、权限、成本或可维护性，并指出由哪个可信组件执行控制。
3. **实践复现：** 复现练习：为 MCP Server 制作能力目录与兼容清单。先独立推导，再对照参考解答检查假设与边界。
4. **证据要求：** 提交物包含输入/假设、处理步骤、结果、失败路径、版本和未验证项。

### 学习检查点（含教师提示）

- **核心机制：** 围绕「Tools、Resources 与 Prompts」与「现代版本元数据与旧版握手兼容」，能否解释本讲的关键机制并写出必要公式、状态或数据流？要求说明变量/参与方及适用假设。
- **工程权衡：** 针对「发现与调用生命周期」与「资源订阅与更新」，能否比较不同实现的质量、成本、延迟或安全取舍，并说明何时不应采用？
- **验证与失效：** 围绕「复现练习：为 MCP Server 制作能力目录与兼容清单」和「能力发现、结果缓存与多租户缓存隔离」，能否设计一个边界/故障/对抗测试，明确预期结果、证据和通过标准？
### 课后复习

- 不看讲义重画本讲数据流/状态图，并逐项标记可信边界。
- 为一个失败案例写出根因、检测信号、恢复动作和防复发测试。
- 将结论转化为一条可自动检查的验收条件。

### 正式作业参考解答

**原始作业：** 为企业文档服务器定义 Tools、Resources、Prompts 三类能力清单，并说明 modern per-request metadata、server/discover、subscriptions/listen、缓存和授权策略。

**参考解答与推理：** Tools 是可执行操作，Resources 是可读取数据，Prompts 是可复用提示模板。能力目录记录名称、描述、schema/URI、版本、权限范围、风险、owner。Modern 每个 request 在 params._meta 携带 protocolVersion、clientCapabilities；clientInfo 可选且是自报展示/调试信息，不可用于授权或安全决策；Server MUST 实现 server/discover，Client MAY 预先调用。Modern list_changed 通知需先通过 subscriptions/listen 订阅，并触发对应缓存失效；Legacy 才使用 initialize/initialized。Resource 访问仍需按用户/租户授权。

**原始 Rubric 对照（满分 10 分）：**

- **能力区分（3 分）：** 正确区分操作、数据和提示模板。要求提交物中有直接证据支持该项结论。

- **协商发现（3 分）：** 描述版本协商、列表变化和缓存更新。要求提交物中有直接证据支持该项结论。

- **安全策略（4 分）：** 定义资源范围和调用授权。要求提交物中有直接证据支持该项结论。

**常见错误与纠正：**

- 把 JSON-RPC notification 当 request；把 legacy initialize 当作 modern 必需握手；把 protocol compatibility 当 trust；断连后假设 modern server session 仍存在；盲目重放在途写操作。
- 只写术语、不展示推导或数据来源；要求补充中间步骤和可复核依据。
- 把设计、模拟和真实执行混为一谈；要求显式标注验证等级。

## 第三讲：Transport、会话与连接生命周期

### 课前准备

- 复习：JSON-RPC、HTTP/stdio、OAuth、TLS、会话管理与 API 版本兼容
- 预读主题：Transport 的职责、会话生命周期、并发、取消和超时、重连与版本漂移、复现练习：设计远程 MCP Transport 生命周期。
- 准备一个成功路径和一个失败路径，要求学生比较其状态、权限和恢复差异。

### 教学路径与关键讲解

1. **概念建立：** 讲解 Transport 的职责、会话生命周期、并发、取消和超时，先定义对象、边界和数据流。
2. **工程深化：** 以 重连与版本漂移 为切入点讨论异常、权限、成本或可维护性，并指出由哪个可信组件执行控制。
3. **实践复现：** 复现练习：设计远程 MCP Transport 生命周期。先独立推导，再对照参考解答检查假设与边界。
4. **证据要求：** 提交物包含输入/假设、处理步骤、结果、失败路径、版本和未验证项。

### 学习检查点（含教师提示）

- **核心机制：** 围绕「Transport 的职责」与「会话生命周期」，能否解释本讲的关键机制并写出必要公式、状态或数据流？要求说明变量/参与方及适用假设。
- **工程权衡：** 针对「并发、取消和超时」与「重连与版本漂移」，能否比较不同实现的质量、成本、延迟或安全取舍，并说明何时不应采用？
- **验证与失效：** 围绕「复现练习：设计远程 MCP Transport 生命周期」和「Streamable HTTP、MRTR 与无会话部署」，能否设计一个边界/故障/对抗测试，明确预期结果、证据和通过标准？
### 课后复习

- 不看讲义重画本讲数据流/状态图，并逐项标记可信边界。
- 为一个失败案例写出根因、检测信号、恢复动作和防复发测试。
- 将结论转化为一条可自动检查的验收条件。

### 正式作业参考解答

**原始作业：** 为远程 MCP Server 设计 modern stateless 与 legacy session 双栈状态机，覆盖认证、版本选择、请求超时、取消、断连重连和能力重新发现。

**参考解答与推理：** Modern 状态：unknown→optional server/discover→version_selected→ready→draining；Legacy 状态：disconnected→connecting→authenticating→initialize→initialized→ready→closing/failed。Modern 每个 request 携带 _meta，无协议级 session；应用可用显式业务 handle 在工具参数中保留状态；Legacy 才清理/恢复旧 session。请求关联 id、deadline、cancel token；超时后先判断副作用是否提交。断连后重新认证、按需 server/discover，写操作用幂等键或状态查询恢复。

**原始 Rubric 对照（满分 10 分）：**

- **传输选择（3 分）：** 比较本地 stdio 与远程 HTTP 约束。要求提交物中有直接证据支持该项结论。

- **生命周期（3 分）：** 状态机覆盖正常与异常转移。要求提交物中有直接证据支持该项结论。

- **恢复安全（4 分）：** 重连重新认证/协商并处理在途副作用。要求提交物中有直接证据支持该项结论。

**常见错误与纠正：**

- 把 JSON-RPC notification 当 request；把 legacy initialize 当作 modern 必需握手；把 protocol compatibility 当 trust；断连后假设 modern server session 仍存在；盲目重放在途写操作。
- 只写术语、不展示推导或数据来源；要求补充中间步骤和可复核依据。
- 把设计、模拟和真实执行混为一谈；要求显式标注验证等级。

## 第四讲：MCP 安全、身份验证与权限治理

### 课前准备

- 复习：JSON-RPC、HTTP/stdio、OAuth、TLS、会话管理与 API 版本兼容
- 预读主题：MCP 威胁模型、身份与授权、工具投毒与用户确认、安全审计与供应链、复现练习：建立第三方 MCP Server 威胁模型。
- 准备一个成功路径和一个失败路径，要求学生比较其状态、权限和恢复差异。

### 教学路径与关键讲解

1. **概念建立：** 讲解 MCP 威胁模型、身份与授权、工具投毒与用户确认，先定义对象、边界和数据流。
2. **工程深化：** 以 安全审计与供应链 为切入点讨论异常、权限、成本或可维护性，并指出由哪个可信组件执行控制。
3. **实践复现：** 复现练习：建立第三方 MCP Server 威胁模型。先独立推导，再对照参考解答检查假设与边界。
4. **证据要求：** 提交物包含输入/假设、处理步骤、结果、失败路径、版本和未验证项。

### 学习检查点（含教师提示）

- **核心机制：** 围绕「MCP 威胁模型」与「身份与授权」，能否解释本讲的关键机制并写出必要公式、状态或数据流？要求说明变量/参与方及适用假设。
- **工程权衡：** 针对「工具投毒与用户确认」与「安全审计与供应链」，能否比较不同实现的质量、成本、延迟或安全取舍，并说明何时不应采用？
- **验证与失效：** 围绕「复现练习：建立第三方 MCP Server 威胁模型」和「OAuth 安全加固：Issuer、Audience、CIMD 与 Token Binding」，能否设计一个边界/故障/对抗测试，明确预期结果、证据和通过标准？
### 课后复习

- 不看讲义重画本讲数据流/状态图，并逐项标记可信边界。
- 为一个失败案例写出根因、检测信号、恢复动作和防复发测试。
- 将结论转化为一条可自动检查的验收条件。

### 正式作业参考解答

**原始作业：** 为企业 MCP Host 连接第三方 Server 建立威胁模型，覆盖身份、scope、工具投毒、资源访问和供应链，并定义上线门槛。

**参考解答与推理：** 威胁覆盖恶意 Server、工具描述投毒、资源内容注入、scope 过宽、token 泄露、网络边界和依赖供应链。验证 issuer/audience/expiry/scope，按资源和动作最小授权；固定 Server 来源/版本，敏感写操作需用户确认，日志不记录 bearer token，具备撤销、审计和回归。

**原始 Rubric 对照（满分 10 分）：**

- **威胁覆盖（3 分）：** 覆盖恶意 Server、工具描述、越权和凭证风险。要求提交物中有直接证据支持该项结论。

- **身份授权（3 分）：** 验证 issuer/audience/scope 并遵循最小权限。要求提交物中有直接证据支持该项结论。

- **治理审计（4 分）：** 记录版本、来源、审批和安全回归。要求提交物中有直接证据支持该项结论。

**常见错误与纠正：**

- 把 JSON-RPC notification 当 request；把 legacy initialize 当作 modern 必需握手；把 protocol compatibility 当 trust；断连后假设 modern server session 仍存在；盲目重放在途写操作。
- 只写术语、不展示推导或数据来源；要求补充中间步骤和可复核依据。
- 把设计、模拟和真实执行混为一谈；要求显式标注验证等级。

## 第五讲：MCP 集成测试、运维与互操作

### 课前准备

- 复习：JSON-RPC、HTTP/stdio、OAuth、TLS、会话管理与 API 版本兼容
- 预读主题：协议一致性测试、互操作与兼容、运行监控与故障处理、部署与运维治理、复现练习：构建 MCP 互操作与升级验收矩阵。
- 准备一个成功路径和一个失败路径，要求学生比较其状态、权限和恢复差异。

### 教学路径与关键讲解

1. **概念建立：** 讲解 协议一致性测试、互操作与兼容、运行监控与故障处理，先定义对象、边界和数据流。
2. **工程深化：** 以 部署与运维治理 为切入点讨论异常、权限、成本或可维护性，并指出由哪个可信组件执行控制。
3. **实践复现：** 复现练习：构建 MCP 互操作与升级验收矩阵。先独立推导，再对照参考解答检查假设与边界。
4. **证据要求：** 提交物包含输入/假设、处理步骤、结果、失败路径、版本和未验证项。

### 学习检查点（含教师提示）

- **核心机制：** 围绕「协议一致性测试」与「互操作与兼容」，能否解释本讲的关键机制并写出必要公式、状态或数据流？要求说明变量/参与方及适用假设。
- **工程权衡：** 针对「运行监控与故障处理」与「部署与运维治理」，能否比较不同实现的质量、成本、延迟或安全取舍，并说明何时不应采用？
- **验证与失效：** 围绕「复现练习：构建 MCP 互操作与升级验收矩阵」和「Extensions、Tasks 与协议弃用治理」，能否设计一个边界/故障/对抗测试，明确预期结果、证据和通过标准？
### 课后复习

- 不看讲义重画本讲数据流/状态图，并逐项标记可信边界。
- 为一个失败案例写出根因、检测信号、恢复动作和防复发测试。
- 将结论转化为一条可自动检查的验收条件。

### 正式作业参考解答

**原始作业：** 为一个远程 MCP 文档 Server 制定上线验收清单，包含协议兼容矩阵、错误/取消测试、身份安全、监控和升级回滚。

**参考解答与推理：** 测试矩阵覆盖 modern per-request _meta/server/discover、legacy initialize、tool call、resource read、subscriptions/listen、MRTR、错误、取消、并发、超时和断连。兼容策略记录 Host/Server/protocol version；升级前跑 contract tests 与 sandbox canary。运维包含 TLS、短期凭证、速率限制、trace、告警、回滚和在途副作用恢复。

**原始 Rubric 对照（满分 10 分）：**

- **测试矩阵（3 分）：** 覆盖 modern per-request metadata、server/discover、legacy initialize、调用、资源、subscriptions/listen 和异常。要求提交物中有直接证据支持该项结论。

- **互操作（3 分）：** 定义 Host/Server/协议版本兼容策略。要求提交物中有直接证据支持该项结论。

- **运维安全（4 分）：** 覆盖 TLS、凭证、监控和回滚。要求提交物中有直接证据支持该项结论。

**常见错误与纠正：**

- 把 JSON-RPC notification 当 request；把 legacy initialize 当作 modern 必需握手；把 protocol compatibility 当 trust；断连后假设 modern server session 仍存在；盲目重放在途写操作。
- 只写术语、不展示推导或数据来源；要求补充中间步骤和可复核依据。
- 把设计、模拟和真实执行混为一谈；要求显式标注验证等级。

## 进阶概念辨析与课堂扩展

### 1. MCP 双协议时代与版本语义

教学必须区分 legacy handshake era（2025-11-25 及以前）和 modern stateless era（2026-07-28）。旧版本使用 initialize/notifications/initialized 和协议级 session；现代版本移除协议级 handshake/session，每个 request 在 params._meta 中携带 protocolVersion 与 clientCapabilities；clientInfo 可选且为自报信息，不可用于安全决策；每个 Server MUST 实现 server/discover，Client MAY 预先调用。HTTP Streamable 每个 request 独立 POST，长期变更通过 subscriptions/listen。版本不是字符串标签，而是影响生命周期、消息字段、缓存和错误处理的 wire contract。新实现应同时测试旧版兼容与现代无状态请求。

### 2. Tools、Resources、Prompts 与缓存策略

Tools 表示动作执行，Resources 表示可读取上下文，Prompts 表示可复用提示模板。不要把三者混成一个“工具列表”。现代 cacheable complete results 要求 ttlMs 与 cacheScope；input_required 与携带 inputResponses/requestState 的 retry 不可缓存。ttlMs=0 表示立即 stale，并非强制 no-store。cacheScope=private 只能在相同 authorization context 内复用；public 仅适用于跨调用者一致的数据。缓存键应考虑 method、参数、protocol version、principal/tenant 和 resource version；ACL 始终独立执行。

### 3. Streamable HTTP、MRTR 与无状态扩展

现代 Streamable HTTP 每个 JSON-RPC request 独立 POST；旧 GET/DELETE /mcp stream endpoint、Mcp-Session-Id 和 Last-Event-ID 已移除，GET/DELETE 返回 405；Server 返回 JSON 或 request-scoped SSE，长期变更通知通过 subscriptions/listen。HTTP 请求校验 MCP-Protocol-Version、Mcp-Method、适用时的 Mcp-Name 与 body 一致。MRTR 用 InputRequiredResult/inputRequests/requestState 将用户输入嵌入 prompts/get、resources/read、tools/call 的结果流程；client 使用新 JSON-RPC id 重试，并原样 echo 不透明 requestState；requestState 只能用于原 request retry，server 必须防篡改及跨 principal 重放。部署不应依赖 sticky sessions，但必须处理版本兼容、请求关联、取消和幂等。

### 4. OAuth/OIDC 安全与资源受众

MCP Authorization 是可选的 HTTP transport 规范，不用于 STDIO。OAuth 2.1 draft-17（2026-10-30 更新）与 CIMD draft-03（2026-11-02 更新）都是 IETF Internet-Drafts，不是最终 RFC。客户端按 metadata 对 iss 做条件校验；resource 参数必须同时出现在 authorization/token request 并指向 MCP Server canonical URI；token audience 必须绑定该 server。CIMD metadata URL 抓取需防 SSRF/钓鱼；DCR 已弃用但可兼容旧授权服务器。禁止把发给一个 resource server 的 access token 直接透传给另一个 MCP Server。Host 还需落实 Origin/Host 验证、DNS rebinding 防护、redirect URI 校验、secret 管理和每次工具调用的授权。

### 5. Extensions、Tasks 与弃用生命周期

Modern Extensions 由 client per-request capabilities 与 server/discover capabilities 声明，双方显式 opt-in。Tasks 是可选扩展，当前 task-augmented execution 仅支持 tools/call；使用 durable task handle、tasks/get/update/cancel 与 subscriptions/listen。MCP Apps 使用 ui:// resource 和 sandboxed iframe，Host 必须声明 UI capability；不支持 UI 时应降级为普通工具结果。Roots、Sampling、Logging、DCR 和 legacy HTTP+SSE 已弃用；新实现 SHOULD NOT 采用。教材和工程实现必须标注规范版本、扩展 opt-in、deprecated API 和迁移计划，不能把实验性或旧版能力写成当前核心必选项。

### 6. 实验工作簿与代码

五项实验统一见 [M12 实验工作簿](./M12-lab-workbook.md)，可运行计算器见仓库的 `examples/m12/README.md`。实验对协议版本、缓存策略、HTTP envelope、OAuth token binding 和 extension negotiation 做确定性校验，不启动真实 MCP Server 或 OAuth Provider。

## 教师批改总表

| 讲次 | 核心能力 | 关键证据 | 必须纠正的误区 |
|---|---|---|---|

| 1 | MCP 架构、角色与协议边界 | 图/表/公式/测试记录与版本信息 | 把 JSON-RPC notification 当 request；把 legacy initialize 当作 modern 必需握手；把 protocol compatibility 当 trust；断连后假设 modern server session 仍存在；盲目重放在途写操作。 |

| 2 | 能力发现、Tools、Resources 与 Prompts | 图/表/公式/测试记录与版本信息 | 把 JSON-RPC notification 当 request；把 legacy initialize 当作 modern 必需握手；把 protocol compatibility 当 trust；断连后假设 modern server session 仍存在；盲目重放在途写操作。 |

| 3 | Transport、会话与连接生命周期 | 图/表/公式/测试记录与版本信息 | 把 JSON-RPC notification 当 request；把 legacy initialize 当作 modern 必需握手；把 protocol compatibility 当 trust；断连后假设 modern server session 仍存在；盲目重放在途写操作。 |

| 4 | MCP 安全、身份验证与权限治理 | 图/表/公式/测试记录与版本信息 | 把 JSON-RPC notification 当 request；把 legacy initialize 当作 modern 必需握手；把 protocol compatibility 当 trust；断连后假设 modern server session 仍存在；盲目重放在途写操作。 |

| 5 | MCP 集成测试、运维与互操作 | 图/表/公式/测试记录与版本信息 | 把 JSON-RPC notification 当 request；把 legacy initialize 当作 modern 必需握手；把 protocol compatibility 当 trust；断连后假设 modern server session 仍存在；盲目重放在途写操作。 |


## 评分与教学一致性要求

- 评分项和分值逐条取自课程模块正式 Rubric；不改变原题、分值或课程内评分标准。
- 数学题写明单位、假设和舍入规则；架构题展示替代方案与故障边界；安全题将控制映射到执行组件和测试证据。
- 外部服务使用 mock/sandbox 时明确标注范围，不得将模拟通过描述为真实 provider 或生产验收。
- 允许其他等价方案，只要满足原始 Rubric 且证据充分。


### MCP 2026-07-28 规范核验（补充操作细节）

- `server/discover` 是 Server MUST 实现的方法，Client MAY 在首个业务 request 前调用；Modern request 的 `_meta` 包含 protocolVersion、clientCapabilities；clientInfo 可选且仅供展示/调试。
- Streamable HTTP 的 POST 必须带 `MCP-Protocol-Version` 与 `Mcp-Method`；`tools/call`、`resources/read`、`prompts/get` 还需 `Mcp-Name`。GET/DELETE `/mcp` 返回 405；通知使用 `subscriptions/listen`，不是旧 GET SSE endpoint。
- `ttlMs=0` 表示立即 stale；`input_required` MRTR 中间结果和带 `inputResponses`/`requestState` 的 retry 不可缓存。`cacheScope=public` 只能用于跨用户一致数据；`private` 按 authorization context 隔离，ACL 始终独立执行。
- MRTR 仅适用于 `prompts/get`、`resources/read`、`tools/call`；`requestState` 不透明、原样 echo、不能跨请求复用；服务器需防篡改和跨 principal 重放，retry 使用新 JSON-RPC id。
- OAuth 2.1 draft-17（2026-10-30 更新）与 CIMD draft-03（2026-11-02 更新）均为 Active Internet-Drafts，尚未成为 RFC。`iss` 缺失时按 `authorization_response_iss_parameter_supported` metadata 处理；出现 iss 时必须与记录的 issuer 严格比较。`resource` 参数同时绑定 authorization 和 token request。
- Tasks task handle 包含 taskId/status/ttlMs/pollIntervalMs；取消是 cooperative。MCP Apps 通过 `_meta.ui.resourceUri` 指向 `ui://` resource，Host 在 sandbox iframe 渲染并控制 postMessage 能力。
