# M20 Capstone 可复现实验代码

五个 Python 标准库示例支持 Capstone 五个 Gate：需求追踪、ADR 审查、垂直切片证据、风险证据矩阵和答辩准备度。无需第三方依赖或模型 API Key。

## 运行

Python 3.10+，从仓库根目录执行：

    python3 examples/m20/01_requirements.py
    python3 examples/m20/02_architecture_review.py
    python3 examples/m20/03_vertical_slice.py
    python3 examples/m20/04_evidence_matrix.py
    python3 examples/m20/05_defense_readiness.py
    python3 -m unittest discover -s examples/m20 -p test_examples.py

## 教学映射

| 示例 | Gate | 核心检查 |
|---|---|---|
| 01_requirements.py | 项目章程 | 字段类型/优先级/证据状态、唯一 ID、测试/证据追踪 |
| 02_architecture_review.py | 架构 ADR | ADR 完整性与生命周期状态 |
| 03_vertical_slice.py | 实现集成 | 成功/失败/安全拒绝轨迹、证据等级 |
| 04_evidence_matrix.py | 综合验收 | 风险/控制/测试/证据/责任人/决策/硬约束门禁 |
| 05_defense_readiness.py | 答辩交付 | 版本冻结、证据索引和未验证项披露 |

## 重要边界

- 需求追踪脚本只检查字段、优先级、状态和链接存在性，不判断需求是否正确、验收标准是否合理或证据是否真实；traceability coverage 不代表测试通过率。
- ADR 完整不代表决策正确，也不代表实现遵循 ADR；选项数检查不替代架构评审。
- 垂直切片示例检查正常/失败/拒绝路径是否有引用，不读取或验证日志真实性。
- Evidence Matrix 使用离散证据等级；硬约束不得以 accepted residual risk 豁免。实际门禁仍需验证原始证据、测试环境、签名、样本量和风险批准人。
- Defense readiness 检查交付包字段和声明的 evidence grade，不认证 SBOM、provenance、commit、日志或外部服务的真实性。
- 参考规范状态需锁定版本：ISO/IEC/IEEE 29148:2018 仍为现行版但已进入修订程序；MCP 2026-07-28；SLSA v1.2；OWASP ASVS 5.0.0；OWASP LLM Top 10 2025。
- Defense readiness 检查交付清单完整性，不代表生产审批或认证。
- 真实项目必须在目标环境执行集成、安全、性能、隐私和恢复测试。
