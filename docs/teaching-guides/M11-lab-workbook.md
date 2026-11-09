# M11 实验工作簿：Planning、Memory 与可恢复状态

> 课程版本：0.40.9

> **证据等级：** E2 Simulated（合成记忆/过期/删除状态）+ E3 Local-tested（本地测试）；不证明生产长期记忆/删除合规。 统一定义见[全课程证据等级](../CURRICULUM_EVIDENCE_LEVELS.md)。

> 五项实验对应 M11 五讲。程序使用 Python 标准库和虚构数据，不连接真实 Agent、长期记忆数据库、用户资料或审批服务。

## 学习成果

完成本工作簿后，学习者应能够：
1. 将自然语言目标编译成带前置条件/效果的计划 DAG；
2. 设计带来源、时间、范围和删除语义的 Memory Record；
3. 建立可解释的检索、反思、摘要与冲突处理策略；
4. 将 Human Approval 绑定具体动作摘要和状态版本；
5. 分别评估 Planning 与 Memory 的质量、隐私和长期可靠性。

## 环境与运行

Python 3.10+，从仓库根目录执行，无第三方依赖：

    python3 examples/m11/01_plan_dag.py
    python3 examples/m11/02_memory_records.py
    python3 examples/m11/03_memory_retrieval.py
    python3 examples/m11/04_approval_binding.py
    python3 examples/m11/05_planning_memory_eval.py
    python3 -m unittest discover -s examples/m11 -p 'test_examples.py'

---

## 实验一：自然语言目标与形式化计划 DAG

**对应课程：** 第一讲《任务分解与计划表示》

### 任务

将“完成供应商尽调并提交采购审批”转化为动作 DAG，验证前置条件、依赖和目标状态。

### 操作

1. 运行 01_plan_dag.py。
2. 定义供应商资料收集、风险筛查、财务核验、报告生成和审批提交等动作。
3. 为每个动作定义参数、preconditions、effects、cost 和资源约束。
4. 构造 DAG，执行拓扑排序并检查循环。
5. 注入缺失初始条件、依赖环和不满足前置条件的失败案例。

### 必须提交

- 目标状态与初始状态；
- Action Schema；
- DAG、依赖边和拓扑顺序；
- 前置条件/效果验证；
- 不确定性、资源约束和重规划触发条件。

### 常见错误

- 将自然语言步骤列表直接称为可执行计划；
- 不定义动作前置条件和效果；
- 将错误 PDDL/状态模型的 planner 结果误认为真实正确；
- 忽略资源冲突、时限和部分可观测状态。

---

## 实验二：Memory Record Schema 与时间语义

**对应课程：** 第二讲《Memory 类型与存储边界》

### 任务

为用户偏好、项目状态和历史事件设计可追溯、可过期、可撤销的记忆记录。

### 操作

1. 运行 02_memory_records.py。
2. 定义 episodic、semantic、procedural 和 preference 四类记忆。
3. 为每条记忆添加 source_event_ids、tenant/user scope、confidence、sensitivity 和 consent basis。
4. 区分 valid time 与 recorded time。
5. 模拟事实更新、过期、用户纠正和删除 tombstone。

### 必须提交

- Memory Record JSON Schema；
- 来源与证据等级；
- 时间有效性和版本更新规则；
- 用户/租户隔离策略；
- 删除传播到摘要、索引、缓存和派生记录的方案。

### 常见错误

- 把模型推断写成用户明确陈述；
- 不保存来源和时间；
- 用静默覆盖消除冲突历史；
- 删除主表记录后保留派生摘要和向量。

---

## 实验三：记忆检索、巩固与冲突解决

**对应课程：** 第三讲《记忆检索、摘要与巩固》

### 任务

对候选记忆按相关性、时效、显著性和置信度排序，并设计证据保真的摘要/冲突策略。

### 操作

1. 运行 03_memory_retrieval.py。
2. 比较 relevance-only、recency-only 和多因子排序。
3. 构造新旧偏好冲突、时间冲突和不同来源可信度冲突。
4. 设计摘要压缩规则，保留 source_event_ids 和时间范围。
5. 对摘要执行实体、数字、时间、否定条件和冲突回归检查。

### 必须提交

- 检索排序公式与权重；
- stale memory 检测策略；
- 证据来源和冲突仲裁；
- 摘要保真和回溯结构；
- 写入、检索和删除的审计事件。

### 常见错误

- 把 recency 直接当作真实性；
- 多次摘要后将同一信息当成多份独立证据；
- 不标记推断和置信度；
- 不保留原始事件 ID 和时间范围。

---

## 实验四：Human Approval 绑定与记忆写入治理

**对应课程：** 第四讲《人类反馈、审批与持久化状态》

### 任务

构造一个需要人工批准的付款/采购动作，确保审批只适用于批准时的参数和状态版本。

### 操作

1. 运行 04_approval_binding.py。
2. 生成 action_digest，绑定 actor、tenant、resource、state_version、policy_version 和 expires_at。
3. 模拟审批后金额变化、目标资源变化、状态版本变化和审批过期。
4. 设计用户纠正、记忆 supersede 和删除 tombstone。
5. 明确审批记录不是永久 capability，也不是未来相似动作的通行证。

### 必须提交

- Approval Record schema；
- action_digest 生成和执行前重验；
- 审批过期、撤销和状态变更策略；
- Memory write consent 与纠错规则；
- 删除传播和审计证据。

### 常见错误

- 只审批“任务”，不绑定具体动作参数；
- 审批后不重验状态；
- 将一次审批复用于金额/资源变化后的动作；
- 把删除请求只处理为前端隐藏。

---

## 实验五：Planning 与 Memory 分离评测

**对应课程：** 第五讲《Planning 与 Memory 综合评测》

### 任务

建立两个独立评测面板，避免把计划错误、记忆错误和端到端失败混为一谈。

### 操作

1. 运行 05_planning_memory_eval.py。
2. 为 planning 设计 goal completion、plan feasibility、precondition violation 和 replan frequency。
3. 为 memory 设计 retrieval recall/precision、temporal accuracy、knowledge update、abstention 和 deletion compliance。
4. 注入过期事实、用户纠正、时间冲突、无证据问题和跨用户相似记忆。
5. 按模型、索引、摘要策略、数据集版本分层回归。

### 必须提交

- Planning 指标定义和分母；
- Memory 指标定义和标注规范；
- LongMemEval/LoCoMo 类型任务覆盖；
- 隐私/撤权/删除回归集；
- 发布门槛和失败归因。

### 常见错误

- 只报告端到端问答准确率；
- 将记忆召回成功等同于答案正确；
- 不测时间推理、知识更新和拒答；
- 不测试删除、撤权和跨用户泄漏。

---

## 统一评分建议

| 维度 | 权重 | 达标证据 |
|---|---:|---|
| 形式化计划 | 20% | Action Schema、DAG、前置条件和目标验证 |
| 记忆结构 | 20% | 来源、时间、范围、同意和删除语义 |
| 检索巩固 | 20% | 可解释排序、摘要保真和冲突处理 |
| 人工审批 | 20% | Digest 绑定、状态重验、撤销和记忆治理 |
| 长期评测 | 20% | Planning/Memory 独立指标、回归集和隐私验证 |

合成数据与标准库计算器只能证明公式和状态逻辑可运行，不代表真实长期记忆系统的质量或隐私合规验收。
