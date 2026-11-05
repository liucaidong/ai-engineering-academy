# 技术架构基线

## 1. 架构目标
支持内容优先、交互可插拔、实验执行分级、安全边界明确，并允许从单体 MVP 平滑演进。初期不预先拆分微服务。

## 2. 逻辑分层
```text
Learner UI
  ├─ Course Shell / Navigation / Search
  ├─ Content Renderer (Markdown/MDX)
  ├─ Lab Components (Tokenizer / Transformer / RAG / Agent ...)
  └─ Progress & Assessment UI
          |
          v
Application API (later phase)
  ├─ Course & Progress Service
  ├─ Tutor / Retrieval Service
  ├─ Model Gateway
  ├─ Lab Orchestrator
  └─ Evaluation Service
          |
          v
Execution & Data
  ├─ Model Providers / Local Models
  ├─ Isolated Lab Workers
  ├─ PostgreSQL (+ pgvector when justified)
  ├─ Redis / Queue (only when async workload requires)
  ├─ Object Storage
  └─ Telemetry / Audit
```

## 3. 技术建议

### 前端
- React + TypeScript；
- Vite 或同等级轻量构建工具；
- Markdown/MDX 内容管线；
- 组件按课程实验能力拆分；
- Zod 或同等级 schema 校验；
- 单元测试、组件测试和浏览器端 E2E 按阶段引入。

### 后端（需要真实执行时再引入）
- Python + FastAPI 作为候选 API 层；
- 模型供应商适配器与统一 Model Gateway；
- PostgreSQL 作为事务型主数据存储；
- pgvector 仅在检索需求和数据规模证明其必要时启用；
- Redis/消息队列仅在异步任务、并发和背压需求出现后引入。

### 执行环境
- 浏览器端仅运行可信、资源受限的教学逻辑；
- 真实代码执行必须使用隔离 worker/container；
- 对外网络默认关闭，按实验白名单开放；
- CPU、内存、时长、输出大小和并发均需限制；
- 每次执行具备独立身份、审计事件和清理策略。

## 4. 核心领域对象
Course（课程元数据与版本）、Module（模块及先修关系）、Lesson（章节内容与教学目标）、LabDefinition（实验定义、参数 schema 和执行模式）、LabRun（实验执行状态、日志和产物引用）、Assessment（测验/任务定义）、AssessmentResult（评分、反馈和证据）、LearningProgress（学习者进度）、SourceReference（知识来源及版本）、PolicyDecision（权限与审批决策）。

## 5. 实验执行模式
每个实验必须声明且在 UI 中持续展示以下一种模式：
1. simulation：预定义规则或合成数据驱动的教学模拟；
2. browser-local：仅在浏览器本地执行，不访问外部服务；
3. server-sandbox：后端隔离环境执行；
4. provider-backed：调用真实模型或第三方服务，可能产生费用和数据传输。

不能因为界面展示了“请求/响应”就暗示发生了真实 API 调用。

## 6. 安全基线
- 默认拒绝所有未声明的工具能力；
- 模型输出不直接成为可信指令；
- 工具参数必须做 schema 校验、权限校验和资源范围校验；
- 写操作、外部消息及其他高影响动作必须人工确认；
- 防御 Prompt Injection、数据外泄、越权工具调用和 SSRF；
- 密钥仅存储在服务端密钥管理系统，不进入前端 bundle 或日志；
- 租户/用户数据隔离，日志最小化并设置保留期限；
- 沙箱采用短生命周期、非特权用户和资源配额。

## 7. 可观测性与评估
至少记录请求 ID、实验 ID、模型/供应商标识、延迟、token 用量（若可得）、成本估算、重试、工具调用结果、策略决策和错误分类。不得记录不必要的敏感原文。离线评测集应版本化，评分器需记录版本和已知局限。

## 8. 当前前端实现状态\n- 已实现 React + TypeScript + Vite 应用壳、课程导航和 Zod 运行时契约；\n- 已实现无原始 HTML 的 Markdown/GFM 渲染；\n- 已实现 Tokenizer、Transformer Attention、RAG 三个浏览器本地/教学模拟实验；\n- 尚未实现后端 API、学习进度持久化、真实模型调用、向量数据库和服务端沙箱。\n\n## 9. 演进约束
先完成静态内容与本地交互 MVP，再引入 API、持久化、真实模型调用和隔离执行。任何新增基础设施都应以已验证需求、容量数据或安全要求为依据。
