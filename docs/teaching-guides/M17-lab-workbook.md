# M17 实验工作簿：Evaluation、LLM Judge、Telemetry 与 Quality SLO

> 课程版本：0.40.9

> **证据等级：** E2 Simulated（合成 benchmark/telemetry）+ E3 Local-tested（本地评测 harness 测试）；不证明真实模型 Judge 或生产 SLO。 统一定义见[全课程证据等级](../CURRICULUM_EVIDENCE_LEVELS.md)。

> 五项实验对应 M17 五讲。示例使用合成任务和遥测数据，不调用模型、不连接真实 OpenTelemetry Collector 或生产监控平台。

## 学习成果

完成本工作簿后，学习者应能够：
1. 定义 Task、Trial、Grader、Transcript、Outcome 和 Evaluation Harness；
2. 用配对实验、Wilson 区间和 Bootstrap 解释评测差异；
3. 校准 LLM Judge，识别位置、长度和模型偏好；
4. 设计 GenAI Trace、低基数 Metrics key/value 和隐私保护策略；
5. 将线上质量 SLI/SLO、Error Budget 和 Burn Rate 连接到持续评测。

## 权威基线

- Anthropic《Demystifying evals for AI agents》：Agent eval 对象模型和 Code/Model/Human graders。
- HumanEval 原始论文：有限样本无偏 pass@k 估计 `1−C(n−c,k)/C(n,k)`；与 IID 理论式 `1−(1−p)^k` 区分。
- Prometheus evaluator 论文（不是 Prometheus metrics 系统）：rubric-based LLM Judge 与人类对齐。
- OpenTelemetry GenAI Semantic Conventions：模型、Agent、工具、Token 和检索遥测字段；当前为 Development，非 Stable。
- Google SRE Workbook：Error Budget 与多窗口 Burn Rate 告警。

## 环境与运行

Python 3.10+，从仓库根目录执行，无第三方依赖：

    python3 examples/m17/01_eval_harness.py
    python3 examples/m17/02_statistical_eval.py
    python3 examples/m17/03_judge_calibration.py
    python3 examples/m17/04_genai_telemetry.py
    python3 examples/m17/05_quality_slo.py
    python3 -m unittest discover -s examples/m17 -p test_examples.py

---

## 实验一：Eval Harness 与 Outcome Grading

**对应课程：** 第一讲《AI Evaluation 体系与指标设计》

### 任务

为一个能检索、调用工具并修改业务状态的 Agent 建立评测 Harness。

### 操作

1. 运行 01_eval_harness.py。
2. 定义 Task、Trial、Grader、Transcript、Outcome 和 Harness。
3. 分别建立 deterministic、model-based 和 human graders。
4. 将最终数据库/文件状态与 Agent 声称的完成结果对照。
5. 区分 capability eval 与 regression eval，并记录 dataset/scorer/model/prompt 版本。

### 必须提交

- Evaluation object schema；
- 任务输入、成功条件和 outcome assertions；
- grader 组合及权重；
- regression/capability suite；
- 评测隔离、清理和数据泄漏防护。

### 常见错误

- 只给最终自然语言回答打分；
- 将 transcript 中“已完成”当作真实业务状态；
- 测试任务和评分器泄漏到调参数据；
- 用一个总分掩盖安全硬约束失败。

---

## 实验二：Paired Trials、Bootstrap 与 pass@k

**对应课程：** 第二讲《评测数据集、基准与统计可信度》

### 任务

比较两个 Agent 版本在相同任务集上的成功率与成本差异。

### 操作

1. 运行 02_statistical_eval.py。
2. 对同一任务集运行 baseline 和 candidate，多次 trial。
3. 计算 Wilson interval、paired difference 和 bootstrap 区间。
4. 分别计算 IID Bernoulli pass@k/pass^k 与 HumanEval 有限样本无偏 pass@k，并解释假设差异。
5. 按 task cluster、难度和风险分层，避免把相关 trial 当独立样本。

### 必须提交

- 配对评测数据集；
- 成功率和 Wilson 区间；
- 配对差值与 Bootstrap 区间；
- pass@k/pass^k 计算；
- 样本量、分层、污染和不确定性说明。

### 常见错误

- 只报告一个百分比；
- 用正态近似处理极小样本和极端比例；
- 同一 task 的重复运行被错误当成独立任务；
- 多指标比较和停止规则未预先定义。

---

## 实验三：LLM Judge 校准与偏差测试

**对应课程：** 第三讲《自动化评测、LLM Judge 与校准》

### 任务

用人工标注的 gold set 校准一个 pairwise LLM Judge。

### 操作

1. 运行 03_judge_calibration.py。
2. 准备人工标签与 Judge 标签。
3. 计算 confusion matrix、precision、recall 和 Cohen's kappa。
4. 对 A/B 顺序交换，检测 position bias。
5. 将 Judge 不确定项交给人工复核，模型或 rubric 变更后重新校准。

### 必须提交

- Rubric 与评分锚点；
- 人工 gold set 和分歧裁决；
- Judge 混淆矩阵与一致性指标；
- A/B 交换实验；
- 误判率、abstain 和再校准门槛。

### 常见错误

- Judge 评分本身被当作真值；
- 只在一个候选顺序下评分；
- 没有测试长度/风格偏好；
- 多 Judge 使用相同模型和数据却被称作独立共识。

---

## 实验四：GenAI Trace、Metrics Cardinality 与 Privacy

**对应课程：** 第四讲《AI Observability——Trace、Metrics 与 Logs》

### 任务

为一次 RAG Agent 请求建立 Trace 树和低基数 Metrics 字典。

### 操作

1. 运行 04_genai_telemetry.py。
2. 建立 gateway→retrieval→model→tool→outcome spans。
3. 添加 model/provider/token/latency/error/tool attributes。
4. 移除原始 Prompt、PII、用户 ID 和文档 ID 的高风险采集。
5. 将 trace/log 与低基数 metrics 分开，并制定采样/保留策略。

### 必须提交

- Trace/span 树；
- GenAI semantic attributes；
- Metrics 标签基数预算；
- 日志脱敏、访问控制和保留期限；
- Semantic Convention 版本和迁移记录。

### 常见错误

- 把 trace_id、user_id 当 metrics label；
- 默认记录完整 Prompt/response；
- 没有 trace context 传播；
- 未锁定 semantic convention 版本。

---

## 实验五：Quality SLO、Error Budget 与持续评测

**对应课程：** 第五讲《线上评测、漂移检测与质量 SLO》

### 任务

为企业知识 Agent 设计质量 SLI/SLO、Burn Rate 告警和回归闭环。

### 操作

1. 运行 05_quality_slo.py。
2. 定义 Good Task / Eligible Task 和安全硬约束。
3. 计算 SLI、Error Budget Remaining 和 Burn Rate。
4. 组合短/长窗口告警，避免单窗口噪声。
5. 建立 shadow/canary、人工采样、漂移检测和离线回归流程。

### 必须提交

- 质量 SLI/SLO；
- 错误预算与多窗口告警；
- 数据/模型/Prompt/Judge 漂移信号；
- 人工反馈和回归流程；
- 发布、暂停和回滚门槛。

### 常见错误

- 用 API uptime 代替任务成功率；
- 让安全违规被成本收益抵消；
- 未考虑低流量场景的误报；
- 没有把线上失败回灌到离线评测集。

---

## 统一评分建议

| 维度 | 权重 | 达标证据 |
|---|---:|---|
| Eval Harness | 20% | Task/Trial/Grader/Outcome 与隔离 |
| 统计可信度 | 20% | 配对实验、区间、Bootstrap 和分层 |
| Judge 校准 | 20% | 人工 gold set、偏差测试和一致性 |
| Telemetry | 20% | Trace、低基数 Metrics、隐私策略 |
| Quality SLO | 20% | Error Budget、Burn Rate、持续回归 |

所有程序使用合成数据。真实评测必须使用代表性任务、人工校准集、目标 Runtime、真实遥测和足够样本量；pass@k 需标明使用 IID 模型还是 HumanEval 估计器；本工作簿不构成模型质量认证。
