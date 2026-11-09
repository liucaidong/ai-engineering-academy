# M16 可复现实验代码

五个 Python 标准库示例覆盖 Workflow/Agent 边界、CloudEvents/Saga、Retry/Circuit Breaker、持久化审批/Trace 和 Workflow replay/versioning。无需第三方依赖或真实 workflow engine。

## 环境与运行

Python 3.10+，从仓库根目录执行：

    python3 examples/m16/01_workflow_control.py
    python3 examples/m16/02_saga_events.py
    python3 examples/m16/03_retry_resilience.py
    python3 examples/m16/04_approval_audit.py
    python3 examples/m16/05_replay_version.py
    python3 -m unittest discover -s examples/m16 -p test_examples.py

## 文件映射

| 文件 | 课程主题 | 输出 |
|---|---|---|
| 01_workflow_control.py | Control plane | 状态转移 guard 与 Agent proposal schema |
| 02_saga_events.py | Saga/Event | CloudEvents 1.0.2 envelope、内存 Outbox/Inbox、source/id 去重和补偿顺序 |
| 03_retry_resilience.py | Reliability | bounded exponential backoff、Full Jitter、简化 Circuit Breaker |
| 04_approval_audit.py | Approval/Audit | signed approval event、action digest、approver identity、one-time nonce 和 trace correlation |
| 05_replay_version.py | Replay/Versioning | command history compatibility 与 version routing |

## 重要边界

- Workflow 状态机是内存教学模型，不持久化、不调度活动、不提供并发安全。
- Outbox/Inbox 只在进程内锁下模拟原子提交和 source/id 去重，不是真实数据库事务，也不提供 broker delivery guarantee。
- Retry 使用 Full Jitter 并固定 seed 便于复现；Circuit Breaker 只实现连续失败阈值和单探针，不是 Resilience4j 的完整滑动窗口/半开并发实现。
- Approval 事件由 demo HMAC signer 签名，假设调用方已认证 approver；action digest 使用 Python JSON（非跨语言 RFC 8785），nonce store 仅进程内原子，不提供持久化身份系统。
- Replay 检查只比较命令序列，不等于 Temporal/Azure Durable 的 SDK replay/conformance test。Temporal Worker Versioning 的 Pinned/Auto-Upgrade 和 patching 依赖具体部署/SDK。
- 所有状态、时间、错误和事件均为合成输入；真实引擎行为需在目标平台上测试。
