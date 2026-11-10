import type { Course } from "../types/course";

/** M04 — pretraining, architecture families, fine-tuning and alignment. */
export const flagshipM04Lessons: Course["modules"][number]["lessons"] = [
{
id:"m04-01-pretraining-data",title:"第一讲：预训练目标与数据工程",summary:"从自回归似然、训练数据管线和计算预算理解基础模型训练。",learningObjectives:["推导 Next Token Prediction 的负对数似然目标","区分语料规模、有效 token 数和训练步数","审查数据许可、去重、污染和质量"],estimatedMinutes:75,
content:[
{heading:"预训练的目标与边界",body:"预训练使参数化模型从大规模序列数据中学习可迁移统计结构，但参数记忆不等于可靠数据库。",markdown:"设参数为 θ，训练序列为 x。经验风险最小化为 R̂(θ)=1/N Σᵢ ℓ(fθ(xᵢ),yᵢ)。语言模型以 token 序列为样本，通过预测下一个 token 学习条件分布。能力取决于数据、目标函数、架构、优化过程、计算预算和后训练，不能仅由参数量推断。\n\n预训练适合学习通用语言、代码和模式；它不能自动提供最新事实、来源证明、工具权限或业务正确性。知识更新、权限和事实验证需要系统层机制。"},
{heading:"Next Token Prediction 数学推导",body:"自回归语言模型按链式法则分解序列概率，并最小化真实下一个 token 的负对数概率。",markdown:"Pθ(x₁:T)=Πₜ Pθ(xₜ|x<ₜ)，损失 L(θ)=−(1/T)Σₜ log Pθ(xₜ|x<ₜ)。若真实 token 概率为 0.8，单 token 损失 −ln(0.8)≈0.223；若概率为 0.1，损失约 2.303。损失更大意味着模型给真实 token 分配的概率更低。\n\n实际训练还涉及 padding mask、loss mask、样本打包、梯度累积和分布式归约。统计 token 数时应说明是否包含 padding、特殊 token 和被 mask 的目标。"},
{heading:"数据管线与污染控制",body:"数据质量、许可、去重和评测污染控制会直接影响模型行为与结果可信度。",markdown:"典型管线：来源登记 → 许可检查 → 解析 → 语言/质量过滤 → PII 处理 → 精确与近似去重 → 数据混合 → 切分 → tokenizer → packing → 版本封存。精确哈希适合完全重复；MinHash/LSH 可发现近重复，但阈值需要评估误删与漏删。\n\n测试集内容或答案进入训练集会造成污染并高估泛化。应保留来源、许可、过滤规则、数据快照、采样权重、排除列表和审计记录。"},
{heading:"数据混合与计算预算",body:"训练数据域的采样权重塑造能力分布；参数量和训练 token 数可用于粗略估算计算量。",markdown:"若领域 d 的采样权重为 w_d，则 Σw_d=1。过采样高质量小众数据可能改善目标能力，也可能损害通用分布表现。对 dense Transformer，常用粗略估算 C≈6ND，其中 N 是参数量、D 是训练 token 数。\n\n例：7B 参数、1.2T token，C≈6×7×10⁹×1.2×10¹²=5.04×10²² FLOPs。该估算忽略激活重计算、稀疏路由、通信、padding 和硬件效率，不是账单或实测值。**不要把 6ND 误当作计算最优配比公式**：Chinchilla 研究在其模型族、数据和训练预算设定下分析参数量与训练 token 的联合分配；它不能推出所有模型、数据质量、推理成本约束或继续预训练任务都应采用固定 token/parameter 比。案例中的 1.2T token 是预算输入，不代表经过 compute-optimal 搜索得出的推荐值。"},
{heading:"复现练习：从 token 预算推导训练计算量",body:"把训练计划拆成可审计输入，逐步计算理想化 FLOPs，并标注估算不覆盖的系统成本。",markdown:"**案例输入**：7B dense 模型，训练语料计划为 1.2T token。\n\n1. 将参数量写为 N=7×10⁹，将训练 token 数写为 D=1.2×10¹²。\n2. 使用教学近似 C≈6ND，先计算 7×1.2=8.4，再乘 6，得到 50.4。\n3. 合并数量级：C≈50.4×10²¹=5.04×10²² FLOPs。\n4. 在报告中另列未计入项：激活重计算、通信、padding、稀疏路由、优化器更新、检查点写入和硬件利用率。\n\n**提交证据**：计算表、单位说明、公式适用假设和至少三项偏差来源。常见错误是把 FLOPs 直接换算成 GPU 小时而不说明设备峰值、利用率和并行效率。"}
,
{
heading:"预训练目标比较：Causal LM、MLM 与 Span Corruption",
body:"Next-token prediction 是 Decoder-only 语言模型的重要目标，但不是所有预训练模型的唯一范式；目标函数必须与架构和下游任务一起理解。",
markdown:"**三种代表性目标**\n\n| 目标 | 训练信号 | 典型架构/代表 | 主要取舍 |\n|---|---|---|---|\n| Causal Language Modeling | 根据左侧上下文预测下一个 token | Decoder-only；GPT 系列 | 与自回归生成目标一致，但训练时每个位置不能读取未来 token |\n| Masked Language Modeling | 根据双向上下文恢复被 mask 的 token | Encoder-only；BERT | 适合学习双向表示，但预训练目标与自由生成并不完全一致 |\n| Span Corruption / Text-to-Text | 将输入中的片段破坏后生成缺失片段或目标文本 | Encoder–Decoder；T5 | 统一输入输出形式，适合条件生成与迁移任务 |\n\n**关键辨析**：架构决定信息可见性，预训练目标决定监督信号；两者相关但不是同一概念。不能把 BERT 的 MLM 说成 next-token prediction，也不能据此断言 Encoder-only 模型没有生成能力（它只是通常不以标准自回归生成作为默认接口）。\n\n**课堂实验**：给定句子“模型通过数据学习可迁移表示”，分别设计 causal mask、随机 mask 和 span corruption 样本；标出每种任务的可见 token、目标 token 与 loss mask。比较同一数据在三种目标下产生的训练样本。\n\n**提交证据**：三份样本、attention 可见性示意、目标 token 标注，以及一段说明为何不能只凭模型名称推断训练目标的分析。"
},
],
assessments:[{id:"m04-01-pretraining-audit",type:"design-review",prompt:"为 7B dense 模型和 1.2T token 训练计划计算理想化 FLOPs，并提交数据许可、去重、污染、PII、质量和版本控制审查单。",rubric:[{criterion:"目标函数",description:"写出自回归似然/交叉熵并解释条件上下文",points:3},{criterion:"预算估算",description:"正确得到约 5.04×10²² FLOPs 并说明假设",points:3},{criterion:"数据治理",description:"覆盖许可、去重、污染、PII、质量和追溯",points:4}]}],
sources:[
{title:"Language Models are Few-Shot Learners",url:"https://arxiv.org/abs/2005.14165",publisher:"Brown et al., NeurIPS 2020",note:"自回归预训练与规模化 few-shot 能力"},
{title:"Training Compute-Optimal Large Language Models",url:"https://arxiv.org/abs/2203.15556",publisher:"Hoffmann et al., 2022",note:"模型规模、训练 token 和计算最优配比"},
{title:"The Pile: An 800GB Dataset of Diverse Text for Language Modeling",url:"https://arxiv.org/abs/2101.00027",publisher:"Gao et al., 2020",note:"多来源语言模型训练语料"},
{title:"BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",url:"https://arxiv.org/abs/1810.04805",publisher:"Devlin et al., 2018",note:"Masked Language Modeling 与双向 Encoder 预训练"},
{title:"Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer",url:"https://arxiv.org/abs/1910.10683",publisher:"Raffel et al., 2020",note:"T5、Span Corruption 与 text-to-text 迁移学习"}
]
},
{
id:"m04-02-architecture-families",title:"第二讲：模型架构家族与稀疏专家",summary:"比较 Encoder、Decoder、Encoder–Decoder、Dense 与 MoE 的信息流和计算成本。",learningObjectives:["比较三类 Transformer 的注意力可见性","区分 MoE 总参数与激活参数","解释专家路由、负载均衡和通信代价"],estimatedMinutes:80,
content:[
{heading:"Encoder、Decoder 与 Encoder–Decoder",body:"架构差异首先体现在 token 之间允许的信息流，而非产品名称。",markdown:"Encoder-only 通常使用双向 self-attention，适合表示和判别任务；Decoder-only 使用 causal self-attention，适合自回归生成；Encoder–Decoder 先编码输入，再由 Decoder 通过 cross-attention 读取编码结果，适合条件转换。\n\n架构不单独决定能力，训练目标、数据、位置机制、模型规模、后训练和推理接口同样重要。"},
{heading:"Dense Transformer 计算路径",body:"Dense 模型的主要权重矩阵会参与每个 token 的前向计算。",markdown:"典型 FFN：FFN(h)=W₂σ(W₁h+b₁)+b₂。忽略 bias，参数量约为 2dd_ff。若 d=4096、d_ff=11008，则单层 FFN 约有 2×4096×11008=90,177,536 个参数。每个 token 都执行相应矩阵运算，参数量与每 token 计算成本通常相关。"},
{heading:"MoE 路由与激活参数",body:"MoE 路由器为 token 选择少量专家，扩大总容量而不激活所有专家。",markdown:"路由器计算 p=softmax(Wᵣh)，选择 top-k 专家，专家输出再按路由权重组合。若有 8 个专家、每 token top-2，则总专家参数包含 8 份，但单 token 只经过 2 份专家 FFN，另有共享层和路由开销。因此总参数不能直接等同于每 token 计算量。"},
{heading:"负载均衡、容量与通信",body:"MoE 的稀疏计算引入专家热点、all-to-all 通信和容量溢出。",markdown:"大量 token 可能集中到少数专家，导致负载倾斜。训练中可用负载均衡辅助损失鼓励专家分配均匀；capacity factor 限制专家接收 token 数，溢出 token 需要丢弃或备用路径。\n\nMoE 可能降低专家计算量，却增加跨设备通信、路由同步和部署复杂度。收益取决于硬件拓扑、专家并行布局、批量与 token 分布。"},
{heading:"复现练习：MoE 的总参数与每 token 激活路径",body:"用一个小型专家配置区分模型容量、单 token 计算路径和跨设备通信。",markdown:"**案例输入**：8 个同构专家，每个专家 FFN 参数量 90M；每 token top-2 路由；共享参数暂按 1.2B 计。\n\n- 专家总参数约为 8×90M=720M。\n- 每 token 激活的专家参数约为 2×90M=180M，另加共享层与路由器。\n- 这不代表显存只需容纳 180M 专家参数：部署通常仍需存放全部专家权重，除非采用分层加载或专家卸载。\n- 若专家跨设备分布，还要计入 token dispatch、all-to-all 通信、负载不均和容量溢出。\n\n**提交证据**：参数账本、token 路由图、显存与计算两张不同的预算表。不要把“激活参数”误写成“常驻参数”。"}
,
{
heading:"架构选择矩阵：目标、信息流与部署约束",
body:"架构选型应从任务的信息流需求和部署边界出发，不能把 Encoder、Decoder、Dense、MoE 当作互斥的单一分类。",
markdown:"**架构维度要分开**：Encoder/Decoder/Encoder–Decoder 描述 Transformer 组件和信息流；Dense/MoE 描述前馈专家计算方式；Causal/MLM/Span Corruption 描述训练目标。它们属于不同维度，可以组合，不能放在同一条简单分类轴上。\n\n| 维度 | 选项 | 需要回答的问题 |\n|---|---|---|\n| 信息流 | 双向、因果、编码器-解码器 cross-attention | 任务是否需要读取完整输入？输出是否逐 token 生成？ |\n| 计算结构 | Dense、MoE | 每个 token 是否经过全部 FFN 权重？路由和通信成本是否可接受？ |\n| 训练目标 | MLM、causal LM、span corruption 等 | 模型在训练时究竟预测什么？训练目标与部署任务是否匹配？ |\n| 部署拓扑 | 单卡、多卡张量/流水线/专家并行 | 权重驻留、显存、网络带宽和批处理如何约束吞吐？ |\n\n**注意力成本**：标准全注意力的序列维度计算/显存压力通常随长度呈二次增长（具体实现会受 FlashAttention、稀疏/窗口注意力等影响）；MoE 稀疏 FFN 不会自动消除 attention 的长上下文成本。\n\n**设计练习**：为文档分类、长文档问答和机器翻译分别选型；说明信息流、训练目标、推理接口、并行策略及最可能的瓶颈。"
},
],
assessments:[{id:"m04-02-architecture-review",type:"knowledge-check",prompt:"比较 Encoder-only、Decoder-only、Encoder–Decoder 的信息流，并解释 8-expert top-2 MoE 的总参数、激活参数和两项系统代价。",rubric:[{criterion:"信息流",description:"准确区分双向、因果和 cross-attention",points:3},{criterion:"参数分析",description:"正确区分总专家参数与激活专家参数",points:4},{criterion:"工程取舍",description:"识别通信、负载均衡或容量溢出",points:3}]}],
sources:[
{title:"Attention Is All You Need",url:"https://arxiv.org/abs/1706.03762",publisher:"Vaswani et al., NeurIPS 2017",note:"Encoder–Decoder Transformer 原始架构"},
{title:"Switch Transformers: Scaling to Trillion Parameter Models with Simple and Efficient Sparsity",url:"https://arxiv.org/abs/2101.03961",publisher:"Fedus et al., 2021",note:"稀疏专家路由和负载均衡"},
{title:"Mixtral of Experts",url:"https://arxiv.org/abs/2401.04088",publisher:"Jiang et al., 2024",note:"Top-2 MoE 架构案例"},
{title:"GShard: Scaling Giant Models with Conditional Computation and Automatic Sharding",url:"https://arxiv.org/abs/2006.16668",publisher:"Lepikhin et al., 2020",note:"条件计算、专家并行与自动分片"}
]
},
{
id:"m04-03-sft-and-lora",title:"第三讲：SFT 与参数高效微调",summary:"设计监督微调样本，理解 loss mask、teacher forcing 和 LoRA。",learningObjectives:["设计指令微调样本和目标 token","解释 loss mask 与 teacher forcing","推导 LoRA 低秩更新参数量"],estimatedMinutes:75,
content:[
{heading:"SFT 数据与目标函数",body:"监督微调用示范输入输出对训练模型遵循指令、格式和任务约束。",markdown:"样本为 (x,y)，x 包含 system/user/context，y 是目标 assistant token。Teacher forcing 在每个位置使用真实前缀预测下一个目标 token。损失可写为 L=−Σₜ mₜ log Pθ(yₜ|x,y<ₜ)，mₜ 是 loss mask。多轮样本通常只对指定 assistant 片段计算损失；错误 mask 会让模型学习不应预测的内容。"},
{heading:"数据质量与覆盖",body:"示范数据需要覆盖常见任务、边界条件、拒绝和澄清行为。",markdown:"记录标注规范、来源许可、任务分布、标注者分歧和质量复核。合成数据可以扩大覆盖，但教师模型错误、模板偏差和风格同质化可能被继承。使用独立 holdout、规则校验、难例抽样和人工评审验证质量。"},
{heading:"LoRA 低秩更新推导",body:"LoRA 冻结基础权重，用两个低秩矩阵近似更新，减少可训练参数和优化器状态。",markdown:"W′=W+ΔW，ΔW=BA。若 W 为 d_out×d_in，A 为 r×d_in，B 为 d_out×r，则 LoRA 参数量为 r(d_in+d_out)。例：4096×4096 全量更新需 16,777,216 参数；rank=8 LoRA 需 65,536，约占 0.39%。该比例不含基础权重，也不意味着任务质量必然相同。"},
{heading:"过拟合与遗忘诊断",body:"训练损失下降不代表目标能力全面改善，需要比较 base、SFT 和最终 checkpoint。",markdown:"训练损失下降而验证损失上升提示过拟合；通用能力下降可能来自数据分布过窄、学习率过大或训练步数过多。评测应覆盖目标任务、通用能力、安全拒答和格式遵循，并记录数据版本、随机种子、学习率、rank、alpha、target modules 和 checkpoint 摘要。"},
{heading:"复现练习：构造一条可训练的 SFT 样本",body:"从对话样本定义输入前缀、目标回答和 loss mask，检查模型究竟被训练去预测哪些 token。",markdown:"**案例**：用户询问订单退款政策，系统要求仅依据提供的政策文本回答。将样本拆为 system、user、retrieved context 和 assistant target。训练时通常对目标 assistant token 计算损失，而不是把用户问题、系统策略或检索原文全部当作模型需要复述的目标。\n\n**检查步骤**：\n1. 标注消息边界和结束 token。\n2. 对每个 token 标记 `loss_mask`，解释为何为 0 或 1。\n3. 检查截断是否意外删除目标答案或结束标记。\n4. 检查样本是否包含真实订单号、个人信息或未授权文档。\n5. 将同一用户/订单的近重复样本放在同一数据切分，避免泄漏。\n\n**提交证据**：一条脱敏样本、token 级 mask 示意、数据卡字段和一条负面测试样本。"}
,
{
heading:"QLoRA 与微调资源预算：参数效率不等于零成本",
body:"LoRA 降低可训练参数量；QLoRA 进一步量化冻结的基础模型权重，并将梯度传入 LoRA adapter。",
markdown:"**LoRA 与 QLoRA 的边界**：LoRA 冻结基础权重并训练低秩矩阵 A、B；QLoRA 通常将冻结的基础权重以 4-bit 形式存储，反向传播穿过量化权重计算 adapter 梯度，但不更新基础权重。QLoRA 的典型技术包括 NF4、double quantization 和 paged optimizer。\n\n**资源账本至少拆分**：基础权重存储、adapter 参数/梯度/优化器状态、激活、临时反量化缓冲、序列长度、batch size、gradient checkpointing 和 optimizer offload。只根据 LoRA 参数占比估算总显存是错误的。\n\n**示例**：一个 7B 模型的 4-bit 权重理论 payload 约为 7×10⁹×0.5 byte=3.5 GB（十进制），但实际显存还需容纳量化元数据、未量化模块、KV/激活、adapter、运行时缓冲和框架开销；因此不能把 3.5 GB 当作 QLoRA 的最低显存承诺。\n\n**实验设计**：固定模型、数据、序列长度和训练步数，比较 full fine-tuning、LoRA 与 QLoRA 的峰值显存、吞吐、训练时间、目标任务质量和通用能力回归。报告硬件、软件版本、精度、batch/accumulation、rank、target modules 和随机种子。"
},
],
assessments:[{id:"m04-03-lora-plan",type:"design-review",prompt:"设计客服指令 SFT 数据与 LoRA 方案。对 4096×4096 矩阵、rank=16，计算可训练参数和全量更新比例，并定义 loss mask。",rubric:[{criterion:"数据契约",description:"定义消息结构、目标回答、边界样例和许可",points:3},{criterion:"LoRA 计算",description:"得到 131072 参数及约 0.78% 比例",points:3},{criterion:"训练验证",description:"说明 loss mask、过拟合监控和独立 holdout",points:4}]}],
sources:[
{title:"LoRA: Low-Rank Adaptation of Large Language Models",url:"https://arxiv.org/abs/2106.09685",publisher:"Hu et al., 2021",note:"低秩适配原始论文"},
{title:"TRL Documentation",url:"https://huggingface.co/docs/trl/index",publisher:"Hugging Face",note:"监督微调和偏好训练工具"},
{title:"PEFT Documentation",url:"https://huggingface.co/docs/peft/index",publisher:"Hugging Face",note:"LoRA 等参数高效微调实现"},
{title:"QLoRA: Efficient Finetuning of Quantized LLMs",url:"https://arxiv.org/abs/2305.14314",publisher:"Dettmers et al., NeurIPS 2023",note:"NF4、Double Quantization 与 Paged Optimizers"}
]
},
{
id:"m04-04-preference-alignment",title:"第四讲：偏好对齐、RLHF、PPO 与 DPO",summary:"理解偏好数据、奖励模型、策略优化和奖励投机风险。",learningObjectives:["描述经典 RLHF 流程","解释 PPO clipping 和 KL 约束","理解 DPO 对数概率比目标"],estimatedMinutes:85,
content:[
{heading:"偏好比较数据",body:"偏好对齐使用候选回答之间的相对选择表达帮助性、安全性和风格偏好。",markdown:"对 prompt x 收集 preferred y_w 与 less-preferred y_l。偏好是特定标注规范下的相对选择，不是客观真理。数据应保留 prompt、候选生成配置、标注指南、标注者分歧和审计记录。单一总体偏好分数可能掩盖事实性、安全性与风格冲突。"},
{heading:"奖励模型与 RLHF",body:"奖励模型将偏好拟合为标量分数，策略优化再提高期望奖励。",markdown:"经典流程：SFT policy 生成候选 → 人类比较 → 训练 reward model rφ(x,y) → PPO 优化 policy。Bradley–Terry 形式 P(y_w≻y_l|x)=σ(rφ(x,y_w)−rφ(x,y_l))。奖励是偏好代理；策略可能利用奖励模型漏洞而非真正满足目标。"},
{heading:"PPO clipping 与 KL 约束",body:"PPO clipping 限制单次策略更新幅度，KL 惩罚约束策略偏离参考模型。",markdown:"概率比 rₜ(θ)=πθ(aₜ|sₜ)/πold(aₜ|sₜ)。PPO 目标为 E[min(rₜAₜ, clip(rₜ,1−ε,1+ε)Aₜ)]。ε=0.2 时裁剪区间为 [0.8,1.2]。RLHF 常加入 −β KL(πθ||πref) 惩罚，避免为追逐奖励过度偏离参考策略。完整 PPO 还涉及 value function、advantage estimation、采样和多轮更新。"},
{heading:"DPO 的直接偏好优化",body:"DPO 将偏好目标写成策略相对参考模型的对数概率差，不需要单独在线训练奖励模型和 PPO rollout。",markdown:"常见 DPO 损失：−E log σ(β[log(πθ(y_w|x)/πref(y_w|x))−log(πθ(y_l|x)/πref(y_l|x))])。模型提高 preferred 回答相对 rejected 回答的参考策略归一化对数概率差。DPO 简化优化流程，但仍依赖偏好质量、参考策略和序列 log-prob 正确计算。**不能据此断言 DPO 普遍优于 PPO**：不同研究在任务、数据、模型规模、超参数和实现质量上会得到不同结论；比较时必须对齐训练预算、采样策略、KL/正则化、评测集和调参资源。Xu 等人在多类基准上的比较显示，经过充分配置的 PPO 在部分任务上可以超过 DPO，因此课程应把 DPO 视为一种有不同工程权衡的偏好优化方法，而非无条件替代品。"},
{heading:"复现练习：用同一偏好样本解释 PPO 与 DPO",body:"通过一组 preferred/rejected 回答说明两种优化方法的共同输入和不同训练路径。",markdown:"**案例**：同一问题有回答 A（引用政策原文并说明限制）与回答 B（编造退款承诺）。标注 A preferred、B rejected。\n\n- RLHF/PPO 路径：偏好对训练 reward model；策略生成回答并取得奖励；PPO 根据 advantage 和 probability ratio 更新策略，同时通过 KL 项约束偏离参考策略。\n- DPO 路径：直接比较策略对 A、B 相对于参考策略的 log-probability ratio，优化偏好差异。\n- 两者都可能放大标注规范中的偏差；若标注者只奖励“语气肯定”，模型可能学会自信编造。\n\n**提交证据**：同一数据样本的两条流程图、至少一个 reward hacking 风险、一个独立事实性评测。不可把奖励分数当成真实正确性的直接测量。"}
,
{
heading:"从 RLHF 到 RLAIF：偏好监督的来源与局限",
body:"偏好优化不一定只依赖人工标注；RLAIF 可由模型依据明确原则生成偏好判断，但不会因此消除价值选择和评估偏差。",
markdown:"**经典 RLHF** 通常由人工示范构造 SFT 数据，再由人工比较训练 reward model，最后用 PPO 等策略优化方法更新模型。**RLAIF** 将部分偏好监督交由 AI 反馈产生；Constitutional AI 是代表性路线之一，使用原则/宪法指导模型自我批评、修订，并在后续阶段利用 AI 偏好反馈。\n\n| 维度 | 人类反馈 | AI 反馈 |\n|---|---|---|\n| 优势 | 可表达细腻的人类判断和情境偏好 | 可扩展、可重复，能按显式原则生成评审 |\n| 风险 | 成本高、标注者差异、疲劳和文化偏差 | 教师模型偏差、评审与被评模型相关、原则覆盖不足 |\n| 必要控制 | 标注规范、分歧记录、抽检和申诉 | 原则版本、独立人工抽检、对抗评测和模型间交叉验证 |\n\n**重要边界**：PPO 是策略优化算法；RLHF/RLAIF 是反馈来源与训练流程范畴；DPO 是直接偏好优化目标。不要把三者描述为同一层级的互斥算法。DPO 省去经典在线 PPO rollout/reward-model 优化路径，但仍需要高质量偏好对和参考策略。\n\n**讨论题**：若 AI 评审器偏好“语气坚定、回答更长”，如何设计原则、人工抽样和独立事实性测试，避免模型学会迎合评审器？"
},
],
assessments:[{id:"m04-04-alignment-compare",type:"knowledge-check",prompt:"画出 RLHF(PPO) 与 DPO 流程图，解释 PPO ratio/clipping 或 DPO log-ratio，并举例说明奖励投机及其评测控制。",rubric:[{criterion:"流程",description:"区分偏好数据、奖励模型、PPO 与 DPO",points:4},{criterion:"数学机制",description:"正确解释 clipping、KL 或 DPO 对数概率差",points:3},{criterion:"风险控制",description:"识别 reward hacking 并提出独立评测",points:3}]}],
sources:[
{title:"Training language models to follow instructions with human feedback",url:"https://arxiv.org/abs/2203.02155",publisher:"Ouyang et al., NeurIPS 2022",note:"InstructGPT 与经典 RLHF"},
{title:"Proximal Policy Optimization Algorithms",url:"https://arxiv.org/abs/1707.06347",publisher:"Schulman et al., 2017",note:"PPO clipped objective"},
{title:"Direct Preference Optimization: Your Language Model is Secretly a Reward Model",url:"https://arxiv.org/abs/2305.18290",publisher:"Rafailov et al., NeurIPS 2023",note:"DPO 目标函数"},
{title:"Is DPO Superior to PPO for LLM Alignment? A Comprehensive Study",url:"https://proceedings.mlr.press/v235/xu24h.html",publisher:"Xu et al., ICML 2024 / PMLR 235",note:"DPO 与 PPO 的理论和实证比较；支持避免普遍优劣断言"},
{title:"Constitutional AI: Harmlessness from AI Feedback",url:"https://www.anthropic.com/research/constitutional-ai-harmlessness-from-ai-feedback",publisher:"Anthropic, 2022",note:"原则驱动的自我批评、修订与 RLAIF"}
]
},
{
id:"m04-05-model-evaluation-release",title:"第五讲：训练评测、模型卡与发布治理",summary:"建立数据隔离、多维评测、消融实验和模型发布证据。",learningObjectives:["设计 train/validation/test 隔离与污染审计","区分困惑度、任务成功率、校准和安全指标","编写模型卡与数据卡"],estimatedMinutes:75,
content:[
{heading:"评测集隔离与污染",body:"评测集必须与训练和调参数据隔离，才能估计泛化能力。",markdown:"按用户、时间、来源或实体切分，避免近重复跨越 train/test。时间敏感任务优先时间切分。冻结测试集版本和访问权限；验证集用于调参，不能再当最终盲测。污染审计可结合哈希、近重复检索、benchmark 发布时间和人工抽查。"},
{heading:"指标的适用边界",body:"困惑度、准确率、校准、安全性和人类偏好衡量不同维度，不能互相替代。",markdown:"Accuracy=正确数/样本数；PPL=exp(平均负对数似然)。若平均 NLL=1.2 nat，PPL≈e¹·²≈3.32。低困惑度不代表指令遵循、事实可靠或安全。生成任务还应报告任务成功率、引用支持率、拒答正确率、格式有效率、成本和延迟。"},
{heading:"消融与统计不确定性",body:"消融实验隔离单一训练变量，重复实验和置信区间用于判断随机波动。",markdown:"比较数据配比时保持模型、token 预算、训练步数和评测集一致，只改变目标变量。可用 bootstrap 重采样估计指标置信区间。小样本 benchmark 的一次领先可能只是抽样波动；预先定义主要指标与比较规则。"},
{heading:"模型卡、数据卡与发布",body:"发布档案应说明训练信息、适用范围、评测结果、已知限制和风险缓解。",markdown:"记录模型标识/权重摘要、Tokenizer、训练数据说明和许可、训练配方、评测集版本、指标与区间、已知失败模式、适用和禁用场景。无法公开的商业训练细节应明确标记缺失和审计限制。\n\n模型发布不是安全认证。应用风险和部署环境仍需单独评估权限、监控、回滚和事故响应。"},
{heading:"复现练习：建立模型发布的证据链",body:"把训练数据、模型工件、评测结果和部署限制关联为可追溯发布档案。",markdown:"**发布门禁示例**：\n\n1. 数据：记录语料快照 ID、来源许可、过滤规则、PII 处理、去重版本和排除清单。\n2. 工件：记录基础模型、Tokenizer、训练代码版本、配置、随机种子、checkpoint hash 和 adapter 版本。\n3. 评测：冻结测试集版本，报告能力、安全、拒答、格式、校准、成本和延迟指标，并注明样本量与置信区间。\n4. 限制：列出未覆盖语言、领域、对抗输入和高影响使用场景。\n5. 发布：设置模型回滚版本、灰度比例、监控负责人和事故升级路径。\n\n**提交证据**：一份发布档案目录及一条从数据快照到模型工件再到评测报告的可追溯链。未执行的评测必须标记为 not tested，不得以计划代替结果。"}
,
{
heading:"校准、分层评测与发布门禁",
body:"模型评测不止是总体准确率或偏好胜率；发布决策需要同时检查能力、可靠性、安全性、成本和统计不确定性。",
markdown:"**校准**关注模型置信度与实际正确率是否一致。分类任务可按置信度分桶比较平均置信度与经验准确率，并报告 Expected Calibration Error（ECE）；Brier score 可衡量概率预测与 one-hot 结果之间的均方误差。生成模型的 token probability 不等同于整段回答的事实置信度，不能未经验证直接把平均 token 概率解释成回答可信度。\n\n**分层报告**：按任务类型、语言、输入长度、风险等级、用户群体和数据新旧程度报告样本量、主要指标、置信区间及失败案例。总体均值可能掩盖某些子群体的系统性退化。\n\n**发布门禁建议**：1) 数据许可与 lineage 完整；2) benchmark 冻结且污染审计通过；3) 预注册主要指标与回归阈值；4) 能力/安全/鲁棒性/校准/成本评测完成；5) 已知限制与未测试项披露；6) 灰度、监控、回滚和事故责任人明确。\n\n**实验要求**：对同一模型输出至少制作一张总体指标表、一张分层结果表、一份失败案例集和一份 not-tested 清单。每个数字必须带分母、数据版本、评测脚本版本和统计区间。"
}
],
assessments:[{id:"m04-05-release-dossier",type:"design-review",prompt:"为 SFT+DPO 模型提交发布评测档案目录，覆盖数据隔离、污染审计、能力/安全指标、统计区间、模型卡和已知限制。",rubric:[{criterion:"评测设计",description:"覆盖任务能力、鲁棒性、安全和校准",points:3},{criterion:"数据可信度",description:"说明切分、污染审计和版本冻结",points:3},{criterion:"发布透明度",description:"说明适用边界、已知限制和剩余风险",points:4}]}],
sources:[
{title:"Holistic Evaluation of Language Models",url:"https://arxiv.org/abs/2211.09110",publisher:"Liang et al., 2022",note:"语言模型多维评测"},
{title:"Model Cards for Model Reporting",url:"https://arxiv.org/abs/1810.03993",publisher:"Mitchell et al., 2018",note:"模型卡透明度框架"},
{title:"Datasheets for Datasets",url:"https://arxiv.org/abs/1803.09010",publisher:"Gebru et al., 2018",note:"数据集来源、组成和使用说明"}
]
}
];
