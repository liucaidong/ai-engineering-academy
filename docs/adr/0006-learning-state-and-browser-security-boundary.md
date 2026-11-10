# ADR-0006：学习状态持久化与浏览器安全边界

- 状态：Accepted
- 日期：2026-11-10
- 范围：前端学习状态、课程编辑器异步加载、后端 credentialed CORS

## 背景

应用入口组件同时负责学习进度、收藏、测评草稿的 localStorage 读写，以及页面视图装配。该状态持久化逻辑与 UI 组合耦合。后端 learner APIs 使用 X-Tenant-ID 和 X-CSRF-Token，但 CORS allow headers 未包含租户请求头。课程编辑器加载所有模块正文时，异步失败没有显式错误状态。

## 决策

### 1. 前端学习状态边界

将学习进度、收藏、测评草稿的状态和 localStorage 读写统一抽取到：

src/features/learning/useLearningState.ts

职责：
- 读取并校验当前浏览器本地数据；
- 管理 React state；
- 将变更写回 localStorage；
- 对浏览器存储被禁用、配额不足等异常 fail-soft；
- 明确这些数据是 device-local，不宣称是账户同步数据。

应用入口保留页面路由/视图编排和用户操作处理，后续继续按 feature 拆分 UI 组合。

### 2. 课程编辑器异步加载

完整课程正文仍按需加载。加载失败必须显示可访问的错误状态和重试操作；不能永久保留 spinner。失败时不清除现有草稿，重试成功后继续使用现有编辑器持久化逻辑。

### 3. 浏览器安全中间件

将 OIDC 启用时的 CSRF/CORS middleware 安装逻辑集中为 configure_browser_security。Credentialed CORS 明确允许：
- Methods：GET、POST；
- Headers：Content-Type、X-CSRF-Token、X-Tenant-ID；
- Origins：仅来自经过配置校验的 HTTPS allowlist；
- Credentials：enabled。

X-Tenant-ID 是 API 请求上下文，不是授权凭证；服务端仍必须根据 session、membership、permission 和 RLS 再次授权。

## 后果

- 应用入口减少了学习状态存储细节，但仍有较多页面组合逻辑，后续需要继续拆分。
- 浏览器预检现在能够通过租户请求头，服务端授权边界不变。
- 课程编辑器加载失败可以恢复。
- localStorage 仍有浏览器设备隔离和配额限制，不等同于持久化云端学习档案。

## 验证

- pnpm lint、pnpm typecheck、pnpm build：通过；
- Playwright：42 tests passed；
- 新增失败 chunk 注入与编辑器重试 E2E；
- Backend pytest：125 passed / 1 skipped；
- 新增 CORS ASGI preflight 和 Assessment key normalization 测试；
- OpenAPI 3.1.0 / 12 paths 无漂移。
