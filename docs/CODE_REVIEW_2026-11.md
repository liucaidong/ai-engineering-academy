# 首轮代码 Review 报告

- 日期：2026-11-10
- 分支：`develop`
- 范围：前端应用状态、课程编辑器、Markdown 渲染；后端配置、CORS/CSRF、OIDC、会话、租户授权、学习/测评 API、SQLAlchemy 事务上下文、ORM 模型与 RLS migrations。
- 状态：首轮重点路径 Review 已完成；不是全仓逐行审计，也不是生产安全认证。

## 1. 已确认并修复的问题

### CR-001 — CORS 未允许租户请求头（P2，已修复）

**问题**：学习进度与测评 API 均要求 `X-Tenant-ID`，但 credentialed CORS 原配置仅允许 `Content-Type` 和 `X-CSRF-Token`。浏览器跨源预检会拒绝包含 `X-Tenant-ID` 的请求，导致启用 learner APIs 后前端无法调用。

**修复**：
- 将浏览器安全中间件配置抽取为可测试的 `configure_browser_security`。
- CORS allow headers 增加 `X-Tenant-ID`。
- 新增 ASGI 级 OPTIONS preflight 测试，验证 tenant、CSRF 请求头和 credentials。

### CR-002 — Assessment key 未规范化（P2，已修复）

**问题**：测评 attempt 创建时，存在性检查与 attempt 序号查询使用 `strip()` 后的 assessment key，但持久化调用使用原始输入。带前后空格的合法 ID 可能被检查为存在，却以非规范 ID 存储。

**修复**：
- `AttemptCreate` 启用 `str_strip_whitespace=True`。
- 新增测试覆盖前后空格规范化和纯空白拒绝。
- 不改变 assessment ID 的课程数据定义。

### CR-003 — 全课程编辑器加载失败无错误状态（P2，已修复）

**问题**：`loadFullCourse()` 失败时没有 rejection handler，编辑器会永久停留在加载提示，学习者无法重试。

**修复**：
- 增加显式加载错误状态和“重试加载”操作。
- 新增 E2E：人为阻断 M20 chunk，验证错误状态可见；恢复网络后重试成功。
- 延长跨 reload 编辑器测试的异步等待，降低 20 个课程 chunk 并发加载时的偶发超时。

## 2. 已审查的安全控制

| 控制面 | 审查结论 |
|---|---|
| OIDC issuer | 配置要求 HTTPS；Discovery issuer 必须精确匹配 |
| Discovery/JWKS | HTTPS endpoint、有限超时、禁止自动跟随重定向、JWKS TTL 与未知 kid 单次刷新 |
| JWT | 算法 allowlist；校验签名、iss、aud、exp、iat、nonce；多 audience 检查 azp；限制 sub |
| OAuth 登录事务 | state/nonce 仅存 hash；PKCE verifier Fernet 加密；短时效、一次性消费与行锁 |
| Session | 256-bit opaque token；数据库只存 SHA-256 hash；撤销与过期检查；Secure/HttpOnly/SameSite cookie |
| CSRF | cookie-authenticated unsafe methods 检查 allowlisted Origin、double-submit 与 session-bound HMAC |
| Tenant authorization | tenant/user/membership 从数据库解析；未知权限 default deny；禁止客户端角色声明 |
| PostgreSQL RLS | transaction-local GUC；用户、租户、会话、OIDC pre-auth context 相互清理；强制 RLS |
| Learner APIs | tenant header 经过 membership 授权；资源查询同时约束 user_id 与 tenant_id；payload 有 JSON 大小限制 |
| Markdown | ReactMarkdown 默认不解析 raw HTML；未引入 rehype-raw 或危险 HTML 注入路径 |
| Course import/export | JSON schema 校验、2 MiB UTF-8 上限、本地导入导出；无服务端执行或自动发布 |

在本次检查范围内，没有确认 P0/P1 级缺陷；这不等于全仓、外部 IdP 或生产环境已经通过安全审计。

## 3. 需要后续处理的架构与性能事项

| 项目 | 风险/优先级 | 建议 |
|---|---|---|
| `src/App.tsx` 仍承担过多页面组合和数据加载职责 | 中 | 已抽取学习状态 hook；继续拆分 sidebar、lesson workspace、lab router 与数据加载 hooks |
| `oidc_provider.py` 和 `api/auth.py` 仍偏大 | 中 | 后续拆分 discovery/JWKS、token exchange/verification、auth application service |
| `Database.check_schema_revision` 在认证/learner API 请求路径重复访问数据库 | P2 性能 | 保持 fail-closed 语义，评估 startup gate + 有界缓存/健康检查，不在缺少负载数据时盲目缓存 |
| OIDC login/callback 缺少应用层速率限制 | P2 上线前 | 在公开部署前加入基于 IP/会话/issuer 的限流与异常登录审计 |
| PostgreSQL RLS 集成测试依赖专用数据库环境 | 验收限制 | 在隔离 PostgreSQL 环境中执行，不能以 mock 测试代替 |
| OIDC 使用 fake provider transport 测试 | 验收限制 | 生产启用前必须完成真实测试 IdP 的端到端验收 |
| localStorage 学习进度与草稿 | 产品边界 | 仍是设备本地数据；若引入账户同步，需定义冲突、迁移、隐私和删除策略 |

## 4. 质量门禁

- Ruff 启用 Bandit S 规则；生产应用代码不豁免安全规则。
- 测试断言 S101 仅对 `tests/**/*.py` 豁免；假密钥与测试 URL 逐行说明。
- 迁移 SQL S608 豁免仅用于固定 SQL 片段；RLS 集成测试表名来自代码中的固定 allowlist。
- npm 官方 registry 生产依赖审计结果：未发现已知漏洞。
- 代码 Review 的静态检查不能替代真实 PostgreSQL RLS、真实 OIDC provider、部署环境和渗透测试。
