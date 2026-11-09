# M10 可复现实验代码

五个 Python 标准库示例覆盖自主性预算、Agent Trace、Durable Execution、Capability Policy 和 Agent Outcome Evaluation。无需 LLM、数据库、Temporal Server、Shell、浏览器或 API Key。

## 环境与运行

Python 3.10+，从仓库根目录执行：

    python3 examples/m10/01_autonomy_envelope.py
    python3 examples/m10/02_agent_loop_trace.py
    python3 examples/m10/03_durable_execution.py
    python3 examples/m10/04_capability_policy.py
    python3 examples/m10/05_agent_evaluation.py
    python3 -m unittest discover -s examples/m10 -p 'test_examples.py'

## 文件映射

| 文件 | 课程主题 | 输出 |
|---|---|---|
| 01_autonomy_envelope.py | Agent 自主性边界 | 动作风险等级、审批和预算停止原因 |
| 02_agent_loop_trace.py | Plan/Act/Observe | 重复动作检测和停止原因 |
| 03_durable_execution.py | Checkpoint/Replay | 事件状态重建与幂等副作用去重 |
| 04_capability_policy.py | Runtime Security | Tenant、动作、资源路径和有效期校验 |
| 05_agent_evaluation.py | Agent Evaluation | 成功率、pass^k、Wilson 区间和单位成功成本 |

## 重要边界

- 自主性风险等级是教学分类，不是通用安全标准或生产授权策略。
- Trace 检测只使用动作签名重复作为简单启发式，不理解真实环境状态。
- 幂等 ledger 是内存字典，不具备跨进程持久化、事务或 exactly-once 保证。
- Capability 路径校验仅为 POSIX 路径演示；生产系统还需可信身份、资源解析、符号链接/挂载边界和服务端授权。
- pass^k 计算假设重复运行分组已预先定义；Wilson 区间不消除任务样本偏差。
- 示例不执行真实 Agent、工具调用、沙箱或持久化运行时。
