# M11 可复现实验代码

五个 Python 标准库示例覆盖形式化计划 DAG、Memory Record、记忆检索、审批绑定和 Planning/Memory 分离评测。无需 LLM、向量数据库、外部审批服务或 API Key。

## 环境与运行

Python 3.10+，从仓库根目录执行：

    python3 examples/m11/01_plan_dag.py
    python3 examples/m11/02_memory_records.py
    python3 examples/m11/03_memory_retrieval.py
    python3 examples/m11/04_approval_binding.py
    python3 examples/m11/05_planning_memory_eval.py
    python3 -m unittest discover -s examples/m11 -p 'test_examples.py'

## 文件映射

| 文件 | 课程主题 | 输出 |
|---|---|---|
| 01_plan_dag.py | 形式化计划 | DAG 拓扑排序、循环检测、前置条件和状态效果 |
| 02_memory_records.py | Memory Record | 来源、scope、有效期、confidence 和删除状态 |
| 03_memory_retrieval.py | 检索与巩固 | relevance/recency/salience/confidence 加权排序 |
| 04_approval_binding.py | 人工审批与记忆治理 | action digest、状态版本、过期和写入同意 |
| 05_planning_memory_eval.py | 长期评测 | Planning 成功率、Memory Recall/Precision 和删除合规 |

## 重要边界

- DAG 验证只做拓扑排序和简单状态前置条件，不是 PDDL parser 或 optimal planner。
- Memory Record 使用内存字典，不提供真实用户/租户存储、加密、索引和删除传播。
- 检索分数权重是教学值，生产权重必须在领域标注集上校准。
- Approval digest 只证明参数摘要匹配，不认证审批人，也不提供并发事务或授权服务。
- Planning/Memory 指标依赖人工标注、清晰分母和评测集设计；示例数值不代表 benchmark 结果。
