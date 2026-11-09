# M15 可复现实验代码

五个 Python 标准库示例覆盖 STRIDE/ATLAS 威胁映射、Taint/Egress、PDP/PEP 与 HMAC 审批绑定、风险分级人工监督、红队指标和事件响应。无需第三方依赖或真实攻击环境。

## 环境与运行

Python 3.10+，从仓库根目录执行：

    python3 examples/m15/01_threat_model.py
    python3 examples/m15/02_taint_flow.py
    python3 examples/m15/03_authorization.py
    python3 examples/m15/04_human_oversight.py
    python3 examples/m15/05_redteam_incident.py
    python3 -m unittest discover -s examples/m15 -p test_examples.py

## 文件映射

| 文件 | 课程主题 | 输出 |
|---|---|---|
| 01_threat_model.py | Threat modeling | STRIDE 映射和 likelihood × impact |
| 02_taint_flow.py | Prompt/data security | 来源信任、敏感标签与外发阻断 |
| 03_authorization.py | Authorization | RBAC/ABAC、租户隔离、参数绑定 HMAC 审批 |
| 04_human_oversight.py | HITL | 风险分级、审批人数和审阅上下文 |
| 05_redteam_incident.py | Red team/IR | 攻击成功率、MTTC 和响应顺序 |

## 重要边界

- STRIDE/ATLAS 映射只是教学 crosswalk，不是官方映射或完整威胁建模工具；risk score 分级是本地示例阈值。
- Taint 标签由调用者提供，不是自动内容分类或数据流追踪；未知来源、未知标签和未知目的地在示例中 fail closed。
- PDP/PEP 是简化策略示例，不连接 IAM、数据库或实际工具；通用 PDP/PEP 与 NIST SP 800-207 的 PE/PA/PEP 术语需区分。
- HMAC 示例展示参数/主体/审批人/过期时间绑定，并在进程内原子消费 nonce；生产需由可信审批服务认证审批人，使用 KMS/Secret Manager、共享持久化 nonce 唯一约束、可信时间源和跨语言规范化序列化（如 RFC 8785）。示例的 Python JSON 摘要不是跨语言 JCS。
- 风险分级是教学矩阵，阈值不是 NIST/EU AI Act 规定，不替代正式风险分析或法律判断。
- 安全指标依赖明确的攻击用例、分母和标签；不能用合成数据声称系统安全。
- Incident sequence 仅验证本练习的核心里程碑/顺序，不是所有事件都必须严格串行的 NIST 状态机；不替代真实 SOC/SIEM、取证或恢复流程。
