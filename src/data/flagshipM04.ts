import type { Course } from "../types/course";

/** M04 — pretraining, architecture families, fine-tuning and alignment. */
export const flagshipM04Lessons: Course["modules"][number]["lessons"] = [
{
id:"m04-01-pretraining-data",title:"第一讲：预训练目标与数据工程",summary:"从自回归似然、训练数据管线和计算预算理解基础模型训练。",learningObjectives:["推导 Next Token Prediction 的负对数似然目标","区分语料规模、有效 token 数和训练步数","审查数据许可、去重、污染和质量"],estimatedMinutes:75,
content:[
{heading:"预训练的目标与边界",body:"预训练使参数化模型从大规模序列数据中学习可迁移统计结构，但参数记忆不等于可靠数据库。",markdown:"设参数为 θ，训练序列为 x。经验风险最小化为 R̂(θ)=1/N Σᵢ ℓ(fθ(xᵢ),yᵢ)。语言模型以 token 序列为样本，通过预测下一个 token 学习条件分布。能力取决于数据、目标函数、架构、优化过程、计算预算和后训练，不能仅由参数量推断。

预训练适合学习通用语言、代码和模式；它不能自动提供最新事实、来源证明、工具权限或业务正确性。知识更新、权限和事实验证需要系统层机制。"},
{heading:"Next Token Prediction 数学推导",body:"自回归语言模型按链式法则分解序列概率，并最小化真实下一个 token 的负对数概率。",markdown:"Pθ(x₁:T)=Πₜ Pθ(xₜ|x<ₜ)，损失 L(θ)=−(1/T)Σₜ log Pθ(xₜ|x<ₜ)。若真实 token 概率为 0.8，单 token 损失 −ln(0.8)≈0.223；若概率为 0.1，损失约 2.303。损失更大意味着模型给真实 token 分配的概率更低。

实际训练还涉及 padding mask、loss mask、样本打包、梯度累积和分布式归约。统计 token 数时应说明是否包含 padding、特殊 token 和被 mask 的目标。"},
{heading:"数据管线与污染控制",body:"数据质量、许可、去重和评测污染控制会直接影响模型行为与结果可信度。",markdown:"典型管线：来源登记 → 许可检查 → 解析 → 语言/质量过滤 → PII 处理 → 精确与近似去重 → 数据混合 → 切分 → tokenizer → packing → 版本封存。精确哈希适合完全重复；MinHash/LSH 可发现近重复，但阈值需要评估误删与漏删。

测试集内容或答案进入训练集会造成污染并高估泛化。应保留来源、许可、过滤规则、数据快照、采样权重、排除列表和审计记录。"},
{heading:"数据混合与计算预算",body:"训练数据域的采样权重塑造能力分布；参数量和训练 token 数可用于粗略估算计算量。",markdown:"若领域 d 的采样权重为 w_d，则 Σw_d=1。过采样高质量小众数据可能改善目标能力，也可能损害通用分布表现。对 dense Transformer，常用粗略估算 C≈6ND，其中 N 是参数量、D 是训练 token 数。

例：7B 参数、1.2T token，C≈6×7×10⁹×1.2×10¹²=5.04×10²² FLOPs。该估算忽略激活重计算、稀疏路由、通信、padding 和硬件效率，不是账单或实测值。"}
],
assessments:[{id:"m04-01-pretraining-audit",type:"design-review",prompt:"为 7B dense 模型和 1.2T token 训练计划计算理想化 FLOPs，并提交数据许可、去重、污染、PII、质量和版本控制审查单。",rubric:[{criterion:"目标函数",description:"写出自回归似然/交叉熵并解释条件上下文",points:3},{criterion:"预算估算",description:"正确得到约 5.04×10²² FLOPs 并说明假设",points:3},{criterion:"数据治理",description:"覆盖许可、去重、污染、PII、质量和追溯",points:4}]}],
sources:[
{title:"Language Models are Few-Shot Learners",url:"https://arxiv.org/abs/2005.14165",publisher:"Brown et al., NeurIPS 2020",note:"自回归预训练与规模化 few-shot 能力"},
{title:"Training Compute-Optimal Large Language Models",url:"https://arxiv.org/abs/2203.15556",publisher:"Hoffmann et al., 2022",note:"模型规模、训练 token 和计算最优配比"},
{title:"The Pile: An 800GB Dataset of Diverse Text for Language Modeling",url:"https://arxiv.org/abs/2101.00027",publisher:"Gao et al., 2020",note:"多来源语言模型训练语料"}
]
},
{
id:"m04-02-architecture-families",title:"第二讲：模型架构家族与稀疏专家",summary:"比较 Encoder、Decoder、Encoder–Decoder、Dense 与 MoE 的信息流和计算成本。",learningObjectives:["比较三类 Transformer 的注意力可见性","区分 MoE 总参数与激活参数","解释专家路由、负载均衡和通信代价"],estimatedMinutes:80,
content:[
{heading:"Encoder、Decoder 与 Encoder–Decoder",body:"架构差异首先体现在 token 之间允许的信息流，而非产品名称。",markdown:"Encoder-only 通常使用双向 self-attention，适合表示和判别任务；Decoder-only 使用 causal self-attention，适合自回归生成；Encoder–Decoder 先编码输入，再由 Decoder 通过 cross-attention 读取编码结果，适合条件转换。

架构不单独决定能力，训练目标、数据、位置机制、模型规模、后训练和推理接口同样重要。"},
{heading:"Dense Transformer 计算路径",body:"Dense 模型的主要权重矩阵会参与每个 token 的前向计算。",markdown:"典型 FFN：FFN(h)=W₂σ(W₁h+b₁)+b₂。忽略 bias，参数量约为 2dd_ff。若 d=4096、d_ff=11008，则单层 FFN 约有 2×4096×11008=90,177,536 个参数。每个 token 都执行相应矩阵运算，参数量与每 token 计算成本通常相关。"},
{heading:"MoE 路由与激活参数",body:"MoE 路由器为 token 选择少量专家，扩大总容量而不激活所有专家。",markdown:"路由器计算 p=softmax(Wᵣh)，选择 top-k 专家，专家输出再按路由权重组合。若有 8 个专家、每 token top-2，则总专家参数包含 8 份，但单 token 只经过 2 份专家 FFN，另有共享层和路由开销。因此总参数不能直接等同于每 token 计算量。"},
{heading:"负载均衡、容量与通信",body:"MoE 的稀疏计算引入专家热点、all-to-all 通信和容量溢出。",markdown:"大量 token 可能集中到少数专家，导致负载倾斜。训练中可用负载均衡辅助损失鼓励专家分配均匀；capacity factor 限制专家接收 token 数，溢出 token 需要丢弃或备用路径。

MoE 可能降低专家计算量，却增加跨设备通信、路由同步和部署复杂度。收益取决于硬件拓扑、专家并行布局、批量与 token 分布。"}
],
assessments:[{id:"m04-02-architecture-review",type:"knowledge-check",prompt:"比较 Encoder-only、Decoder-only、Encoder–Decoder 的信息流，并解释 8-expert top-2 MoE 的总参数、激活参数和两项系统代价。",rubric:[{criterion:"信息流",description:"准确区分双向、因果和 cross-attention",points:3},{criterion:"参数分析",description:"正确区分总专家参数与激活专家参数",points:4},{criterion:"工程取舍",description:"识别通信、负载均衡或容量溢出",points:3}]}],
sources:[
{title:"Attention Is All You Need",url:"https://arxiv.org/abs/1706.03762",publisher:"Vaswani et al., NeurIPS 2017",note:"Encoder–Decoder Transformer 原始架构"},
{title:"Switch Transformers: Scaling to Trillion Parameter Models with Simple and Efficient Sparsity",url:"https://arxiv.org/abs/2101.03961",publisher:"Fedus et al., 2021",note:"稀疏专家路由和负载均衡"},
{title:"Mixtral of Experts",url:"https://arxiv.org/abs/2401.04088",publisher:"Jiang et al., 2024",note:"Top-2 MoE 架构案例"}
]
},
{
id:"m04-03-sft-and-lora",title:"第三讲：SFT 与参数高效微调",summary:"设计监督微调样本，理解 loss mask、teacher forcing 和 LoRA。",learningObjectives:["设计指令微调样本和目标 token","解释 loss mask 与 teacher forcing","推导 LoRA 低秩更新参数量"],estimatedMinutes:75,
content:[
{heading:"SFT 数据与目标函数",body:"监督微调用示范输入输出对训练模型遵循指令、格式和任务约束。",markdown:"样本为 (x,y)，x 包含 system/user/context，y 是目标 assistant token。Teacher forcing 在每个位置使用真实前缀预测下一个目标 token。损失可写为 L=−Σₜ mₜ log Pθ(yₜ|x,y<ₜ)，mₜ 是 loss mask。多轮样本通常只对指定 assistant 片段计算损失；错误 mask 会让模型学习不应预测的内容。"},
{heading:"数据质量与覆盖",body:"示范数据需要覆盖常见任务、边界条件、拒绝和澄清行为。",markdown:"记录标注规范、来源许可、任务分布、标注者分歧和质量复核。合成数据可以扩大覆盖，但教师模型错误、模板偏差和风格同质化可能被继承。使用独立 holdout、规则校验、难例抽样和人工评审验证质量。"},
{heading:"LoRA 低秩更新推导",body:"LoRA 冻结基础权重，用两个低秩矩阵近似更新，减少可训练参数和优化器状态。",markdown:"W′=W+ΔW，ΔW=BA。若 W 为 d_out×d_in，A 为 r×d_in，B 为 d_out×r，则 LoRA 参数量为 r(d_in+d_out)。例：4096×4096 全量更新需 16,777,216 参数；rank=8 LoRA 需 65,536，约占 0.39%。该比例不含基础权重，也不意味着任务质量必然相同。"},
{heading:"过拟合与遗忘诊断",body:"训练损失下降不代表目标能力全面改善，需要比较 base、SFT 和最终 checkpoint。",markdown:"训练损失下降而验证损失上升提示过拟合；通用能力下降可能来自数据分布过窄、学习率过大或训练步数过多。评测应覆盖目标任务、通用能力、安全拒答和格式遵循，并记录数据版本、随机种子、学习率、rank、alpha、target modules 和 checkpoint 摘要。"}
],
assessments:[{id:"m04-03-lora-plan",type:"code-task",prompt:"设计客服指令 SFT 数据与 LoRA 方案。对 4096×4096 矩阵、rank=16，计算可训练参数和全量更新比例，并定义 loss mask。",rubric:[{criterion:"数据契约",description:"定义消息结构、目标回答、边界样例和许可",points:3},{criterion:"LoRA 计算",description:"得到 131072 参数及约 0.78% 比例",points:3},{criterion:"训练验证",description:"说明 loss mask、过拟合监控和独立 holdout",points:4}]}],
sources:[
{title:"LoRA: Low-Rank Adaptation of Large Language Models",url:"https://arxiv.org/abs/2106.09685",publisher:"Hu et al., 2021",note:"低秩适配原始论文"},
{title:"TRL Documentation",url:"https://huggingface.co/docs/trl/index",publisher:"Hugging Face",note:"监督微调和偏好训练工具"},
{title:"PEFT Documentation",url:"https://huggingface.co/docs/peft/index",publisher:"Hugging Face",note:"LoRA 等参数高效微调实现"}
]
},
{
id:"m04-04-preference-alignment",title:"第四讲：偏好对齐、RLHF、PPO 与 DPO",summary:"理解偏好数据、奖励模型、策略优化和奖励投机风险。",learningObjectives:["描述经典 RLHF 流程","解释 PPO clipping 和 KL 约束","理解 DPO 对数概率比目标"],estimatedMinutes:85,
content:[
{heading:"偏好比较数据",body:"偏好对齐使用候选回答之间的相对选择表达帮助性、安全性和风格偏好。",markdown:"对 prompt x 收集 preferred y_w 与 less-preferred y_l。偏好是特定标注规范下的相对选择，不是客观真理。数据应保留 prompt、候选生成配置、标注指南、标注者分歧和审计记录。单一总体偏好分数可能掩盖事实性、安全性与风格冲突。"},
{heading:"奖励模型与 RLHF",body:"奖励模型将偏好拟合为标量分数，策略优化再提高期望奖励。",markdown:"经典流程：SFT policy 生成候选 → 人类比较 → 训练 reward model rφ(x,y) → PPO 优化 policy。Bradley–Terry 形式 P(y_w≻y_l|x)=σ(rφ(x,y_w)−rφ(x,y_l))。奖励是偏好代理；策略可能利用奖励模型漏洞而非真正满足目标。"},
{heading:"PPO clipping 与 KL 约束",body:"PPO clipping 限制单次策略更新幅度，KL 惩罚约束策略偏离参考模型。",markdown:"概率比 rₜ(θ)=πθ(aₜ|sₜ)/πold(aₜ|sₜ)。PPO 目标为 E[min(rₜAₜ, clip(rₜ,1−ε,1+ε)Aₜ)]。ε=0.2 时裁剪区间为 [0.8,1.2]。RLHF 常加入 −β KL(πθ||πref) 惩罚，避免为追逐奖励过度偏离参考策略。完整 PPO 还涉及 value function、advantage estimation、采样和多轮更新。"},
{heading:"DPO 的直接偏好优化",body:"DPO 将偏好目标写成策略相对参考模型的对数概率差，不需要单独在线训练奖励模型和 PPO rollout。",markdown:"常见 DPO 损失：−E log σ(β[log(πθ(y_w|x)/πref(y_w|x))−log(πθ(y_l|x)/πref(y_l|x))])。模型提高 preferred 回答相对 rejected 回答的参考策略归一化对数概率差。DPO 简化优化流程，但仍依赖偏好质量、参考策略和序列 log-prob 正确计算。"}
],
assessments:[{id:"m04-04-alignment-compare",type:"knowledge-check",prompt:"画出 RLHF(PPO) 与 DPO 流程图，解释 PPO ratio/clipping 或 DPO log-ratio，并举例说明奖励投机及其评测控制。",rubric:[{criterion:"流程",description:"区分偏好数据、奖励模型、PPO 与 DPO",points:4},{criterion:"数学机制",description:"正确解释 clipping、KL 或 DPO 对数概率差",points:3},{criterion:"风险控制",description:"识别 reward hacking 并提出独立评测",points:3}]}],
sources:[
{title:"Training language models to follow instructions with human feedback",url:"https://arxiv.org/abs/2203.02155",publisher:"Ouyang et al., NeurIPS 2022",note:"InstructGPT 与经典 RLHF"},
{title:"Proximal Policy Optimization Algorithms",url:"https://arxiv.org/abs/1707.06347",publisher:"Schulman et al., 2017",note:"PPO clipped objective"},
{title:"Direct Preference Optimization: Your Language Model is Secretly a Reward Model",url:"https://arxiv.org/abs/2305.18290",publisher:"Rafailov et al., NeurIPS 2023",note:"DPO 目标函数"}
]
},
{
id:"m04-05-model-evaluation-release",title:"第五讲：训练评测、模型卡与发布治理",summary:"建立数据隔离、多维评测、消融实验和模型发布证据。",learningObjectives:["设计 train/validation/test 隔离与污染审计","区分困惑度、任务成功率、校准和安全指标","编写模型卡与数据卡"],estimatedMinutes:75,
content:[
{heading:"评测集隔离与污染",body:"评测集必须与训练和调参数据隔离，才能估计泛化能力。",markdown:"按用户、时间、来源或实体切分，避免近重复跨越 train/test。时间敏感任务优先时间切分。冻结测试集版本和访问权限；验证集用于调参，不能再当最终盲测。污染审计可结合哈希、近重复检索、benchmark 发布时间和人工抽查。"},
{heading:"指标的适用边界",body:"困惑度、准确率、校准、安全性和人类偏好衡量不同维度，不能互相替代。",markdown:"Accuracy=正确数/样本数；PPL=exp(平均负对数似然)。若平均 NLL=1.2 nat，PPL≈e¹·²≈3.32。低困惑度不代表指令遵循、事实可靠或安全。生成任务还应报告任务成功率、引用支持率、拒答正确率、格式有效率、成本和延迟。"},
{heading:"消融与统计不确定性",body:"消融实验隔离单一训练变量，重复实验和置信区间用于判断随机波动。",markdown:"比较数据配比时保持模型、token 预算、训练步数和评测集一致，只改变目标变量。可用 bootstrap 重采样估计指标置信区间。小样本 benchmark 的一次领先可能只是抽样波动；预先定义主要指标与比较规则。"},
{heading:"模型卡、数据卡与发布",body:"发布档案应说明训练信息、适用范围、评测结果、已知限制和风险缓解。",markdown:"记录模型标识/权重摘要、Tokenizer、训练数据说明和许可、训练配方、评测集版本、指标与区间、已知失败模式、适用和禁用场景。无法公开的商业训练细节应明确标记缺失和审计限制。

模型发布不是安全认证。应用风险和部署环境仍需单独评估权限、监控、回滚和事故响应。"}
],
assessments:[{id:"m04-05-release-dossier",type:"design-review",prompt:"为 SFT+DPO 模型提交发布评测档案目录，覆盖数据隔离、污染审计、能力/安全指标、统计区间、模型卡和已知限制。",rubric:[{criterion:"评测设计",description:"覆盖任务能力、鲁棒性、安全和校准",points:3},{criterion:"数据可信度",description:"说明切分、污染审计和版本冻结",points:3},{criterion:"发布透明度",description:"说明适用边界、已知限制和剩余风险",points:4}]}],
sources:[
{title:"Holistic Evaluation of Language Models",url:"https://arxiv.org/abs/2211.09110",publisher:"Liang et al., 2022",note:"语言模型多维评测"},
{title:"Model Cards for Model Reporting",url:"https://arxiv.org/abs/1810.03993",publisher:"Mitchell et al., 2018",note:"模型卡透明度框架"},
{title:"Datasheets for Datasets",url:"https://arxiv.org/abs/1803.09010",publisher:"Gebru et al., 2018",note:"数据集来源、组成和使用说明"}
]
}
];
