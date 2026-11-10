# 工程治理基线与分阶段整改计划

- 日期：2026-11-10
- 分支：`develop`
- 基线提交：`2d1d6f14801bebf16cd0d4167a3e27aea3e29f60`
- 状态：治理进行中；本文件记录首轮基线，不代表全部治理完成。

## 1. 治理目标

将项目治理为可长期演进、可复现构建、可审计安全边界、可持续交付的教育软件产品。治理优先级为正确性与安全性、架构边界、可测试性、可维护性、性能和依赖生命周期；不以追逐最新版本或引入基础设施作为目标。

本轮不新增课程业务功能，不改变 M01–M20 内容结构、课程标识或学习路径。

## 2. 当前技术基线

| 层 | 当前基线 | 治理结论 |
|---|---|---|
| Runtime | Node.js 26.13.0 / Python 3.12.14 | 固定项目运行时；系统 Python 3.14 不作为后端验收解释器 |
| Package managers | pnpm 12.7.0 / uv 0.13.x | 双锁文件治理；禁止混用包管理器 |
| Frontend | React 19.3.1 / TypeScript 5.9.3 / Vite 8.3.6 | Vite 8 升级完成；TypeScript 7 暂缓 |
| Build | @vitejs/plugin-react 6.2.1 / Rolldown | 已通过生产构建 |
| Validation | Zod 4.6.7 | 完成 v3→v4 迁移；未知字段拒绝行为有回归测试 |
| Frontend tests | Vitest 5.1.0 / Playwright 1.65.0 | 73 单测与 42 E2E 通过 |
| Backend | FastAPI / SQLAlchemy 2.1 / PostgreSQL / Alembic | 保持 Python 模块化单体 |
| Backend quality | pytest 9.2.0 / pytest-asyncio 1.4.1.post1 / Ruff 0.17.4 + S rules | 已升级并通过后端回归测试 |
| API contract | FastAPI OpenAPI 3.1 / openapi-typescript 7.13 | 后端为权威 schema，生成类型受漂移检查 |

### 版本升级决策

- **已升级**：Vite 6→8、@vitejs/plugin-react 4→6、Vitest 3→5、Zod 3→4。
- **暂缓 TypeScript 7**：当前 openapi-typescript 7.13.0 声明 TypeScript peer 范围为 `^5.x`；实测 TS7 还触发 CSS side-effect import 类型声明问题。不能在工具链 peer 不兼容时强行升级。
- **Python 开发测试依赖**：已升级 pytest 9.2.0 / pytest-asyncio 1.4.1.post1；明确 fixture loop scope，后端 125 项测试通过且无 pytest deprecation warning。
- **依赖安全扫描**：已提供 `pnpm security:audit`，使用 npm 官方 registry 扫描生产依赖，并用 pip-audit 扫描本地 Python 3.12 环境；两者均未发现已知漏洞。pip-audit 跳过未发布到 PyPI 的本项目包，只审计其安装依赖。默认 npmmirror registry 不提供 pnpm audit bulk endpoint，不能把该错误误报为安全扫描通过。
- **Ruff 安全规则**：已将 Bandit S 规则纳入 Ruff。S608 在迁移和 RLS 集成测试中涉及的动态 SQL 均使用固定模块常量或固定表名白名单，已逐处添加带理由的 noqa；测试中的 S101 断言和假密钥也按测试文件/具体行明确豁免。生产应用代码不豁免 S 规则。

## 3. 架构现状

- 浏览器端：React SPA，课程目录元数据与模块正文按需加载；本地实验均为教学模拟或浏览器本地逻辑。
- 服务端：FastAPI 模块化单体；身份、OIDC、会话、租户授权、学习记录与评估服务按模块组织。
- 数据：PostgreSQL 为事务事实源；SQLAlchemy Async、Alembic、RLS；RLS 不能替代应用层授权。
- API：OpenAPI 从 FastAPI 生成，前端类型自动生成；禁止手工维护冲突 schema。
- 尚未实现：任意用户代码安全沙箱、生产模型网关、生产向量检索、教师资源范围授权、完整教师评分流程。不得将教学模拟标记为真实 provider-backed 功能。

## 4. 首轮代码审查观察

| 观察 | 风险 | 后续动作 |
|---|---|---|
| `src/App.tsx` 从原约 614 行缩减到 568 行，仍承担较多页面组合与数据加载 | 中：变更耦合、测试隔离困难 | 已抽取 `useLearningState`，继续拆分 sidebar、lesson workspace、lab router 和数据加载边界 |
| `backend/app/security/oidc_provider.py` 约 333 行 | 中：协议边界集中 | 分离 discovery/JWKS、token exchange、token verification；保留严格 issuer/audience/nonce/PKCE 校验 |
| `backend/app/api/auth.py` 约 251 行 | 中：HTTP 适配和认证流程耦合 | 将业务编排下沉至服务层，路由只处理 HTTP 输入输出 |
| 迁移文件存在动态 SQL 字符串模板 | 低（已审查的具体插值为常量） | 保留迁移可读性；逐项注明常量来源，不接受外部输入 |
| CORS 原先未放行 `X-Tenant-ID` | P2（跨源 learner API 预检失败） | 已放行该请求头，并新增真实 ASGI CORS preflight 回归测试 |
| Assessment key 校验使用规范化值、持久化却使用原始值 | P2（测评记录主键语义不一致） | 已启用 Pydantic 字符串 trim，并新增规范化/空白拒绝测试 |
| 全课程编辑器数据加载无 rejection handler | P2（失败后永久显示加载状态） | 已加入错误状态、重试按钮和失败 chunk 注入 E2E |
| 每个认证/learner API 请求重复检查 Alembic revision | P2 性能观察 | 保持 fail-closed；后续用真实请求负载评估启动检查/有界缓存方案 |
| 前端 localStorage 作为学习状态与草稿存储 | 低/产品边界 | 已抽取持久化 hook 并保留 storage 异常容错；后续评估 schema version migration |
| npm audit 的默认 registry endpoint 不可用 | 过程风险 | 安全扫描固定使用 npm 官方 registry 或等效可信审计源 |

这些是首轮静态审查的结构性观察，不等同于已完成逐行安全审计。

## 5. 分阶段治理计划

### G01 — 技术栈与依赖治理
- [x] 升级 Vite 8 / Rolldown、React 插件 6、Vitest 5。
- [x] 升级 Zod 4 并修复未知字段错误断言的版本兼容性。
- [x] npm 官方 registry 生产依赖审计。
- [x] pytest 9 / pytest-asyncio 1.x 迁移并通过 122 项后端测试。
- [ ] TypeScript 7 在 OpenAPI 生成工具声明兼容后重新评估。
- [ ] 建立依赖更新分级、升级窗口和回滚标准。

### G02 — 安全与代码 Review
- [ ] 全量审查身份认证、会话、CSRF、OIDC、租户授权、RLS 和 Alembic migrations。
- [x] 为 Ruff 启用安全规则并逐处处理已识别误报；[ ] 持续扩大安全规则覆盖和修复新发现。
- [ ] 检查前端 Markdown 渲染、浏览器存储、导入导出和文件处理边界。
- [ ] 引入可重复的依赖漏洞扫描和 SBOM 生成流程（先本地执行，不依赖 Actions）。

### G03 — 架构边界治理
- [ ] 前端按 app shell、features、shared、data/contracts 划分职责。
- [ ] 后端按 API adapter、application service、domain policy、infrastructure 分层。
- [ ] 明确依赖方向，避免跨模块反向导入和循环依赖。
- [ ] 为每个业务模块定义公开接口和测试边界。
- [ ] 仅在业务需求、容量或安全边界成立时引入外部基础设施。

### G04 — 测试与质量体系
- [ ] 增加后端覆盖率报告和关键安全路径覆盖门槛。
- [ ] 为前端关键业务逻辑增加覆盖率与组件级测试。
- [ ] 增加数据库迁移升级/回滚和真实 PostgreSQL RLS 测试。
- [ ] 增加性能基准：首屏 JS、课程正文 chunk、搜索加载、API 延迟。
- [ ] 统一本地验收报告格式和失败归因。

### G05 — 发布与运维治理
- [ ] 定义环境配置矩阵、密钥注入、备份恢复和日志脱敏要求。
- [ ] 定义 API / 数据库兼容性与发布回滚策略。
- [ ] 形成 Release Candidate 检查清单和已知限制清单。
- [ ] GitHub Actions 额度恢复前不新增或触发工作流；本地门禁保持完整。

## 6. 本轮验收证据

Vite 8 + Vitest 5 + Zod 4 组合完成本机验收：

- Biome lint：58 files 通过。
- Biome format：57 files 通过。
- TypeScript 5.9 typecheck：通过。
- OpenAPI：3.1.0 / 12 paths，契约无漂移。
- Vitest：16 files / 73 tests passed。
- Playwright：42 tests passed。
- M04–M20 Python 示例：全部通过（88 tests）。
- Ruff format / lint（含 Bandit S 规则）：65 files 通过，无未豁免安全规则告警。
- Backend pytest：125 passed / 1 skipped。
- 1 项 skipped 是需要专用 PostgreSQL RLS 环境的可选集成测试，不计入通过数。
- `pnpm security:audit`：npm 生产依赖与 Python 3.12 环境均 No known vulnerabilities found；本项目本身因未发布至 PyPI 被 pip-audit 跳过。
- 未运行 GitHub Actions。

## 7. Review 记录

- 首轮 Review 明细：[`CODE_REVIEW_2026-11.md`](./CODE_REVIEW_2026-11.md)。
- 前端状态持久化边界与浏览器安全中间件配置记录：[`ADR-0006`](./adr/0006-learning-state-and-browser-security-boundary.md)。
- 本轮修复 3 项 P2：CORS tenant header、assessment key 规范化、全课程编辑器加载错误与重试。
- 当前全量本机验收：42 E2E、125 backend tests passed / 1 skipped；详见本文件第 6 节。

## 8. 完成定义

工程治理不是一次性升级。每个阶段必须提交：审查范围、发现分级、修复记录、测试证据、残余风险和回滚方法。只有所有 P0/P1 已关闭、P2 有明确接受或计划、关键质量门禁稳定通过，才可定义为工程治理基线稳定。真实部署、生产负载、外部 OIDC Provider 与人工用户验证仍需独立证据。
