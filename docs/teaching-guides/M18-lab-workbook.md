# M18 实验工作簿：AI Platform、Gateway、多租户与计量

> 课程版本：0.40.9

> **证据等级：** E2 Simulated（内存 ledger/策略/capacity）+ E3 Local-tested（本地测试）；不证明真实账单、持久化计量或生产多租户。 统一定义见[全课程证据等级](../CURRICULUM_EVIDENCE_LEVELS.md)。

> 五项实验对应 M18 五讲。示例使用合成配置、请求和用量事件，不连接真实云账号、模型供应商、网关或计费平台。

## 学习成果

完成本工作簿后，学习者应能够：
1. 区分 Control Plane、Data Plane 和业务应用边界；
2. 设计能力感知路由、Local/Global 限流和安全 fallback；
3. 实现用量事件去重、quota reservation/settlement 和价格版本；
4. 选择 Silo/Pool/Bridge 隔离模型并传播可信 Tenant Context；
5. 通过公平调度、过载控制和容量余量保护平台 SLO。

## 工程基线

- Kubernetes Cluster Architecture：控制平面、节点和配置/调度边界。
- Envoy Gateway Rate Limiting：本地与全局限流。
- AWS SaaS Lens：Silo、Pool、Bridge 隔离模型。
- OpenMeter Usage Events：CloudEvents、source/id 去重和计量聚合；同一 key 的不同 payload 必须拒绝。
- NIST SP 800-57 Part 1 Rev.5 是当前最终版；Rev.6 仍为 Initial Public Draft。
- Google SRE Handling Overload：准入、降级和过载保护。

## 环境与运行

Python 3.10+，从仓库根目录执行，无第三方依赖：

    python3 examples/m18/01_control_plane.py
    python3 examples/m18/02_gateway_routing.py
    python3 examples/m18/03_metering.py
    python3 examples/m18/04_tenant_isolation.py
    python3 examples/m18/05_capacity_fairness.py
    python3 -m unittest discover -s examples/m18 -p test_examples.py

---

## 实验一：Desired State Reconciliation 与配置快照

**对应课程：** 第一讲《AI 平台边界与分层架构》

### 任务

设计一个控制平面发布模型路由/租户策略，数据平面消费版本化快照的机制。

### 操作

1. 运行 01_control_plane.py。
2. 定义 desired state、observed state 和 config version。
3. 检查 schema、策略模拟、canary、原子切换和 rollback。
4. 模拟控制平面不可用，判断数据平面是否可以继续使用最近可信快照。
6. 为过期/签名无效配置定义 fail-closed 条件。

### 必须提交

- Control Plane / Data Plane 组件图；
- desired/observed reconciliation loop；
- 配置快照和版本字段；
- rollout/rollback 状态机；
- 控制面故障时的数据面行为矩阵。

### 常见错误

- 每个推理请求同步调用控制平面；
- 没有版本就热更新部分配置；
- 让数据面无限期使用过期策略；
- 将控制面故障等同于所有已建立请求立即中断。

---

## 实验二：Gateway Routing、Fallback 与 Local/Global Rate Limit

**对应课程：** 第二讲《Model Gateway、路由与供应商抽象》

### 任务

为三个模型供应商设计基于能力、区域、租户策略和健康状态的路由。

### 操作

1. 运行 02_gateway_routing.py。
2. 定义模型能力目录、区域、数据策略、价格和健康状态。
3. 对候选模型执行 provider allowlist、capability/region/data policy/health/context/schema compatibility filter。
4. 比较 local 与 global rate limit。
5. 模拟主模型故障，验证 fallback 不越过租户区域、数据策略、上下文、schema、健康和预算策略。

### 必须提交

- Model capability registry；
- Gateway 请求处理序列；
- Local/Global 限流矩阵；
- fallback 兼容与拒绝条件；
- provider adapter 错误/usage 归一化规则。

### 常见错误

- 只按价格选择模型；
- Fallback 静默改变数据驻留或工具能力；
- 把每个 proxy 的 local quota 当成全局 quota；
- 将 provider secret 下发给客户端。

---

## 实验三：Usage Event Ledger、Quota Reservation 与 Settlement

**对应课程：** 第三讲《配额、限流、计量与成本归因》

### 任务

为一次模型请求设计配额预留、实际 usage 结算和账单事件去重。

### 操作

1. 运行 03_metering.py。
2. 预留最大输入/输出 token 和并发额度。
3. 生成 CloudEvents usage event，记录 tenant、request、provider/model、usage_origin、price_version、currency 和 occurred_at。
4. 用 source+id 去重，模拟事件重发和相同 ID 不同 payload 的冲突。
5. 使用 Decimal 计算费用（禁止 float）；对比 provider usage 与内部估算，计算 settle/refund delta，并使用版本化 ISO 4217 minor-unit exponent 与明确 rounding policy 量化金额。

### 必须提交

- Reservation/Settlement 状态机；
- Usage Event Schema；
- source/id 去重和 outbox 设计；
- 价格版本、币种和对账差异；
- 重试/失败请求的计量规则。

### 常见错误

- 请求开始时就按最大输出直接扣最终账单；
- 重试事件重复计费；
- 缺少价格生效时间和币种；
- 把 tokenizer 估算说成 provider usage。

---

## 实验四：Silo/Pool/Bridge 与 Tenant Context Propagation

**对应课程：** 第四讲《多租户安全、密钥与策略控制》

### 任务

为高敏感、普通和低成本租户选择不同隔离模型，并防止跨租户访问。

### 操作

1. 运行 04_tenant_isolation.py。
2. 为数据库、向量索引、对象存储、缓存、队列和密钥选择隔离粒度。
3. 从已完成 JWT signature/issuer/audience 验证的认证主体派生 tenant context。
4. 将 tenant scope 贯穿查询、缓存 key、事件 subject 和后台任务；私有缓存 key 还绑定 principal/resource version/policy version；标识符分隔符必须编码，避免键碰撞。
5. 构造伪造 tenant header、同租户越权和跨租户资源访问负向测试。

### 必须提交

- Silo/Pool/Bridge 选型矩阵；
- Tenant Context 数据结构；
- 数据/缓存/索引/队列隔离策略；
- 跨租户访问测试；
- 迁移、审计和租户生命周期流程。

### 常见错误

- 信任客户端 tenant_id/header；
- 只隔离数据库而不隔离缓存和向量检索；
- 后台任务丢失 tenant context；
- 将共享计算误认为数据天然隔离。

---

## 实验五：Fair Scheduling、Overload Control 与 Capacity Headroom

**对应课程：** 第五讲《平台可靠性、弹性与架构验收》

### 任务

模拟多个租户竞争有限推理容量，设计公平调度和过载保护。

### 操作

1. 运行 05_capacity_fairness.py。
2. 为每个租户设置权重、并发上限和 token budget。
3. 计算队列长度、等待时间和准入拒绝。
4. 模拟下游过载，选择降级、限流、load shedding 或 fallback。
5. 按失去一个节点后的剩余容量计算 N+1 headroom，再定义故障域、RTO/RPO 和平台 SLO。

### 必须提交

- Tenant fairness policy；
- Admission control 和队列策略；
- 容量压测及 break point；
- Overload/degradation 决策矩阵；
- 故障演练、RTO/RPO 和告警责任人。

### 常见错误

- 无限排队和无限重试；
- 大租户占满共享容量；
- 降级时绕过安全策略；
- 只看平均延迟，不看 P95/P99 和队列等待。

---

## 统一评分建议

| 维度 | 权重 | 达标证据 |
|---|---:|---|
| 平面与配置 | 20% | Reconciliation、版本快照、回滚 |
| Gateway | 20% | 能力路由、双层限流、安全 fallback |
| 计量 | 20% | Reservation/Settlement、去重和对账 |
| 多租户 | 20% | Silo/Pool/Bridge、可信上下文和负向测试 |
| 可靠性 | 20% | Fair scheduling、过载、容量和灾备 |

所有脚本使用合成数据。HMAC keyring、UsageLedger 和调度器均为进程内示例；真实平台验收需在目标 Kubernetes/Gateway/计量服务上验证 KMS 签名、分布式唯一约束、原子配额、币种精度、JWT/RBAC、数据库 RLS、缓存隔离、限流原子性、计量对账和过载恢复。
