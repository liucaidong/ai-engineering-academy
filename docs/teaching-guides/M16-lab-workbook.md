# M16 实验工作簿：Workflow、Saga、Durable Execution 与 Replay

> 课程版本：0.40.9

> **证据等级：** E2 Simulated（内存 Workflow/replay/进程内锁）+ E3 Local-tested（本地测试）；不证明数据库事务或真实 Workflow 平台。 统一定义见[全课程证据等级](../CURRICULUM_EVIDENCE_LEVELS.md)。

> 五项实验对应 M16 五讲。示例使用内存状态和合成事件，不启动 Temporal、Azure Durable Functions、AWS Step Functions 或消息队列。

## 学习成果

完成本工作簿后，学习者应能够：
1. 区分 Workflow Control Plane 与 Agent Decision Plane；
2. 设计 Saga、Outbox、幂等消费者和版本化事件；
3. 为重试、deadline、熔断和隔离建立有界策略；
4. 将人工审批作为可持久恢复状态，并关联审计与 Trace；
5. 验证确定性回放、Workflow 版本兼容和历史迁移。

## 官方工程基线

- Temporal Workflow Definition：确定性命令、Replay、Activities 和版本化。
- Temporal Worker Versioning：Pinned/Auto-Upgrade 与 Worker Deployment Version；patching 是 replay-safe 兼容路径。
- Azure Durable Task：Event Sourcing、checkpoint、replay 和 orchestrator 代码约束。
- AWS Saga Patterns：局部事务、forward recovery 和 compensation。
- AWS Step Functions Error Handling：Retry/Catch、BackoffRate、MaxAttempts、jitter。
- CloudEvents v1.0.2：source/id/type/specversion 等事件上下文；`specversion` 值仍为 `"1.0"`。
- OpenTelemetry Messaging Spans：消息生产者/消费者之间的 trace context 传播；当前 semantic conventions 状态为 Development。

## 环境与运行

Python 3.10+，从仓库根目录执行，无第三方依赖：

    python3 examples/m16/01_workflow_control.py
    python3 examples/m16/02_saga_events.py
    python3 examples/m16/03_retry_resilience.py
    python3 examples/m16/04_approval_audit.py
    python3 examples/m16/05_replay_version.py
    python3 -m unittest discover -s examples/m16 -p test_examples.py

---

## 实验一：Workflow Control Plane 与 Agent Decision Plane

**对应课程：** 第一讲《Workflow 与 Agent 的边界》

### 任务

为保险理赔设计确定性状态机和受限 Agent 节点。

### 操作

1. 运行 01_workflow_control.py。
2. 定义 received、validated、awaiting_review、approved、rejected、paid 等状态。
3. 将身份校验、额度、审批和付款放入确定性控制层。
4. 将材料摘要、分类和风险标签放入 Agent Decision Plane。
5. 检查 Agent 输出必须经过 Schema、证据和业务规则校验。

### 必须提交

- Workflow state machine；
- Agent/Workflow 责任矩阵；
- 每个 Agent 节点的输入/输出 Schema；
- 状态转移 guard 和副作用清单；
- 不允许模型直接决定的高风险动作。

### 常见错误

- 因为流程有 LLM 节点就称为自主 Agent；
- 让 Agent 自己决定是否批准付款；
- 把自然语言“完成”当成业务状态；
- 在 orchestrator replay path 直接执行网络或数据库操作。

---

## 实验二：Saga、Outbox、CloudEvents 与幂等消费

**对应课程：** 第二讲《编排模式、状态图与事件驱动》

### 任务

为订单履约实现库存、支付和物流的 Saga 及补偿。

### 操作

1. 运行 02_saga_events.py。
2. 定义 local transaction、outbox event 和 consumer inbox。课程脚本用进程内锁模拟同一事务边界，不是数据库事务实现。
3. 使用 source + id 作为事件去重范围。
4. 在物流失败时执行退款和库存释放补偿。
5. 模拟补偿失败、重复事件和 schema version 升级。

### 必须提交

- Saga 状态图；
- Outbox/Inbox 数据模型；
- CloudEvents envelope；
- 正向事务与补偿映射；
- 重复/乱序事件和补偿失败测试。

### 常见错误

- 将补偿称为 ACID rollback；
- 数据库提交和消息发布分开执行造成双写；
- 只用时间戳去重；
- 事件 schema 变更没有兼容策略。

---

## 实验三：Retry Budget、Deadline、Circuit Breaker 与 Bulkhead

**对应课程：** 第三讲《重试、超时、熔断与补偿》

### 任务

为支付依赖设计有界重试与故障隔离策略。

### 操作

1. 运行 03_retry_resilience.py。
2. 将错误分类为 permanent、transient、rate-limited、unknown-write-outcome。
3. 计算 Full Jitter：`delay ~ Uniform(0, min(cap, base×factor^attempt))`。
4. 将 queue wait、attempt、backoff 和 synthesis 纳入总 deadline。
5. 设计 closed/open/half-open 熔断和并发 bulkhead。

### 必须提交

- 错误分类矩阵；
- Retry budget 与总 deadline；
- 幂等键和超时后状态查询；
- Circuit Breaker 状态图；
- 最大并发、限流和人工恢复策略。

### 常见错误

- 对所有异常统一重试；
- 每次重试重置总 deadline；
- 对状态未知的支付写操作盲目重试；
- 多层重试叠加造成 retry amplification。

---

## 实验四：Durable Approval Wait、审计与 Trace Context

**对应课程：** 第四讲《人工审批、审计与流程可追溯》

### 任务

将付款审批建模为持久化等待状态，并将审批事件与工作流 trace 关联。

### 操作

1. 运行 04_approval_audit.py。
2. 生成 awaiting_approval 状态及稳定 request ID。
3. 绑定 actor、resource、action、参数摘要、policy version、expiry 和一次性 nonce。
4. 由可信审批服务对 event 签名；验证时检查认证审批人并原子消费 nonce。
5. 通过外部 approval event 恢复工作流。
6. 传播 trace_id、span_id、correlation_id 和 causation_id。OpenTelemetry Messaging spans 当前为 Development。

### 必须提交

- Approval Request/Event Schema；
- 参数/资源版本绑定；
- 超时、拒绝、撤回和撤权状态；
- 审计事件字段；
- Producer→Consumer Trace Context 传播图。

### 常见错误

- 依赖 HTTP 请求一直保持打开；
- 审批后不重新检查权限和业务状态；
- Trace 只有服务名，没有 workflow/task/event 关联；
- 日志记录完整敏感参数或凭证。

---

## 实验五：Deterministic Replay 与 Workflow Versioning

**对应课程：** 第五讲《Workflow 测试、版本与生产治理》

### 任务

模拟 Workflow 历史事件与新版本代码命令序列，检测不兼容升级。

### 操作

1. 运行 05_replay_version.py。
2. 为 Workflow 历史记录稳定的 command sequence。
3. 修改新版本中的 Activity/Timer/Child Workflow 顺序，观察 replay mismatch。
4. 比较 Temporal Worker Versioning 的 Pinned/Auto-Upgrade 与 patching；不要将简化命令字符串测试误当作 Temporal SDK replay。
5. 使用 version marker 或 side-by-side worker path 保持旧任务兼容。
6. 为 Activity 设计幂等副作用和历史回放测试。

### 必须提交

- Event History 与 Command Sequence；
- replay compatibility 测试；
- versioning/patching 策略；
- Activity idempotency key；
- 开放历史任务升级、回滚和 Continue-As-New 策略。

### 常见错误

- 在 orchestrator 里读取系统时钟、随机数或环境变量；
- 将外部 API/LLM 调用放进 replay path；
- 认为 Activity 只会执行一次；
- Workflow 代码升级后不测试历史回放。

---

## 统一评分建议

| 维度 | 权重 | 达标证据 |
|---|---:|---|
| Workflow/Agent 边界 | 20% | Control Plane、Decision Plane 和状态图 |
| Saga/Event | 20% | Outbox/Inbox、CloudEvents、补偿与幂等 |
| Resilience | 20% | Retry budget、deadline、熔断和隔离 |
| Approval/Trace | 20% | Durable wait、动作绑定、审计关联 |
| Replay/Versioning | 20% | 历史回放、版本兼容和副作用保护 |

示例不代表任一工作流引擎的完整执行语义。真实验收必须在目标 Temporal/Azure/AWS 等引擎上进行历史回放、故障注入、幂等、补偿和版本升级测试。
