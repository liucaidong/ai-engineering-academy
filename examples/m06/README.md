# M06 可复现实验代码

M06 的五个 Python 标准库计算器覆盖 Prompt 契约、Few-shot 选择、结构化输出校验、注入测试覆盖和评测统计。无需 GPU、模型权重、API Key 或第三方依赖。

## 环境与运行

Python 3.10+，从仓库根目录执行：

    python3 examples/m06/01_prompt_contract.py
    python3 examples/m06/02_fewshot_selection.py
    python3 examples/m06/03_structured_validation.py
    python3 examples/m06/04_injection_matrix.py
    python3 examples/m06/05_prompt_eval_metrics.py
    python3 -m unittest discover -s examples/m06 -p 'test_examples.py'

## 文件映射

| 文件 | 课程主题 | 输出 |
|---|---|---|
| 01_prompt_contract.py | Prompt 契约 | 版本化 manifest 必需字段检查 |
| 02_fewshot_selection.py | Few-shot | token budget 下的 coverage-aware 示例选择 |
| 03_structured_validation.py | 结构化输出 | parse、schema、business、authorization 分层状态 |
| 04_injection_matrix.py | Prompt Injection | 直接/间接注入等攻击类别覆盖检查 |
| 05_prompt_eval_metrics.py | Prompt 评测 | Wilson 区间和 Judge 顺序偏差诊断 |

## 重要边界

- Prompt manifest 字段齐全不代表 Prompt 行为已通过评测。
- Few-shot 选择器是贪心教学启发式，不保证全局最优；实际 token 数必须由目标 tokenizer 计算。
- 结构化输出脚本是轻量教学校验器，不是完整 JSON Schema 实现，也不执行退款。
- 注入矩阵覆盖不代表防御有效；必须针对真实模型和工具执行端开展红队测试。
- Wilson 区间只描述二项比例的不确定性；Judge 顺序偏差示例不替代人工标注校准。
