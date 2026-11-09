# M14 实验工作簿：Multi-Agent 协作、状态与评测

> 课程版本：0.40.9

> **证据等级：** E2 Simulated（确定性 Multi-Agent 拓扑/成本/状态）+ E3 Local-tested（本地测试）；不证明远程 Agent/A2A 互操作。 统一定义见[全课程证据等级](../CURRICULUM_EVIDENCE_LEVELS.md)。

> 五项实验对应 M14 五讲。示例使用确定性合成数据，不调用 LLM、不启动真实 Agent Runtime、不连接 A2A Server 或远程工具。

## 学习成果

完成本工作簿后，学习者应能够：
1. 通过任务依赖、并行收益、协调成本和副作用风险选择协作拓扑；
2. 区分 Runtime 内部 Task/Result、A2A 远程互操作和 MCP 工具/上下文协议；
3. 为共享状态选择 single-writer、CAS、append-only event log 或 CRDT；
4. 用 claim ledger 和独立验证降低相关错误与“多数票幻觉”；
5. 通过 paired benchmark、trace 和 cost per successful task 证明多 Agent 净收益。

## 规范与工程基线

- Anthropic Building Effective Agents：routing、parallelization、orchestrator-worker、evaluator-optimizer。
- Anthropic multi-agent research system：并行 subagents、任务边界、artifact handoff、上下文管理。
- OpenAI Agents SDK：Agents as tools、handoffs、guardrails、内建 trace/span 类型及敏感数据采集配置。
- A2A Protocol v1.0.1：Agent Card、supportedInterfaces、三种核心 binding、TaskState、Message/Part/Artifact 和 A2A-Version。
- Microsoft AutoGen：GroupChat、speaker selection 和 termination conditions。
- Dynamo 论文：最终一致性、版本向量和冲突协调。

## 环境与运行

Python 3.10+，从仓库根目录执行，无第三方依赖：

    python3 examples/m14/01_topology_cost.py
    python3 examples/m14/02_a2a_contract.py
    python3 examples/m14/03_shared_state.py
    python3 examples/m14/04_evidence_ledger.py
    python3 examples/m14/05_multiagent_evaluation.py
    python3 -m unittest discover -s examples/m14 -p test_examples.py

---

## 实验一：Topology Decision Matrix 与协调税

**对应课程：** 第一讲《Multi-Agent 协作模型与适用边界》

### 任务

比较单 Agent、Manager/Worker、Peer、流水线和并行 fan-out/fan-in 的成本与延迟。

### 操作

1. 运行 01_topology_cost.py。
2. 对市场研究、代码审查、订单退款三个任务记录依赖耦合、并行性、共享状态和副作用。
3. 计算总 token/工具成本与串行/并行 wall-clock latency。
4. 比较单 Agent baseline 与多 Agent 方案的预期成功率。
5. 给出明确的采用或不采用结论。

### 必须提交

- Topology decision matrix；
- 任务 DAG 与关键路径；
- C_total 成本拆解；
- 并行和串行延迟估算；
- 协调税、重复劳动和失败传播风险；
- 不采用多 Agent 的反例。

### 常见错误

- Agent 数量增加就认为质量一定提高；
- 只比较 wall-clock latency，不比较总 token/工具成本；
- 并行执行没有定义 barrier、超时和失败策略；
- 对退款、支付、发布等副作用任务用自由讨论代替确定性工作流。

---

## 实验二：A2A Agent Card 与 Task/Message/Artifact

**对应课程：** 第二讲《专家分工、任务路由与消息协议》

### 任务

设计一个内部 Agent Task/Result 合同，并映射到 A2A 的远程互操作概念。

### 操作

1. 运行 02_a2a_contract.py。
2. 按 A2A v1.0.1 定义 Agent Card 的 name、description、supportedInterfaces、version、capabilities、defaultInputModes、defaultOutputModes 和 skills。
3. 为一个长任务建立 Task ID、contextId 和 `status.state`，覆盖 AUTH_REQUIRED/INPUT_REQUIRED。
4. 使用 ROLE_USER/ROLE_AGENT、messageId 和 Part oneof（text/raw/url/data）定义 Message。
5. 区分用于沟通的 Message 与必须具有 artifactId/non-empty parts 的最终 Artifact。
6. 标注 JSONRPC、GRPC、HTTP+JSON 三种核心 binding，并在每个请求中发送 A2A-Version；本练习 validator 不覆盖 custom binding。

### 必须提交

- A2A v1.0.1 Agent Card JSON；
- A2A Task/Message/Part/Artifact 样例；
- 内部 Task/Result Schema；
- A2A Task/Message/Artifact 映射；
- MCP 与 A2A 的职责边界图；
- 超时、重派、状态查询和认证策略。

### 常见错误

- 把 A2A 当作 MCP 的新版本；
- 把内部 Task JSON 说成 A2A 标准消息；
- 用自由文本消息传递所有大型交付物；
- 仅凭 Agent Card 声明就信任远端 Agent 或跳过认证授权；
- 把 `TASK_STATE_AUTH_REQUIRED` 当作已获得权限。

---

## 实验三：共享状态、CAS 与事件账本

**对应课程：** 第三讲《共享状态、一致性与冲突协调》

### 任务

模拟两个 Agent 并发更新共享研究记录，检测 stale write 和重复事件。

### 操作

1. 运行 03_shared_state.py。
2. 为每条证据事件分配稳定 event_id 和来源引用。
3. 使用 expected_version/CAS 阻止过期写入覆盖。
4. 用 event_id 去重，区分 append-only evidence 与 mutable summary。
5. 比较 single-writer、乐观并发和 CRDT 的适用条件。

### 必须提交

- 共享状态数据模型；
- 并发时序图；
- stale-write 和 duplicate-event 测试；
- 一致性/冲突策略；
- 读写权限与审计字段。

### 常见错误

- 默认 last-write-wins；
- 将时间戳当作完整因果关系；
- 证据事件与可变摘要混存；
- 没有说明 CRDT 的可交换/收敛条件。

---

## 实验四：Claim Ledger 与独立验证

**对应课程：** 第四讲《协作讨论、独立验证与结果综合》

### 任务

合并多个 Agent 的主张，保留支持/反对证据，并识别来源和模型相关性。

### 操作

1. 运行 04_evidence_ledger.py。
2. 构造 proposal、critique、revision 和 independent verification 四阶段。
3. 将每个 claim 与 supporting_refs、contradicting_refs 和验证方法关联。
4. 为 Agent 记录模型、Prompt、工具和数据源重叠情况。
5. 对无法解决的冲突保留 unresolved 状态并上报人工。

### 必须提交

- Claim ledger；
- 证据来源等级；
- Agent 独立性矩阵；
- verified fact / inference / recommendation / unresolved 分类；
- 停止和人工仲裁条件。

### 常见错误

- 用 3:1 投票取代来源核验；
- 把同一模型的三次采样当作三个独立证据源；
- 丢弃反对证据和未解决项；
- 让 Manager 将 Worker 的自我评价写成验证结论。

---

## 实验五：Paired Benchmark 与单位成功成本

**对应课程：** 第五讲《Multi-Agent 评测、成本与可靠性》

### 任务

比较单 Agent 与多 Agent 的任务成功率、成本、延迟和协作故障。

### 操作

1. 运行 05_multiagent_evaluation.py。
2. 为同一批任务记录 baseline/candidate 的成功、总成本和 P95 延迟。
3. 计算 task success、cost per successful task 和 Wilson 区间。
4. 记录 conflict rate、duplicate work、handoff failure 和 tool violation。
5. 按任务难度、领域和权限角色切片，制定灰度与回滚门槛。

### 必须提交

- Paired benchmark dataset；
- 成功率和单位成功成本；
- 延迟分布与置信区间；
- 协作失败指标；
- Trace span 结构、敏感数据采集/脱敏、导出目标和审计保留策略；
- 明确的采用/不采用决策。

### 常见错误

- 只测单次演示；
- 忽略失败任务成本；
- 仅比较 token 数而不比较成功率；
- 小样本结果没有不确定性说明；
- Trace 没有跨 Agent、工具和 Artifact 的关联 ID。

---

## 统一评分建议

| 维度 | 权重 | 达标证据 |
|---|---:|---|
| 拓扑与成本 | 20% | Decision matrix、关键路径、协调税 |
| 协议与路由 | 20% | Agent Card、Task/Result、A2A 映射 |
| 状态与一致性 | 20% | CAS、事件账本、冲突策略 |
| 证据与仲裁 | 20% | Claim ledger、独立验证和未解决项 |
| 评测与观测 | 20% | Paired benchmark、cost/success、trace |

所有脚本均使用合成数据。真实生产验收还需要真实 Agent Runtime、A2A v1.0.1 endpoint、身份认证、权限策略、持久状态、trace backend 和具代表性的任务数据集。OpenAI Agents SDK 的默认 tracing 可能捕获 generation/function 的敏感输入输出；部署前必须审查 trace redaction、ZDR 适用性和保留策略。
