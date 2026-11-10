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
| `Database.check_schema_revision` 在认证/learner API 请求路径重复访问数据库 | P2 性能 | 已增加 5 秒成功结果缓存、并发 miss 合并、失败不缓存和显式失效；部署仍要求 expand/contract 与 worker 重启，见 ADR-0007 |
| OIDC login/callback 缺少应用层速率限制 | P2 上线前 | 在公开部署前加入基于 IP/会话/issuer 的限流与异常登录审计 |
| PostgreSQL RLS 集成测试依赖专用数据库环境 | 已完成（2026-11-10） | 新增可重复临时 PostgreSQL 18 验收脚本；非 owner / 非 superuser / 非 BYPASSRLS 角色实测通过 |
| OIDC 使用 fake provider transport 测试 | 验收限制 | 生产启用前必须完成真实测试 IdP 的端到端验收 |
| localStorage 学习进度与草稿 | P1 产品缺口 | 当前仍是设备本地数据；接入账户同步前须定义冲突、迁移、隐私和删除策略 |
| Tenant discovery HTTP endpoint | 已完成（2026-11-10） | 新增 `GET /tenants/me`，依赖 session、transaction-local user context 和 migration 0010 self-only RLS policy；完整 HTTP route 与 opaque session resolver 已在真实 PostgreSQL 18.6 runtime role 下验证通过（不等于外部 OIDC Provider 验收） |
| 前端尚无 API runtime client | P1 功能缺口 | 仅有生成 OpenAPI 类型；开始调用时必须同时实现 Cookie credentials、CSRF、tenant header 和结构化错误处理 |

## 3.1 第二轮后端性能与一致性修复

- `Database.check_schema_revision` 原先每次认证或 learner API 请求都查询 `alembic_version`。
- 已引入 5 秒进程内 TTL，仅缓存精确匹配的成功结果；并发 cache miss 由 `asyncio.Lock` 合并；失败不缓存。
- 提供显式失效方法，并在 `dispose()` 时清理。
- 7 项 database tests 覆盖 TTL、失败不缓存、并发合并和失效；全量后端测试 131 passed / 1 skipped。

## 3.2 第三轮 OIDC 应用服务分层

- 将已验证 OIDC claims 到用户/个人租户 provisioning、Session 创建的用例从 `api/auth.py` 下沉至 `services/authentication.py`。
- HTTP Adapter 保留 state cookie 校验、一次性 transaction 消费、Token Exchange/验证调用、HTTP 状态码和 Cookie/Redirect。
- Application Service 管理身份解析与 Session 创建事务；唯一约束冲突时，在原事务退出回滚后最多重试一次，非 IntegrityError 不重试。
- 新增两个服务层测试验证 fresh transaction retry 和非完整性异常不重试；认证定向测试 9 passed。
- 该变更不改变 OIDC 协议流程；真实测试 IdP 端到端验收仍未完成。决策见 ADR-0008。
- 该优化没有真实 PostgreSQL 负载基准数据，不声称有确定百分比的延迟收益。迁移部署必须采用 expand/contract 并滚动重启 worker。

## 4. 质量门禁

- Ruff 启用 Bandit S 规则；生产应用代码不豁免安全规则。
- 测试断言 S101 仅对 `tests/**/*.py` 豁免；假密钥与测试 URL 逐行说明。
- 迁移 SQL S608 豁免仅用于固定 SQL 片段；RLS 集成测试表名来自代码中的固定 allowlist。
- npm 官方 registry 生产依赖审计结果：未发现已知漏洞。
- 代码 Review 的静态检查不能替代真实 PostgreSQL RLS、真实 OIDC provider、部署环境和渗透测试。


## 5. 2026-11-10 后续质量与功能基线

当前本地验证：Biome、TypeScript、OpenAPI drift、Vite production build 通过；Vitest 73 passed；Playwright 42 passed；Backend pytest 135 passed / 1 skipped；Ruff lint/format 通过。普通 pytest 的 RLS skip 是未提供双连接 URL 时的可选跳过；真实 PostgreSQL 18.6 验收已由独立脚本实际执行并通过。

后续系统功能优先级：
1. 实现前端 typed API transport，完整处理 HttpOnly Cookie、CSRF、tenant header、401/403/409/422/5xx。
2. 增加 session/tenant UI，并将学习进度和测评从 localStorage-only 逐步接入后端，定义本地历史数据迁移/冲突规则。
3. 真实 OIDC Provider E2E、隐私/数据保留审查完成前，继续保持 learner APIs 默认关闭。
4. 课程发布、Instructor 授权和云端编辑流程单独进行权限及审计设计，不从 learner-only role 推导管理权限。

详细基线与 DoD：[`ENGINEERING_QUALITY_AND_FUNCTIONALIZATION_2026-11.md`](./ENGINEERING_QUALITY_AND_FUNCTIONALIZATION_2026-11.md)。

## 6. 第四轮课程发布边界 Review（2026-11-10）

新增平台发布边界并完成 PostgreSQL 18.6 disposable acceptance：

- 平台发布身份独立于 tenant_admin 和 API runtime role；CLI 同时核验 session_user / current_user，拒绝 SET ROLE 代用连接。
- 课程导出复用前端 Zod Schema；后端再次执行严格 Pydantic 校验，拒绝未知字段、显式 null、无效嵌套结构、重复 ID、无效先修图和实验引用。
- 发布要求 dry-run 后人工复核的 SHA-256；数据库唯一约束负责 course/version 并发冲突；重复同内容为幂等 no-op，冲突内容不覆盖；并发发布验收验证两个发布进程只有一个实际 INSERT，另一个取得相同 UUID 的 no-op 结果；内容冲突拒绝覆盖，故意撤销 audit INSERT 权限后验证 release INSERT 随事务一起回滚。
- release 与全局 audit event 同一事务提交；publisher audit 不伪造 actor_user_id / tenant_id。
- publisher 对 tenant_memberships 具有仅供既有 audit policy EXISTS 子查询使用的 SELECT table privilege；restrictive RLS policy 即使面对任意自设 GUC 仍返回零行。
- 数据库触发器阻止 publisher 插入 draft，阻止已发布/已退役快照被修改或删除，阻止 retired 重新激活。
- 实测通过：20 modules / 100 lessons / 100 assessments 的实际课程快照校验、并发发布、重复幂等、内容冲突和 digest mismatch 拒绝、审计写入失败时的事务回滚、最小权限、租户行不可见及不可变性测试；migration downgrade/re-upgrade 也通过。
- 该测试数据库是 disposable；其中产生的 release UUID 不得绑定前端。真实持久化数据库的 DBA role provisioning、密钥管理与发布尚未执行。

残余风险：数据库 publisher 凭证仍具有对 course_releases 的 INSERT 权限；拥有该凭证的主体可绕过 CLI 直接提交结构不符合课程 Schema 的 published JSON。生产环境必须将该凭证仅交给受控发布作业/操作员，限制网络访问并保留审批与凭证轮换。当前审计事件可归因到 PostgreSQL publisher role，不能证明具体自然人身份。当前没有 HTTP 发布 API，也没有 Instructor/tenant_admin 发布权限。

## 7. 前端组件边界 Review（2026-11-10）

- 将课程目录、进度摘要、推荐模块、全文搜索状态、收藏过滤和模块列表从 App.tsx 抽取到 features/learning/CourseModuleNavigation.tsx。
- 将课程级别标签和已实现实验 ID 集合集中到 features/learning/courseMetadata.ts。
- 组件通过显式 props 和回调接收状态，不读写 localStorage，不承担会话/租户授权职责，也不引入新的全局状态。
- App.tsx 从 574 行降至 443 行，减少 131 行（22.8%）；页面交互和 CSS 选择器保持不变。
- 全量本地验收通过：88 Vitest、47 Playwright、152 backend pytest + 1 optional skip、TypeScript、Biome、OpenAPI drift、生产构建和 M04–M20 示例。
- 后续应优先抽取 lesson renderer 与 assessment composition；避免仅为了拆文件而引入过度抽象。

## 8. 课程正文与学习上下文组件 Review（2026-11-10）

- 将 lesson 正文、学习目标、模块完成动作、assessment 自评响应和参考来源抽取到 features/learning/LessonArticle.tsx。
- 将先修模块、学习成果和实验执行说明抽取到 features/learning/LearningContextAside.tsx。
- 组件通过显式 props/callbacks 接收状态；assessment 响应仍由 useLearningState 管理，持久化方式没有变化。
- 与课程导航组件合并计算，App.tsx 从 574 行降至 338 行，减少 236 行（41.1%）。
- 全量本地验收通过：88 Vitest、47 Playwright、152 backend pytest + 1 optional skip、TypeScript、Biome、OpenAPI drift、M04–M20 示例和生产构建。
- 下一步只在边界明确时抽取 lab renderer/registry 与 authoring workflow，不为拆分而拆分。

## 9. 课程数据生命周期与实验注册表 Review（2026-11-10）

- 将模块课程加载、全文搜索索引、完整课程加载、加载错误/重试和课程内容校验从 App.tsx 抽取到 useAcademyCourseData。
- 该 hook 对模块切换使用取消标记，避免过期异步结果覆盖当前模块；重试通过显式回调清理当前模块缓存或递增 authoring attempt。
- 将 8 个交互实验的 lazy component 映射集中到 features/labs/labRegistry.tsx，由 LabWorkspace 负责渲染。
- IMPLEMENTED_LABS 现在要求课程目录状态为 implemented 且存在对应的 lazy component；新增 Vitest 合约测试防止课程目录与组件注册表漂移。
- App.tsx 从 574 行降至 237 行，减少 337 行（58.7%）；业务状态仍由 useLearningState 管理，持久化语义未变化。
- 全量验收通过：90 Vitest、47 Playwright、152 backend pytest + 1 optional skip、TypeScript、Biome、OpenAPI drift、M04–M20 示例和生产构建。
- 剩余 App 职责主要是页面组合、导航选择和跨 feature 状态协调；下一步只在课程编辑工作流生命周期明确时再拆分。

## 10. 课程模块加载重试回归 Review（2026-11-10）

- 在课程数据 hook 拆分后发现 lessonLoadError 出现时，selectedLessons 仍为 undefined；仅依赖 selectedLessons 的 effect 不会因 retry 清理一个本来就不存在的 cache key 而重新执行。
- 修复方式：课程加载 effect 依赖模块缓存映射对象；retry 创建新的映射对象并删除当前模块缓存项，触发一次新的加载请求。失败的动态 import 仍由 moduleLessons 缓存层清除。
- 新增 Playwright 回归：拦截并中止首次 M01 动态模块加载，确认错误状态可见，点击重试后确认课程正文正常显示。
- 全量本地验收通过：90 Vitest、47 Playwright、152 backend pytest + 1 optional skip、Biome、TypeScript、OpenAPI drift、M04–M20 示例及生产构建。
