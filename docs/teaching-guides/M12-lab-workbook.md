# M12 实验工作簿：MCP 2026-07-28 双时代协议与集成

> 课程版本：0.40.9

> **证据等级：** E2 Simulated（合成 MCP/OAuth 边界消息）+ E3 Local-tested（协议/schema 本地测试）；不证明远程 MCP Server/OAuth 互操作。 统一定义见[全课程证据等级](../CURRICULUM_EVIDENCE_LEVELS.md)。

> 五项实验对应 M12 五讲。实验使用 Python 标准库和合成消息，不连接真实 MCP Server、OAuth Provider、浏览器或外部工具。

## 学习成果

完成本工作簿后，学习者应能够：
1. 区分 2025-11-25 及以前的 handshake era 与 2026-07-28 stateless era；
2. 解释 server/discover、Tools/Resources/Prompts 和缓存提示；
3. 验证 Streamable HTTP、Mcp-Method/Mcp-Name、MRTR 和无会话部署；
4. 检查 OAuth issuer/audience/token binding 与常见 confused-deputy 风险；
5. 设计 Extensions 协商、Tasks/MCP Apps 兼容和弃用迁移矩阵。

## 规范基线

本工作簿以官方 2026-07-28 MCP 规范为当前基线，并保留 2025-11-25 及以前版本的互操作知识。规范入口：

- Model Context Protocol Specification 2026-07-28
- MCP Blog: The 2026-07-28 Specification
- MCP Streamable HTTP Transport
- MCP Versioning and Compatibility
- MCP Caching Specification
- Multi Round-Trip Requests (MRTR)
- MCP Tasks Extension / MCP Apps Extension / Deprecated Features Registry
- MCP Authorization Specification
- IETF OAuth 2.1 draft-17 / Client ID Metadata Document draft-03

不要将旧版 initialize/session 语义写成现代版本要求；也不要将扩展能力描述为所有 peer 都必须实现的核心功能。

## 环境与运行

Python 3.10+，从仓库根目录执行，无第三方依赖：

    python3 examples/m12/01_protocol_eras.py
    python3 examples/m12/02_capability_cache.py
    python3 examples/m12/03_streamable_http.py
    python3 examples/m12/04_oauth_binding.py
    python3 examples/m12/05_extension_matrix.py
    python3 -m unittest discover -s examples/m12 -p 'test_examples.py'

---

## 实验一：MCP 协议版本与双时代生命周期

**对应课程：** 第一讲《MCP 架构、角色与协议边界》

### 任务

为一个同时连接 legacy server 和 modern server 的 Host 设计版本识别与请求生命周期。

### 操作

1. 运行 01_protocol_eras.py。
2. 将 2025-11-25 及以前版本归入 handshake era。
3. 将 2026-07-28 归入 stateless era。
4. 对照 initialize/notifications/initialized 与 server/discover/per-request _meta。
5. 构造 request、response、notification 和 error，检查 JSON-RPC id 与响应匹配。

### 必须提交

- 两个协议时代的 lifecycle sequence diagram；
- per-request protocolVersion/clientCapabilities 字段表，并说明 clientInfo 可选且不可信；
- version mismatch 和 unsupported method 错误策略；
- legacy/modern 双栈兼容矩阵；
- 说明 SDK 内部 ClientSession 不等于现代 wire-level session；应用可通过显式业务 handle 传递跨调用状态。

### 常见错误

- 认为 initialize 是所有版本都必须执行的握手；
- 把 2026-07-28 仍然解释为 Mcp-Session-Id 会话协议；
- 将 notification 当作需要 response 的 request；
- 只替换版本字符串，不处理字段和生命周期差异。

---

## 实验二：server/discover、能力目录与缓存隔离

**对应课程：** 第二讲《能力发现、Tools、Resources 与 Prompts》

### 任务

建立一个可缓存但不会跨租户泄漏的 MCP 能力目录。

### 操作

1. 运行 02_capability_cache.py。
2. 分别定义 Tool、Resource、Prompt 的输入、输出和使用语义。
3. 为 modern server/discover 和 tools/list/resources/list/prompts/list 设计缓存提示。
4. 为结果设置 ttlMs 和 cacheScope；验证 ttlMs=0 立即 stale、input_required/retry 不可缓存。
5. 模拟 private tenant-specific tool list、public static resource 和 TTL 过期。

### 必须提交

- Tool/Resource/Prompt capability catalog；
- inputSchema/outputSchema/annotations 的验证策略；
- ttlMs/cacheScope 的缓存矩阵；
- principal/tenant/protocolVersion/resource version 缓存键；
- 分页 cursor、listChanged 和缓存失效方案。

### 常见错误

- 将 Tools、Resources、Prompts 当作同一种能力；
- private list 使用 public shared cache；
- 把 ttlMs 当作权限有效期；
- 缓存键遗漏 tenant 或 authorization context。

---

## 实验三：Streamable HTTP、路由头与 MRTR

**对应课程：** 第三讲《Transport、会话与连接生命周期》

### 任务

设计一个无协议级会话的远程 MCP HTTP 服务，验证请求路由和响应关联。

### 操作

1. 运行 03_streamable_http.py。
2. 为每个 JSON-RPC request 建立独立 POST；Modern Streamable HTTP 不定义 client-to-server notifications。
3. 验证 MCP-Protocol-Version、Mcp-Method 和 Mcp-Name 与 body 一致。
4. 删除现代协议对 Mcp-Session-Id 和旧 GET stream endpoint 的依赖。
5. 构造 MRTR 流程，说明 server 如何通过 InputRequiredResult/inputRequests/requestState 将 Elicitation 输入嵌入结果并交由 Host 审批；Sampling/Roots 仅属弃用兼容面。

### 必须提交

- Streamable HTTP sequence diagram；
- request id、trace id 和 header/body 一致性规则；
- JSON 与 request-scoped SSE response 处理；
- MRTR 的 Host consent、requestState 原样 echo/完整性保护、新 JSON-RPC id 和取消策略；
- legacy HTTP+SSE 兼容/迁移方案。

### 常见错误

- 将旧 GET SSE 连接当作现代传输必需组件；
- 用 sticky session 维持现代协议的协议级状态；
- 忽略 header/body routing mismatch；
- 让 Server 侧请求绕过 Host 的用户同意策略。

---

## 实验四：OAuth Issuer、Audience 与 Token Binding

**对应课程：** 第四讲《MCP 安全、身份验证与权限治理》

### 任务

为 Host、Authorization Server 和 MCP Resource Server 建立安全授权边界，阻止 token 误用。

### 操作

1. 运行 04_oauth_binding.py。
2. 定义 client、authorization server、resource server、issuer、audience 和 scope。
3. 模拟 issuer mismatch、audience mismatch、错误 resource indicator 和跨 server token passthrough。
4. 比较 CIMD draft-03 与 legacy DCR 的身份元数据管理，评估 CIMD URL fetch 的 SSRF/domain trust 风险。
5. 将 Origin/Host 校验、DNS rebinding、redirect URI、secret storage 和 tenant authorization 纳入威胁模型。

### 必须提交

- OAuth/OIDC trust boundary；
- issuer/audience/resource validation；
- token issuer binding 和禁止 token passthrough 的测试；
- CIMD/DCR 迁移兼容策略；
- 401/403、consent、撤权和审计事件方案。

### 常见错误

- 将 OAuth access token 当作 MCP Server 的通用 bearer token；
- 不验证 iss 或 aud；
- 不区分 Client、Authorization Server 与 Resource Server；
- 将用户批准某个 tool call 视为永久授权。

---

## 实验五：Extensions、Tasks、MCP Apps 与版本治理

**对应课程：** 第五讲《MCP 集成测试、运维与互操作》

### 任务

设计多版本、多扩展 MCP Server 的兼容和升级策略。

### 操作

1. 运行 05_extension_matrix.py。
2. 以 reverse-DNS extension ID 表示扩展能力；现代客户端每请求声明 clientCapabilities.extensions，Server 通过 server/discover 声明支持项。
3. 构造 client/server capabilities 协商矩阵。
4. 将 Tasks 作为 2026-07-28 可选官方扩展，验证双边 opt-in、durable task handle 和任务生命周期；不要将其描述为 2025-11-25 核心实验能力。
5. 对 MCP Apps、Roots/Sampling/Logging、legacy HTTP+SSE 建立支持/弃用/迁移矩阵。

### 必须提交

- extension negotiation matrix；
- Tasks extension 双边 opt-in；当前 task-augmented execution 仅支持 `tools/call`；taskId/status/ttlMs/pollIntervalMs、tasks/get/update/cancel 与 cooperative cancellation；
- MCP Apps `io.modelcontextprotocol/ui` capability、`_meta.ui.resourceUri`、`ui://` resource、sandbox iframe、postMessage 与 Host consent 边界；不支持 UI 的 Host 必须能降级为普通工具结果。
- deprecated feature 和 migration deadline 清单；
- protocol conformance、compatibility、security 和 observability 测试矩阵。

### 常见错误

- 将 Tasks 扩展当作现代 MCP 核心默认能力；
- 未协商扩展就返回 extension-specific result；
- 不记录 deprecated API 的迁移计划；
- 只测 happy path，不测版本降级和不支持能力。

---

## 统一评分建议

| 维度 | 权重 | 达标证据 |
|---|---:|---|
| 协议版本 | 20% | Legacy/Modern lifecycle 和 JSON-RPC 验证 |
| 能力发现 | 20% | Tool/Resource/Prompt catalog、缓存和隔离 |
| 传输语义 | 20% | Stateless POST、header routing 和 MRTR |
| 授权安全 | 20% | Issuer/Audience、token binding、CIMD 和威胁模型 |
| 扩展治理 | 20% | Extension negotiation、Tasks/MCP Apps 与迁移矩阵 |

所有协议断言必须标注版本。合成消息和标准库测试不能替代真实 SDK/Server 的官方 conformance test、OAuth Provider 测试或安全审计。


**现代协议要求：** Modern Streamable HTTP 每个 request 单独 POST，GET/DELETE `/mcp` 返回 405；每个 POST 带 `MCP-Protocol-Version` 与 `Mcp-Method`，适用时带 `Mcp-Name`。长期变更通过 `subscriptions/listen`。`ttlMs=0` 是立即 stale 而非强制 no-store；`cacheScope=private` 只在相同 authorization context 复用。MRTR 的 `requestState` 必须原样 echo、不可跨请求复用，retry 使用新 JSON-RPC id。OAuth 2.1 draft-17（2026-10-30 更新）与 CIMD draft-03（2026-11-02 更新）均为 Active Internet-Drafts，不是 RFC。
