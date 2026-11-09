# M19 可复现实验代码

五个 Python 标准库示例覆盖持续产品发现、风险分级人工控制、单位经济性、实验数据质量和 AI 产品发布清单。无需第三方依赖、模型 API Key 或云服务账号。

## 运行

Python 3.10+，从仓库根目录执行：

    python3 examples/m19/01_discovery.py
    python3 examples/m19/02_human_control.py
    python3 examples/m19/03_unit_economics.py
    python3 examples/m19/04_experiment_quality.py
    python3 examples/m19/05_release_manifest.py
    python3 -m unittest discover -s examples/m19 -p test_examples.py

## 教学映射

| 示例 | 主题 | 核心概念 |
|---|---|---|
| 01_discovery.py | Product Discovery | 假设优先级、风险/不确定性/验证成本 |
| 02_human_control.py | AI UX / HITL | 风险分级、可逆性、动作绑定审批 |
| 03_unit_economics.py | Business Model | 模型/工具/人工成本、成功任务成本、贡献毛利、盈亏平衡 |
| 04_experiment_quality.py | Product Analytics | SRM chi-square/p-value、转化率、两比例 z-test/p-value |
| 05_release_manifest.py | Delivery Lifecycle | 代码/镜像/运行配置/模型/Prompt/工具/API/索引/评测/策略/feature flags manifest |

## 重要边界

- Discovery 分数是排序启发式，不是市场需求或 PMF 概率。
- HITL 分级示例不替代实际授权服务、PDP/PEP、审批身份验证或不可抵赖审计。
- 单位经济性使用 Decimal 并拒绝 float；所有金额必须统一币种，脚本没有自动识别失败重试、客户分群、税费、折扣或阶梯价格。
- 成功任务成本以独立验证成功任务为分母；不能使用调用数或模型自报完成数。
- SRM 示例计算双臂 1 自由度 chi-square 与 p-value；两比例 z-test 是教学近似，不覆盖聚类随机化、实验功效、序贯分析、干扰或多重比较校正。
- Approval binding 只校验字段一致性和过期时间；生产系统还需强身份、原子 nonce/审批消费、授权策略和不可抵赖审计。
- Release manifest 只校验资产字段完整性和环境一致；生产回滚还必须检查数据库/索引迁移、模型/工具/API 兼容、策略版本、评测证据和数据可恢复性。
- 全部数据为合成教学数据，不构成真实市场验证、财务预测或产品发布批准。
