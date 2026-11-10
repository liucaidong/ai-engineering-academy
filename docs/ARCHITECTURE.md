# 技术架构基线

> 本文描述当前批准的架构。版本、依赖与语言职责的详细治理规则见 [TECH_STACK.md](./TECH_STACK.md)，架构决策见 [ADR](./adr/)。

## 1. 架构原则

- 内容优先、交互可插拔、实验执行分级、安全边界明确。
- 前端 TypeScript、后端 Python，各自承担明确职责。
- 后端先采用模块化单体；不因预期规模提前拆分微服务。
- 浏览器模拟、浏览器本地逻辑、服务端沙箱和真实第三方调用必须明确区分。
- 任何新增基础设施必须由真实需求、容量数据或安全要求驱动。

## 2. 逻辑架构

```text
Learner / Instructor Browser
  |
  v
React 19 + TypeScript 5.9 + Vite 8 (Rolldown)
  ├─ Course Shell / Navigation / Search
  ├─ Markdown/GFM Content Renderer
  ├─ Browser Learning Labs
  ├─ Assessment / Authoring UI
  └─ Zod Client-side Contract Validation
  |
  | HTTPS JSON API / OpenAPI
  v
Python 3.12 + FastAPI Modular Monolith
  ├─ API / Pydantic Validation
  ├─ Identity / OIDC / Session / Authorization
  ├─ Tenant Context / Audit
  ├─ Course Release / Learning Records
  ├─ Assessment Services
  └─ Future AI / RAG / Model Provider Adapters
  |
  v
PostgreSQL
  ├─ SQLAlchemy Async / asyncpg
  ├─ Alembic Migrations
  └─ Row-Level Security
```

## 3. 技术选型

### 前端

- React 19、TypeScript 5.9、Vite 8（Rolldown）；
- Markdown/GFM 内容渲染，Zod 课程数据运行时校验；
- Vitest 单元测试，Playwright 浏览器 E2E；
- pnpm 管理依赖，根目录 `pnpm-lock.yaml` 是唯一前端锁文件。

### 后端

- Python、FastAPI、Pydantic Settings；
- SQLAlchemy 2 Async、asyncpg、Alembic；
- pytest、pytest-asyncio、Ruff；
- uv 管理依赖，`backend/uv.lock` 是唯一 Python 锁文件。

### 数据

- PostgreSQL 是事务型持久化事实源；
- Alembic 是 schema 演进唯一入口；
- RLS 是纵深防御，不能替代应用层身份验证、授权和资源范围检查；
- pgvector、Redis、消息队列均延后到需求与容量证据成立时再引入。

## 4. 语言与信任边界

### TypeScript / Browser

负责页面、交互、浏览器本地教学实验、用户输入校验和 API 调用。不得直接连接数据库、保存服务端密钥、承担最终授权或执行不可信代码并宣称其为安全沙箱。

### Python / Server

负责认证、授权、租户上下文、审计、服务端业务规则、持久化和 AI 集成。不得信任客户端传入的 user_id、tenant_id、role 或权限声明。所有写操作必须在服务端重新执行校验和授权。

### API Contract

FastAPI/OpenAPI 是接口权威来源。前端校验用于用户体验，不构成安全控制。跨语言字段、枚举、分页、错误码和时间格式必须通过契约测试保持一致。

## 5. 实验执行模式

每个实验必须声明且持续展示以下模式之一：

1. `simulation`：预定义规则或合成数据驱动的教学模拟；
2. `browser-local`：浏览器本地执行，不访问外部服务；
3. `server-sandbox`：由后端调度隔离 worker/container 执行；
4. `provider-backed`：调用真实模型或第三方服务，可能产生费用和数据传输。

不能因为 UI 展示了请求/响应就暗示发生了真实 API 调用。真实代码执行必须使用短生命周期、非特权、资源受限的隔离环境，默认拒绝外网访问。

## 6. 当前实现边界

- React + TypeScript + Vite 前端，包含 M01–M20 课程导航、教材渲染、课程数据契约和浏览器本地教学实验。
- Tokenizer、Transformer、RAG、Tool Calling、Agent Runtime、MCP、Multi-Agent 和 Evaluation 教学实验属于本地教学实现，不代表生产模型推理服务。
- 学习进度、收藏和测评草稿当前以浏览器 localStorage 为主，不等同于账户级云端同步。
- FastAPI 后端采用模块化单体，具备运行探针、配置管理、数据库会话、身份与租户基础模型、OIDC 登录/会话服务、学习记录与评估数据基础服务。
- OIDC 路由依赖外部 Provider、生产密钥和数据库配置；未配置时保持关闭。真实 Provider 注册、生产密钥注入、同站点部署验证仍是部署门禁。
- 学习者数据 API 默认关闭；启用前必须满足非 owner PostgreSQL runtime role 的 RLS 验收、隐私审查及完整配置要求。
- 课程发布、身份、租户、学习记录和评估 schema 通过 Alembic 管理；迁移必须在目标数据库环境单独验收。
- 尚未实现任意用户代码执行沙箱、生产级模型网关、生产向量检索、教师资源范围授权和完整教师评分流程。

## 7. 安全基线

- 默认拒绝未声明的工具能力；
- 模型输出不直接成为可信指令；
- 服务端对所有输入实施 schema、身份、权限和资源范围校验；
- 写操作、外部消息及高影响动作必须有明确授权与审计；
- 防御 Prompt Injection、数据外泄、越权工具调用和 SSRF；
- 密钥仅存储于服务端密钥管理系统，不进入前端 bundle 或日志；
- 租户/用户数据隔离，日志最小化并设置保留期限；
- 沙箱采用短生命周期、非特权用户和资源配额。

## 8. 演进约束

先保证教材内容、浏览器实验和当前后端基础稳定，再按实际业务需求引入持久化业务 API、真实模型调用和隔离执行。禁止以技术栈治理为由无需求地增加微服务、Kubernetes、Redis、消息队列或第二套框架。
