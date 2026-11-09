# M14 可复现实验代码

五个 Python 标准库示例覆盖拓扑成本、A2A 消息模型、共享状态 CAS、证据账本和单位成功成本。无需第三方依赖、Agent API Key 或真实 Runtime。

## 环境与运行

Python 3.10+，从仓库根目录执行：

    python3 examples/m14/01_topology_cost.py
    python3 examples/m14/02_a2a_contract.py
    python3 examples/m14/03_shared_state.py
    python3 examples/m14/04_evidence_ledger.py
    python3 examples/m14/05_multiagent_evaluation.py
    python3 -m unittest discover -s examples/m14 -p test_examples.py

## 文件映射

| 文件 | 课程主题 | 输出 |
|---|---|---|
| 01_topology_cost.py | Topology | 总成本、串行/并行关键路径延迟、cost per success |
| 02_a2a_contract.py | Protocol | Agent Card、Task、Message、Artifact 结构检查 |
| 03_shared_state.py | Consistency | optimistic concurrency/CAS 与 event_id 去重 |
| 04_evidence_ledger.py | Evidence | 独立来源计数、claim 状态和 Agent 多样性 |
| 05_multiagent_evaluation.py | Evaluation | Wilson 区间、P95、单位成功成本 |

## 重要边界

- 成本模型不连接真实模型供应商，不包含所有计费项目；价格必须由实际部署配置提供。
- A2A 代码按 v1.0.1 检查部分字段形状（supportedInterfaces、Task.status.state、ROLE_*、Part oneof），只接受三种核心 binding，不覆盖 custom binding；不是官方 SDK、网络 binding 实现或完整 conformance test。
- SharedState 使用线程锁演示单进程内 CAS 原子性；不提供跨进程/跨主机事务、分布式锁、CRDT 或持久化。
- Evidence ledger 按声明的 lineage_id 合并同源副本，并用外部验证标志推进 claim 状态；lineage_id 是人工/系统元数据，仍不证明来源真实性或统计独立性。Agent diversity 仅是配置多样性指标，不等于统计独立。
- Wilson 区间假设二项结果模型；小样本区间较宽，配对设计和分层分析仍需独立完成。
- Trace span 的结构建议不等于真实 trace backend、审计日志或数据保留策略。OpenAI Agents SDK tracing 默认可能采集模型和工具调用输入/输出，生产部署需显式评估敏感数据脱敏、导出和 retention。
- 所有数据均为合成教学输入，不能据此宣称多 Agent 真实优于单 Agent。
