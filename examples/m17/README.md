# M17 可复现实验代码

五个 Python 标准库示例覆盖 Eval Harness、统计评测、LLM Judge 校准、OpenTelemetry GenAI attributes 和 Quality SLO。无需第三方依赖、模型 API Key 或监控平台。

## 环境与运行

Python 3.10+，从仓库根目录执行：

    python3 examples/m17/01_eval_harness.py
    python3 examples/m17/02_statistical_eval.py
    python3 examples/m17/03_judge_calibration.py
    python3 examples/m17/04_genai_telemetry.py
    python3 examples/m17/05_quality_slo.py
    python3 -m unittest discover -s examples/m17 -p test_examples.py

## 文件映射

| 文件 | 课程主题 | 输出 |
|---|---|---|
| 01_eval_harness.py | Evaluation | Task contract、Outcome grading、Capability/Regression suite |
| 02_statistical_eval.py | Statistics | Wilson interval、paired bootstrap、IID pass@k/pass^k、HumanEval 无偏 pass@k |
| 03_judge_calibration.py | LLM Judge | confusion matrix、Cohen's kappa、paired A/B position bias |
| 04_genai_telemetry.py | Observability | gen_ai.* span attributes、内容脱敏和低基数 labels |
| 05_quality_slo.py | SLO | task SLI、error budget、burn rate 和 multi-window alert |

## 重要边界

- Eval Harness 只校验对象形状和最终状态，不运行真实 Agent 或隔离环境。
- Bootstrap 使用固定 seed 的简单重采样；真实分析需按 task cluster、配对关系和数据分布选择方法。
- `pass_at_k(p,k)=1-(1-p)^k` 和 `pass_power_k(p,k)=p^k` 是 IID Bernoulli 理论近似；`human_eval_pass_at_k(n,c,k)=1-C(n-c,k)/C(n,k)` 是 HumanEval 有限样本无偏估计器。二者不可混用，且都不自动解决任务间异质性/相关性。
- Cohen's kappa 对标签分布和类别不平衡敏感；需要结合混淆矩阵、分层和人工裁决解释。
- Telemetry 代码使用严格 span-attribute allowlist 和 metric-label key allowlist（仅检查键名，实际标签值基数仍需在运行时治理），只构造属性字典，不连接 OTel SDK/Collector；GenAI semantic conventions 当前为 Development，版本、采样和隐私政策需由部署实现。
- Judge 位置偏差函数需要对同一候选对进行 A/B 顺序交换；SLO 示例使用合成计数，不考虑所有低流量、窗口对齐和告警抑制细节。
- 所有结果是教学数据，不构成模型或 Agent 质量认证。
