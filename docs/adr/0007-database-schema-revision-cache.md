# ADR-0007：数据库 Schema Revision 检查缓存

- 状态：Accepted
- 日期：2026-11-10
- 范围：API 请求路径中的 Alembic revision readiness check

## 背景

认证路由和 learner API 在每个请求中调用 `Database.check_schema_revision`。该方法每次都建立数据库连接并查询 `alembic_version`。在高频请求路径上重复执行相同的只读元数据查询，增加连接池占用和数据库往返。

## 决策

在每个进程的 `Database` 实例中缓存成功的 revision 检查结果，TTL 为 5 秒：
- 使用 `time.monotonic()` 计算过期时间，避免系统时钟调整影响 TTL。
- 使用 `asyncio.Lock` 合并并发 cache miss，同一进程并发首次请求只触发一次数据库查询。
- 仅缓存成功且 revision 精确匹配的结果。
- 数据库异常、空 revision、旧 revision、多 head 均 fail closed，失败结果不缓存。
- 提供显式 `invalidate_schema_revision_cache()`；`dispose()` 时清除缓存。
- 不跨进程共享缓存；每个 worker 独立检查。

## 部署约束与风险

- 缓存最多允许 schema readiness 判断滞后 5 秒。迁移部署仍必须采用 expand/contract 策略，先保证旧/新应用版本兼容，再迁移和滚动重启。
- 不支持在同一运行进程内绕过部署流程执行破坏性 schema migration；如确实存在进程内迁移操作，必须显式调用 cache invalidation。
- 缓存不是数据库健康检查，也不缓存 SQLAlchemy 连接可用性；连接池仍使用 `pool_pre_ping`。
- 这是减少重复 catalog 查询的机制，不声称已测得具体延迟百分比；真实吞吐收益需在 PostgreSQL 环境做基准测试。

## 验证

- 7 项 database unit tests 通过，覆盖 exact head、旧 revision、未配置数据库、TTL 过期、失败不缓存、12 个并发调用合并为一次查询、显式失效。
- Backend pytest：129 passed / 1 skipped。
- Ruff check / format：通过。
- 完整 `pnpm acceptance:local`：通过，包含 42 Playwright E2E、73 Vitest、88 Python 教学示例及后端测试。
- `pnpm security:audit`：npm 生产依赖与 Python 环境依赖未发现已知漏洞。
