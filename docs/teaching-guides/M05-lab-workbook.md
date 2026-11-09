# M05 实验工作簿：从单请求生成到推理服务容量

> 课程版本：0.40.9

> **证据等级：** E2 Simulated（KV/队列/容量模型）+ E3 Local-tested（本地测试）；不证明真实推理引擎吞吐或 GPU 显存。 统一定义见[全课程证据等级](../CURRICULUM_EVIDENCE_LEVELS.md)。

> 五项实验对应 M05 五讲。代码仅使用 Python 标准库，不需要 GPU、模型权重、API Key 或真实用户数据。所有容量与性能数字均为教学假设，不代表具体推理引擎的实测值。

## 学习成果

完成工作簿后，学习者应能够：

1. 推导 KV Cache 内存并解释 PagedAttention 的块分配与前缀复用边界；
2. 计算 Temperature、Top-k、Top-p 对生成分布的影响；
3. 区分 Continuous Batching、Chunked Prefill 和 Prefill/Decode 分离；
4. 解释 Speculative Decoding 的接受/拒绝校正与量化的资源—质量权衡；
5. 建立包括权重、KV、激活、运行时和 SLO 的容量评审。

## 环境

- Python 3.10+
- 从仓库根目录执行
- 无第三方依赖

    python3 examples/m05/01_kv_cache_budget.py
    python3 examples/m05/02_decoding_distribution.py
    python3 examples/m05/03_queueing_budget.py
    python3 examples/m05/04_quantization_speculative.py
    python3 examples/m05/05_serving_capacity.py
    python3 -m unittest discover -s examples/m05 -p 'test_examples.py'

---

## 实验一：KV Cache 容量与分页分配

**对应课程：** 第一讲《Prefill、Decode 与 KV Cache》

### 任务

计算 32 层、8 KV heads、head_dim=128、BF16、16,384 tokens 的单请求 KV Cache；再计算 batch=4 的总量，并比较 block_size=16/32 时的尾块浪费。

### 操作

1. 运行 python3 examples/m05/01_kv_cache_budget.py。
2. 将 batch 改为 4，观察 KV payload 线性变化。
3. 将 tokens 改为 16,385，观察分页块分配的 round-up。
4. 分别改变 KV heads 为 32、8、1，比较 MHA/GQA/MQA 的理论缓存差异。

### 预期结果

单请求理论 KV payload 为 2 GiB；batch=4 为 8 GiB。若 T=16,385、block_size=16，则需 1,025 个 blocks，容量为 16,400 token slots，尾块浪费 15 slots。该计算不包含 block table、allocator metadata、运行时 buffer、碎片和共享前缀收益。

### 必须提交

- 逐项代入公式的容量表；
- GB 与 GiB 换算；
- MHA/GQA/MQA 对 KV head 项的影响；
- block_size=16/32 的内部尾块浪费；
- 前缀共享的兼容条件、引用计数和租户隔离方案。

### 常见错误

- 用 query heads 代替 KV heads；
- 漏掉 K 与 V 的系数 2；
- 将 PagedAttention 误说成 KV 量化或压缩；
- 认为相似语义文本即可共享 KV，而不检查 token 前缀和模型版本。

---

## 实验二：解码分布与约束输出

**对应课程：** 第二讲《解码策略与生成分布》

### 任务

对 logits=[2,1,0] 计算 Temperature=1/2 的 softmax，并对两组概率分别执行 top-k 和 top-p。

### 操作

1. 运行 python3 examples/m05/02_decoding_distribution.py。
2. 修改 temperature、top-k 和 top-p。
3. 对概率 [0.60,0.15,0.15,0.10] 执行 top-p=0.80；对比 top-k=2。
4. 设计一份 JSON Schema，说明 grammar-constrained decoding 和应用侧 Schema/业务校验分别负责什么。

### 预期结果

Temperature=1 时概率约为 [0.665,0.245,0.090]；Temperature=2 时约为 [0.506,0.307,0.186]。对 [0.60,0.15,0.15,0.10]，top-p=0.80 需保留前三项，top-k=2 仍保留两项。过滤后需要重新归一化。

### 必须提交

- 两组 softmax 概率；
- top-k/top-p 候选集与归一化结果；
- 完整采样配置清单；
- 语法合法、Schema 合法、业务正确三层验证矩阵；
- 至少两个“JSON 合法但业务错误”的反例。

### 常见错误

- 把 top-p 解释为固定候选数量；
- 认为低 temperature 能提升事实正确性；
- 只做 JSON parse，不做 Schema 和业务验证；
- 不记录 tokenizer、模型版本、停止条件和采样实现。

---

## 实验三：队列、Continuous Batching 与 Chunked Prefill

**对应课程：** 第三讲《Batching 与请求调度》

### 任务

用 M/M/1 教学模型计算系统逗留时间和纯排队等待时间；为长短 prompt 混合的工作负载设计迭代调度策略。

### 操作

1. 运行 python3 examples/m05/03_queueing_budget.py。
2. 分别设置 arrival rate=15/19 req/s、service rate=20 req/s。
3. 对照 M/M/1 的 W 和 Wq，说明它们不是同一个量。
4. 设计 A/B/C 三条请求：A/B 是短 prompt/长输出交互任务，C 是长 prompt/短输出任务。
5. 对比 colocated continuous batching、chunked prefill 和 disaggregated serving。

### 预期结果

当 μ=20、λ=15 时，M/M/1 系统逗留时间 W=0.2s，纯排队等待 Wq=0.15s；当 λ=19 时，W=1.0s，Wq=0.95s。该模型假设 Poisson 到达和指数服务时间，不是 LLM serving 的精确模拟，只用于理解系统接近饱和时延迟上升。

### 必须提交

- W、Wq、利用率和假设；
- 至少 10 个离散调度 step 的时间线；
- A/B/C 的 TTFT、TPOT、完成时间；
- queue limit、deadline、tenant quota、cancel、KV release 和 backpressure；
- 三种优化路径的瓶颈、网络成本和适用条件。

### 常见错误

- 把 W=1/(μ−λ) 称为纯排队等待时间；
- 将请求/s、输入 token/s 和输出 token/s 混为一谈；
- 认为 continuous batching、chunked prefill、phase disaggregation 是同一技术；
- 只最大化总吞吐而不定义 P95/P99 TTFT 和公平性。

---

## 实验四：量化存储与 Speculative Decoding

**对应课程：** 第四讲《Speculative Decoding 与量化》

### 任务

对 13B 参数模型估算 FP16、INT8、INT4 理论权重 payload；计算一个 draft token 的接受概率和拒绝残差分布。

### 操作

1. 运行 python3 examples/m05/04_quantization_speculative.py。
2. 将参数量改为 7B 和 70B。
3. 对 target p=[0.5,0.5]、draft q=[0.8,0.2] 计算残差分布。
4. 设计量化前后公平评测矩阵，固定模型、Tokenizer、提示集、采样参数、并发和硬件。

### 预期结果

13B 参数权重理论 payload：FP16=26GB、INT8=13GB、INT4=6.5GB（十进制）。这些值不包含 scale、zero-point、group metadata、未量化层、KV、激活和 workspace。

若候选 token 的 target probability p(x)=0.1、draft probability q(x)=0.2，则接受概率 min(1,p/q)=0.5。拒绝时使用归一化 residual max(0,p−q)，不能直接无条件采纳 draft token 并宣称分布等价。

### 必须提交

- 权重 payload 表和完整显存遗漏项；
- speculative accept/reject 数学步骤；
- GPTQ、AWQ、SmoothQuant 的对象和机制差异；
- 量化方法、group size、校准集、kernel 版本；
- task quality、TTFT、TPOT、吞吐、峰值显存和并发对照。

### 常见错误

- 将权重 payload 写成总 VRAM；
- 把 weight-only INT4 误称为全链路 INT4；
- 把 draft acceptance rate 直接当成端到端加速比；
- 将量化和 speculative decoding 当成同一种优化技术。

---

## 实验五：推理服务容量与 SLO 评审

**对应课程：** 第五讲《推理服务架构与容量工程》

### 任务

在 80 GiB 总显存、50 GiB 权重、5 GiB 固定开销、10% 安全预留、单请求 KV=2 GiB 的教学假设下估算 KV 预算和理论并发上限。

### 操作

1. 运行 python3 examples/m05/05_serving_capacity.py。
2. 修改权重、固定开销和安全预留，观察并发上限。
3. 设计 70B 模型多 GPU 服务，列出 TP/PP/DP/EP 选择和通信路径。
4. 为交互、批处理和后台租户定义 admission control。
5. 设计 open-loop 压测矩阵和回滚阈值。

### 预期结果

可用预算为 80×(1−10%)−50−5=17 GiB；除以每请求 2 GiB，理论上限为 8 个并发请求。真实服务必须进一步考虑请求长度分布、block rounding、KV sharing、workspace、通信 buffer、GPU 拓扑、调度开销和 SLO 余量。

### 必须提交

- 权重/KV/激活/workspace/通信/安全余量账本；
- 服务数据路径和并行拓扑图；
- Admission control 状态表；
- P50/P95/P99 TTFT、TPOT、goodput、tokens/s、OOM/rejection 指标；
- 最大可持续负载、SLO 违反率、降级与回滚策略。

### 常见错误

- 只按参数量或显存总和决定 GPU 数量；
- 把理论并发上限当成压测容量；
- 只报平均延迟或 aggregate tokens/s；
- 故障时无限重试，或回退到未经评估的模型。

---

## 统一评分建议

| 维度 | 权重 | 达标证据 |
|---|---:|---|
| 公式与单位 | 20% | KV、权重、排队公式可复算，单位正确 |
| 算法理解 | 20% | 采样、截断、Speculative acceptance 解释准确 |
| 系统调度 | 20% | 区分 batching、chunked prefill、phase disaggregation |
| 可复现实验 | 20% | 环境、配置、输入分布、输出和限制完整 |
| 容量与可靠性 | 20% | 内存账本、SLO、过载策略和回滚证据完整 |

所有数字必须标注是理论估算、教学模型还是实测结果。未在目标硬件上运行的容量设计不得标记为生产验收通过。
