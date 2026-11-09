# M04 实验工作簿：从预训练到模型发布

> 课程版本：0.40.9

> **证据等级：** E2 Simulated（合成训练与参数计算）+ E3 Local-tested（Python 示例测试）；不证明真实训练/微调。 统一定义见[全课程证据等级](../CURRICULUM_EVIDENCE_LEVELS.md)。

> 面向学习者的动手实验材料。五项实验与 M04 五讲一一对应；代码仅依赖 Python 标准库。实验使用合成数字和示例样本，不需要下载模型权重或真实用户数据。

## 学习成果

完成本工作簿后，学习者应能够：

1. 解释训练目标、数据质量和训练计算预算之间的关系；
2. 区分 Transformer 信息流、Dense/MoE 计算结构和预训练目标；
3. 计算 LoRA 参数量，并解释 QLoRA 的显存账本；
4. 对比 RLHF/PPO、DPO 与 RLAIF 的数据和优化路径；
5. 设计可复核的评测与模型发布证据链。

## 实验环境

- Python 3.10 或更新版本；
- 仓库根目录；
- 无需 GPU、API Key、模型权重或第三方 Python 包。

首次运行全部实验：

    python3 examples/m04/01_pretraining_budget.py
    python3 examples/m04/02_moe_budget.py
    python3 examples/m04/03_lora_qlora_budget.py
    python3 examples/m04/04_preference_objectives.py
    python3 examples/m04/05_evaluation_metrics.py
    python3 -m unittest discover -s examples/m04 -p 'test_examples.py'

---

## 实验一：预训练计算预算与数据治理

**对应课程：** 第一讲《预训练目标与数据工程》

### 任务

对 7B dense 模型、1.2T training tokens 使用教学近似 C ≈ 6ND 估算训练计算量。然后解释为什么不能仅凭 FLOPs 得出训练耗时或费用。

### 操作

1. 运行 python3 examples/m04/01_pretraining_budget.py。
2. 手动将参数量改为 13B、训练 token 改为 2.6T，重新计算。
3. 可选：提供实测持续吞吐参数 --sustained-flops-per-second，观察理想化设备小时如何变化。
4. 为一个假想数据集建立 lineage 字段：source、license、collection_date、parser_version、filter_version、dedup_version、PII_action、split、snapshot_hash。

### 预期结果与推理

默认结果约为 5.04×10²² FLOPs。该值是 dense 模型的粗略训练计算估算，不是实际 GPU 小时。若换算设备时间，必须使用持续实测吞吐，而非只使用厂商峰值；分布式通信、故障重跑、检查点、评测和数据预处理也会增加 wall-clock time。6ND 不是 compute-optimal 配比公式；本例 7B/1.2T 是给定预算输入，不代表 Chinchilla 研究结论或普遍最优训练配方。

### 必须提交

- 计算过程和单位；
- 至少四项公式假设/遗漏成本；
- 数据 lineage 表；
- 精确去重与近重复去重的差异说明；
- benchmark contamination 的检查和冻结策略。

### 常见错误

- 将原始语料 token 数当成实际参与 loss 的有效 token 数；
- 把训练 token 数、训练 step 数和 batch token 数混为一谈；
- 把 6ND 当作所有架构的精确计算公式；
- 只做精确哈希去重，忽略近重复和评测污染。

---

## 实验二：架构家族与 MoE 参数账本

**对应课程：** 第二讲《模型架构家族与稀疏专家》

### 任务

比较 Encoder-only、Decoder-only 和 Encoder–Decoder 的信息流；计算 8 experts、top-2 的总参数与单 token 激活参数。

### 操作

1. 运行 python3 examples/m04/02_moe_budget.py。
2. 将 top-k 改为 1、4、8，观察 active/total ratio。
3. 将共享参数、每个专家参数和 bytes per parameter 改为不同值。
4. 为文档分类、机器翻译和长文档生成分别画出输入可见性和输出生成路径。

### 预期结果与推理

默认总参数为 1.92B，单 token 近似激活参数为 1.38B（包含 1.2B shared parameters，不含显式 router 参数）。专家部分总参数为 720M，top-2 激活专家参数为 180M。激活参数不是显存占用：推理时全部专家权重可能仍需驻留或分布式存储。

### 必须提交

- 三类 Transformer 的 attention 可见性图；
- MoE 总参数与 active parameters 两张账本；
- 显存、计算和通信三项分开的预算；
- 对 load imbalance、capacity overflow、all-to-all 的风险说明。

### 常见错误

- 将 top-2 误解为模型只存储 2/8 的专家权重；
- 将 Dense/MoE 与 Encoder/Decoder 混成同一分类维度；
- 只比较 FLOPs，不分析专家跨设备通信。

---

## 实验三：LoRA 与 QLoRA 资源估算

**对应课程：** 第三讲《SFT 与参数高效微调》

### 任务

对 4096×4096 矩阵和 rank=16 计算 LoRA adapter 参数量，并估算 7B 模型 4-bit 权重的理论 payload。

### 操作

1. 运行 python3 examples/m04/03_lora_qlora_budget.py。
2. 分别使用 rank=8、16、32，比较 adapter 参数量。
3. 将量化位宽改为 8，观察权重 payload 的变化。
4. 对同一客服样本标记消息边界、assistant target span、padding mask 和 loss mask。

### 预期结果与推理

rank=16 时 LoRA 参数量为 131,072，占该单一 4096×4096 矩阵参数的约 0.78125%。7B 参数的理想化 4-bit payload 约为 3.5 GB（十进制）。这两个数字都不是完整训练显存估算。

QLoRA 通过冻结量化基础权重并训练 adapter 降低内存需求；NF4、double quantization 和 paged optimizer 是原始方法的重要技术组成。实际峰值还受量化元数据、未量化模块、激活、序列长度、优化器状态和临时缓冲影响。

### 必须提交

- LoRA 参数推导；
- QLoRA 显存账本；
- token 级 loss mask；
- full fine-tuning、LoRA、QLoRA 的对比实验计划；
- 目标任务、通用能力和安全回归的 holdout 设计。

### 常见错误

- 将 LoRA 参数占比写成总显存占比；
- 将 4-bit 理论 payload 写成实际峰值显存；
- 未说明矩阵方向、target modules、rank、alpha 和随机种子。

---

## 实验四：偏好优化与对齐路径

**对应课程：** 第四讲《偏好对齐、RLHF、PPO 与 DPO》

### 任务

用同一组 chosen/rejected 回答解释 Bradley–Terry、PPO clipped surrogate 和 DPO loss，并区分 RLHF 与 RLAIF。

### 操作

1. 运行 python3 examples/m04/04_preference_objectives.py。
2. 修改 reward winner/loser，观察 Bradley–Terry 偏好概率。
3. 修改 PPO ratio 和 advantage，观察 clipping 如何限制 surrogate objective。
4. 修改 chosen/rejected log-ratio 和 beta，观察 DPO loss。
5. 为 AI 反馈评审器写一份原则清单，并设计独立人工抽检和事实性评测。

### 必须提交

- RLHF/PPO 与 DPO 流程图；
- RLAIF 数据生成和评审流程图；
- 一项 reward hacking 风险及独立检测指标；
- 偏好标注规范、分歧处理和审计字段；
- 对 beta、reference policy 和序列 log-prob mask 的说明。

### 常见错误

- 将 PPO、RLHF、DPO 视为同一层级的算法；
- 将 reward model 分数视为事实正确性；
- 认为 AI feedback 自动消除了人工价值判断；
- 忽略偏好样本中回答长度、风格和标注者偏差。

---

## 实验五：评测校准与模型发布门禁

**对应课程：** 第五讲《训练评测、模型卡与发布治理》

### 任务

计算二分类样例的 accuracy、Brier score 和 ECE，并为模型发布设计可审计证据链。

### 操作

1. 运行 python3 examples/m04/05_evaluation_metrics.py。
2. 改变概率与标签，观察 accuracy 与 calibration metrics 不一定同步。
3. 分别使用 5、10、15 个 bins，比较 ECE 对分桶策略的敏感性。
4. 为测试集设计冻结、访问控制、污染扫描和版本记录。
5. 为模型卡中的每项声明标记 evidence、limitation 或 not tested。

### 必须提交

- 指标结果、分桶配置和样本量；
- 至少一个子群体切片；
- 失败案例与置信区间；
- 数据快照、模型 checkpoint、tokenizer、代码 commit 和评测脚本版本；
- intended use、out-of-scope use、已知限制、监控与回滚计划。

### 常见错误

- 只报告总体 accuracy；
- 将分类 ECE 直接解释为自由文本生成置信度；
- 反复使用 test set 调参；
- 将模型卡误当作安全认证或法律合规证明。

---

## 统一评分建议

| 维度 | 权重 | 达标证据 |
|---|---:|---|
| 数学与单位 | 20% | 公式、变量、单位和中间步骤可复算 |
| 概念辨析 | 20% | 能区分架构、训练目标、优化算法和系统部署 |
| 实验可复现 | 20% | 命令、参数、环境、输出和限制完整 |
| 数据与评测治理 | 20% | 数据 lineage、隔离、污染审计和分层指标 |
| 工程判断 | 20% | 识别资源瓶颈、失败模式和未验证假设 |

提交物应保留原始输出和环境信息。模拟数字、理论 payload 和教学近似必须明确标注，不得写成真实训练或生产测试结果。
