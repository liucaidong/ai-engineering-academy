# M07 可复现实验代码

M07 五个 Python 标准库教学示例覆盖 Tool Calling 状态机、Strict Schema 子集、动态工具发现、幂等账本和分层评测。无需 GPU、模型权重、API Key 或真实外部服务。

## 环境与运行

Python 3.10+，从仓库根目录执行：

    python3 examples/m07/01_tool_call_trace.py --timeout-after-submit
    python3 examples/m07/02_strict_schema_compat.py
    python3 examples/m07/03_tool_discovery.py --query "refund order"
    python3 examples/m07/04_idempotency_ledger.py --same-key-different-args
    python3 examples/m07/05_tool_eval_metrics.py
    python3 -m unittest discover -s examples/m07 -p 'test_examples.py'

## 文件映射

| 文件 | 课程主题 | 输出 |
|---|---|---|
| 01_tool_call_trace.py | Tool Calling 生命周期 | 合法状态转换与 unknown outcome |
| 02_strict_schema_compat.py | JSON Schema | 常见 strict tool schema 约束检查 |
| 03_tool_discovery.py | 工具目录与路由 | 基于元数据的候选发现 |
| 04_idempotency_ledger.py | 副作用与幂等 | 同 key 重放、参数冲突与结果查询 |
| 05_tool_eval_metrics.py | 工具评测 | 选择、参数、授权、执行和业务结果指标 |

## 重要边界

- 状态机和 registry 是确定性教学模型，不连接模型或 MCP Server。
- Strict Schema 检查器只覆盖少量 provider-specific 约束，不是完整 JSON Schema validator。
- 工具发现示例只做字符串/tag 匹配，不代表生产级语义检索。
- 幂等账本只保存在内存中；生产实现需要数据库唯一约束、事务和持久化保留策略。
- 评测指标的分母应按真实测试设计明确；这些示例数据不能代表生产表现。
