# M09 实验工作簿：多模态表示、生成与时序工程

> 课程版本：0.40.9

> **证据等级：** E2 Simulated（媒体 Token/延迟/PCM 预算）+ E3 Local-tested（公式测试）；不证明真实多模态模型或 GPU 性能。 统一定义见[全课程证据等级](../CURRICULUM_EVIDENCE_LEVELS.md)。

> 五项实验对应 M09 五讲。所有程序均为 Python 标准库确定性计算，不加载图像/音频模型、不调用 GPU、不上传媒体文件。样本均为虚构教学数据。

## 学习成果

完成本工作簿后，学习者应能够：
1. 区分对比式表示对齐、成对 sigmoid 目标和条件生成目标；
2. 计算视觉 patch/token 预算，比较 resize、tiling 与动态分辨率；
3. 分离扩散模型训练目标、采样器 NFE 和 CFG 的影响；
4. 计算音频存储、WER、chunk overlap 与流式延迟；
5. 设计视频抽帧、事件覆盖、时间戳同步和隐私评测。

## 环境与运行

Python 3.10+，从仓库根目录执行，无第三方依赖：

    python3 examples/m09/01_multimodal_alignment.py
    python3 examples/m09/02_vision_token_budget.py
    python3 examples/m09/03_diffusion_sampling_budget.py
    python3 examples/m09/04_streaming_audio_metrics.py
    python3 examples/m09/05_video_timeline_budget.py
    python3 -m unittest discover -s examples/m09 -p 'test_examples.py'

---

## 实验一：图文表示对齐与负样本诊断

**对应课程：** 第一讲《多模态架构与表示对齐》

### 任务

解释 batch 内对比学习如何形成正负配对，并比较负样本数量、温度和错误配对对学习信号的影响。

### 操作

1. 运行 01_multimodal_alignment.py。
2. 手工构造一个 batch 的 image-to-text 相似度矩阵。
3. 对同一对正样本改变 temperature，观察 softmax 概率变化。
4. 标记重复图文、语义 false negative 和错误配对。
5. 比较 CLIP 类 softmax 对比目标与 SigLIP pairwise sigmoid 目标的归一化差异。

### 必须提交

- 正样本/负样本矩阵；
- temperature 变化对梯度分布的定性解释；
- 错误配对与 false negative 风险清单；
- image-to-text、text-to-image 和跨语言分层评测计划；
- Recall@K 与人工语义审查方案。

### 常见错误

- 将高 cosine similarity 直接等同于理解；
- 把 batch 内所有非匹配项都当作真正负样本；
- 忽略温度、重复样本和数据来源偏差；
- 将 embedding retrieval 与生成式跨模态推理混为一谈。

---

## 实验二：ViT、动态分辨率与视觉 Token 预算

**对应课程：** 第二讲《Vision Transformer 与视觉编码》

### 任务

比较固定 resize、不同 patch size 和多图/多 tile 输入的 token 成本，并解释动态分辨率的质量与资源权衡。

### 操作

1. 运行 02_vision_token_budget.py。
2. 计算 384×384、patch=16/8 的 patch 数和 attention pair 数。
3. 对 16:9、4:3、长截图三种输入设计 resize、crop、tiling 或 native aspect ratio 策略。
4. 为 OCR、图表、细小目标和全局场景分别确定 token 预算。
5. 记录图像预处理版本和模型输入限制。

**基准复算（单张 384×384 图像，另加 1 个 CLS token 和 64 个文本 token）：** patch=16 时为 576 个 patch token、序列长度 641、全注意力 token pair 上界 410,881；patch=8 时为 2,304 个 patch token、序列长度 2,369、全注意力 token pair 上界 5,612,161。patch token 数增长 4 倍；由于 CLS/文本 token 固定开销，合并序列的 pair 数增长约 13.66 倍。若只计算图像 patch 自注意力，pair 数增长为 16 倍。该估算假设标准全注意力，不适用于窗口/稀疏/分层注意力实现。

### 必须提交

- patch/CLS/token 计算表；
- 标准全注意力复杂度估算；
- resize/crop/tiling/native resolution 的信息损失比较；
- 任务质量、token、延迟、显存的联合评测方案；
- 高分辨率输入的降级策略。

### 常见错误

- 把 patch 数增长 4 倍误说成注意力计算也只增长 4 倍；
- 认为更高分辨率必然更准确；
- 忽略长宽比变化、crop 丢失和 tile 间全局关系；
- 不把多图和文本 token 纳入同一个上下文预算。

---

## 实验三：扩散采样器、CFG 与 NFE 预算

**对应课程：** 第三讲《图像生成与视觉条件控制》

### 任务

为固定模型和提示词设计 sampler 对照实验，区分采样步数、NFE、CFG 和图像质量。

### 操作

1. 运行 03_diffusion_sampling_budget.py。
2. 对 CFG=2/4/7/10 设计固定 seed 的对照矩阵。
3. 比较 10/20/30 NFE 的推理调用预算。
4. 解释 latent compression 对显存/速度和重建质量的双重影响。
5. 设计人评 rubric，分别标注 prompt adherence、视觉质量、多样性和伪影。

### 必须提交

- sampler/NFE/CFG 实验矩阵；
- 每组网络前向调用次数估算；
- 质量—延迟—显存联合指标；
- 至少一个过高 CFG 或低 NFE 失败案例；
- 模型 checkpoint、scheduler、seed 和推理参数记录。

### 常见错误

- 将 NFE 与 scheduler steps 永远视为同一个数字；
- 将论文在特定数据集上的 FID/速度直接套用到其他模型；
- 同时改变 sampler、CFG、seed 和分辨率后归因；
- 只用 CLIP 分数替代人评与任务特定评测。

---

## 实验四：流式 ASR、WER 与音频时延

**对应课程：** 第四讲《Audio Tokenization、语音识别与生成》

### 任务

计算 PCM 音频大小、WER 和流式 chunk 延迟，比较离线转写与实时交互的指标差异。

### 操作

1. 运行 04_streaming_audio_metrics.py。
2. 计算 16kHz/16-bit/mono/60 秒 PCM 的原始字节数。
3. 以替换、删除、插入错误计算 WER。
4. 比较 chunk=1/2/4 秒和不同 overlap/look-ahead 的端到端延迟。
5. 设计 partial/stable/final transcript 与 diarization 事件结构。

### 必须提交

- PCM 数据量和带宽计算；
- WER 逐项计算；
- chunk/overlap/look-ahead 延迟预算；
- WER、DER、first-token latency、endpoint latency 的分层指标；
- 录音同意、加密、访问、保留和删除策略。

### 常见错误

- 将 WER 当作实时交互质量的唯一指标；
- 不记录 partial transcript 的修订；
- 把 diarization 说话人编号当作真实身份认证；
- 忽略口音、噪声、语言切换和重叠发言。

---

## 实验五：视频抽帧、事件覆盖与时间轴同步

**对应课程：** 第五讲《多模态系统工程与综合评测》

### 任务

比较固定抽帧率对短事件的覆盖风险，并设计带原始时间戳和不确定性的跨模态事件索引。

### 操作

1. 运行 05_video_timeline_budget.py。
2. 计算 30fps 视频每秒抽 1/2/5/10 帧的采样比例。
3. 对 100ms、250ms、1s 事件估算固定间隔抽帧的漏检风险。
4. 设计音频、字幕和视频帧统一时间轴及同步误差预算。
5. 为未采样时间段、媒体损坏和模态冲突定义回答状态。

### 必须提交

- 抽帧率、帧数和视觉 token 预算；
- 短事件覆盖/漏检分析；
- event_id、media_offset、timestamp、modality、source_ref 和模型版本 schema；
- 事件 Recall、时间定位误差和引用支持率评测；
- 视频/音频隐私、访问授权、保留和删除传播方案。

### 常见错误

- 认为每秒一帧可以代表整秒视频；
- 把未观察到事件描述成事件没有发生；
- 忽略音视频时钟漂移和字幕延迟；
- 不保留采样策略和原始媒体 offset，导致无法回溯。

---

## 统一评分建议

| 维度 | 权重 | 达标证据 |
|---|---:|---|
| 表示对齐 | 20% | 正负样本、温度、错误配对与跨模态指标 |
| 视觉预算 | 20% | Patch/token/attention 计算与动态分辨率取舍 |
| 生成工程 | 20% | NFE、CFG、采样器与盲评实验设计 |
| 语音工程 | 20% | PCM、WER、流式延迟、Diarization 与隐私 |
| 视频系统 | 20% | 抽帧覆盖、时间同步、事件 Grounding 与治理 |

所有数值必须标明是解析计算、合成样本还是模型实测。未运行真实模型的脚本不能被描述为多模态模型能力或 GPU 性能验收。
