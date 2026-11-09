# M19 实验工作簿：AI 产品发现、体验、商业与交付

> 课程版本：0.40.9

> **证据等级：** E2 Simulated（假设价格/客户/成本模型）+ E3 Local-tested（计算单元测试）；不证明真实报价、客户付费或生产收入。 统一定义见[全课程证据等级](../CURRICULUM_EVIDENCE_LEVELS.md)。

> 五项实验对应 M19 五讲。全部使用合成数据，不连接模型 API、真实用户数据、支付系统或生产发布平台。

## 学习成果

1. 用持续发现方法验证用户机会和 AI 适用性；
2. 按风险、可逆性和证据质量设计人机控制；
3. 计算 Cost per Successful Task、贡献毛利和盈亏平衡；
4. 设计可解释的 A/B 实验并识别 SRM、选择偏差和多重比较；
5. 建立绑定模型、Prompt、工具、索引和策略版本的发布清单。

## 参考基线

- Product Talk Opportunity Solution Tree / Continuous Discovery；
- Microsoft HAX Toolkit（CHI 2019）与 Google PAIR Guidebook v2；
- FinOps Unit Economics 与 AWS Well-Architected Cost Optimization；
- Kohavi、Tang、Xu《Trustworthy Online Controlled Experiments》（Cambridge UP, 2020）与 Microsoft Experimentation Platform；
- DORA Continuous Delivery。

## 环境

Python 3.10+，无需第三方依赖。运行命令见 [M19 Python 实验代码](../../examples/m19/README.md)。

---

## 实验一：Opportunity Solution Tree 与假设优先级

**对应课程：** 第一讲《AI 产品问题定义与价值验证》

### 任务

为企业合同审查助手建立 outcome → opportunity → solution → assumption test 结构。

### 操作

1. 从用户任务、当前替代流程、失败成本和目标结果开始。
2. 将访谈/工单发现归类为用户机会，而不是直接记录功能请求。
3. 为每个候选方案列出 desirability、feasibility、viability 和风险假设。
4. 运行 `01_discovery.py`，按影响、不确定性和验证成本排序。
5. 为最高风险假设设计低成本反证实验。

### 必须提交

- Outcome / Opportunity / Solution Tree；
- 假设登记表与证据等级；
- AI/规则/搜索/传统 ML/人工方案比较；
- MVP 非目标和退出条件；
- 一页问题章程。

---

## 实验二：Risk-tiered Autonomy 与可逆性设计

**对应课程：** 第二讲《AI UX、可控性与 Human-in-the-Loop》

### 任务

为采购建议系统设计低风险自动草拟、中风险确认和高风险审批。

### 操作

1. 列出动作、主体、资源、影响、可逆性和证据质量。
2. 运行 `02_human_control.py`，观察控制等级。
3. 为审批绑定 actor、resource、operation、arguments digest 和 policy version。
4. 设计 preview、edit、reject、undo、compensation 和 escalation。
5. 定义人工响应超时、审批拒绝和证据不足时的安全状态。

### 必须提交

- 风险分级动作矩阵；
- HITL 状态机与审批证据包；
- 不可逆动作的双重控制策略；
- 撤销/补偿/申诉流程；
- 用户可理解的状态文案。

---

## 实验三：Cost per Successful Task 与 Break-even

**对应课程：** 第三讲《AI 产品成本模型与商业指标》

### 任务

计算合同审查任务的模型、工具、存储、人工成本，并核算成功任务成本和盈亏平衡。

### 操作

1. 运行 `03_unit_economics.py`。
2. 以输入 12k token、输出 2k token，价格 2/百万和 8/百万复算模型费用；金额统一币种并用 Decimal，禁止 float。
3. 加入人工复核、工具、存储、失败重试和支持成本。
4. 使用独立验证的成功任务作为分母，计算 Cost per Successful Task。
5. 改变人工复核率、任务成功率、价格和输出长度，做敏感性分析。

### 必须提交

- 成本分类与归因表；
- 单任务与成功任务成本；
- 客户/任务分层毛利；
- 盈亏平衡任务量；
- 价格版本、币种和配额护栏。

---

## 实验四：A/B 实验可信度与 SRM

**对应课程：** 第四讲《产品质量分析、实验与增长》

### 任务

为 AI 客服助手设计实验，并验证分流是否符合预期。

### 操作

1. 运行 `04_experiment_quality.py`。
2. 定义随机化单位、eligibility、primary metric、guardrails、窗口和停止规则。
3. 检查 SRM chi-square/p-value、曝光日志缺失、跨组污染、版本变更和重复用户；SRM 不代表 treatment effect。
4. 分离 primary metrics 与诊断指标；说明多重比较风险。
5. 同时分析任务成功、人工接管、错误升级、隐私事件、P95 和 cost/task。

### 必须提交

- 实验预注册方案；
- SRM 检查和数据质量报告；
- 指标字典与多重比较处理；
- 用户/组织分层分析；
- 扩大、停止或回滚决策门槛。

---

## 实验五：AI Product Release Manifest 与退役

**对应课程：** 第五讲《产品交付、运营与持续改进》

### 任务

为一个 RAG 客服产品建立可复现发布包和可执行回滚计划。

### 操作

1. 运行 `05_release_manifest.py`。
2. 记录 code commit、container image digest、runtime config、model/provider、Prompt、tool/API schema、index/embedding snapshot、dataset/evaluation report digest、policy、feature flags 和 environment。
3. 定义资产兼容矩阵、回归门禁、canary 和放量阈值。
4. 模拟模型升级导致输出质量下降，回滚完整行为组合。
5. 设计用户通知、数据导出/删除、凭证吊销和供应商迁移退役流程。

### 必须提交

- Release Manifest；
- 兼容矩阵和回归证据；
- Canary 指标和自动停止条件；
- 端到端回滚演练；
- 退役计划、owner、时间表和用户迁移方案。

---

## 统一评分建议

| 维度 | 权重 | 达标证据 |
|---|---:|---|
| 用户问题与 Discovery | 20% | 机会树、假设、反证实验 |
| AI UX 与 HITL | 20% | 风险分级、审批绑定、撤销和接管 |
| 单位经济性 | 20% | 成功任务成本、毛利、Break-even |
| 产品实验 | 20% | SRM、primary/guardrail metrics、偏差控制 |
| 发布与生命周期 | 20% | Release Manifest、canary、回滚、退役 |

学生必须标注哪些结论来自合成数据，哪些需要真实用户研究、财务数据或线上实验验证。
