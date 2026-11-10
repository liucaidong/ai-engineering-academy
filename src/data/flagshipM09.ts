import type { Course } from "../types/course";

/** M09 — multimodal AI: vision, image generation, audio and cross-modal systems. */
export const flagshipM09Lessons: Course["modules"][number]["lessons"] = [
{id:"m09-01-multimodal-architecture",title:"第一讲：多模态架构与表示对齐",summary:"理解模态编码器、共享表示空间和跨模态融合。",learningObjectives:["区分 early/late fusion 与 cross-attention","解释模态专用编码器和投影层","分析对齐数据与模态缺失问题"],estimatedMinutes:75,content:[
{heading:"多模态系统的基本结构",body:"多模态模型需要把不同输入表示映射到可交互的表示空间。",markdown:"典型路径：图像/音频/文本 → modality encoder/tokenizer → projection 或 resampler → shared transformer → task head/decoder。并非所有模型都采用统一 token 化；有些保留模态专用编码器，再通过 cross-attention 或投影融合。"},
{heading:"Early Fusion、Late Fusion 与 Cross-Attention",body:"融合位置决定模态交互时机、计算成本和可解释边界。",markdown:"Early fusion 在较早阶段拼接表示，交互充分但序列可能很长；late fusion 分别编码后融合输出，成本较低但细粒度对齐弱；cross-attention 让一个模态作为 query 读取另一个模态的 key/value。选择取决于任务是否需要局部对齐、延迟和数据量。"},
{heading:"表示对齐与训练数据",body:"跨模态对齐依赖配对数据、对比目标和任务监督，数据偏差会进入共享空间。",markdown:"对比学习可将匹配图文向量拉近、非匹配样本推远。InfoNCE 形式 L=−log(exp(sim(v,t)/τ)/Σⱼ exp(sim(v,tⱼ)/τ))。负样本质量、重复 caption、语言偏差和数据许可都会影响表示空间。"},
{heading:"模态缺失与鲁棒性",body:"生产系统必须处理空模态、低质量输入、同步偏差和传感器噪声。",markdown:"评测需覆盖图像损坏、低分辨率、音频噪声、时间戳错位、语言切换和模态缺失。不能假设所有输入都同时具备文本、图像和音频。为每种模态定义可用性检测、错误码和降级行为。"},
{heading:"复现练习：设计会议助手的跨模态时间线",body:"将 ASR 文本、说话人、视频帧和事件时间戳关联到统一时间轴。",markdown:"场景：60 分钟会议，音频流产生带起止时间的转写片段，视频每秒抽取关键帧。每个事件保存 meeting_id、media_offset、timestamp、speaker_id、modality、content_ref 和模型版本。将“某人在屏幕上展示预算表”关联到对应 ASR 片段和视频帧；处理时钟漂移、丢帧、重叠发言和 ASR 修订。若没有可靠时间戳，不得伪造精确的跨模态引用。\n\n提交证据：事件 schema、统一时间轴图、同步误差预算和模态缺失时的降级策略。"}
,
{
heading:"跨模态对齐目标：Contrastive、Sigmoid 与生成式监督",
body:"共享嵌入空间不是自动产生的；损失函数、负样本构造、温度和数据配对质量共同决定对齐行为。",
markdown:"**双向对比学习**通常同时计算 image-to-text 与 text-to-image 目标。对 batch 内匹配对拉近、非匹配对推远，温度 τ 控制相似度分布的尖锐程度。负样本过易会提供弱梯度；错误配对、重复图文和语义上同样正确的 false negatives 会制造错误监督。\n\n**SigLIP** 使用 pairwise sigmoid loss，不依赖对整个 batch 的 softmax 归一化；这改变了负样本与 batch scaling 的训练设计，但不意味着任意配对数据都可靠。**Generative alignment** 则通过条件生成目标学习跨模态关联，与检索式 embedding 对齐的优化目标不同。\n\n**诊断**：分别检查 image-to-text、text-to-image、跨语言、细粒度区域和长尾概念；报告 Recall@K、对齐校准、语言/来源分层及数据污染。不要只用总体相似度证明语义理解。"
},],assessments:[{id:"m09-01-multimodal-architecture",type:"design-review",prompt:"为会议助手设计音频、视频帧和文本融合架构，比较 early fusion、late fusion 与 cross-attention，并说明模态缺失策略。",rubric:[{criterion:"数据流",description:"说明各模态编码、投影和融合路径",points:4},{criterion:"架构比较",description:"比较交互能力、计算和时序成本",points:3},{criterion:"鲁棒性",description:"覆盖模态缺失、噪声和时间同步",points:3}]}],sources:[
{title:"Learning Transferable Visual Models From Natural Language Supervision",url:"https://arxiv.org/abs/2103.00020",publisher:"Radford et al., ICML 2021",note:"CLIP 图文对比学习"},
{title:"Flamingo: a Visual Language Model for Few-Shot Learning",url:"https://arxiv.org/abs/2204.14198",publisher:"Alayrac et al., NeurIPS 2022",note:"视觉语言交叉注意力架构"},
{title:"ImageBind: One Embedding Space To Bind Them All",url:"https://arxiv.org/abs/2305.05665",publisher:"Girdhar et al., CVPR 2023",note:"多模态共享表示"},
{title:"Sigmoid Loss for Language Image Pre-Training",url:"https://arxiv.org/abs/2303.15343",publisher:"Zhai et al., 2023",note:"SigLIP 成对 sigmoid 图文对齐目标"}
]},
{id:"m09-02-vision-transformers",title:"第二讲：Vision Transformer 与视觉编码",summary:"推导 patch embedding、位置表示、分辨率和视觉 token 成本。",learningObjectives:["计算 ViT patch 数量与序列长度","解释 CLS token 和位置编码","分析分辨率、patch size 与计算量的权衡"],estimatedMinutes:75,content:[
{heading:"从图像到 Patch Tokens",body:"ViT 将图像切分为固定 patch，再投影为 token 序列输入 Transformer。",markdown:"图像 H×W、patch P×P，忽略 padding 时 patch 数 N=(H/P)(W/P)。例：224×224 图像、patch=16，得到 14×14=196 个 patch token，若含 CLS token 则序列长度 197。"},
{heading:"Patch Embedding 与位置",body:"每个 patch 展平后经线性投影映射到隐藏维度，位置表示保留空间布局。",markdown:"单个 RGB patch 的输入维度为 3P²；线性投影 W∈R^(3P²×D)。CLS token 可作为全局汇聚表示；位置编码让模型区分空间位置。不同分辨率可能需要插值位置编码或动态分辨率策略。"},
{heading:"分辨率与计算成本",body:"分辨率增加会平方级增加 patch 数，标准全注意力的分数矩阵成本随 token 数平方增长。",markdown:"将图像边长从 224 提升到 448 且 patch size 不变，patch 数从 196 增至 784，即 4 倍；全注意力矩阵元素约增至 16 倍。高分辨率有利于细节但显著增加计算和显存。"},
{heading:"视觉任务与边界",body:"分类、检测、分割和 OCR 对空间定位与输出结构有不同要求。",markdown:"分类常输出全局标签；检测输出框和类别；分割输出像素级 mask；OCR 还需文字序列和坐标。不能把分类准确率当作定位能力。评测要使用任务对应指标，如 mAP、IoU、字符错误率和区域召回。"},
{heading:"复现练习：比较两种 ViT Patch 配置的 token 成本",body:"通过 patch 数和注意力矩阵规模计算分辨率提升的代价。",markdown:"输入图像为 384×384。patch=16 时为 24×24=576 个 patch，加 CLS 后长度 577；patch=8 时为 48×48=2,304 个 patch，加 CLS 后长度 2,305。patch 数约扩大 4 倍；标准全注意力的序列平方项约扩大 16 倍。该计算未包含窗口注意力、分层下采样、padding 或具体 kernel 优化。\n\n提交证据：维度表、token 预算、任务细节需求和延迟/显存评测设计。不能只因 patch 更小就假设整体识别质量一定提高。"}
,
{
heading:"任意分辨率、Patch Packing 与动态视觉 Token 预算",
body:"视觉输入预处理是模型成本和信息损失的关键控制点；固定缩放、切块和原生分辨率有不同失败模式。",
markdown:"固定 resize 会改变长宽比或压缩小字；center crop 可能直接裁掉目标；tiling 能保留局部细节，却会产生跨 tile 重复和全局关系断裂。NaViT 的 Patch n' Pack 探索在序列中打包不同分辨率/长宽比图像，说明固定正方形输入不是唯一选择。\n\n**预算**：若单张图像 patch 数为 N，标准全局 self-attention 的主要序列交互项约随 N² 增长；多图输入要将各图 token、分隔符和文本 token 一起纳入上下文预算。高分辨率 OCR/图表任务可按区域自适应分配 token，而不是对所有图像统一加倍分辨率。\n\n**评测**：比较 resize、crop、tiling、dynamic resolution 和 native aspect ratio；按小字 OCR、空间定位、图表、密集场景和长宽比切片，记录任务质量、视觉 token、延迟与显存。"
},],assessments:[{id:"m09-02-vit-calc",type:"knowledge-check",prompt:"计算 384×384 输入在 patch=16 和 patch=8 时的 patch 数、含 CLS 的序列长度，并比较标准注意力矩阵规模比。",rubric:[{criterion:"Patch 计算",description:"分别得到 576 与 2304 patch",points:3},{criterion:"复杂度",description:"正确计算序列长度扩大 4 倍、注意力矩阵约 16 倍",points:4},{criterion:"工程取舍",description:"解释分辨率、细节和显存延迟权衡",points:3}]}],sources:[
{title:"An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale",url:"https://arxiv.org/abs/2010.11929",publisher:"Dosovitskiy et al., ICLR 2021",note:"Vision Transformer 原始论文"},
{title:"Swin Transformer: Hierarchical Vision Transformer using Shifted Windows",url:"https://arxiv.org/abs/2103.14030",publisher:"Liu et al., ICCV 2021",note:"层次窗口注意力"},
{title:"DINOv2: Learning Robust Visual Features without Supervision",url:"https://arxiv.org/abs/2304.07193",publisher:"Oquab et al., 2023",note:"视觉特征预训练"},
{title:"Patch n' Pack: NaViT, a Vision Transformer for any Aspect Ratio and Resolution",url:"https://arxiv.org/abs/2307.06304",publisher:"Dehghani et al., NeurIPS 2023",note:"原生分辨率与序列打包"}
]},
{id:"m09-03-image-generation",title:"第三讲：图像生成与视觉条件控制",summary:"理解扩散模型的去噪过程、条件输入和生成评测。",learningObjectives:["解释前向加噪与反向去噪","写出简化 DDPM 训练目标","区分 prompt adherence、质量和安全指标"],estimatedMinutes:80,content:[
{heading:"扩散模型的前向过程",body:"前向过程逐步向数据添加高斯噪声，反向模型学习从噪声恢复数据。",markdown:"简化 DDPM：q(x_t|x_{t−1})=N(√(1−β_t)x_{t−1},β_t I)。可写成 x_t=√(ᾱ_t)x_0+√(1−ᾱ_t)ε，其中 ε~N(0,I)。模型学习预测噪声 εθ(x_t,t,c)，c 为条件信息。"},
{heading:"训练目标与采样",body:"常见训练目标是预测添加噪声，采样时从噪声开始迭代去噪。",markdown:"L=E_{x₀,ε,t}[||ε−εθ(x_t,t,c)||²]。训练时随机抽时间步 t 和噪声 ε；推理时从随机噪声逐步更新。采样步数、scheduler、guidance scale 和分辨率共同影响质量、速度和多样性。"},
{heading:"条件控制与 CFG",body:"文本条件通过 cross-attention 等机制影响去噪，Classifier-Free Guidance 调节条件信号强度。",markdown:"CFG 常用 ε̂=ε_uncond+s(ε_cond−ε_uncond)。s 增大通常加强 prompt adherence，但过高可能导致过饱和、伪影或多样性下降。模型版本、文本编码器、负面提示和采样器都需记录。"},
{heading:"生成评测与安全",body:"图像生成需要同时评估视觉质量、条件遵循、多样性和安全风险。",markdown:"可组合人评、CLIP 相似度、FID 等分布指标和特定任务评分；任何单一指标都不完整。测试版权风格模仿、暴力/色情/自伤、身份偏见和训练数据记忆风险。生成内容还需来源标识与使用政策。"},
{heading:"复现练习：分析 CFG Scale 的质量—多样性曲线",body:"通过固定模型和 seed 的对照实验，分析条件遵循与图像伪影之间的关系。",markdown:"固定 prompt、模型、采样器、步数、分辨率和 seed，仅改变 CFG scale（例如 2、4、7、10）。对每组输出分别评估 prompt adherence、视觉质量、多样性和伪影；使用多条 prompt 和多个 seed，避免单图结论。CFG 变大可能增强条件信号，但过高会造成过饱和、细节伪影或多样性下降。CLIP 相似度只能作为一项参考，需结合人评和任务特定检查。\n\n提交证据：实验配置、盲评 rubric、指标表和至少一个失败案例。不得把玩具公式演示写成真实扩散模型性能测试。"}
,
{
heading:"Latent Diffusion、采样器与 NFE 质量预算",
body:"扩散模型的生成成本不仅由采样步数决定，还受 latent 压缩、网络调用次数、分辨率和条件引导影响。",
markdown:"**Latent Diffusion** 先用自编码器把像素空间压缩到 latent，再在 latent 上执行扩散/去噪，降低空间维度；压缩会引入重建误差，不能视为无损。训练目标、噪声参数化（ε/v/x0）、噪声调度和采样器必须匹配模型训练契约。\n\n**NFE（Number of Function Evaluations）** 比“steps”更接近实际去噪网络调用预算：某些 solver、二阶/多步方法或 guidance 实现每步可能调用网络多次。DPM-Solver 将采样写为求解扩散 ODE，尝试用更少 NFE 达到质量目标；论文数据集结果不能直接外推到所有模型和提示词。\n\n**实验设计**：固定 checkpoint、prompt、seed、分辨率和 CFG，仅改变 sampler/NFE；分别测人评质量、prompt adherence、伪影率、耗时和显存。把模型能力、采样器效率与推理硬件影响分开。"
},],assessments:[{id:"m09-03-diffusion",type:"knowledge-check",prompt:"解释 DDPM 的 x_t 构造式和噪声预测损失，并分析 CFG scale 过高时可能出现的两类质量问题。",rubric:[{criterion:"前向公式",description:"正确解释 alpha-bar、噪声和时间步",points:3},{criterion:"训练目标",description:"说明噪声预测 MSE 的变量",points:3},{criterion:"采样取舍",description:"解释 CFG 对遵循度、多样性和伪影的影响",points:4}]}],sources:[
{title:"Denoising Diffusion Probabilistic Models",url:"https://arxiv.org/abs/2006.11239",publisher:"Ho et al., NeurIPS 2020",note:"DDPM 原始论文"},
{title:"Classifier-Free Diffusion Guidance",url:"https://arxiv.org/abs/2207.12598",publisher:"Ho and Salimans, 2022",note:"无分类器引导"},
{title:"High-Resolution Image Synthesis with Latent Diffusion Models",url:"https://arxiv.org/abs/2112.10752",publisher:"Rombach et al., CVPR 2022",note:"潜空间扩散模型"},
{title:"DPM-Solver: A Fast ODE Solver for Diffusion Probabilistic Model Sampling in Around 10 Steps",url:"https://arxiv.org/abs/2206.00927",publisher:"Lu et al., NeurIPS 2022",note:"扩散 ODE 快速采样与 NFE"}
]},
{id:"m09-04-audio-tokenization",title:"第四讲：Audio Tokenization、语音识别与生成",summary:"理解波形、声学特征、离散音频 token 和语音任务链路。",learningObjectives:["区分 waveform、spectrogram、codec token 和文本 token","解释 ASR、TTS 与 speech-to-speech 数据流","计算采样率和音频时长对应的数据量"],estimatedMinutes:80,content:[
{heading:"音频信号基础",body:"数字音频是连续声压信号的离散采样，采样率和位深决定表示与数据量。",markdown:"单声道 PCM 原始数据量约为 duration×sample_rate×bit_depth/8。例：16kHz、16-bit、60 秒单声道约 16,000×2×60=1,920,000 bytes，约 1.92 MB（不含容器开销）。立体声翻倍。"},
{heading:"声学表示与 Tokenization",body:"模型可使用 waveform、log-Mel spectrogram 或神经音频 codec token 表示声音。",markdown:"STFT 把时域信号转换为时频表示；Mel filterbank 压缩频率尺度，log-Mel 常用于语音识别。神经 codec 把音频压缩为离散 codebook token，便于自回归或序列模型处理。不同表示在保真度、序列长度和延迟之间折中。"},
{heading:"ASR 与 TTS 流程",body:"ASR 将音频转文字，TTS 将文本与说话人/韵律条件转成音频。",markdown:"ASR 链路：VAD/切片 → encoder → decoder 或 CTC head → 解码/标点。TTS 链路：文本规范化 → phoneme/token → acoustic model/codec → vocoder 或 codec decoder。流式系统需处理 chunk 边界、时间戳、端点检测和增量修订。"},
{heading:"语音评测与隐私",body:"WER、延迟、自然度和说话人一致性衡量不同目标；音频可能包含高度敏感信息。",markdown:"WER=(S+D+I)/N，S 替换、D 删除、I 插入、N 参考词数。若参考 100 词，出现 4 替换、3 删除、2 插入，则 WER=9%。还需评测不同口音、噪声、语言和重叠说话人。录音需告知、授权、保留期限和访问控制。"},
{heading:"复现练习：核算音频数据量并设计流式 ASR",body:"从采样率、位深、声道数推导带宽，再把音频切片和增量转写纳入延迟预算。",markdown:"16 kHz、16-bit、mono、60 秒 PCM：16,000 samples/s × 2 bytes/sample × 60 s = 1,920,000 bytes，约 1.92 MB（十进制）。若双声道则约 3.84 MB。压缩编码、容器和元数据不在该原始 PCM 估算内。设计 VAD、chunk 长度、重叠窗口、时间戳、增量修订和 endpointing。评测 WER 时明确文本规范化、标点是否计分、语言/口音分层和参考转写质量。\n\n提交证据：数据量计算、流式时序图、WER 计算样例和录音授权/保留策略。"}
,
{
heading:"流式语音工程：Chunk、Diarization 与任务级延迟",
body:"语音系统必须同时处理内容准确性、说话人归属、时间边界、端点检测和交互延迟。",
markdown:"**Streaming ASR** 将音频切成 chunk，使用 overlap/look-ahead 缓解边界词丢失；但更长 look-ahead 会增加算法延迟。系统应区分 partial hypothesis、稳定片段和 final transcript，并记录每次修订。Diarization（说话人分离）输出 speaker turns，不等同于声纹身份认证。\n\n**级联系统 vs 统一多任务模型**：ASR→MT→TTS 模块边界清晰、易替换和定位错误，但误差会级联；SeamlessM4T 等统一模型覆盖多种语音/文本翻译任务，仍需按语言方向、任务类型和实时要求评测。\n\n**指标**：WER/CER 衡量文本错误；endpoint latency、first-token latency、real-time factor 衡量响应；DER 衡量 diarization。报告 partial-to-final revision、重叠说话人、噪声、口音和语言切换，不能只报告离线 WER。"
},],assessments:[{id:"m09-04-audio-engineering",type:"design-review",prompt:"计算 16kHz/16-bit/mono 60 秒 PCM 音频大小，并设计支持流式 ASR 的分块、时间戳、WER 和隐私控制方案。",rubric:[{criterion:"数据量计算",description:"正确得到约 1.92 MB 并注明单位假设",points:2},{criterion:"语音架构",description:"覆盖 VAD、chunk、时间戳和增量结果",points:4},{criterion:"评测隐私",description:"定义 WER 分层评测及录音治理",points:4}]}],sources:[
{title:"Robust Speech Recognition via Large-Scale Weak Supervision (Whisper)",url:"https://arxiv.org/abs/2212.04356",publisher:"Radford et al., 2022",note:"Whisper 模型论文；680,000 小时多语种/多任务弱监督语音数据"},
{title:"SoundStream: An End-to-End Neural Audio Codec",url:"https://arxiv.org/abs/2107.03312",publisher:"Zeghidour et al., 2021",note:"神经音频 codec"},
{title:"High Fidelity Neural Audio Compression (EnCodec)",url:"https://arxiv.org/abs/2210.13438",publisher:"Défossez et al., 2022",note:"EnCodec 流式神经音频 codec 与量化潜变量压缩"},
{title:"SeamlessM4T: Massively Multilingual & Multimodal Machine Translation",url:"https://arxiv.org/abs/2308.11596",publisher:"Seamless Communication et al., 2023",note:"统一语音/文本多任务翻译"}
]},
{id:"m09-05-multimodal-systems",title:"第五讲：多模态系统工程与综合评测",summary:"设计多模态输入管线、时间对齐、成本监控和隐私治理。",learningObjectives:["设计图像/音频/视频预处理与同步架构","选择模态级和端到端评测指标","治理上传数据、保留期限和推理成本"],estimatedMinutes:85,content:[
{heading:"多模态数据管线",body:"多模态系统需要统一请求 envelope，同时保留每种模态的专属元数据。",markdown:"请求 envelope 可包含 tenant/user、文本、图像 URI、音频片段、时间戳、采样率、分辨率、内容类型和来源。媒体应通过受控存储引用，不要把任意 URL 直接交给模型服务抓取。"},
{heading:"视频帧与时间对齐",body:"视频通常通过抽帧或时序编码处理，帧采样策略决定事件是否被观察到。",markdown:"若视频 30fps、每秒抽 1 帧，采样仅覆盖约 1/30 的帧；短暂事件可能完全错过。提高采样率会增加视觉 token 和费用。音频与视频需共享时间基准，处理漂移、丢帧和不同采样率。"},
{heading:"多维评测矩阵",body:"单一总体准确率会掩盖模态和用户群体上的差异。",markdown:"图像评测可包含分类、定位、OCR 和 grounding；音频评测包含 WER、说话人分离和端点延迟；跨模态任务评估对齐、时间定位和证据一致性。按分辨率、语言、噪声、口音和设备分层报告。"},
{heading:"成本、隐私与部署边界",body:"多模态输入可能显著增加预处理、token、存储和数据泄露成本。 NIST Privacy Framework 1.0 仍是正式版本；1.1 在 2026-11-10 仍处于 Initial Public Draft 状态（2025-06-13 已结束公众评论），不能将 1.1 称为最终标准。",markdown:"监控上传字节、图像 patch/token、音频秒数、转码成本、模型延迟和缓存命中。实施媒体访问授权、加密、短期 URL、恶意文件扫描、保留期限和删除传播。浏览器本地演示不等于真实多模态模型或 GPU 验证。"},
{heading:"复现练习：为视频理解设计抽帧与隐私预算",body:"把采样率、短事件漏检风险、视觉 token 成本和媒体治理放入同一评审。",markdown:"场景：30 fps 视频按每秒 1 帧抽取，理论只采样约 1/30 的原始帧；持续 100 ms 的短暂事件可能完全未被采到。提高抽帧频率可改善时间覆盖，但增加视觉 token、存储和推理成本。为任务定义关键事件时间窗、动态抽帧策略、音视频同步、敏感人脸/屏幕内容处理、短期访问 URL、加密、删除传播和访问审计。按事件类别、光照、运动模糊和摄像头角度分层评测。\n\n提交证据：采样策略、成本估算、事件召回评测计划和媒体隐私数据流图。"}
,
{
heading:"视频时序覆盖、事件级 Grounding 与基准有效性",
body:"视频理解的核心难点不只是抽帧，而是事件覆盖、时间定位、跨模态证据和长时序推理。",
markdown:"固定每秒抽一帧对短事件有系统性漏检风险；提高采样率增加视觉 token 和计算。可采用场景切换/运动触发、关键片段二次采样或 coarse-to-fine 策略，但采样器本身也会产生偏差。每个 frame/clip 保留原始时间戳、采样规则和 source offset。\n\n**Temporal grounding** 要求模型把回答关联到可验证的时间区间，而不只是描述“视频里发生了什么”。音频、字幕和视觉帧可能互相冲突；应保留各模态证据并显式呈现不确定性。Video-MME 等基准覆盖不同视频长度、领域和多模态输入，评测时仍需防止字幕泄漏、答案线索和数据集污染。\n\n**生产指标**：事件 Recall、时间定位误差、片段级引用支持率、长视频性能衰减、采样 token 成本和 P95 延迟。对没有采样覆盖的时间段，系统必须承认“未观察到”，不能声称“未发生”。"
}],assessments:[{id:"m09-05-multimodal-capstone",type:"design-review",prompt:"为视频会议分析系统提交多模态架构，覆盖抽帧、ASR、时间同步、模态级评测、成本、隐私和降级。",rubric:[{criterion:"架构完整",description:"音频/视频/文本管线及时间戳清楚",points:3},{criterion:"评测体系",description:"定义模态级和端到端指标",points:3},{criterion:"治理",description:"覆盖媒体权限、保留、删除和成本",points:4}]}],sources:[
{title:"Video-LLaMA: An Instruction-tuned Audio-Visual Language Model for Video Understanding",url:"https://arxiv.org/abs/2306.02858",publisher:"Zhang et al., 2023 (v4)",note:"Video Q-Former 与 Audio Q-Former 融合视频时序和音频信息"},
{title:"Qwen2.5-VL Technical Report",url:"https://arxiv.org/abs/2502.13923",publisher:"Bai et al., 2025",note:"视觉语言模型与视频理解"},
{title:"NIST Privacy Framework 1.0 / 1.1 status",url:"https://www.nist.gov/privacy-framework",publisher:"NIST",note:"Privacy Framework 1.0 为现行最终版；1.1 仍是 Initial Public Draft，2025-06-13 评论期结束，尚未发布最终版"},
{title:"Video-MME: The First-Ever Comprehensive Evaluation Benchmark of Multi-modal LLMs in Video Analysis",url:"https://arxiv.org/abs/2405.21075",publisher:"Fu et al., CVPR 2025",note:"长短视频与多模态视频理解评测"}
]}
];
