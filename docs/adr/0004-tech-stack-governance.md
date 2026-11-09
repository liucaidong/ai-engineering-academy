# ADR-0004：双语言技术栈与依赖治理

- 状态：Accepted
- 日期：2026-11-09
- 决策范围：AI Engineering Academy 全仓库

## 背景

项目同时包含 React/TypeScript 浏览器应用和 Python/FastAPI 服务端。前端适合承载课程 UI 与浏览器本地实验；Python 生态更适合服务端业务、AI/ML、数据处理和模型集成。当前依赖治理存在前端缺少 lockfile、后端依赖管理方式不统一、架构文档过时等问题。

## 决策

1. 保留 TypeScript + Python 双语言架构，不进行语言统一迁移。
2. TypeScript 仅负责浏览器 UI、交互、客户端校验和 API 消费。
3. Python 负责服务端 API、认证授权、业务规则、数据访问及 AI 集成。
4. 后端采用 FastAPI 模块化单体，不预先拆分微服务。
5. 前端统一 pnpm，唯一锁文件为根目录 `pnpm-lock.yaml`。
6. 后端统一 uv，唯一锁文件为 `backend/uv.lock`。
7. Node.js 26 Active LTS 作为项目基线；Python 3.12 作为标准开发版本。
8. PostgreSQL 是事务型持久化事实源；Alembic 是 schema 演进唯一入口。
9. API 契约以 FastAPI/OpenAPI 为权威，使用 openapi-typescript 生成前端类型，并通过临时重生成比较阻止契约漂移。
10. Biome 是 TypeScript/TSX 唯一 lint + formatter；TypeScript 编译器继续负责类型检查。
11. Ruff 是 Python 唯一 lint + formatter，格式化检查与 lint 均纳入本地验收。
12. Redis、消息队列、pgvector、Kubernetes 和微服务均延后，必须由明确需求驱动。

## 后果

- 保留两种语言带来的生态优势，但必须通过 OpenAPI 和契约测试管理跨语言边界。
- 前后端有独立依赖清单和 lockfile，安装、测试、版本升级各自负责。
- 本地环境必须遵守仓库声明的 Node/Python 基线。
- 不允许把浏览器端校验当成服务端授权，不允许前端直接访问数据库。
- 版本升级需要更新版本文件、lockfile、文档并执行本地验收。

## 验收标准

- [x] pnpm frozen-lockfile 安装成功。
- [x] uv locked sync 安装成功。
- [x] TypeScript、Vitest、Playwright、Ruff、pytest 本机验收通过（测试 skip 与警告另行披露）。
- [x] Biome lint/format 与 TypeScript strict typecheck 纳入 `pnpm check`。
- [x] OpenAPI 契约生成与一致性检查具备可执行实现。
- [x] 文档与实际依赖、目录和脚本保持一致。
