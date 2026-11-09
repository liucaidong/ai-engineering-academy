# M05 可复现实验代码

M05 的五个 Python 标准库计算器覆盖 KV Cache、采样、排队、量化/推测解码和推理服务容量。无需 GPU、模型权重或第三方依赖。

## 环境与运行

Python 3.10+，从仓库根目录执行：

    python3 examples/m05/01_kv_cache_budget.py
    python3 examples/m05/02_decoding_distribution.py
    python3 examples/m05/03_queueing_budget.py
    python3 examples/m05/04_quantization_speculative.py
    python3 examples/m05/05_serving_capacity.py
    python3 -m unittest discover -s examples/m05 -p 'test_examples.py'

## 文件映射

| 文件 | 课程主题 | 输出 |
|---|---|---|
| 01_kv_cache_budget.py | Prefill/Decode、KV Cache、PagedAttention | 理论 KV payload、block-rounded 容量和尾块开销 |
| 02_decoding_distribution.py | Temperature、Top-k、Top-p | softmax 概率和截断后分布 |
| 03_queueing_budget.py | Batching 与排队 | M/M/1 利用率、系统时间和纯排队时间 |
| 04_quantization_speculative.py | 量化与 Speculative Decoding | 权重 payload、候选接受率和残差分布 |
| 05_serving_capacity.py | 容量工程与 admission control | KV 预算和理论并发上限 |

## 重要边界

- KV 公式不含 allocator metadata、block table、碎片、运行时 buffer 和共享前缀收益。
- Top-p 依概率排序保留最小前缀；具体服务的处理顺序、tie handling 和额外参数可能不同。
- M/M/1 是排队论教学模型，不是 LLM 服务的真实到达/服务分布模拟。
- 量化 payload 不是峰值 VRAM；Speculative acceptance 示例是单 token 机制，不代表端到端加速比。
- 并发上限计算是理论上界，不替代真实负载压测和 SLO 容量验收。
