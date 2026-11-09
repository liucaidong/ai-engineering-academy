# M18 可复现实验代码

五个 Python 标准库示例覆盖控制平面快照、Gateway 路由、计量账本、多租户隔离和公平调度。无需第三方依赖、模型 API Key 或真实云资源。

## 运行

Python 3.10+，从仓库根目录执行：

    python3 examples/m18/01_control_plane.py
    python3 examples/m18/02_gateway_routing.py
    python3 examples/m18/03_metering.py
    python3 examples/m18/04_tenant_isolation.py
    python3 examples/m18/05_capacity_fairness.py
    python3 -m unittest discover -s examples/m18 -p test_examples.py

## 教学映射

| 示例 | 主题 | 核心概念 |
|---|---|---|
| 01_control_plane.py | Control Plane | desired/observed reconciliation、HMAC key_id/schema/版本/TTL 快照 |
| 02_gateway_routing.py | Model Gateway | capability/region/policy 路由、fallback、local/global 限流 |
| 03_metering.py | Usage Metering | CloudEvents source+id 幂等账本、Decimal settlement、价格版本 |
| 04_tenant_isolation.py | SaaS Tenancy | 可信 tenant context、跨租户拒绝、Silo/Pool/Bridge |
| 05_capacity_fairness.py | Reliability | weighted round-robin、admission control、generic/N+1 capacity headroom |

## 重要边界

- 控制平面示例使用 HMAC 验证完整配置快照；生产仍需 KMS/HSM、非对称签名、key rotation、schema registry 和 Kubernetes watch/canary。
- Gateway 示例是静态路由筛选，不实现真实代理、分布式限流或 provider adapter。
- UsageLedger 只在进程内按 source/id 去重并检测 payload 冲突；生产需要数据库持久唯一约束、事务 outbox、原子账本、币种精度/rounding policy 和 provider invoice reconciliation。
- Tenant context 假设 claims 已由认证组件验证；示例本身不验证 JWT、RBAC、数据库 RLS 或 Kubernetes NetworkPolicy。私有 cache key 按 tenant/principal/resource version/policy version 隔离。
- Weighted scheduling 是小型教学轮询模型，不是完整 DRR/WFQ；N+1 函数只核算单节点丢失的容量条件，不替代压测和故障域分析。
- 所有输入都是合成数据，不构成生产部署或多租户安全认证。
