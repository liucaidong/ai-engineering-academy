# M07 实验工作簿：从模型工具调用到可信执行

> 课程版本：0.40.9

> **证据等级：** E2 Simulated/Mock（工具、支付和重放轨迹）+ E3 Local-tested（契约/幂等/授权本地测试）；不证明真实支付或 Provider 写操作。 统一定义见[全课程证据等级](../CURRICULUM_EVIDENCE_LEVELS.md)。

> 五项实验对应 M07 五讲。示例只使用 Python 标准库和虚构数据，不连接真实模型、MCP Server、支付网关或生产业务系统。

## 学习成果

完成本工作簿后，学习者应能够：

1. 区分 Provider Tool Calling、Host Runtime、MCP Tools 和 JSON-RPC 的协议边界；
2. 对工具参数建立 provider-specific strict schema 兼容性测试；
3. 使用元数据目录按需发现工具并限制候选集合；
4. 设计 unknown outcome、幂等键、错误契约和安全重试；
5. 分层评测工具选择、参数、授权、执行和业务结果。

## 环境

- Python 3.10+
- 从仓库根目录执行
- 无 GPU、模型权重、API Key 或第三方依赖

    python3 examples/m07/01_tool_call_trace.py --timeout-after-submit
    python3 examples/m07/02_strict_schema_compat.py
    python3 examples/m07/03_tool_discovery.py --query "refund order"
    python3 examples/m07/04_idempotency_ledger.py --same-key-different-args
    python3 examples/m07/05_tool_eval_metrics.py
    python3 -m unittest discover -s examples/m07 -p 'test_examples.py'

---

## 实验一：Tool Calling 状态机与协议边界

**对应课程：** 第一讲《Tool Calling 协议与控制流》

### 任务

为订单退款流程绘制 Provider API、Host Runtime、Policy/Authorization、MCP Client、MCP Server 和外部工具的时序图。

### 操作

1. 运行 python3 examples/m07/01_tool_call_trace.py --timeout-after-submit。
2. 运行 python3 examples/m07/01_tool_call_trace.py，比较正常成功和超时未知状态。
3. 标记 provider call_id、host request_id、MCP/JSON-RPC request ID、业务 idempotency key 的独立作用域；JSON-RPC id 不得充当业务幂等键。
4. 为每种错误定义 machine-readable error code、retryable、source layer 和用户可见文案。

### 必须提交

- 分层时序图；
- proposed/validated/authorized/running/succeeded/failed/cancelled/unknown 状态机；
- 每层 ID 映射和 trace correlation；
- 超时、取消、部分成功和结果截断策略；
- 对 MCP tools/call 与 provider function call 的差异说明。

### 常见错误

- 把模型生成 tool call 当作工具已经执行；
- 把 Provider Function Calling 直接称为 MCP；
- 把 JSON-RPC envelope 当成业务授权；
- 将 timeout 直接转为 failed 并盲目重试。

---

## 实验二：Strict Schema 与 Provider 契约测试

**对应课程：** 第二讲《JSON Schema、类型约束与参数校验》

### 任务

为退款工具定义 JSON Schema，并检查目标 provider strict mode 的兼容子集。

### 操作

1. 运行 python3 examples/m07/02_strict_schema_compat.py。
2. 将 additionalProperties 改为 true，观察约束问题。
3. 从 required 中删除一个字段，观察 strict mode 检查结果。
4. 为 OpenAI、Anthropic 和内部工具 runtime 建立独立 compatibility matrix。
5. 设计 schema version 1→2 的字段新增、单位变更和弃用测试。

### 必须提交

- 完整工具 Schema；
- provider/model-specific 支持矩阵；
- required、nullable、additionalProperties、enum、range、array、nested object 和 $ref 测试；
- 服务端二次校验顺序；
- Schema semver 和兼容迁移计划。

### 常见错误

- 认为 JSON Schema 标准的所有关键字都被每个模型 API 支持；
- 把 strict output 当成业务正确性；
- 把可选字段与 required+nullable 混淆；
- Schema 升级未重跑模型调用回归。

---

## 实验三：工具发现、Deferred Loading 与程序化编排

**对应课程：** 第三讲《工具发现、选择与路由》

### 任务

为包含 400 个工具的目录设计按需发现策略，并比较逐次模型调用和代码运行时批量编排。

### 操作

1. 运行 python3 examples/m07/03_tool_discovery.py --query "refund order"。
2. 增加同名/相似描述工具，观察候选混淆。
3. 设计 eager tools、always-loaded tools 和 deferred tools 三层目录。
4. 选择一个 100 条订单聚合任务，分别设计逐条 tool call 和 programmatic tool calling。
5. 定义 code runtime 可调用工具 allowlist、执行时间、内存、调用次数和结果字节预算。

### 必须提交

- 工具元数据表；
- discovery recall/precision 和误路由成本；
- deferred loading 的上下文成本估算；
- programmatic orchestration 时序图；
- 沙箱、权限、预算和审计策略。

### 常见错误

- 将工具描述堆入 Prompt 而不计算 token 成本；
- 将 Tool Search 当作授权机制；
- 让代码运行时调用任意工具；
- 把中间数据全部返回模型，失去程序化编排的价值。

---

## 实验四：副作用、幂等与 Unknown Outcome

**对应课程：** 第四讲《副作用、幂等与事务边界》

### 任务

模拟退款操作已提交但响应丢失，并验证相同请求重放和相同 key 不同参数的行为。

### 操作

1. 运行 python3 examples/m07/04_idempotency_ledger.py。
2. 运行 python3 examples/m07/04_idempotency_ledger.py --same-key-different-args。
3. 为 key、principal、规范化参数摘要、状态和结果引用定义持久化表。
4. 模拟两个 worker 并发处理同一个 key。
5. 为支付调用定义 RFC 9457 Problem Details 错误对象和 unknown 查询接口。

### 必须提交

- 幂等键生成/作用域/保留期；
- 相同 key 相同参数、相同 key 不同参数、并发请求的行为矩阵；
- unknown outcome 的状态查询与恢复时序；
- 本地事务、outbox、Saga 和补偿语义；
- 审批与执行参数 hash 的绑定规则。

### 常见错误

- 认为网络超时等于副作用未发生；
- 相同 key 不同参数仍返回旧结果；
- 幂等键只在客户端生成而服务端不持久化；
- 将 Saga compensation 误解为自动回滚所有外部世界状态。

---

## 实验五：工具调用分层评测与安全验收

**对应课程：** 第五讲《工具调用评测与安全验收》

### 任务

对一组虚构测试用例分别计算工具选择、参数、授权、执行和业务结果指标。

### 操作

1. 运行 python3 examples/m07/05_tool_eval_metrics.py。
2. 增加一个未授权但已执行的用例，观察 authorization violation rate。
3. 增加重复副作用用例，观察 duplicate side-effect rate。
4. 为高风险写操作设计 mock、sandbox、provider-backed 和生产 canary 四级验收。
5. 固定模型、Prompt、工具 Schema、provider API 和测试集版本。

### 必须提交

- 按风险分层的评测集；
- selection accuracy、argument validity、authorization violation、execution success、business outcome 和 duplicate side-effect 指标；
- 失败归因和可复现 trace；
- mock/sandbox/真实 provider 的证据边界；
- 回归门禁、人工审批和回滚方案。

### 常见错误

- 用整体 tool success rate 隐藏越权或业务失败；
- 将 mock 成功写成真实 provider 集成成功；
- 不记录 tool schema/model/prompt 版本；
- 只测正常调用，不测重复、超时、取消和越权。

---

## 统一评分建议

| 维度 | 权重 | 达标证据 |
|---|---:|---|
| 协议与控制流 | 20% | 分层时序图、状态机和 ID 映射 |
| Schema 与契约 | 20% | provider compatibility matrix 和负向测试 |
| 工具发现与编排 | 20% | 候选质量、token 预算、沙箱策略 |
| 副作用可靠性 | 20% | 幂等、unknown、事务/补偿和审计 |
| 评测与安全 | 20% | 分层指标、证据等级和回滚门禁 |

所有实验使用虚构数据。未连接真实外部服务的代码不得标记为 provider-backed 或生产验收通过。
