# 技术栈治理基线

> 状态：Accepted；与代码实现冲突时，以本文件记录的决策和对应 ADR 为准，并通过后续工程变更修正实现。
> 最后核对：2026-11-10

## 1. 总体决策

项目采用 **TypeScript 前端 + Python 后端** 的双语言分层架构。两种语言不争夺同一职责，不建设重复业务层。部署形态先保持前端静态应用与后端模块化单体，不因技术栈治理而拆分微服务。

| 层              | 标准技术                                | 职责                                               |
| --------------- | --------------------------------------- | -------------------------------------------------- |
| Web UI          | React 19、TypeScript 5.9、Vite 8 / Rolldown | 课程界面、交互实验、浏览器状态、可访问性           |
| 内容与前端契约  | Markdown/GFM、Zod 4                     | 教材渲染、课程数据运行时校验                       |
| API             | Python、FastAPI、Pydantic               | HTTP API、输入输出校验、业务编排                   |
| 持久化          | PostgreSQL、SQLAlchemy 2 Async、asyncpg | 事务数据、身份/租户/学习记录                       |
| 数据库演进      | Alembic                                 | 可审计、可回滚的 schema migration                  |
| 前端质量        | Biome 2.6.6、TypeScript 5.9 strict      | 统一 lint、格式化、导入排序与类型检查             |
| 前端测试        | Vitest 5.1、Playwright                  | 单元/模块测试、浏览器 E2E                         |
| 后端质量        | pytest 9、pytest-asyncio 1、Ruff（含 Bandit S 规则） | 测试、安全 lint、导入排序与格式化                 |
| API 类型生成    | openapi-typescript 7.13.0               | 从 FastAPI OpenAPI 生成 TypeScript 类型           |
| 前端依赖管理    | pnpm                                    | 依赖安装与唯一 lockfile                            |
| Python 依赖管理 | uv                                      | 环境同步与唯一 lockfile                            |

## 2. 语言职责边界

### TypeScript（浏览器侧）

允许负责：

- React 页面、组件、交互状态和路由；
- 浏览器本地教学实验与可视化；
- 用户输入的前端校验、课程内容 schema 校验；
- 通过 HTTP/OpenAPI 契约调用后端。

禁止负责：

- 直接连接 PostgreSQL 或其他内部数据存储；
- 保存服务端密钥、OIDC client secret 或数据库凭据；
- 实施最终授权、租户隔离或信任边界判断；
- 在浏览器中执行不可信用户代码并将其视为安全沙箱。

### Python（服务端）

负责：

- 身份认证、会话、授权、租户上下文与审计；
- 课程发布、学习记录、评估等服务端业务规则；
- 数据库访问、事务、迁移和 RLS 配合；
- 模型供应商适配、AI/RAG/评测/数据处理等服务端能力；
- 未来隔离执行编排（实际执行必须交由独立、受限的 worker/sandbox）。

禁止：

- 复制前端页面和浏览器交互逻辑；
- 将 UI 展示状态作为服务端业务事实；
- 信任客户端提交的 user_id、tenant_id、role 或权限声明。

## 3. 版本与工具基线

| 项目       | 基线                              | 规则                                                                 |
| ---------- | --------------------------------- | -------------------------------------------------------------------- |
| Node.js    | 26 Active LTS（项目基线 26.13.0） | 由 `.node-version` 指定；使用 Active LTS 版本                        |
| pnpm       | 12.7.0                            | 由 `packageManager` 固定；只提交 `pnpm-lock.yaml`                    |
| TypeScript | 5.9.x，严格模式                   | `strict`、`noUnusedLocals`、`noUnusedParameters` 保持开启；TypeScript 7 待 OpenAPI 工具链声明兼容后再升级 |
| Python     | 3.12（项目标准开发版本）          | 由 `.python-version` 指定；兼容范围见 `pyproject.toml`               |
| uv         | 0.13.x 或兼容新版本               | 通过 `uv.lock` 锁定依赖解析结果                                      |
| PostgreSQL | PostgreSQL 16+                    | 当前本地验收容器为 18.6；生产/验收环境版本必须显式记录               |
| API 契约   | OpenAPI 3                         | 后端 schema 为权威来源；生成或校验客户端类型，不手工维护两套冲突定义 |

升级 Node、pnpm、Python 主/次版本、核心框架或数据库主版本，必须单独说明兼容性、迁移步骤和验收结果。依赖版本范围不等于实际安装版本；可复现安装必须使用 lockfile。

## 4. 依赖与环境治理

- 根目录只管理前端依赖；后端 Python 项目独立位于 `backend/`。
- 前端唯一锁文件为根目录 `pnpm-lock.yaml`；Python 唯一锁文件为 `backend/uv.lock`。
- `pnpm-workspace.yaml` 使用 `allowBuilds` 显式批准 `esbuild` 构建脚本；新增依赖的安装脚本必须逐项审查，不允许全量放开。
- 禁止提交 `node_modules`、虚拟环境、缓存、构建产物、密钥和本地环境文件。
- 前端使用 `pnpm install --frozen-lockfile`；后端使用 `uv sync --locked --default-index https://pypi.org/simple --extra dev`。
- 禁止在同一项目中交替使用 npm/yarn/pnpm，或 pip 手工安装与 uv lock 并行管理。
- 不将本地开发数据库、测试数据库或生产数据库凭据写入仓库。
- 任何锁文件更新都应与依赖清单变更放在同一提交，并记录原因。

## 5. API 与数据契约

- HTTP API 使用 JSON；接口定义和错误语义以 FastAPI/OpenAPI 为权威。
- FastAPI 导出 `openapi/openapi.json`；`openapi-typescript` 生成 `src/api/generated.ts`，并由 `pnpm api:check` 检查契约漂移。
- 目前只生成类型，不预先创建未使用的 API runtime client；前端开始调用认证 API 时，必须同时设计 Cookie credentials、CSRF token 和错误处理。
- 服务端必须再次执行输入校验、身份验证、授权和资源范围检查；前端 Zod 校验不能替代服务端安全控制。
- 数据库 schema 只能通过 Alembic migration 演进；禁止仅靠 ORM 自动建表作为生产迁移方案。
- PostgreSQL RLS 是纵深防御，不替代应用层授权。
- 对跨语言共享的枚举、字段名、分页、错误码和时间格式，必须有契约测试。
- 生成客户端类型时应标注生成命令和来源版本，避免手工修改生成文件。

## 6. 测试与质量门禁

- Biome 是前端唯一 lint + formatter，负责 TypeScript/TSX、工程配置与导入排序；不并行维护 ESLint、Prettier。
- Ruff 是 Python 唯一 lint + formatter，启用 pycodestyle、Pyflakes、import sorting（I）与 Bandit 安全规则（S）；测试中的 S101 断言仅在 tests 路径豁免，其他误报必须逐行附理由。后端验收同时执行 `ruff format --check` 和 `ruff check`。
- `pnpm security:audit` 使用 npm 官方 registry 和 pip-audit 分别检查前端生产依赖、Python 环境依赖；不依赖 GitHub Actions。
- TypeScript `strict` 类型检查独立运行，Biome 不替代编译器类型检查。
- Biome 不格式化课程数据源、教材 Markdown、CSS 和生成的 OpenAPI TypeScript；这些文件分别由课程校验、内容审阅、现有样式治理和生成器管理。
- `pnpm check` 汇总 Biome lint、格式检查、TypeScript typecheck 和 OpenAPI 契约漂移检查。
- `pnpm acceptance:local` 执行前后端完整本地质量门禁；不依赖 GitHub Actions。
- Vite 对实验组件、课程编辑器和 M01–M20 正文采用动态导入；`courseCatalog.ts` 仅提供首屏目录元数据，`moduleLessons.ts` 为每个模块提供独立 loader 与 Promise 缓存。
- 正常进入课程时只加载当前模块正文；切换模块后再下载对应内容 chunk。课程全文搜索首次触发时加载完整课程索引；课程编辑器在用户主动打开时加载完整课程数据。完整课程加载通过 `loadFullCourse()` 汇集模块 loader，不得在应用入口静态导入 `curriculum.ts`。
- `curriculum.ts` 保留为测试、全量课程校验和显式导出使用的 eager fixture；生产应用不得直接静态引用它。新增模块必须同时更新目录元数据、动态 loader，并由全课程测试验证内容。
- 搜索保留模块标题、摘要、学习目标和正文全文匹配；正文全文索引只在用户开始搜索时加载，避免首屏为搜索功能预载全部教材。

本地验收至少包含：

- 前端：TypeScript typecheck、Vitest、课程数据校验、Vite production build；
- 浏览器：Playwright E2E；
- 后端：Ruff、pytest；
- 数据库：Alembic migration SQL/upgrade 检查；涉及 RLS 的功能必须使用非 owner、非 BYPASSRLS runtime role 验收；
- 契约：OpenAPI schema 与前端消费模型一致性检查。

不得将被 skip 的集成测试计入通过数。没有真实执行的外部 OIDC provider、生产密钥、部署拓扑、负载和人工验收必须明确标记为未验证。

## 7. 暂不引入的技术

除非有明确业务需求、容量数据或安全要求，不引入：

- 微服务、Kubernetes；
- Redis、消息队列；
- pgvector/独立向量数据库；
- 独立 Model Gateway 服务；
- 第二套 ORM、第二套前端框架或第二套 Python 包管理器；
- 浏览器端任意代码执行沙箱。

这些技术可以作为未来 ADR 的候选，不作为当前依赖预装。

## 8. 目录边界

```text
/
├── src/                  # React + TypeScript 前端
│   └── api/generated.ts  # OpenAPI 生成的 TS 类型
├── e2e/                  # Playwright 浏览器 E2E
├── package.json          # 前端依赖与脚本
├── pnpm-lock.yaml        # 前端唯一锁文件
├── biome.json            # TypeScript lint/formatter 配置
├── openapi/
│   └── openapi.json      # FastAPI 导出的 OpenAPI 契约
├── backend/
│   ├── app/              # FastAPI 模块化单体
│   ├── migrations/       # Alembic migrations
│   ├── tests/            # pytest
│   ├── pyproject.toml    # Python 项目与工具配置
│   └── uv.lock           # Python 唯一锁文件
└── docs/
    ├── TECH_STACK.md
    └── adr/              # 架构决策记录
```

## 9. 当前治理事项

- [x] 确认 TypeScript 前端 / Python 后端的职责分层。
- [x] 确认 pnpm 与 uv 为唯一依赖管理工具。
- [x] 建立 Python lockfile（`backend/uv.lock`）。
- [x] 建立并验证前端 lockfile（`pnpm-lock.yaml`）。
- [x] Node.js 26.13.0 / pnpm 12.7.0 frozen-lockfile 安装与前端测试通过。
- [x] Python 3.12.14 在项目 `backend/.venv` 中完成 uv locked sync、Ruff 与 pytest 验收。
- [x] 在隔离 clean-room 工作目录（空 `node_modules`、空 `backend/.venv`）完成前后端端到端安装与验收复验。
- [x] 采用 Biome 2.6.6 作为 TypeScript/TSX 唯一 lint + formatter，并执行全量代码规范化。
- [x] 由 FastAPI 3.1.0 schema 生成 OpenAPI 3.1.0 JSON 与 TypeScript 类型。
- [x] 增加 `pnpm api:check` 临时重生成并逐字节比较契约的漂移检查。
- [x] 将 Biome、TypeScript、OpenAPI 契约检查纳入 `pnpm check` 和 `pnpm acceptance:local`。
- [x] 将 Ruff format 与 Ruff lint 纳入 `pnpm acceptance:local`。
- [x] 将前后端基础质量门禁固化为 `pnpm acceptance:local`。
- [x] 实验组件和课程编辑器改为按需加载，Vite 主入口与依赖 chunk 分离。
- [x] M01–M20 教材正文拆成独立动态 chunk；首屏只加载目录元数据与当前模块正文。
- [x] 保留课程正文全文搜索（首次搜索按需加载完整索引）及完整课程编辑/导出。
- [x] 清理 Starlette/httpx 测试弃用警告；常规 pytest 达到 0 warnings。
- [x] 使用临时管理员/runtime 双连接执行 PostgreSQL RLS 自动化集成验收。
