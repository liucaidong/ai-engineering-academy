# AI Engineering Academy

面向 AI 工程学习者的系统化课程与交互实验平台。项目目标不是把概念做成静态百科，而是构建一条从大模型原理、AI 应用开发、Agent 系统，到平台工程与综合项目的可验证学习路径。

> 当前阶段：M01–M20 前端课程平台与八个本地教学实验已建立；P3 后端模块化单体已具备 API、异步数据库访问和首个课程版本快照迁移基础。完整运行验收与生产后端能力仍在推进中。

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
- [工程验收清单](docs/ACCEPTANCE.md)
- [ADR-0001：独立平台决策](docs/adr/0001-independent-platform.md)
- [ADR-0002：后端模块化单体决策](docs/adr/0002-backend-modular-monolith.md)

## 技术栈

### Frontend
- React + TypeScript + Vite
- Zod 课程数据运行时校验
- Vitest 单元测试、Playwright 浏览器 E2E
- 浏览器本地交互实验与学习草稿

### Backend foundation
- Python 3.11+、FastAPI、Pydantic Settings
- SQLAlchemy Async + asyncpg + Alembic
- PostgreSQL versioned course-release schema
- Backend implementation notes: [backend/README.md](backend/README.md)

## 前端本地开发

```bash
npm install
npm run dev
npm test
npm run validate:course
npm run build
npx playwright install chromium
npm run test:e2e
```

## 后端本地开发

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
python -m pip install -e ".[dev]"
cp .env.example .env
uvicorn app.main:app --reload
```

数据库迁移需在 PostgreSQL 可访问且已配置 `ACADEMY_DATABASE_URL` 后，从 `backend/` 目录执行：

```bash
alembic -c alembic.ini upgrade head
```

本地开发默认不强制 PostgreSQL。设置 `ACADEMY_DATABASE_REQUIRED=true` 与 `ACADEMY_DATABASE_URL` 后，readiness 会执行数据库连通性探测。生产环境配置缺失数据库依赖时会 fail closed。

## 当前已实现能力

- 20 个课程模块导航、全文搜索、先修依赖和课程 Schema 校验；
- M01–M20 均具备章节化教材、参考来源和 Rubric 测评；
- 模块完成状态、收藏、测评草稿和 Rubric 自评保存在当前浏览器的 localStorage；
- 浏览器本地课程编辑工作区：JSON 导入、严格 Schema 校验、UTF-8 字节限制、草稿自动保存与校验通过后导出；
- Tokenizer、Transformer、RAG、Tool Calling、Agent Runtime、MCP、Multi-Agent 和 Evaluation 八个本地教学实验；
- FastAPI 后端运行骨架、liveness/readiness、生产配置 fail-closed；
- SQLAlchemy 异步 session/transaction 基础、Alembic 迁移环境和首个课程发布快照 schema。

上述实验均为教学级实现，不代表真实模型推理、生产向量检索或服务端沙箱。浏览器本地进度不等同于账户级云端同步。后端当前不提供学习者数据 API，也不执行任意用户代码。数据库迁移与测试代码尚未在受控运行环境执行。

## 工程原则

- 知识准确性优先于视觉效果；
- 模拟、浏览器本地执行、服务端沙箱和真实服务调用严格区分；
- 工具、文件、网络和代码执行采用最小权限；
- 先交付可验证的前端 MVP，再按实际需求引入后端；
- Redis、消息队列和 pgvector 仅在有明确需求与容量依据后引入；
- CI 自动触发暂缓，避免项目早期消耗 GitHub Actions 额度。
