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


## 11. Learner record creation concurrency review（2026-11-10）

发现并修复两个“目标行尚不存在时 `SELECT ... FOR UPDATE` 无法提供互斥”的创建竞态：

- `POST /assessments/attempts` 原先通过 `MAX(attempt_number) + 1` 分配编号。并发请求可能读到同一最大值，其中一个最终被唯一约束拒绝。
- `POST /learning/progress` 原先先查询并锁定已有进度行；首次并发创建时双方都可能观察到空结果，导致一个请求以 409 结束。

修复：在各自的 learner transaction 内，按 tenant、user、course release 和 assessment/module key 获取 PostgreSQL `pg_advisory_xact_lock(hashtextextended(...))` 事务级锁，然后再读取或创建记录。锁在事务提交/回滚时自动释放。唯一约束保持不变，仍是最终完整性防线；hash 冲突最多导致无关身份短暂串行，不会放宽数据隔离。锁 key 通过 JSON 数组编码并作为 SQL 参数传递，不拼接 SQL。

回归验证：
- 单元测试验证锁 key 稳定、参数化以及空 identity 拒绝。
- 新增真实 PostgreSQL 双连接验收：第一个事务持有同一 identity 锁时，第二个事务必须等待；首事务提交后第二个事务才能继续。
- `backend` pytest：154 passed，2 optional PostgreSQL skips（普通测试未配置专用 DB URL）。
- `scripts/acceptance-postgres-rls.sh`：2 passed；包含现有 RLS/HTTP acceptance 和新增事务锁并发测试；runtime role `superuser=false`、`bypassrls=false`。
- `pnpm acceptance:local`：Biome、TypeScript、OpenAPI drift、Vitest 90、Playwright 47、M04–M20 示例、Ruff、Backend pytest 154 passed / 2 skipped、Vite production build 全部通过。

剩余风险：该锁只在 PostgreSQL 内生效；SQLite 或其他数据库不具备等价语义。本项目当前 learner API 的目标数据库为 PostgreSQL，部署不得将该事务锁替换为进程内 mutex。


## 12. Session revocation and in-flight request ordering（2026-11-10）

审计确认原 session resolver 在 token-hash bootstrap 查询后切换用户上下文，但未定义请求与 logout 并发时的事务顺序。若只在 token-hash bootstrap 查询上使用 `FOR UPDATE`，会因该阶段没有用户身份、且 bootstrap policy 仅允许 SELECT 而违反 RLS；不能通过扩大匿名 UPDATE policy 解决。

修复采用 PostgreSQL transaction-scoped advisory lock：

- session resolve：先用 token hash 进行原有窄范围 bootstrap SELECT，再对 session ID 获取 shared advisory lock；切换至已解析用户的 RLS context 后，重新确认该 session 仍未撤销、未过期且用户 active。
- session revoke/logout：先按 token hash 定位 session，再获取同一 identity 的 exclusive advisory lock，最后在 owner RLS context 中执行带 `revoked_at IS NULL` 条件的更新。
- session rotation：直接获取 exclusive lock，重新验证当前 session 后原子撤销并创建替代 session，避免 shared-to-exclusive lock upgrade。
- 多个普通请求可共享 lifecycle lock；logout 等待已开始的请求事务结束。若 logout 先取得 exclusive lock，后续请求等待后重新检查并拒绝已撤销 session。`last_seen_at` 使用数据库 `GREATEST` 表达式保持单调，避免较早请求较晚提交时覆盖更新的活动时间。
- lock key 使用固定 namespace 和 session UUID，通过 SQL 参数传递；shared/exclusive 函数名由代码内固定分支选择。

真实 PostgreSQL 双连接验收验证：第一事务持有 resolver shared lock 时，第二事务调用实际 `revoke_session` 必须等待；第一事务提交后撤销成功；之后再次解析同一 cookie 返回无效 session。完整 RLS acceptance 3 passed，runtime role `superuser=false`、`bypassrls=false`。普通 backend pytest 154 passed / 3 optional DB-only skips。

残余语义：logout 不会中断已经通过认证并开始执行的请求；它会等待这些请求完成后再确认撤销。logout 完成后新请求无法继续使用该 session。这是明确的事务边界，不声称可以取消已经运行中的业务操作。


## 13. Learner HTTP concurrency and ORM response lifecycle（2026-11-10）

将并发验收从锁 helper 提升到真实 HTTP 路由：PostgreSQL 18.6 + 非 owner / 非 superuser / 非 BYPASSRLS runtime role，使用真实 opaque session cookie 和 tenant header，并发调用 `POST /learning/progress` 与 `POST /assessments/attempts`。

实测发现并修复一个此前未覆盖的 API 响应生命周期缺陷：learner endpoints 在事务上下文退出后由 FastAPI 序列化 ORM response；部分 server-generated / on-update timestamp 字段可能处于 expired 状态，导致 `DetachedInstanceError` 和响应 500。所有创建/状态转换写入现在在 flush 后、事务仍处于活动状态时显式 refresh 对应 ORM 记录，再返回给 response serializer。

真实 HTTP 并发断言：
- 两个相同身份的 progress start 均返回 201，并收敛到同一 progress UUID，不产生重复行或 409。
- 已有 attempt 1 的情况下，并发创建同一 assessment 的两个新 attempt，返回 attempt_number 2 和 3，无重复编号、无序号空洞。
- 返回模型的时间戳字段可在 session 关闭后正常序列化。
- 同一 RLS transaction 仍只能看到当前用户的 progress/assessment rows；测试同时校验新增记录属于当前 learner。
- Session lifecycle 测试进一步证明两个并发认证读取可同时持有 shared lock，而 exclusive logout 必须等待读取事务结束；`last_seen_at` 在乱序提交下保持单调。

完整 disposable PostgreSQL 18.6 acceptance：3 passed；runtime role `superuser=false`、`bypassrls=false`。普通 backend pytest：154 passed / 3 optional DB-only skips。

## 14. Frontend API cancellation during CSRF bootstrap（2026-11-10）

发现 API client 的 caller cancellation 只覆盖最终业务请求，不覆盖 unsafe request 前置的 CSRF token 获取阶段。若组件在等待 `GET /auth/csrf` 时卸载或切换页面，调用方虽然已取消，但原实现仍会在 CSRF 请求返回后继续发送 POST，造成不必要的副作用窗口。

修复：
- 新增 `awaitWithSignal`，让单个调用方可独立取消对共享 CSRF token Promise 的等待。
- 不因某个调用方取消而中止共享 CSRF 获取，避免破坏同一 session 下其他并发 mutation 的 token bootstrap。
- CSRF 等待完成后再次检查 signal，确保取消请求不会继续发送业务 mutation。
- 不自动重放 mutation；既有 CSRF rejection 仍要求调用方显式重试，避免未知执行结果下重复副作用。

新增回归测试：在 CSRF fetch pending 时取消 mutation，断言业务请求没有发送；随后完成 token bootstrap，再发起正常请求并复用已取得的 token。

验收：API client tests 16 passed；完整 `pnpm acceptance:local` 通过：Vitest 91、Playwright Chromium 47、backend pytest 154 passed / 3 optional DB-only skips，Biome、TypeScript、OpenAPI drift、M04–M20 示例、Ruff 和 Vite production build 全部通过。GitHub Actions 未触发。

## 15. Platform publisher migration-head fail-closed guard（2026-11-10）

发布 CLI 原先核验数据库连接身份，但未主动核验 Alembic schema revision。若 DBA 漏跑 migration 0012，后续可能因缺失 policy/trigger 而失败；更重要的是，发布前置条件应由 CLI 明确拒绝，而非依赖写入时偶然报错。

修复：
- publisher 在执行任何 release/audit 写入前读取 `alembic_version`，要求唯一 revision 精确等于 `0012_platform_publisher_audit`；无表、无记录、多 head 或旧 revision 均 fail closed。
- publisher 获得 `alembic_version` 的 SELECT 权限，不获得 UPDATE 权限。
- 更新 DBA provisioning SQL、ADR 与 backend runbook，明确该权限仅用于 schema-head preflight。
- disposable acceptance 将数据库临时 downgrade 至 0011，确认 publisher 明确拒绝发布，再 upgrade 至 0012 并恢复 migration downgrade 会撤销的 tenant_memberships 辅助 SELECT grant。

验收：`pnpm acceptance:course-publisher` 通过。覆盖 stale migration head rejection、完整课程快照校验、双进程并发幂等发布、重复 no-op、冲突内容拒绝、digest mismatch、audit 写入失败事务回滚、publisher 最小权限、RLS membership 零行可见、draft 插入拒绝、已发布快照 update/delete 拒绝，以及 migration downgrade/re-upgrade。该测试只使用 disposable PostgreSQL；生成的 UUID 不得用于持久化环境。

## 16. Browser learning-state account isolation（2026-11-10）

发现收藏、模块完成状态和测评草稿原先使用全浏览器共享的 localStorage key。若同一浏览器先后登录不同账户，后一账户可能读取前一账户遗留的学习记录；该问题不仅影响数据正确性，也构成共享设备上的跨账户信息暴露。

修复：
- 将学习状态存储键按服务端确认的 user ID 和当前已验证 tenant ID 分区；未登录状态使用独立 guest scope。
- App 统一持有账户 session 状态，并将同一权威 session 传递给账户 UI 与学习状态边界，避免两个独立 session hook 产生不一致。
- scope 改变时，在 effects 执行前同步重置内存状态，避免旧账户数据被写入新账户存储区。
- 旧版未分区 localStorage 数据仅作为 guest scope 的兼容读取来源；不会自动复制到已登录账户。
- 浏览器仍不保存身份凭证、服务端角色或授权决策；tenant preference 仍需服务端重新校验。

新增存储分区测试覆盖 guest、不同 user、同一 user 的不同 tenant 以及 key 编码。账户 API 和 learner data API 默认开关保持不变。

## 17. Version-bound learner progress synchronization（2026-11-10）

实现前端完成模块状态与 Learner API 的受控同步：
- 只有显式设置 `VITE_ACADEMY_AUTH_UI_ENABLED=true` 与 `VITE_ACADEMY_LEARNER_SYNC_ENABLED=true` 才启用；默认关闭。
- 必须先由服务端确认 session，并由用户选择经服务端重新验证的 tenant。
- 只匹配 `course_key + exact frontend version + schema_version` 唯一的已发布课程；再读取完整快照并使用当前 Zod CourseSchema 校验，要求课程 ID、版本及模块顺序完全一致。无发布版本、重复版本或内容结构不匹配均 fail closed。
- 首次连接先合并云端已完成模块与当前账户/租户本地记录，保留两端已有完成状态；后续将用户本地变更收敛到该 release 的进度记录，支持完成与重新打开。
- 不根据版本字符串猜测 release UUID，不将 guest/legacy 未分区数据自动迁移到账户，不上传收藏和测评草稿。
- 网络/权限/版本错误显示为显式同步错误并提供重试；取消/切换租户时 abort 当前客户端请求。服务端 mutation 仍依赖现有幂等、事务和 RLS 边界。

新增服务层测试覆盖精确版本解析、无发布版本拒绝、远端快照完整校验、缺失记录创建、完成、重新打开和两端收敛。当前部署仍默认关闭同步；只有真实持久化数据库中存在对应发布快照后才可打开。


## 18. Assessment draft persistence and optimistic concurrency（2026-11-10）

補齊本地測評草稿到服務端的同步閉環：
- 新增 `GET /assessments/attempts/drafts`，只返回每個 assessment 最新 attempt 且仍為 draft 的記錄；若最新 attempt 已提交/評分，不會把舊 draft 當作活動草稿。
- 新增 `PUT /assessments/attempts/{id}/draft`，只允許擁有者修改仍處於 draft 的 self-review attempt；請求必須攜帶 `expected_updated_at`，服務端以 row lock + revision compare 實施 optimistic concurrency，過期 revision 返回 409。
- 草稿 response 與 rubric payload 限制 64 KiB，拒絕非有限 JSON。提交後不能再修改。
- 所有 learning/assessment 成功響應均設 `Cache-Control: no-store` 和 `Pragma: no-cache`，避免共享/瀏覽器緩存保存帳戶學習資料。
- 前端草稿同步採 700ms debounce；先按 release snapshot 校驗 assessment IDs，再同步。服務端 revision 未變時更新原 draft；遇到 409 則創建新 attempt 保存本地編輯，不覆蓋另一設備的遠端內容。遠端較新且本地此前已同步時，遠端成為本地權威版本。同步 ACK 只在本地內容仍與已發送快照相同時標記 synced，避免覆蓋請求期間的新輸入。
- 舊版本地草稿無服務端 revision 時保留本地內容，不直接覆蓋遠端 draft；會以新 attempt 保存，形成可追溯歷史。

驗收：FastAPI/OpenAPI 17 paths drift check 通過；backend pytest 159 passed / 3 optional DB-only skips；PostgreSQL 18 RLS HTTP acceptance 3/3 通過，覆蓋 draft list、更新、stale revision 409、提交後更新拒絕和 no-store headers；Vitest 104、Playwright 47、M04–M20 示例測試、Biome、TypeScript、Ruff、production build 全部通過。GitHub Actions 未觸發。

## 19. Explicit guest-to-account learning data import（2026-11-10）

账户/租户隔离后，旧访客状态不会自动出现在已登录账户中。新增显式迁移入口：
- 登录并选择租户后，检测 guest scope 和旧版未分区 localStorage 中的收藏、完成状态及测评草稿。
- 用户点击“导入访客记录”后，收藏/完成状态按集合并集迁移；不存在的测评草稿复制到当前账户/租户。
- 若账户已存在不同内容的同一测评草稿，保留账户版本并报告冲突；访客原始草稿不删除、不覆盖，用户可在访客 scope 中恢复。
- 通过账户/租户专属 fingerprint marker 实现幂等；访客数据变化后允许再次检查新增数据。存储不可用时重复导入仍保持集合并集和草稿不覆盖语义。
- 迁移只复制浏览器本地内容，不伪造用户身份、tenant、role 或 release ID；之后的云端同步仍受精确课程发布版本和服务端 RLS 约束。

新增单元测试验证并集、测评草稿冲突保留、来源不变和重复导入幂等。

## 20. App account/learner-control composition boundary（2026-11-10）

将账户、租户、guest import、learner progress sync 和 assessment draft sync 的 UI/side-effect orchestration 从 `src/App.tsx` 提取到 `LearningAccountControls` feature boundary。App 仍拥有权威 session 与学习状态，组件通过显式 props 接收状态和 setter，不复制 session、不把授权判断下沉到浏览器，也不改变 feature flag 默认值。

结果：App 去除约 90 行账户/同步控制细节，账户 UI 和学习数据副作用集中在同一 feature boundary，后续可独立测试/演进。
