# M15 实验工作簿：Agentic Security、Authorization 与 Human Oversight

> 课程版本：0.40.9

> **证据等级：** E1 Static-reviewed（威胁模型/策略映射）+ E2 Simulated（合成红队轨迹）+ E3 Local-tested（本地测试）；不证明外部渗透测试或生产阻断。 统一定义见[全课程证据等级](../CURRICULUM_EVIDENCE_LEVELS.md)。

> 五项实验对应 M15 五讲。示例使用合成威胁、授权属性和事件记录，不执行攻击、不访问真实数据、不调用模型或生产工具。

## 学习成果

完成本工作簿后，学习者应能够：
1. 将 STRIDE 与 MITRE ATLAS 组合为 Agentic AI 攻击链威胁模型；
2. 对不可信内容、Prompt Injection 和数据外传建立分层控制；
3. 使用 PDP/PEP、RBAC/ABAC 和委托链实施逐请求授权；
4. 设计风险分级、可理解、可撤销的人类审批；
5. 构建红队指标、事件遏制和可审计的恢复流程。

## 权威基线

- MITRE ATLAS：AI/Agent 对抗战术、技术、案例和缓解。
- OWASP Top 10 for Agentic Applications 2026：Agentic 系统风险分类。
- NIST SP 800-162 Update 2：ABAC 决策模型。
- NIST SP 800-207：Zero Trust Architecture（PE/PA/PEP）。
- NIST AI 600-1：Generative AI Profile；AI RMF 1.0 正在修订，Playbook 是自愿建议而非 checklist。
- NIST Privacy Framework 1.0 当前发布，1.1 为 Initial Public Draft。
- NIST SP 800-53 Release 5.2.0（2025-08-27）；该次更新未改变 SP 800-53B baselines。
- EU AI Act 使用 2026-07-27 合并文本；招聘/筛选用途需评估 Annex III 高风险分类；AI Act 一般适用日期为 2026-08-02，Annex III 高风险规则为 2027-12-02，Annex I 产品相关高风险规则为 2028-08-02（AI Omnibus 生效后）。
- OWASP WSTG 使用稳定版 v4.2；其内容是通用 Web 安全测试，不是 Agent 专用规范。
- MITRE ATLAS OpenClaw Investigation：2026-02-09 真实 Agent 攻击链案例。
- NIST Privacy Framework 1.0：当前发布版本；1.1 仍是 IPD。
- NIST SP 800-53 Release 5.2.0：2025-08-27 发布；未改变 800-53B baselines。
- NIST SP 800-61 Rev. 3：2025 final incident-response guidance。
- EU AI Act：引用 2026-07-27 合并文本；Annex III 高风险规则自 2027-12-02 起适用，Annex I 产品相关高风险规则自 2028-08-02 起适用；具体适用仍需按用途、法定例外和司法辖区审查。
- ISO/IEC 42001:2023：AI Management System 标准。
- OWASP WSTG v4.2：通用 Web 应用安全测试指南，不是 Agent 专用规范。

## 环境与运行

Python 3.10+，从仓库根目录执行，无第三方依赖：

    python3 examples/m15/01_threat_model.py
    python3 examples/m15/02_taint_flow.py
    python3 examples/m15/03_authorization.py
    python3 examples/m15/04_human_oversight.py
    python3 examples/m15/05_redteam_incident.py
    python3 -m unittest discover -s examples/m15 -p test_examples.py

---

## 实验一：STRIDE + MITRE ATLAS 威胁登记

**对应课程：** 第一讲《AI 系统威胁建模与风险分类》

### 任务

为一个可调用检索、邮件和文件工具的企业 Agent 建立攻击链威胁模型。

### 操作

1. 运行 01_threat_model.py。
2. 盘点模型、Prompt、数据、工具、凭证、状态、日志和供应链资产。
3. 将 Agent Tool Invocation、Prompt Injection、Context Poisoning、Credential Access 等技术映射到 STRIDE。
4. 为每个威胁记录入口、前置条件、影响、控制点和验证证据。
5. 按 likelihood × impact 排序，并说明不确定性。

### 必须提交

- 数据流图和信任边界；
- 至少 10 条威胁登记；
- STRIDE 与 ATLAS 映射表；
- 高风险控制的 owner、验证步骤和残余风险；
- 未验证假设列表。

### 常见错误

- 只罗列风险名词，不描述攻击路径；
- 将漏洞、威胁场景和风险混为一谈；
- 仅用 Prompt 指令作为控制；
- 用风险分数伪装客观概率。

---

## 实验二：Prompt Injection、Taint 与 Egress Policy

**对应课程：** 第二讲《Prompt Injection、数据泄露与隐私》

### 任务

构建一个多租户 RAG Agent 的数据流污染与外发阻断模型。

### 操作

1. 运行 02_taint_flow.py。
2. 标记来自网页、邮件、PDF、Issue 和检索索引的内容来源。
3. 区分 untrusted instruction、confidential data、secret 和 public data。
4. 在检索 ACL、上下文组装、工具执行和网络出口分别定义控制。
5. 模拟恶意网页诱导 Agent 将机密内容发送到外部目的地。

### 必须提交

- 数据分类和 taint 标签；
- 注入攻击树；
- RAG 对象级 ACL 与租户隔离；
- 工具/网络 egress policy；
- 日志脱敏、保留和删除传播策略。

### 常见错误

- 把不可信文本包在 XML 标签里就认为隔离完成；
- 让模型自行判断自己是否可以读取或发送数据；
- 只防输入注入，不防工具调用和出口外传；
- 将完整 Prompt/response 无差别写入日志。

---

## 实验三：PDP/PEP、RBAC/ABAC 与审批绑定

**对应课程：** 第三讲《工具权限、最小权限与安全执行》

### 任务

为文件、邮件和支付工具设计逐请求授权与一次性审批机制。

### 操作

1. 运行 03_authorization.py。
2. 定义 principal、tenant、resource、action、scope 和 environment attributes。
3. 使用 RBAC 作为角色基线，ABAC 处理资源归属、金额阈值和环境条件。
4. 为高风险动作生成参数摘要和短期审批对象。
5. 修改参数、资源版本或过期时间，验证审批不能复用。

### 必须提交

- PDP/PEP 架构图，并说明 NIST SP 800-207 使用 PE/PA/PEP 术语；
- RBAC/ABAC 策略决策表；
- Agent delegation chain；
- 审批摘要/签名/nonce/expiry 数据结构；
- 拒绝默认、重授权和审计测试。

### 常见错误

- 把登录认证等同于工具授权；
- Agent 继承用户的全部权限；
- 审批只绑定工具名，不绑定具体参数和目标；
- 把审批当作授权的替代品。

---

## 实验四：Risk-tiered Human Oversight

**对应课程：** 第四讲《模型输出风险、内容安全与治理》

### 任务

为内容发布、文件删除、付款和高影响建议设计风险分级审批。

### 操作

1. 运行 04_human_oversight.py。
2. 根据影响、可逆性、数据敏感性和外部副作用划分风险级别。
3. 为不同级别设计自动执行、抽样复核、逐次审批和双人审批。
4. 检查审批界面是否展示主体、目标、参数、影响和证据。
5. 设计拒绝、修改、撤销、超时和升级路径。

### 必须提交

- 风险等级和审批矩阵；
- 人工审批页面信息结构；
- 审批责任人与升级路径；
- automation bias / approval fatigue 缓解方案；
- 人工覆盖、申诉和撤销记录。

### 常见错误

- 让审阅者只点击“批准”，看不到具体动作；
- 将多个副作用动作打包为一次笼统批准；
- 没有拒绝和撤销机制；
- 对所有动作使用同一审批强度。

---

## 实验五：红队指标与事件响应演练

**对应课程：** 第五讲《安全测试、审计与事件响应》

### 任务

针对间接注入、越权、凭证泄露和工具外传组织一次可复核演练。

### 操作

1. 运行 05_redteam_incident.py。
2. 构造 direct/indirect injection、cross-tenant、approval tampering 和 data exfiltration 测试。
3. 计算 attack success、unauthorized execution 和 sensitive exposure 指标。
4. 按 detect、triage、contain、preserve、revoke、recover、notify、review 组织事件状态。
5. 记录 trace、模型/Prompt/工具版本、授权决策和数据访问证据。

### 必须提交

- 红队测试集和预期控制；
- 安全指标及发布门槛；
- 事件时间线；
- 凭证/审批撤销和 Agent/Tool quarantine 方案；
- 根因分析、通知和复盘记录。

### 常见错误

- 以模型拒答文本代替工具执行日志；
- 不记录攻击前置条件和数据暴露范围；
- 事故后只修 Prompt，不撤销凭证或隔离工具；
- 把未测试的控制写成通过。

---

## 统一评分建议

| 维度 | 权重 | 达标证据 |
|---|---:|---|
| 威胁建模 | 20% | STRIDE/ATLAS、攻击链和风险登记 |
| 数据与注入防护 | 20% | Taint、对象级 ACL、出口控制 |
| 授权与审批 | 20% | PDP/PEP、RBAC/ABAC、参数绑定 |
| 人工监督 | 20% | 风险分级、真实同意、撤销/申诉 |
| 红队与响应 | 20% | 指标、事件时间线、证据保全和恢复 |

所有程序仅验证教学模型。示例风险阈值、STRIDE↔ATLAS crosswalk 和安全指标均为教学/组织自定义，不是监管阈值。真实系统必须在目标 Runtime 和工具集上进行授权、隐私、攻击链、执行隔离和事件响应验收。
