# M09 可复现实验代码

五个 Python 标准库示例覆盖跨模态对齐、视觉 token 预算、扩散采样 NFE、流式音频指标和视频时间轴。无需 GPU、模型权重、媒体文件或 API Key。

## 环境与运行

Python 3.10+，从仓库根目录执行：

    python3 examples/m09/01_multimodal_alignment.py
    python3 examples/m09/02_vision_token_budget.py
    python3 examples/m09/03_diffusion_sampling_budget.py
    python3 examples/m09/04_streaming_audio_metrics.py
    python3 examples/m09/05_video_timeline_budget.py
    python3 -m unittest discover -s examples/m09 -p 'test_examples.py'

## 文件映射

| 文件 | 课程主题 | 输出 |
|---|---|---|
| 01_multimodal_alignment.py | 图文表示对齐 | 对比损失、温度与 pairwise sigmoid |
| 02_vision_token_budget.py | ViT 与动态分辨率 | Patch、CLS、文本 token 和 attention pair 预算 |
| 03_diffusion_sampling_budget.py | 图像生成 | CFG 调用数、NFE 与推理延迟估算 |
| 04_streaming_audio_metrics.py | ASR/TTS 工程 | PCM 字节、WER 和流式延迟 |
| 05_video_timeline_budget.py | 视频理解 | 抽帧数、事件覆盖概率和时间戳容差 |

## 重要边界

- 对比学习计算使用合成相似度矩阵，不训练 CLIP/SigLIP，不产生真实 embedding。
- 视觉预算使用标准全注意力上界，不模拟窗口注意力、动态视觉编码器或真实显存。
- Diffusion 只估算去噪网络调用数，不生成图像，不比较真实 sampler 质量。
- 音频程序计算 PCM/WER/延迟公式，不执行 ASR、TTS 或 speaker diarization。
- 视频事件捕获概率假设理想周期采样且事件相位均匀随机，不代表真实视频 benchmark。
- 所有数据都是教学样本；生产质量必须使用目标模型、真实数据和人工标注集验证。
