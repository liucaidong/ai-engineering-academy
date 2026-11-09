# AI Engineering Academy

面向 AI 工程学习者的系统化课程与交互实验平台。项目目标不是把概念做成静态百科，而是构建一条从大模型原理、AI 应用开发、Agent 系统，到平台工程与综合项目的可验证学习路径。

> 当前阶段：M01–M20 前端课程平台与八个本地教学实验已建立；P3 后端模块化单体已具备 API、异步数据库访问、课程版本快照、身份/租户基础表及初步 RLS 策略。完整运行验收与生产后端能力仍在推进中。

## 项目定位

AI Engineering Academy 将以工程能力为主线，覆盖 AI 基础认知、大模型核心技术、AI 应用工程、Agent 系统工程、AI 平台与基础设施，以及综合工程实践。

原始参考课件 [llm-courseware](https://shibaby.github.io/llm-courseware) 是轻量、离线、单页交互式科普课件。本项目吸收其直观表达和交互教学方式，但保持独立的产品定位与工程架构。

## 文档导航

- [版本变更记录](CHANGELOG.md)
- [产品需求](docs/PRODUCT.md)
- [课程体系](docs/CURRICULUM.md)
- [技术架构](docs/ARCHITECTURE.md)
- [实施路线图](docs/ROADMAP.md)
- [参考课件审计](docs/REFERENCE_AUDIT.md)
- [工程治理](docs/ENGINEERING_GOVERNANCE.md)
- [课程内容契约](docs/COURSE_CONTENT_CONTRACT.md)
- [课程内容编写与迁移规范](docs/CONTENT_AUTHORING.md)
- [教师教学实施手册](docs/TEACHING_PLAYBOOK.md)
- [学习者手册](docs/LEARNER_GUIDE.md)
- [课程术语表](docs/GLOSSARY.md)
- [课程参考来源静态审计](docs/CURRICULUM_SOURCE_AUDIT.md)
- [教师指南与作业参考解答（M01–M20）](docs/teaching-guides/README.md)
- [工程验收清单](docs/ACCEPTANCE.md)
- [ADR-0001：独立平台决策](docs/adr/0001-independent-platform.md)
- [ADR-0002：后端模块化单体决策](docs/adr/0002-backend-modular-monolith.md)
- [ADR-0003：身份认证与租户隔离基线](docs/adr/0003-identity-and-tenant-isolation.md)
- [ADR-0004：双语言技术栈与依赖治理](docs/adr/0004-tech-stack-governance.md)
- [OpenAPI 契约与生成规则](openapi/README.md)

## 技术栈

项目采用 TypeScript 前端 + Python 后端的分层架构，不做语言统一迁移。

- 前端：React 19、TypeScript 5、Vite 6、Zod、Vitest、Playwright、Biome；Node.js 26 LTS + pnpm。
- API 类型：FastAPI OpenAPI 3.1 → `openapi-typescript` → `src/api/generated.ts`；契约漂移由 `pnpm api:check` 检查。
- 教材加载：课程目录首屏加载，M01–M20 正文独立动态加载；全文搜索与课程编辑器按需加载完整课程数据。
- 后端：Python 3.12 基线、FastAPI、Pydantic、SQLAlchemy Async、asyncpg、Alembic、Ruff；uv 管理依赖。
- 数据：PostgreSQL + RLS。
- 详细职责边界、版本和治理规则：[技术栈治理基线](docs/TECH_STACK.md)、[ADR-0004](docs/adr/0004-tech-stack-governance.md)。
- Backend implementation notes: [backend/README.md](backend/README.md)

## 前端本地开发

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm validate:course
pnpm check
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e

# 单独生成或校验 OpenAPI 契约
pnpm api:generate
pnpm api:check

# 一键执行前后端本地质量门禁
pnpm acceptance:local
```

## 后端本地开发

```bash
cd backend
uv sync --locked --default-index https://pypi.org/simple --extra dev
cp .env.example .env
uv run --locked --default-index https://pypi.org/simple uvicorn app.main:app --reload
```

数据库迁移需在 PostgreSQL 可访问且已配置 `ACADEMY_DATABASE_URL` 后，从 `backend/` 目录执行：

```bash
uv run --locked --default-index https://pypi.org/simple alembic -c alembic.ini upgrade head
```

本地开发默认不强制 PostgreSQL。设置 `ACADEMY_DATABASE_REQUIRED=true` 与 `ACADEMY_DATABASE_URL` 后，readiness 会执行数据库连通性探测。生产环境配置缺失数据库依赖时会 fail closed。

## 当前已实现能力

- 20 个课程模块导航、全文搜索、先修依赖和课程 Schema 校验；
- M01–M20 均具备章节化教材、参考来源和 Rubric 测评；
- M01–M20 全部配有教师教学指南与正式作业参考解答；
- 提供课程级教师实施手册、学习者手册和统一术语表；
- 模块完成状态、收藏、测评草稿和 Rubric 自评保存在当前浏览器的 localStorage；
- 浏览器本地课程编辑工作区：JSON 导入、严格 Schema 校验、UTF-8 字节限制、草稿自动保存与校验通过后导出；
- Tokenizer、Transformer、RAG、Tool Calling、Agent Runtime、MCP、Multi-Agent 和 Evaluation 八个本地教学实验；
- FastAPI 后端运行骨架、liveness/readiness、生产配置 fail-closed；
- SQLAlchemy 异步 session/transaction、Alembic 11 个迁移版本、课程发布生命周期、身份/租户/学习进度/测评记录基础表和 transaction-local RLS context；OIDC 登录与首登个人租户 provisioning 已实现，但依赖外部 Provider 配置；教师资源范围授权和学习数据 API 仍未开放。

上述实验均为教学级实现，不代表真实模型推理、生产向量检索或服务端沙箱。浏览器本地进度不等同于账户级云端同步。后端当前不执行任意用户代码，学习者数据 API 默认关闭。迁移与测试已有本机验收证据；生产 OIDC Provider、生产密钥、正式部署拓扑和独立 runtime-role 集成测试仍需单独验收。

## 工程原则

- 知识准确性优先于视觉效果；
- 模拟、浏览器本地执行、服务端沙箱和真实服务调用严格区分；
- 工具、文件、网络和代码执行采用最小权限；
- 先交付可验证的前端 MVP，再按实际需求引入后端；
- Redis、消息队列和 pgvector 仅在有明确需求与容量依据后引入；
- CI 自动触发暂缓，避免项目早期消耗 GitHub Actions 额度。
