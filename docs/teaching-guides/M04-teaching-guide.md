# M04 教师教学指南与作业参考解答

> 课程版本：0.40.9

> **证据评阅：** 教师应按[全课程证据等级](../CURRICULUM_EVIDENCE_LEVELS.md)区分设计、静态审阅、模拟/Mock、本地测试、目标环境测试和生产观测；只为实际覆盖范围授予等级。

>
> 本文是教师备课、助教批改和学生自查材料。参考解答用于解释推理过程，不应作为唯一可接受答案。

## 使用方式

- 建议按 5 讲、每讲 75–90 分钟组织；公式推导和作业讨论可安排为课后研习。
- 先让学生独立完成诊断题，再讲授；先展示假设和单位，再展示数值结果。
- 每讲结束时要求学生提交一项可复核证据：公式推导、数据契约、架构图、实验表或发布档案。
- 所有训练规模数字均为教学假设。真实训练预算还受序列长度、packing、重计算、稀疏路由、通信、硬件利用率和数据质量影响。

## 第一讲：预训练目标与数据工程

### 课前准备
- 复习条件概率、对数、求和、均值、矩阵/向量基本概念。
- 准备一份小型文本样本，演示 tokenization、重复样本和训练/评测污染。
- 板书区分原始语料 token、经过过滤的有效 token、训练步数和 batch token 数。

### 教学路径与关键推导

**1. 自回归分解**

对 token 序列 (x_{1:T})，链式法则给出：

\[
P_\theta(x_{1:T})=\prod_{t=1}^{T}P_\theta(x_t\mid x_{<t})
\]

取负对数，将乘积变为求和：

\[
-\log P_\theta(x_{1:T})=-\sum_{t=1}^{T}\log P_\theta(x_t\mid x_{<t})
\]

对 token 数取平均得到教学形式的 NLL：

\[
\mathcal L(\theta)=-\frac{1}{T}\sum_{t=1}^{T}\log P_\theta(x_t\mid x_{<t})
\]

真实训练实现还要说明 padding、特殊 token、loss mask、样本权重和分布式 loss reduction 的处理。若目标 token 被 mask，该位置不应进入有效损失分母。

**2. 单 token 数值例子**

真实 token 概率为 0.8 时，损失为 (-\ln 0.8\approx0.223)；概率为 0.1 时，损失为 (-\ln0.1\approx2.303)。因此降低 NLL 的方向是提高真实 token 的预测概率，而不是让所有 token 概率都变大（概率总和仍为 1）。

**3. 训练计算量近似**

常用 dense Transformer 教学估算：

\[
C\approx6ND
\]

其中 (N) 是参数量，(D) 是训练 token 数。代入 (N=7\times10^9)、(D=1.2\times10^{12})：

\[
C\approx6\times7\times1.2\times10^{21}
=50.4\times10^{21}=5.04\times10^{22}\text{ FLOPs}
\]

这是粗略模型计算量，不是 GPU 小时或电费。换算设备时间还需要峰值 FLOPs、MFU/HFU、并行效率、通信、重计算、检查点和故障重跑数据。**6ND 不是 compute-optimal 配比公式**；Chinchilla 的参数量/token 配比结论依赖其研究模型族和训练预算假设，不能机械套用于所有模型、数据质量和推理成本约束。7B/1.2T 是本课预算算例，不是最优训练配方。

### 学习检查点（含教师提示）
1. **为什么最大化序列概率等价于最小化 NLL？** 因为负对数是单调递减变换；取负后最大化 log-likelihood 等价于最小化负 log-likelihood。
2. **语料 1.2T token 是否意味着模型实际训练了 1.2T 有效 token？** 不一定。需要说明过滤、去重、采样、packing、重复 epoch、mask 和被丢弃 token。
3. **测试集被加入训练数据会怎样？** 评测污染使测试分数偏乐观，不能证明对未见数据的泛化。

### 课后复习
- 从 (P(x_{1:T})) 独立推导 NLL，不直接背公式。
- 写出一条数据样本从来源登记到训练快照的 lineage。
- 解释 (6ND) 估算的假设和至少四项遗漏成本。

### 正式作业参考解答

**原始作业：** 为 7B dense 模型和 1.2T token 训练计划计算理想化 FLOPs，并提交数据许可、去重、污染、PII、质量和版本控制审查单。

**题目：** 7B dense、1.2T token，计算理想化 FLOPs，并审查数据治理。

**解题思路：**
1. 统一单位：7B = (7\times10^9) 参数；1.2T = (1.2\times10^{12}) token。
2. 采用 (C\approx6ND)，代入得到 (5.04\times10^{22}) FLOPs。
3. 在结果旁注明这是 dense 训练近似；不把 FLOPs 直接写成 GPU 小时。
4. 对数据建立 source、license、collection date、parser version、filter rule、dedup key、PII action、split、snapshot hash 等字段。
5. 使用精确哈希处理完全重复，使用 MinHash/LSH 或 embedding 相似度发现近重复；人工抽样检查误删和漏删。
6. 对 benchmark 做精确与近重复污染扫描，冻结最终 holdout；记录排除规则。

**评分对照（10 分）：** 目标函数 3 分；正确预算和假设 3 分；数据许可、去重、污染、PII、质量与追溯 4 分。

**常见错误：**
- 把 1.2T 写成 (1.2\times10^9)。
- 将 (5.04\times10^{22}) FLOPs 直接称为实际训练耗时。
- 只写“清洗数据”，不记录许可、来源和可复现版本。
- 只做 exact dedup，忽略近重复和 benchmark 污染。

## 第二讲：模型架构家族与稀疏专家

### 课前准备
- 复习矩阵乘法、softmax、因果掩码和 encoder/decoder 的信息流。
- 准备 Dense FFN 与 MoE 的简化计算图；用不同颜色标出共享层、路由器和专家 FFN。
- 提醒学生区分“模型总参数”“每 token 激活参数”“单设备驻留参数”和“每步通信量”。

### 教学路径与关键推导

**1. 三类 Transformer 的可见信息**
- Encoder-only：通常双向 self-attention，适合从左右上下文共同形成表示。
- Decoder-only：因果 mask，只能读取当前位置及之前 token，适合自回归生成。
- Encoder–Decoder：Encoder 编码输入；Decoder 对输出做因果 self-attention，并通过 cross-attention 读取 Encoder 表示。

**2. MoE 参数与激活参数**

若共享参数为 (P_s)，有 (E) 个同规模专家、每个专家参数 (P_e)，路由器参数为 (P_r)，则：

\[
P_{total}=P_s+E P_e+P_r
\]

top-k 路由下，单 token 的近似激活参数：

\[
P_{active}\approx P_s+kP_e+P_r
\]

以 8 experts、top-2 为例，专家部分总参数为 (8P_e)，单 token 通常只经过 (2P_e) 的专家权重；但共享层、路由器和实际实现仍会参与计算。不能把“激活参数较少”解释为“显存只需存储激活专家”：专家权重可能分布在多张 GPU 上，仍需驻留或按策略加载。

**3. 系统成本**
- Load imbalance：路由集中到少数专家，造成部分设备过载。
- Capacity overflow：专家 token 容量不足，可能丢弃或重新路由 token。
- All-to-all：token dispatch/combine 引入网络通信与同步。
- Expert parallel：专家分片有助于容量扩展，但会增加通信和调度复杂度。

### 学习检查点
1. **Decoder 为什么不能看未来 token？** 训练目标是根据前缀预测下一个 token；读取未来会泄漏标签。
2. **top-2 是否意味着模型总参数只有四分之一被存储？** 不是。top-2 描述单 token 选择的专家数量，不代表所有专家权重不需要存储。
3. **MoE 一定比 Dense 快吗？** 不一定。通信、路由不均、专家容量和 batch 形态可能抵消稀疏计算收益。

### 课后复习
画一张包含 router、top-k、dispatch、expert FFN、combine 的 MoE 数据流图；在图上标出张量所在设备及通信边界。

### 正式作业参考解答

**原始作业：** 比较 Encoder-only、Decoder-only、Encoder–Decoder 的信息流，并解释 8-expert top-2 MoE 的总参数、激活参数和两项系统代价。

**题目：** 比较 Encoder-only、Decoder-only、Encoder–Decoder，并分析 8-expert top-2 MoE。

**参考答案要点：**
- Encoder-only：双向可见，适合分类、表征、抽取等理解任务。
- Decoder-only：因果可见，适合 next-token generation。
- Encoder–Decoder：输入端双向编码，输出端因果生成，并通过 cross-attention 读取输入表示。
- 若每个专家参数为 (P_e)，8-expert 总专家参数为 (8P_e)，top-2 单 token 专家激活约为 (2P_e)，专家激活比例约 25%；这不包含共享参数与 router，也不等于设备显存比例。
- 系统代价至少列出 all-to-all 通信、负载不均、capacity overflow、专家并行布局或跨节点同步中的两项。

**评分对照（10 分）：** 信息流 3 分；参数分析 4 分；工程取舍 3 分。

**常见错误：**
- 将 Encoder 的双向 attention 与 Decoder 的 causal attention 混为一谈。
- 用 (2/8) 推断整个模型只需 25% 显存。
- 只讨论 FLOPs，不讨论 token dispatch 的网络通信。
- 忽略路由器、共享层、容量因子和专家负载分布。

## 第三讲：SFT 与参数高效微调

### 课前准备
- 复习线性层 (y=xW)、矩阵维度和交叉熵。
- 准备一条客服指令样本，分别展示 user、assistant target、system policy 和不应参与 loss 的上下文。
- 明确 LoRA 的矩阵方向约定；不同代码库可能把权重写成 (W\in\mathbb R^{d_{out}\times d_{in}}) 或转置形式。

### 教学路径与关键推导

**1. SFT 的 token-level loss**

对输入 prompt (x) 和目标回答 (y=(y_1,\ldots,y_T))，典型目标：

\[
\mathcal L_{SFT}=-\frac{1}{\sum_t m_t}
\sum_{t=1}^{T}m_t\log P_\theta(y_t\mid x,y_{<t})
\]

其中 (m_t\in\{0,1\}) 是 loss mask。只对目标回答 token 计损失是一种常见配置；实际是否对 system、user、assistant 前缀或特殊 token 计算 loss，取决于训练格式和目标定义。必须在数据契约中写清楚，不能默认所有 prompt token 都参与监督。

**2. LoRA 参数量推导**

对一个 (4096\times4096) 的线性矩阵，低秩更新写为：

\[
\Delta W=BA,\quad A\in\mathbb R^{r\times4096},\quad B\in\mathbb R^{4096\times r}
\]

当 (r=16)：

\[
P_{LoRA}=16\times4096+4096\times16=131072
\]

全量矩阵参数：

\[
P_W=4096^2=16777216
\]

比例：

\[
\frac{131072}{16777216}=0.0078125=0.78125\%
\]

这只是一个矩阵的一组 LoRA adapter 参数，不包含 bias、多个 target modules、embedding、lm_head 或额外模块。

**3. 训练质量**
- 检查重复模板、标签噪声、拒答样本、长尾意图和边界样本。
- 按用户/会话/实体分组切分，避免同一客户的近重复数据跨 train/test。
- 监控 train/validation loss、任务成功率和灾难性遗忘；训练 loss 下降不代表业务指标一定改善。

### 学习检查点
1. **为什么需要 loss mask？** 避免把输入提示、padding 或不希望监督的片段误当成目标输出。
2. **LoRA 为什么能减少可训练参数？** 把完整矩阵更新限制为两个低秩矩阵的乘积。
3. **LoRA 0.78% 是否代表显存只占全量微调的 0.78%？** 不是。激活、基础权重、优化器状态、梯度、序列长度和 target module 数都会影响显存。

### 课后复习
- 手算 (d_{in},d_{out},r) 不同组合的 LoRA 参数量。
- 写出一条包含拒绝、澄清、越权请求和正常请求的 SFT 样本集。
- 设计按实体分组的 holdout，说明如何避免数据泄漏。

### 正式作业参考解答

**原始作业：** 设计客服指令 SFT 数据与 LoRA 方案。对 4096×4096 矩阵、rank=16，计算可训练参数和全量更新比例，并定义 loss mask。

**题目：** 客服 SFT 数据与 LoRA 方案，4096×4096、rank=16。

**参考方案：**
- 数据结构至少包含 sample_id、conversation_id、intent、messages、target spans、source/license、quality label、split、version。
- 覆盖正常回答、信息缺失需澄清、政策拒绝、权限不足、工具失败和边界输入。
- LoRA 参数为 131,072；原矩阵为 16,777,216；比例 0.78125%。
- 使用 token-level loss mask，只在定义的 assistant target span 计算损失；padding mask 与 loss mask 分开管理。
- 用独立 holdout 检查任务成功、拒答正确性、事实性和旧能力回归。

**评分对照（10 分）：** 数据契约 3 分；LoRA 计算 3 分；训练验证 4 分。

**常见错误：**
- 把 LoRA 参数算成 (r\times r)。
- 忽略 A、B 两个矩阵。
- 将 0.78% 参数比例误写成 0.78% 训练显存或总计算量。
- 对 user prompt 和 padding 无差别计算 loss。
- 用随机行切分造成同一对话/客户泄漏到 holdout。

## 第四讲：偏好对齐、RLHF、PPO 与 DPO

### 课前准备
- 复习概率比、log、sigmoid、期望和梯度优化基本概念。
- 准备同一 prompt 的 chosen/rejected 两个回答，要求学生先解释偏好理由再看公式。
- 说明 RLHF 是一类训练流程，PPO 是一种策略优化算法，DPO 是直接偏好优化目标；三者不是同义词。

### 教学路径与关键推导

**1. 经典 RLHF 流程**
1. 收集 demonstration，训练 SFT policy。
2. 收集偏好对 ((x,y_w,y_l))。
3. 用偏好数据训练 reward model。
4. 用 PPO 等方法优化 policy，并常用 reference policy/KL 约束控制偏移。
5. 用独立评测和人工审查检查奖励投机与能力退化。

**2. PPO ratio 与 clipping**

\[
r_t(\theta)=\frac{\pi_\theta(a_t\mid s_t)}{\pi_{old}(a_t\mid s_t)}
\]

\[
L^{CLIP}=\mathbb E_t\left[
\min(r_tA_t,\operatorname{clip}(r_t,1-\epsilon,1+\epsilon)A_t)
\right]
\]

若 (A_t>0)，过度提高概率会被 clip 限制；若 (A_t<0)，过度降低概率也会受到限制。Clipping 限制单次更新的激进程度，但不能保证 reward model 正确，也不能消除 reward hacking。

**3. DPO 的对数概率差**

常见 DPO 目标写为：

\[
\mathcal L_{DPO}=-\mathbb E\log\sigma\left(
\beta\left[
\log\frac{\pi_\theta(y_w\mid x)}{\pi_{ref}(y_w\mid x)}
-\log\frac{\pi_\theta(y_l\mid x)}{\pi_{ref}(y_l\mid x)}
\right]\right)
\]

直觉：相对于 reference policy，模型应提高 chosen 回答的概率比，同时降低 rejected 回答的概率比。实际实现需确认序列 log-prob 的 token mask、长度归一化策略和 beta 定义。

### 学习检查点
1. **PPO clipping 是否等于裁剪模型输出概率？** 不是；它裁剪新旧策略概率比构成的 surrogate objective。
2. **DPO 是否需要单独训练 reward model？** 经典 DPO 目标可直接使用偏好对和 reference policy，不要求先训练独立 reward model。
3. **偏好一致是否等于事实正确？** 不等于；偏好数据可能奖励语气、长度或迎合性。

### 课后复习
用一组 chosen/rejected 回答分别解释 reward model、PPO 和 DPO 如何使用它；写出一个可能被 reward hacking 利用的评分器漏洞。

### 正式作业参考解答

**原始作业：** 画出 RLHF(PPO) 与 DPO 流程图，解释 PPO ratio/clipping 或 DPO log-ratio，并举例说明奖励投机及其评测控制。

**题目：** 绘制 RLHF(PPO) 与 DPO 流程，解释 ratio/clipping 或 DPO log-ratio，并给出 reward hacking 控制。

**参考答案：**
- RLHF(PPO)：demonstration → SFT → preference pairs → reward model → policy rollout → reward/advantage → PPO update；reference policy/KL 控制 policy drift。
- DPO：preference pairs + frozen reference policy + trainable policy → chosen/rejected sequence log-prob → log-ratio difference → sigmoid loss → policy update。
- Reward hacking 例：Reward model 偏好更长、更礼貌的回答，模型学会堆砌客套话而不提高事实质量。
- 控制：独立任务成功率、事实性/引用支持、长度分层、对抗样本、人类盲评、奖励模型版本监控和回滚。

**评分对照（10 分）：** 流程 4 分；数学机制 3 分；风险控制 3 分。

**常见错误：**
- 把 PPO 和 DPO 写成同一训练算法。
- 忘记 PPO ratio 分母是 old policy。
- DPO 两个 log-ratio 的 chosen/rejected 次序写反。
- 把 KL 约束当作事实正确性保证。
- 只报告 reward score，不做独立任务评测。

## 第五讲：训练评测、模型卡与发布治理

### 课前准备
- 准备 train/validation/test 三份示例数据和一份故意污染的 holdout。
- 复习准确率、召回率、置信区间和抽样偏差。
- 准备模型卡与数据卡模板，要求每项声明都能指向证据或标记为未知。

### 教学路径
1. 按用户、实体、时间或来源切分数据；不要让同一实体近重复跨越训练与最终测试。
2. 将 benchmark 冻结并保存数据 hash、标注版本、评测脚本 commit 和模型 checkpoint。
3. 分开报告能力、鲁棒性、安全、校准、延迟、成本和失败模式。
4. 做 ablation：一次只改变一个关键因素，并固定其他变量。
5. 发布档案说明 intended use、out-of-scope use、训练数据范围、评测方法、限制和风险。

### 学习检查点
- **Validation 与 Test 有何区别？** Validation 用于开发决策；最终 test 应尽量保持独立，不能反复调参直到对它过拟合。
- **平均分高是否足够？** 不足。需要按语言、任务、长度、风险和用户群体分层，并报告样本量。
- **模型卡是否等于合规认证？** 不是；它是透明度与使用边界文档，不替代法律、隐私或安全审查。

### 课后复习
- 对一份 benchmark 写出数据冻结和污染审计步骤。
- 选一个总体指标，说明其可能掩盖的两个子群体失败。
- 为模型卡中的每项能力声明标注 evidence、limitation 或 unknown。

### 正式作业参考解答

**原始作业：** 为 SFT+DPO 模型提交发布评测档案目录，覆盖数据隔离、污染审计、能力/安全指标、统计区间、模型卡和已知限制。

**题目：** 为 SFT+DPO 模型提交发布评测档案目录。

**建议目录：**
```text
release-evidence/
  model/
    checkpoint-id.txt
    model-config.json
  data/
    dataset-card.md
    split-manifest.csv
    dedup-and-contamination-report.md
    snapshot-hashes.txt
  evaluation/
    benchmark-card.md
    metrics.json
    subgroup-results.csv
    confidence-intervals.md
    regression-cases/
  safety/
    threat-model.md
    red-team-results.md
    refusal-and-boundary-tests.md
  governance/
    model-card.md
    intended-use.md
    limitations.md
    approval-record.md
  reproducibility/
    code-commit.txt
    tokenizer-version.txt
    evaluation-command.txt
```

每项指标需写分母、样本数、统计窗口、脚本版本和置信区间；数据切分按实体去重；保留已知失败和未测试项。不能把模型卡写成营销材料，也不能把内部评测写成第三方认证。

**评分对照（10 分）：** 评测设计 3 分；数据可信度 3 分；发布透明度 4 分。

**常见错误：**
- 反复用 test 集调参，造成 test leakage。
- 只给总体准确率，不给样本量与子群体结果。
- 不保存 tokenizer、checkpoint、代码和数据版本。
- 模型卡只写能力，不写限制、禁用场景和已知风险。

## 进阶概念辨析与课堂扩展

### 1. 不要把架构、预训练目标和计算结构混成一个分类

建议教师在白板上分别画三条轴：

- **信息流/架构**：Encoder-only、Decoder-only、Encoder–Decoder；
- **预训练目标**：Causal LM、Masked LM、Span Corruption / Text-to-Text；
- **前馈计算结构**：Dense、Mixture of Experts。

BERT 以双向 Encoder 和 MLM 为代表；GPT 类模型以 Decoder-only 和 causal LM 为代表；T5 将文本任务统一为 text-to-text，并采用 span corruption 预训练。以上是典型组合，不是不可更改的定义。学生必须指出“架构规定可见性，目标规定监督信号”，不能只凭模型名称推断训练配方。

### 2. LoRA 与 QLoRA 的资源口径

LoRA 的参数节省主要针对可训练更新矩阵及其梯度/优化器状态；基础模型权重仍然存在。QLoRA 将冻结的基础权重量化，并将梯度传递到低秩 adapter。理论 4-bit 权重 payload 不等于训练峰值显存。批改时要求学生分列基础权重、量化元数据、adapter、激活、临时缓冲、优化器状态和运行时开销。

### 3. 对齐方法的层级

- RLHF/RLAIF 描述偏好反馈的来源和训练流程；
- Reward Model 将偏好比较拟合为可优化的代理信号；
- PPO 是一种策略优化算法；
- DPO 是直接使用偏好对和参考策略构造的优化目标；
- Constitutional AI 是以原则驱动批评/修订和 AI feedback 的代表性训练路线。

不要将 PPO、DPO、RLHF 和 RLAIF 视为同一层级的互斥算法。任何偏好分数都不是事实正确性、安全性或用户真实利益的充分证明。也不要把 DPO 宣称为普遍优于 PPO；ICML 2024 的系统比较显示结论受任务、训练设置和实现质量影响，PPO 在部分基准上仍可取得更好结果。课堂比较必须控制数据、训练预算、参考策略、超参数搜索和评测口径。

### 4. 校准指标的适用范围

ECE、Brier score 等概率校准指标适用于定义明确的概率预测任务。分类任务的 ECE 不能直接证明自由文本回答的事实置信度已经校准。对生成模型应另行设计可验证任务、引用支持率、拒答正确性、人工盲评和分层失败分析；每个结果都需说明样本、分母、切分和评测版本。

### 5. 实验工作簿与代码

学生实验统一见 [M04 实验工作簿](./M04-lab-workbook.md)，可运行计算器见仓库的 `examples/m04/README.md`。代码只用 Python 标准库，展示公式和局部指标，不实现完整模型训练，也不声称任何 GPU 实测性能。

## 教师批改总表

| 讲次 | 核心能力 | 关键证据 | 必须纠正的误区 |
|---|---|---|---|
| 1 | NLL、数据工程、FLOPs | 公式推导、数据 lineage | FLOPs 不等于 GPU 小时 |
| 2 | Attention 家族、MoE | 信息流图、参数拆分 | 激活参数不等于驻留显存 |
| 3 | SFT、loss mask、LoRA | 样本契约、参数计算 | 参数比例不等于显存比例 |
| 4 | PPO、DPO、偏好对齐 | 流程图、目标函数 | Reward 不等于真实性 |
| 5 | 评测、发布治理 | 冻结数据、模型卡 | 高分不等于无风险 |

