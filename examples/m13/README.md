# M13 可复现实验代码

五个 Python 标准库示例覆盖 Agent Skills 元数据、渐进披露、DAG 组合、供应链路径审计和触发/任务评测。另附完整的 repository-security-review 示例 Skill 包，包含 SKILL.md、references、脚本和合成报告。无需第三方依赖、Agent API Key 或真实 Runtime。

## 环境与运行

Python 3.10+，从仓库根目录执行：

    python3 examples/m13/01_skill_metadata.py
    python3 examples/m13/02_progressive_disclosure.py
    python3 examples/m13/03_skill_dag.py
    python3 examples/m13/04_supply_chain.py
    python3 examples/m13/05_skill_evaluation.py
    python3 examples/m13/repository-security-review/scripts/validate_report.py examples/m13/repository-security-review/sample-report.json
    python3 -m unittest discover -s examples/m13 -p test_examples.py

## 文件映射

| 文件 | 课程主题 | 输出 |
|---|---|---|
| 01_skill_metadata.py | Format | name/description 约束、可选字段和 experimental allowed-tools |
| 02_progressive_disclosure.py | Context | Discovery/Activation/Execution token 估算 |
| 03_skill_dag.py | Composition | 拓扑排序、缺失依赖和循环检测 |
| 04_supply_chain.py | Security | SHA-256 文件清单、路径/符号链接边界、能力白名单 |
| 05_skill_evaluation.py | Evaluation | Trigger precision/recall、FPR、wrong-skill/miss/false-activation rates 和 task success |

示例 Skill 包：repository-security-review/

## 重要边界

- 元数据程序接收 Python dict，不解析 YAML，也不是完整 skills-ref 实现。
- Token 估算使用 UTF-8 bytes / 4，仅用于比较，不代表任何模型 tokenizer 的真实 token 数。
- DAG 检查不验证 JSON Schema、权限或实际 Runtime 调度。
- 文件清单只生成文件 SHA-256，不等于 SBOM、签名、SLSA v1.2 provenance 或恶意代码扫描。
- 路径检查示例不防御并发目录变更造成的 TOCTOU race；生产实现应使用 descriptor-relative/open-no-follow 模式并对打开的文件描述符计算摘要。
- 能力白名单只是本地示例，不提供操作系统沙箱、网络隔离或运行时强制执行。
- 触发与任务指标依赖人工标注的代表性测试集；示例区分二分类 FPR 与多 Skill wrong-skill/miss/false-activation 指标，示例数据不能证明 Skill 的泛化能力。
- 真实验收需要在目标 Agent Host 上测试触发、权限、脚本、外部引用、任务行为和回滚。
