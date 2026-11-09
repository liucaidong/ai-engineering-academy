# M06 实验工作簿：Prompt 契约、结构化输出与安全评测

> 课程版本：0.40.9

> **证据等级：** E2 Simulated/Mock（虚构 Prompt、Schema 和 Provider）+ E3 Local-tested（本地验证/测试）；不证明真实 Provider strict-schema。 统一定义见[全课程证据等级](../CURRICULUM_EVIDENCE_LEVELS.md)。

> 五项实验对应 M06 五讲。代码只依赖 Python 标准库，不调用真实模型、不访问网络、不执行外部工具。所有样本均为虚构数据。

## 学习成果

完成本工作簿后，学习者应能够：

1. 将 Prompt 定义为版本化任务契约，并记录运行时兼容信息；
2. 在 token 预算下选择兼顾覆盖、相关性和多样性的 Few-shot 示例；
3. 区分 JSON parse、Schema、业务规则和授权校验；
4. 建立覆盖直接/间接注入的红队用例矩阵；
5. 使用人工校准、位置交换和统计区间评估 Prompt 变更。

## 环境

- Python 3.10+
- 从仓库根目录执行
- 无 GPU、模型权重、API Key 或第三方依赖

    python3 examples/m06/01_prompt_contract.py
    python3 examples/m06/02_fewshot_selection.py
    python3 examples/m06/03_structured_validation.py
    python3 examples/m06/04_injection_matrix.py
    python3 examples/m06/05_prompt_eval_metrics.py
    python3 -m unittest discover -s examples/m06 -p 'test_examples.py'

---

## 实验一：Prompt 契约与版本化 Manifest

**对应课程：** 第一讲《指令结构与任务规格》

### 任务

为采购合同审查助手定义一份 Prompt manifest，明确输入、输出、消息职责、模型兼容性、失败分支、评测集和回滚目标。

### 操作

1. 运行 python3 examples/m06/01_prompt_contract.py --show-required。
2. 检查必需字段并补充一个完整 manifest。
3. 分别模拟只修改 Prompt 文本、输出 Schema、模型版本和工具 Schema 的变更。
4. 为每种变更列出必须重跑的回归、安全和成本测试。

### 必须提交

- Prompt ID、版本、Owner、目的和变更理由；
- 输入/输出变量 Schema；
- System/Developer/User/Tool 消息职责及其 API-specific precedence 说明；
- 模型、工具、检索快照、采样参数和评测集版本；
- needs_clarification、not_found、refused、tool_error 等失败状态；
- 回滚目标和兼容性矩阵。

### 常见错误

- 把“你是一名专家”当作完整任务契约；
- 在 Prompt 中保存 API Key 或密码；
- 只记录 Prompt 文本，不记录模型、工具和检索版本；
- 把模型输出的 user_id 或 tenant_id 当作可信身份。

---

## 实验二：Few-shot 覆盖与 Token Budget

**对应课程：** 第二讲《Few-shot、示例选择与上下文组织》

### 任务

从候选示例中，在 550 token 预算内选择覆盖 billing、refund、security、edge 和 refusal 的样本，并分析选择器的启发式限制。

### 操作

1. 运行 python3 examples/m06/02_fewshot_selection.py。
2. 将预算分别改为 400、550、700，观察覆盖和样本数量。
3. 设计 8 类客服意图样本，标注类别、难度、边界、拒绝、token 数和近重复组。
4. 对同一示例集合执行原序、逆序和随机 5 次排列，比较 macro-F1、少数类 recall 和拒绝正确率。

### 方法

可使用两阶段选择：

1. Coverage stage：先满足每类/每个风险边界的最低覆盖；
2. Ranking stage：再根据相关性、质量和多样性补充。

MMR 风格的启发式可以写为：

    score(e) = λ × sim(e, query) − (1−λ) × max_sim(e, selected)

这不是全局最优算法。所有 token 数必须由目标模型 Tokenizer 计算，预算还要预留系统消息、用户输入、检索片段、工具定义和模型输出。

### 必须提交

- 候选示例表和标签覆盖矩阵；
- 选择算法与权重说明；
- token budget 表；
- 顺序扰动结果和分层指标；
- 少数类/拒绝样本的失败分析。

### 常见错误

- 只按语义相似度选择，忽略长尾类别；
- 让高频类占满上下文；
- 将字符数当 token 数；
- 只测一种示例顺序。

---

## 实验三：结构化输出的四层校验

**对应课程：** 第三讲《结构化输出与可验证生成》

### 任务

对退款申请构建 parse、schema、business 和 authorization 四层验证，并证明合法 JSON 不等于有效退款。

### 操作

1. 运行 python3 examples/m06/03_structured_validation.py --user alice。
2. 将 user 改为 bob，观察授权失败。
3. 修改 amount 为负数、缺少 order_id、金额超过可退余额，比较错误层。
4. 为真实项目设计 JSON Schema，并检查目标模型 API/推理引擎支持的 Schema 子集。

### 校验顺序

1. Parse：能否解析 JSON；
2. Schema：字段、类型、required、enum、范围和额外字段策略；
3. Business：订单存在、退款窗口、余额和状态；
4. Authorization：可信 principal 是否有权访问该资源；
5. Approval/Execution：高影响写操作是否审批、幂等和审计。

Grammar-constrained decoding 可以约束输出形式，但不取代完整 Schema、业务规则和授权检查。模型输出中的身份字段不能替代服务端认证上下文。

### 必须提交

- JSON Schema 和版本兼容策略；
- 四层校验状态机；
- 非法 JSON、Schema 错误、业务错误、越权四类样本；
- 有界修复、拒绝和幂等执行策略；
- 目标 API 的结构化输出能力矩阵。

### 常见错误

- 把 JSON parse 成功当作业务正确；
- 用模型生成的 user_id 进行授权；
- 对越权请求进行“自动修复”；
- 超时后无幂等保护地重复执行写操作。

---

## 实验四：Prompt Injection 红队矩阵

**对应课程：** 第四讲《Prompt Injection 与提示词安全》

### 任务

建立覆盖直接注入、间接网页/文档注入、工具结果伪装、跨轮持久化和数据外带的攻击用例。

### 操作

1. 运行 python3 examples/m06/04_injection_matrix.py --show-required。
2. 为每类攻击编写一条虚构测试 payload。
3. 标记 payload 来源、目标资产、请求动作、工具路径和预期阻断层。
4. 在目标系统中分别观察模型输出和工具执行端的真实副作用。
5. 将 attack success、越权工具调用、敏感数据泄露和误拒绝按类别统计。

### 必须提交

- 数据流/信任边界图；
- 至少六条攻击用例；
- 每条攻击的 expected block layer 和 actual result；
- 服务端 allowlist、资源授权、最小权限、审批、速率限制和审计映射；
- 残余风险及未覆盖项。

### 常见错误

- 只测模型是否说“我不能做”；
- 只在 Prompt 中加入“忽略网页指令”；
- 把外部文档或工具结果提升为系统指令；
- 没有检查工具是否真的被调用或数据是否真的外泄。

---

## 实验五：Prompt 评测与 Judge 校准

**对应课程：** 第五讲《Prompt 评测、版本管理与回归》

### 任务

对 50/100 的二项成功率计算 Wilson 区间，并用候选顺序互换检查 Judge 的位置偏差。

### 操作

1. 运行 python3 examples/m06/05_prompt_eval_metrics.py。
2. 将成功数和样本总数改为实际开发集数据。
3. 对同一对回答分别执行 A/B 与 B/A 排序，记录 Judge 对 A 的分数。
4. 使用人工标注基准集计算 Judge 与人工的一致性，并审查分歧。
5. 为 Prompt 版本定义质量、安全、成本和延迟发布门禁。

### 必须提交

- 常规、边界、对抗、拒绝、无证据和工具失败分层数据集；
- 规则评分、人评 Rubric 和 LLM Judge 评分方案；
- 位置偏差、长度偏差和自偏好诊断；
- Wilson score 区间；若扩展为配对比较，按相同任务 ID 成组执行 paired bootstrap，并报告配对差值区间；
- Prompt/model/tool/dataset/judge 版本 manifest；
- Canary、停止条件和回滚方案。

### 常见错误

- 将 Judge 分数当作客观真值；
- 不交换候选顺序；
- 只报告总体均值，不报告分母和分层结果；
- 用反复调参后的测试集作为最终独立评测；
- 安全硬指标退化被总体平均分抵消。

---

## 统一评分建议

| 维度 | 权重 | 达标证据 |
|---|---:|---|
| 契约与版本 | 20% | 输入输出、失败状态和依赖版本完整 |
| 示例选择 | 20% | 覆盖、多样性、预算和顺序稳健性 |
| 结构化验证 | 20% | Parse/Schema/Business/Auth 分层正确 |
| 安全测试 | 20% | 攻击矩阵、阻断层和副作用证据 |
| 评测治理 | 20% | 人工校准、统计区间、Canary 和回滚 |

所有安全测试应使用授权的测试环境和虚构数据。未实际执行的攻击用例只能标记为设计项，不能标记为测试通过。
