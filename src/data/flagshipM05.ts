import type { Course } from "../types/course";

/** M05 — inference, decoding, performance optimization and serving infrastructure. */
export const flagshipM05Lessons: Course["modules"][number]["lessons"] = [
{
id:"m05-01-prefill-decode-kv",title:"第一讲：Prefill、Decode 与 KV Cache",summary:"推导生成阶段、缓存张量和显存容量。",learningObjectives:["区分 Prefill 与 Decode 的工作量","推导 KV Cache 内存公式","解释 MHA、MQA、GQA 对缓存的影响"],estimatedMinutes:80,
content:[
{heading:"一次生成请求的两个阶段",body:"Prefill 并行处理 prompt 并建立 KV；Decode 逐 token 生成并复用历史 KV。",markdown:"Prefill 处理输入长度 T_in，计算各位置隐藏状态和 K/V。Decode 每轮通常只输入最新 token，读取历史 KV 并预测下一 token。TTFT 包含排队、prefill 和首轮生成；TPOT 描述持续 decode 的每 token 时间。长 prompt 常放大 prefill 延迟；长输出与高并发持续占用 decode 计算和 KV 内存。"},
{heading:"KV Cache 内存公式",body:"缓存保存每层每个 KV head 的 Key 和 Value，避免每步重新计算历史投影。",markdown:"近似公式：M_KV=2×L×B×T×H_kv×d_h×bytes。2 表示 K/V，L 层数，B batch，T 缓存 token，H_kv KV heads，d_h 每头维度。\n\n例：32 层、B=1、T=8192、32 KV heads、head_dim=128、BF16 每元素 2 bytes：2×32×1×8192×32×128×2=4,294,967,296 bytes，约 4 GiB。真实运行还需考虑块对齐、并发、元数据和碎片。"},
{heading:"MHA、MQA 与 GQA",body:"减少 KV heads 可降低缓存容量和读取带宽，但要求模型架构支持并需验证质量。",markdown:"MHA 通常每个 query head 对应独立 KV head；MQA 让多个 query heads 共享一组 KV；GQA 把 query heads 分组共享较少 KV heads。若 query heads=32，KV heads 从 32 降到 8，其他维度不变时公式中的 KV 项降至四分之一。\n\n这不是无代价优化：模型训练结构、内核实现、序列长度和硬件带宽都会影响实际收益。"},
{heading:"缓存生命周期与隔离",body:"缓存必须与模型版本、token 前缀、位置偏移、会话身份和分支状态保持一致。",markdown:"缓存复用错误可能混合不同会话状态，造成生成错误或数据泄漏。请求取消、beam/speculative 分支、前缀共享和多租户调度需要引用计数、回收与隔离。KV 是派生状态，不能任意跨模型/适配器版本复用。"},
{heading:"复现练习：逐项核算单请求 KV Cache",body:"使用公式核算指定模型的缓存占用，并区分理论值、十进制 GB 与二进制 GiB。",markdown:"**案例输入**：32 层、8 KV heads、head_dim=128、BF16（2 bytes）、单请求 16,384 token。\n\n公式：M=2×L×B×T×H_kv×d_h×bytes。\n\n代入：2×32×1×16,384×8×128×2=2,147,483,648 bytes，即 2 GiB（约 2.147 GB）。若同时服务 4 个同长度请求，未共享前缀时约 8 GiB。\n\n**核对项**：确认 KV heads 而非 query heads；确认 K 与 V 的系数 2；确认 BF16 是 2 bytes；明确是否包含 beam、并发、块对齐和运行时开销。**提交证据**：可复算表格和至少两种参数变化的敏感性分析。"}
,
{
heading:"Paged KV Cache：块分配、碎片与前缀复用",
body:"KV Cache 的动态增长不适合简单地为每条请求预留最大连续内存；分页式块管理把逻辑 token 序列映射到固定大小的物理 KV blocks。",
markdown:"**连续预留的问题**：如果按最大输出长度一次性分配，短回答会浪费空间；如果按需扩容连续内存，则可能产生外部碎片和搬移成本。PagedAttention 将 KV 按固定 token block 分配，并通过 block table 映射逻辑序列到物理块。\n\n若 block_size=16 tokens，序列长度 T=1001，则需要 ceil(1001/16)=63 个 block，分配容量为 1008 tokens，尾块最多浪费 15 token slots。分页降低连续大块分配和外部碎片压力，但仍有 block rounding、block table、调度和内存带宽成本。\n\n**前缀复用**：多个请求拥有完全相同的 token 前缀且模型、adapter、位置语义和缓存配置兼容时，可共享前缀 KV；引用计数、copy-on-write、失效和租户隔离必须正确。不能仅因自然语言文本相似就共享 KV。\n\n**课堂练习**：对 1,001、1,025 和 16,385 token 三条请求，分别计算 block_size=16/32 时的 block 数、尾块浪费和总分配容量。说明为什么分页不会减少每个 token 本身需要的 K/V 数值。"
},
],
assessments:[{id:"m05-01-kv-capacity",type:"code-task",prompt:"计算 32 层、8 KV heads、head_dim=128、BF16、batch=4、每请求 16k token 的理论 KV 容量，并说明分页分配和共享前缀如何改变实际占用。",rubric:[{criterion:"公式单位",description:"正确代入维度并区分 bytes 与 GiB",points:4},{criterion:"架构影响",description:"解释 GQA/MQA 对 KV head 项的影响",points:3},{criterion:"生命周期",description:"覆盖隔离、回收、共享或失效",points:3}]}],
sources:[
{title:"Efficiently Scaling Transformer Inference",url:"https://arxiv.org/abs/2211.05102",publisher:"Pope et al., 2022",note:"推理系统瓶颈与优化"},
{title:"Fast Transformer Decoding: One Write-Head is All You Need",url:"https://arxiv.org/abs/1911.02150",publisher:"Shazeer, 2019",note:"Multi-Query Attention"},
{title:"GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints",url:"https://arxiv.org/abs/2305.13245",publisher:"Ainslie et al., 2023",note:"Grouped-Query Attention"},
{title:"Efficient Memory Management for Large Language Model Serving with PagedAttention",url:"https://arxiv.org/abs/2309.06180",publisher:"Kwon et al., SOSP 2023",note:"Paged KV blocks、前缀共享与碎片管理"}
]
},
{
id:"m05-02-decoding-distribution",title:"第二讲：解码策略与生成分布",summary:"从 logits 推导 temperature、top-k、top-p 和停止条件。",learningObjectives:["区分 logits、概率与采样结果","计算 temperature 对概率分布的影响","解释 top-k 与 top-p 的候选集合"],estimatedMinutes:70,
content:[
{heading:"Logits、Softmax 与 Temperature",body:"模型输出 logits，经温度缩放和 Softmax 得到下一 token 概率。",markdown:"p_i=exp(z_i/τ)/Σ_j exp(z_j/τ)。τ 越小分布通常越尖锐，τ 越大通常越平坦。例：logits=[2,1,0]，τ=1 时概率约 [0.665,0.245,0.090]；τ=2 时约 [0.506,0.307,0.186]。温度改变抽样分布，不会增加模型知识。"},
{heading:"Greedy、Top-k 与 Top-p",body:"Greedy 取最大概率；Top-k 限制候选数量；Top-p 保留累计概率达到阈值的最小候选集合。",markdown:"若排序概率为 [0.6,0.25,0.1,0.05]，top-p=0.8 通常保留前两项（累计 0.85）；top-k=2 也保留两项，但其他分布下二者可能不同。截断后通常重新归一化再采样。"},
{heading:"惩罚、停止与约束输出",body:"重复惩罚和停止条件改变生成轨迹，不能替代任务正确性验证。",markdown:"重复惩罚的具体 logit 变换依实现而异；EOS、stop sequence、最大新 token 数和工具交接标记定义终止条件。结构化输出应使用服务支持的受约束解码，并在应用侧独立解析、schema 校验和业务校验。"},
{heading:"可复现性元数据",body:"采样参数必须与模型、Tokenizer、模板和服务实现一起记录。",markdown:"记录模型/权重版本、Tokenizer、Chat Template、temperature、top-p、top-k、seed（若支持）、stop、max tokens 和采样实现。相同参数不保证跨模型或供应商得到相同输出。低 temperature 也不等于正确，仍需任务集评测。"},
{heading:"复现练习：手算一次采样分布与候选截断",body:"从 logits 计算概率，再分别执行 top-k 与 top-p，避免把候选过滤和温度缩放混为一谈。",markdown:"给定 logits=[2,1,0]，τ=1 时 Softmax 约为 [0.665,0.245,0.090]；τ=2 时约为 [0.506,0.307,0.186]。每组概率应归一化为 1（允许四舍五入误差）。\n\n另设排序概率 [0.60,0.25,0.10,0.05]：top-k=2 保留前两项；top-p=0.80 按累计概率保留最小前缀，此处前两项累计 0.85，因此也保留两项。换成 [0.60,0.15,0.15,0.10] 时 top-p=0.80 会保留前三项，而 top-k=2 仍只保留两项。\n\n**提交证据**：概率表、截断前后候选集合和采样配置。说明温度、截断与重新归一化的执行顺序以目标推理框架为准。"}
,
{
heading:"约束解码、结构化输出与采样边界",
body:"采样策略决定概率分布中的选择方式；Grammar/Schema-constrained decoding 限制合法 token 路径，但不能证明业务语义正确。",
markdown:"**三层约束**：1) sampling policy（temperature、top-k、top-p、min-p 等）控制随机选择；2) grammar/schema constraint 限制 token 序列只能落在可接受语法集合；3) 应用侧解析、Schema validation 和业务规则检查确认输出可用。三层不能互相替代。\n\nBeam search 维护多个候选序列，适合部分搜索任务，但长度偏置、重复和多样性问题需要处理；对开放式对话不保证优于 sampling。Repetition/frequency/presence penalty 的定义和作用顺序依引擎实现而异，必须记录配置。\n\n**失败案例**：模型生成语法合法的 JSON，但把金额单位写错、引用不存在的订单或填入越权字段。受约束解码只解决可表达性，不解决事实性、授权和业务正确性。\n\n**提交证据**：同一任务分别使用 unconstrained sampling 和 grammar-constrained decoding，记录语法成功率、Schema 成功率、业务校验成功率与任务质量。"
},
],
assessments:[{id:"m05-02-decoding-calc",type:"knowledge-check",prompt:"计算 logits=[2,1,0] 在 τ=1 和 τ=2 时的近似 Softmax 概率；说明 top-k=2 与 top-p=0.8 的候选集及其差异。",rubric:[{criterion:"概率计算",description:"近似值正确且归一化",points:4},{criterion:"截断规则",description:"正确解释 top-k 和 top-p",points:3},{criterion:"复现配置",description:"列出模型与采样元数据",points:3}]}],
sources:[
{title:"The Curious Case of Neural Text Degeneration",url:"https://arxiv.org/abs/1904.09751",publisher:"Holtzman et al., ICLR 2020",note:"核采样与生成退化"},
{title:"Generation strategies",url:"https://huggingface.co/docs/transformers/generation_strategies",publisher:"Hugging Face",note:"生成策略说明"},
{title:"GenerationConfig API",url:"https://huggingface.co/docs/transformers/main_classes/text_generation",publisher:"Hugging Face",note:"生成参数接口"}
]
},
{
id:"m05-03-batching-scheduling",title:"第三讲：Batching 与请求调度",summary:"比较静态批处理、Continuous Batching、排队和公平性。",learningObjectives:["解释 padding 与 straggler 问题","描述 iteration-level scheduling","计算吞吐和简化排队延迟"],estimatedMinutes:75,
content:[
{heading:"批处理的收益与浪费",body:"批处理合并矩阵运算提高设备利用率，但长度不一致会引入 padding 和等待。",markdown:"若请求 prompt 长度为 100、200、1000 token，静态 padding batch 可能按 1000 对齐，短请求浪费计算。长度分桶可降低 padding，但可能增加排队和长请求饥饿。吞吐指标必须明确是请求/s、输入 token/s 还是输出 token/s。"},
{heading:"Continuous Batching",body:"Continuous batching 在每轮生成迭代后加入新请求、移除完成请求，不等待整个 batch 结束。",markdown:"Iteration-level scheduling 允许请求结束后释放槽位，并在后续 decode step 加入等待请求。它提高设备忙碌程度，但要求 KV 动态分配、请求状态管理和调度器协调。吞吐最大化可能损害短请求延迟，需要优先级、最大等待时间和租户公平策略。"},
{heading:"排队延迟的非线性",body:"端到端延迟由排队、prefill、decode 和网络组成；接近饱和时等待时间快速增加。",markdown:"T_total=T_queue+T_prefill+T_decode+T_network。简化 M/M/1 模型中，系统逗留时间 W=1/(μ−λ)，排队等待时间 Wq=λ/[μ(μ−λ)]，要求 λ<μ。若 μ=20 req/s、λ=15，则 W=0.2s、Wq=0.15s；若 λ=19，则 W=1s、Wq=0.95s。LLM 服务并非真正 M/M/1，此例只说明容量接近饱和时延迟非线性上升。"},
{heading:"背压、取消和公平性",body:"队列上限、请求取消、超时和背压可阻止过载扩散。",markdown:"设置最大队列长度、prompt/output token 上限、租户并发额度和 deadline。过载时拒绝、排队、降级或要求缩短输入，不应无限等待。取消应尽早停止计算并回收 KV；重试必须有幂等语义和退避，避免故障放大流量。"},
{heading:"复现练习：设计带延迟目标的 Continuous Batching",body:"把请求到达、prefill、decode 和完成回收放入迭代调度模型，展示吞吐与尾延迟的冲突。",markdown:"**教学场景**：交互请求 A/B 的输出上限为 64 token，长任务 C 的输出上限为 2,048 token。静态 batch 若等待 C 完成，A/B 的槽位可能被占用；iteration-level scheduling 可在 A/B 结束后释放槽位并接入新请求。\n\n设计时明确：队列最大长度、每租户并发、最大等待时间、prompt token 上限、输出 token 上限、取消传播和 KV 回收。将交互请求设为有 deadline 的服务类，但必须保留长任务的最低公平份额，避免饥饿。\n\n**提交证据**：至少 10 个离散调度 step 的时间线、A/B/C 的 TTFT/TPOT/完成时间、队列过载时的拒绝或降级策略。不要用请求/s 替代输出 token/s。"}
,
{
heading:"Chunked Prefill 与 Prefill/Decode 分离",
body:"长 prompt 的 Prefill 可能阻塞正在 Decode 的请求；chunked prefill 和 phase disaggregation 是不同层次的调度/部署优化。",
markdown:"**Chunked prefill** 将长 prompt 切成多个 token chunks，分批进入调度器，使 decode iteration 不必长时间等待一个大 prefill。chunk size 越小，调度更灵活但调度/内核开销可能增加；越大则 prefill 效率可能更高，但对 decode 的干扰更明显。\n\n**Prefill/Decode disaggregation** 将两个阶段放到不同 GPU worker 或资源池：Prefill 偏计算密集，Decode 通常更受内存带宽/KV 访问约束。分离可独立配置硬件和并行策略，但要支付 KV/状态跨节点传输、网络带宽、调度、故障恢复和资源碎片成本。\n\n**系统对比**：Orca 的 iteration-level scheduling、Sarathi-Serve 的 chunked prefill、DistServe/Splitwise 的阶段分离，解决的是相关但不同的瓶颈。不能把“连续批处理”“分块 Prefill”和“Prefill/Decode 分离”当成同义词。\n\n**设计练习**：同一工作负载包含短 prompt/长输出和长 prompt/短输出两类请求。分别提出 colocated continuous batching、chunked prefill 和 disaggregated serving 方案，比较 TTFT、TPOT、goodput、KV transfer 和 GPU 利用率。"
},
],
assessments:[{id:"m05-03-scheduler-design",type:"design-review",prompt:"设计三租户 continuous batching 策略，在提升输出 token 吞吐的同时为交互请求设定 P95 TTFT 目标。",rubric:[{criterion:"调度机制",description:"说明请求入队/出队、KV 分配和完成回收",points:4},{criterion:"指标公平",description:"区分 TTFT、TPOT、吞吐与租户公平",points:3},{criterion:"过载处理",description:"定义队列上限、背压、取消和降级",points:3}]}],
sources:[
{title:"Orca: A Distributed Serving System for Transformer-Based Generative Models",url:"https://www.usenix.org/conference/osdi22/presentation/yu",publisher:"Yu et al., OSDI 2022",note:"Iteration-level scheduling"},
{title:"Efficient Memory Management for Large Language Model Serving with PagedAttention",url:"https://arxiv.org/abs/2309.06180",publisher:"Kwon et al., SOSP 2023",note:"PagedAttention 与 KV 管理"},
{title:"vLLM Documentation",url:"https://docs.vllm.ai/",publisher:"vLLM Project",note:"高吞吐推理服务实现"},
{title:"Taming Throughput-Latency Tradeoff in LLM Inference with Sarathi-Serve",url:"https://arxiv.org/abs/2403.02310",publisher:"Agrawal et al., OSDI 2024",note:"Chunked prefill 与 stall-free scheduling"}
]
},
{
id:"m05-04-speculative-quantization",title:"第四讲：Speculative Decoding 与量化",summary:"理解草稿验证、权重量化和 KV 压缩的性能—质量权衡。",learningObjectives:["描述 speculative draft/verify 流程","计算 INT8/INT4 理论权重存储","区分权重、激活和 KV 量化"],estimatedMinutes:80,
content:[
{heading:"Speculative Decoding",body:"草稿模型提出候选 token 块，目标模型并行验证并接受可兼容前缀。",markdown:"流程：draft model 提出 k 个候选 → target model 对候选块评分 → 按分布一致性规则接受若干 token → 在拒绝位置按修正分布采样 → 进入下一轮。在正确分布校正下可保持目标模型输出分布。收益取决于草稿接受率、模型成本比、块长和实现开销。"},
{heading:"量化映射与存储估算",body:"量化把浮点权重映射到有限整数，降低存储和带宽但引入误差。",markdown:"对称量化可写为 q=clip(round(x/s),qmin,qmax)，反量化 x̂=sq。7B 权重 FP16 理论约 14GB，INT8 约 7GB，INT4 约 3.5GB（十进制，不含 scale、元数据、未量化层和运行时 buffer）。实际显存还要容纳 KV、激活和工作区。"},
{heading:"量化粒度与算法",body:"Per-tensor、per-channel 和 group-wise 在元数据、异常值和精度间折中。",markdown:"Per-tensor 共享 scale，简单但可能受极端值支配；per-channel 为通道设 scale；group-wise 在小组共享 scale。GPTQ 使用近似二阶信息逐层量化；AWQ 利用激活统计保护重要通道；SmoothQuant 在权重和激活间迁移量化难度。评估不能只看 MSE。"},
{heading:"权重、激活与 KV 量化",body:"三种量化作用位置不同，部署收益依赖算子、硬件和任务质量。",markdown:"权重量化降低常驻权重内存；激活量化改变矩阵计算路径；KV 量化压缩长上下文缓存。选择方案应评估任务质量、首 token 延迟、decode tokens/s、峰值显存、并发、硬件 kernel 支持和校准数据代表性。不能仅凭 4-bit 标签断言可部署。"},
{heading:"复现练习：量化前后建立公平对照",body:"为 FP16、INT8 和 INT4 建立存储估算与质量/性能评测矩阵。",markdown:"**案例输入**：13B 参数，暂不计 scale、元数据和未量化层。\n\n- FP16：13B×2 bytes=26 GB（十进制）。\n- INT8：13B×1 byte=13 GB。\n- INT4：13B×0.5 byte=6.5 GB。\n\n这只是权重理论存储，不是完整显存需求。实验必须固定模型版本、Tokenizer、提示集、输出上限和硬件；分别记录任务质量、峰值显存、TTFT、TPOT、吞吐、并发和失败率。若 INT4 使用不同 kernel 或分组 scale，应记录量化方法与配置。\n\n**提交证据**：量化配置、校准集说明、指标对照表和质量回归门槛。不能只凭权重文件变小就宣布部署成功。"}
,
{
heading:"Speculative Decoding 接受率与量化质量门槛",
body:"Speculative decoding 的正确性来自接受/拒绝校正，而不是简单地相信 draft model；量化和推测解码应分别测量。",
markdown:"对某位置 draft 分布 q 采样得到候选 token x，target 分布为 p。标准 rejection sampling 的接受概率为 min(1,p(x)/q(x))。若拒绝，按归一化残差分布 max(0,p−q) 重新采样，才能保持 target 分布。实际算法还涉及候选块、并行验证、终止 token 和数值实现。\n\n草稿接受率高不必然带来同等比例的加速：还要计入 draft 计算、target 验证、内存带宽、batch 形态和调度开销。量化改变模型近似误差和 kernel 性能；Speculative decoding 改变 target forward 的组织方式，二者可以组合，但需要联合评测。\n\n**量化门禁**：对固定模型/Tokenizer/提示集/采样配置，报告 task quality、长上下文回归、格式成功率、TTFT、TPOT、tokens/s、峰值显存、并发和错误率。记录量化算法、位宽、group size、scale、校准集、异常层和 kernel 版本。"
},
],
assessments:[{id:"m05-04-quantization-plan",type:"code-task",prompt:"对 13B 参数模型比较 FP16、INT8、INT4 理论权重存储，并设计 32k context 多并发服务的量化评估计划。",rubric:[{criterion:"存储估算",description:"得到约 26GB、13GB、6.5GB 十进制理论值",points:3},{criterion:"机制区分",description:"区分权重/激活/KV 量化和 speculative decoding",points:3},{criterion:"验证计划",description:"覆盖质量、延迟、吞吐、显存与硬件兼容",points:4}]}],
sources:[
{title:"Fast Inference from Transformers via Speculative Decoding",url:"https://arxiv.org/abs/2211.17192",publisher:"Leviathan et al., 2023",note:"Speculative decoding"},
{title:"GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers",url:"https://arxiv.org/abs/2210.17323",publisher:"Frantar et al., ICLR 2023",note:"后训练权重量化"},
{title:"SmoothQuant: Accurate and Efficient Post-Training Quantization for Large Language Models",url:"https://arxiv.org/abs/2211.10438",publisher:"Xiao et al., ICML 2023",note:"激活与权重量化"},
{title:"AWQ: Activation-aware Weight Quantization for LLM Compression and Acceleration",url:"https://arxiv.org/abs/2306.00978",publisher:"Lin et al., MLSys 2024",note:"Activation-aware weight-only quantization"}
]
},
{
id:"m05-05-serving-architecture",title:"第五讲：推理服务架构与容量工程",summary:"从模型加载到 API 流式输出设计服务、并行、监控和降级。",learningObjectives:["区分 TP、PP、DP 与专家并行","建立权重、KV、激活和运行时内存预算","设计健康检查、SLO 和故障降级"],estimatedMinutes:85,
content:[
{heading:"推理请求数据路径",body:"请求经过网关、队列、Tokenizer、调度器、模型 worker 和响应流，每一层都可能产生延迟或故障。",markdown:"Client → Gateway/Auth/Quota → Queue → Tokenizer/Template → Scheduler → Model Worker → Sampler/Detokenizer → Streaming Response。契约应定义输入大小、上下文/输出上限、超时、取消、流式事件和错误码。API 返回成功不代表内容正确，应用层仍需校验。"},
{heading:"并行策略",body:"Tensor Parallel 拆分层内矩阵，Pipeline Parallel 拆分层段，Data Parallel 复制模型处理不同请求。",markdown:"TP 需层内通信；PP 跨 stage 传递激活并可能出现 pipeline bubble；DP 复制权重提高请求吞吐但增加常驻内存；Expert Parallel 将 MoE 专家分布在设备并 dispatch token。并行度不保证线性加速，通信带宽、拓扑、batch 和模型形状决定收益。\n\n具体推理框架的 API 和版本会演进：DeepSpeed-Inference v2 已以 DeepSpeed-FastGen 形式发布；旧版 `init_inference` 教程适合作为历史接口示例，采用前必须核对当前版本文档和模型支持矩阵。"},
{heading:"完整内存预算",body:"部署容量必须同时计算权重、KV、激活、通信 buffer、运行时开销和安全余量。",markdown:"M_total=M_weights+M_KV+M_activations+M_workspace+M_runtime+M_fragmentation。70B FP16 权重理论约 140GB（十进制）；即使多 GPU 能容纳权重，也必须为 KV、临时激活和运行时 buffer 留余量。不能只用显存总和大于权重文件判断可部署。"},
{heading:"上线监控与故障降级",body:"监控质量、资源和尾延迟，并为加载失败、OOM 和依赖故障定义恢复路径。",markdown:"监控模型加载时间、GPU/CPU 利用率、显存水位、KV 使用率、队列长度、TTFT、TPOT、P95/P99、tokens/s、错误率和每请求成本。readiness 未通过不接流量；OOM 时按策略降低并发或释放缓存；模型不可用时只回退到已评估且权限等价的模型。避免记录不必要的敏感 prompt。"},
{heading:"复现练习：做一次推理服务容量评审",body:"把 API 数据路径、并行策略和内存预算放入同一份容量设计，而不是只比较 GPU 显存总量。",markdown:"**设计输入**：70B FP16 权重理论约 140 GB（十进制）；目标服务还需要 KV、激活、通信 buffer、运行时和碎片余量。\n\n评审顺序：\n1. 明确模型架构、权重格式和目标上下文长度。\n2. 按请求分布计算 KV 峰值，而非只用平均长度。\n3. 选择 TP/PP/DP/EP，并列出跨卡通信和拓扑约束。\n4. 定义 readiness、队列上限、OOM 处理、请求取消和优雅摘流。\n5. 为 TTFT、TPOT、P95/P99、tokens/s、错误率和单位请求成本定义 SLI/SLO。\n\n**提交证据**：内存账本、服务序列图、容量假设、故障降级表。理论预算必须留安全余量，并在真实目标硬件上压测后才能形成部署结论。"}
,
{
heading:"Goodput、SLO 与 Admission Control",
body:"吞吐量并不等于可服务容量；只有满足延迟和错误率约束的有效请求才计入 goodput。",
markdown:"**Throughput** 可表示每秒完成请求数或 token 数；**Goodput** 进一步只统计满足服务质量目标的有效工作。若系统以 100 req/s 完成请求，但 35% 请求超过 TTFT/TPOT SLO，则满足 SLO 的 goodput 只有 65 req/s。指标分母和成功条件必须明确。\n\nAdmission control 在请求入队前检查 GPU/KV 余量、预计 prompt/output token、租户额度、deadline 和当前排队；可选择接收、排队、拒绝、降级或路由到经过评估的备用模型。队列不能无限增长，过载时盲目重试会形成 retry storm。\n\n**压测矩阵**：按 prompt 长度、输出长度、并发、到达突发度、缓存命中、租户分布和取消率分层。报告 P50/P95/P99 TTFT、TPOT、端到端延迟、goodput、tokens/s、KV occupancy、GPU utilization、OOM/rejection 和每有效请求成本。\n\n**发布门禁**：先用 open-loop 到达模型测容量边界，再用真实 trace 验证；明确最大可持续负载、SLO 违反率、回滚阈值和容量余量。"
}
],
assessments:[{id:"m05-05-serving-design",type:"design-review",prompt:"为 70B 模型设计多 GPU 推理服务，提交并行策略、内存预算、API 数据路径、SLO、监控和 OOM/模型不可用降级方案。",rubric:[{criterion:"架构并行",description:"说明 TP/PP/DP 选择和通信代价",points:3},{criterion:"容量模型",description:"覆盖权重、KV、激活、buffer 和余量",points:3},{criterion:"可靠性",description:"定义 SLO、健康检查、监控和安全降级",points:4}]}],
sources:[
{title:"TensorRT-LLM Documentation",url:"https://nvidia.github.io/TensorRT-LLM/",publisher:"NVIDIA",note:"LLM 推理优化和部署"},
{title:"vLLM Documentation",url:"https://docs.vllm.ai/",publisher:"vLLM Project",note:"高吞吐 LLM serving"},
{title:"DistServe: Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving",url:"https://arxiv.org/abs/2401.09670",publisher:"Zhong et al., OSDI 2024",note:"Prefill/Decode 分离与 SLO-aware goodput"},
{title:"Splitwise: Efficient Generative LLM Inference Using Phase Splitting",url:"https://arxiv.org/abs/2311.18677",publisher:"Patel et al., ISCA 2024",note:"Prefill/Decode 异构资源分离"},
{title:"DeepSpeed Inference",url:"https://www.deepspeed.ai/inference/",publisher:"Microsoft DeepSpeed",note:"DeepSpeed 推理总览；注明 DeepSpeed-Inference v2 已更名为 FastGen，具体 API 必须按当前版本核对"}
]
}
];
