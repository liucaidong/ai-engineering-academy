# M10 实验工作簿：Agent Runtime、执行边界与可靠性

> 课程版本：0.40.9

> **证据等级：** E2 Simulated（进程内 Runtime、crash/retry）+ E3 Local-tested（本地测试）；不证明真实 Temporal Worker 或外部副作用。 统一定义见[全课程证据等级](../CURRICULUM_EVIDENCE_LEVELS.md)。

> 五项实验对应 M10 五讲。程序使用 Python 标准库和虚构数据，不调用真实 LLM、Shell、浏览器、MCP Server、外部 API 或持久化执行平台。

## 学习成果

完成本工作簿后，学习者应能够：
1. 定义 Agent 的自主性包络、授权范围、预算和停止条件；
2. 设计可验证的 Plan/Act/Observe 轨迹和后置条件；
3. 区分 checkpoint、replay、retry 和幂等副作用；
4. 为 Agent 工具运行时建立 capability、sandbox 和不可信观察边界；
5. 使用环境状态、pass^k、人工介入和单位成功成本评估 Agent。

## 环境与运行

Python 3.10+，从仓库根目录执行，无第三方依赖：

    python3 examples/m10/01_autonomy_envelope.py
    python3 examples/m10/02_agent_loop_trace.py
    python3 examples/m10/03_durable_execution.py
    python3 examples/m10/04_capability_policy.py
    python3 examples/m10/05_agent_evaluation.py
    python3 -m unittest discover -s examples/m10 -p 'test_examples.py'

---

## 实验一：定义 Agent 自主性包络

**对应课程：** 第一讲《Agent 基本模型与自主性边界》

### 任务

为“企业报销申请助手”定义 Agent 可做、不可做和必须审批的动作，并设置可量化预算。

### 操作

1. 运行 01_autonomy_envelope.py。
2. 定义目标、非目标、资源范围、最大轮次、工具调用数、运行时间和费用上限。
3. 将动作分为只读、可逆写入、不可逆副作用和跨系统操作。
4. 为每个动作指定授权主体、策略检查点和人工审批要求。
5. 定义成功后置条件、拒绝条件和停止条件。

### 必须提交

- Agent/Runtime/Tool/Policy/Environment 架构图；
- autonomy envelope；
- 动作风险分级和权限矩阵；
- 预算与停止条件；
- 业务后置条件和状态验证证据。

### 常见错误

- 把模型输出当作授权；
- 将“最大轮数”当作唯一预算；
- 让 Agent 继承用户全部权限；
- 以模型说“已完成”替代环境状态检查。

---

## 实验二：Plan/Act/Observe 轨迹与循环检测

**对应课程：** 第二讲《Planning、Execution 与 Observation 循环》

### 任务

设计一个结构化 Agent Trace，检测重复动作、无进展、工具错误和预算耗尽。

### 操作

1. 运行 02_agent_loop_trace.py。
2. 将一次 Agent 执行表示为 action/observation 事件序列。
3. 对每个 action 增加 action_id、工具、参数摘要、授权决策、deadline 和 postcondition。
4. 对 observation 增加状态、时间戳、来源版本、错误类别和 correlation ID。
5. 注入重复动作、无进展、权限拒绝和目标达成等情况，定义终止原因。

### 必须提交

- 状态机和事件 schema；
- 一条成功轨迹和至少三条失败轨迹；
- 循环检测与无进展策略；
- postcondition 验证方案；
- stop reason 和审计事件列表。

### 常见错误

- 把内部 reasoning 文本当作可靠执行日志；
- 只看工具 HTTP 200，不验证业务后置条件；
- 工具输出包含“系统指令”时直接信任；
- 无限重试相同动作或相同错误。

---

## 实验三：Checkpoint、Replay、Retry 与幂等恢复

**对应课程：** 第三讲《Runtime 状态机与执行调度》

### 任务

模拟 Agent 在外部副作用执行后、结果持久化前崩溃的情况，设计恢复和重复提交防护。

### 操作

1. 运行 03_durable_execution.py。
2. 区分 workflow decision、LLM activity、tool activity 和外部业务副作用。
3. 设计事件历史和 checkpoint，说明哪些结果必须持久化。
4. 模拟 worker crash、消息重投、Activity retry 和未知结果。
5. 为外部写操作设计 idempotency key、operation ledger 和 reconcile 流程。

### 必须提交

- Durable Execution 边界图；
- Event History 和 checkpoint schema；
- replay/retry 对照表；
- 重复副作用防护策略；
- 未知结果恢复和人工对账方案。

### 常见错误

- 认为 replay 就是重新执行所有工具；
- 认为数据库事务可以覆盖跨系统副作用；
- 认为 at-least-once delivery 自动等于 exactly-once；
- 未知结果时盲目再次扣款/提交/发送。

---

## 实验四：Capability Security 与工具运行时隔离

**对应课程：** 第四讲《Context、工具注册与 Runtime 安全》

### 任务

为不同 Agent run 签发最小 capability，阻止越权工具、越界资源和不可信观察诱导的动作。

### 操作

1. 运行 04_capability_policy.py。
2. 定义工具 capability：动作、资源范围、租户、有效期和调用预算。
3. 比较 ambient credentials 与 per-run scoped capability。
4. 构造网页、文件、终端输出中的 prompt injection 文本。
5. 设计 sandbox、网络出口、secret broker、路径校验和 HITL 策略。

### 必须提交

- capability 数据结构和策略决策表；
- 工具 allowlist/denylist；
- 不可信观察处理规则；
- 文件/进程/网络隔离边界；
- 高风险副作用审批和拒绝证据。

### 常见错误

- 只通过 Prompt 约束工具权限；
- 把工具描述或网页内容当作可信系统指令；
- 把用户凭证长期暴露给 Agent；
- 认为容器隔离自动解决租户、网络和密钥泄露。

---

## 实验五：Agent Outcome、Pass^k 与单位成功成本

**对应课程：** 第五讲《Agent 可靠性、故障恢复与验收》

### 任务

以最终环境状态而不是模型自述作为成功标准，评估多次运行一致性、人工介入和单位成功成本。

### 操作

1. 运行 05_agent_evaluation.py。
2. 对固定任务进行多次独立运行，统计单次成功率和 pass^k。
3. 比较最终环境状态与标注目标状态。
4. 统计工具错误、策略违规、恢复率、人工接管和 P95 latency。
5. 计算 cost per successful task，并按难度/环境初始状态切片。

### 必须提交

- 任务数据集和初始状态；
- 最终状态 evaluator；
- pass^k、置信区间和样本量；
- token/tool cost、latency 和 human intervention；
- 失败案例分类和回归门禁。

### 常见错误

- 把一次成功当作系统可靠；
- 只评估回答文本而不检查环境状态；
- 不报告人工介入和策略违规；
- 用平均成本掩盖长尾失败和高成本任务。

---

## 统一评分建议

| 维度 | 权重 | 达标证据 |
|---|---:|---|
| 自主性与边界 | 20% | Agent 契约、授权矩阵、预算和停止条件 |
| 执行循环 | 20% | Trace、循环检测、观察可信度和后置条件 |
| 持久化恢复 | 20% | Event History、Replay/Retry 和幂等恢复 |
| 运行时安全 | 20% | Capability、sandbox、secret 和 HITL |
| 可靠性评测 | 20% | Outcome、pass^k、成本、延迟和人工介入 |

所有通过结论必须绑定可复现的环境状态和评测版本。合成轨迹和本地计算器不能被描述为真实 Agent 或生产运行时验收。
