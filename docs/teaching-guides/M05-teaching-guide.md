# M05 教师教学指南与作业参考解答

> 课程版本：0.40.9

> **证据评阅：** 教师应按[全课程证据等级](../CURRICULUM_EVIDENCE_LEVELS.md)区分设计、静态审阅、模拟/Mock、本地测试、目标环境测试和生产观测；只为实际覆盖范围授予等级。

>
> 本指南为教学参考，不代表特定推理引擎的实测性能承诺。

## 使用方式与课前准备

- 建议每讲 75–90 分钟，先手算再使用推理引擎/实验室观察。
- 准备 GPU 显存单位换算表：1 GiB = (2^{30}) bytes；1 GB = (10^9) bytes。
- 明确区分 TTFT（首 token 延迟）、TPOT（每输出 token 时间）、端到端延迟、吞吐和并发。
- 所有容量题先列公式和单位，再代数值；估算值与实测值必须分栏。

## 第一讲：Prefill、Decode 与 KV Cache

### 关键推导：KV Cache 容量

每层每个 token 需要缓存 K 与 V。若：
- 层数 (L)
- batch/并发序列数 (B)
- 每序列缓存长度 (T)
- KV heads 数 (H_{kv})
- head dimension (d)
- 每元素字节数 (s)

则：

\[
M_{KV}=2\times L\times B\times T\times H_{kv}\times d\times s
\]

前面的 2 对应 K 与 V。该式假设各层维度相同、所有序列长度相同且未考虑分页元数据、碎片、前缀共享、滑动窗口或混合精度。

**题目参数：** (L=32,B=4,T=16384,H_{kv}=8,d=128,s=2)（BF16）。

\[
M=2\times32\times4\times16384\times8\times128\times2
=8,589,934,592\text{ bytes}=8\text{ GiB}
\]

这是四条序列合计，平均每条序列 2 GiB。实际 allocator 还会受 block size、预留容量、碎片、并发长度分布和 cache reuse 影响。

### 课前准备
- 复习 tensor shape、字节单位、MHA/MQA/GQA。
- 准备一次请求的 Prefill 与逐 token Decode 时间线。
- 让学生先估算再观察实际 cache 分配，不以单次运行数据代替容量模型。

### 学习检查点
1. **Prefill 做什么？** 并行处理输入 prompt，计算各层隐藏状态并建立 KV cache。
2. **Decode 为什么逐步执行？** 自回归生成依赖前一个新 token；每步通常只为新 token 计算 Q/K/V 并读取历史 cache。
3. **GQA 为什么降低 KV？** KV heads 少于 query heads，减少缓存中的 K/V 头数；但 query heads 与 KV heads 的映射需符合模型架构。

### 课后复习
- 对 batch=1、2、8 重新计算 KV。
- 比较 MHA 的 (H_{kv}=32) 与 GQA 的 (H_{kv}=8)，其他参数相同则 KV 约为四分之一。
- 解释分页分配如何缓解外部碎片，及其不能消除的开销。

### 正式作业参考解答

**原始作业：** 计算 32 层、8 KV heads、head_dim=128、BF16、batch=4、每请求 16k token 的理论 KV 容量，并说明分页分配和共享前缀如何改变实际占用。

8 GiB 总 KV，2 GiB/sequence。Paged allocation 以 block 分配可减少连续大块预留和外部碎片；共享前缀在语义与实现允许时可复用共同前缀的 KV，降低重复存储。实际值仍需加上 block rounding、metadata、workspace 和运行时预留。评估必须区分理论容量与引擎报告的 allocated/reserved/used memory。

**评分对照（10 分）：** 公式单位 4；GQA/MQA 影响 3；生命周期、隔离、回收或共享 3。

**常见错误：**
- 忘记 K 和 V 的系数 2。
- 用 query heads 代替 KV heads。
- 将 GB 与 GiB 混用。
- 忽略 batch 乘数，把总缓存误当成单请求缓存。
- 把分页机制描述为压缩模型权重。

## 第二讲：解码策略与生成分布

### 关键推导：Temperature

给定 logits (z=[2,1,0])，temperature 为 (	au) 时：

\[
p_i=\frac{\exp(z_i/\tau)}{\sum_j\exp(z_j/\tau)}
\]

- (	au=1)：softmax([2,1,0]) ≈ [0.665, 0.245, 0.090]。
- (	au=2)：softmax([1,0.5,0]) ≈ [0.506, 0.307, 0.186]。

较高 temperature 使分布更平坦；较低 temperature 使高 logit 项更占优势。temperature 不改变 logits 排序，但会改变概率集中程度。

**Top-k 与 Top-p：**
- (	au=1)、top-k=2：保留前两项，重新归一化后约 [0.731, 0.269]。
- (	au=1)、top-p=0.8：按概率排序，第一项累计 0.665 未达 0.8，加入第二项累计 0.910，因此保留前两项。
- (	au=2)、top-p=0.8：第一项累计 0.506，加入第二项累计 0.813，因此仍保留前两项。
- 实际采样顺序、min-p、typical sampling 等参数依实现而异；报告必须记录完整配置。

### 课前准备
- 准备 logits、softmax 计算器或小型 notebook。
- 先让学生解释 logits、probabilities、sampled token 三个层次。
- 准备 greedy、top-k、top-p、temperature 的对照样例。

### 学习检查点
1. **Temperature 作用于什么？** 通常作用于 softmax 前的 logits 除法，不是对 token ID 做变换。
2. **Top-k 和 top-p 区别？** Top-k 固定候选数量；top-p 保留累计概率达到阈值的最小排序前缀。
3. **相同 seed 是否必然完全一致？** 不必然。硬件 kernel、并行归约、引擎版本和非确定性算子都可能影响结果。

### 课后复习
- 手算另一组 logits，比较 (	au=0.5,1,2)。
- 写出生成复现实验必须保存的模型、tokenizer、sampling config、seed 和 runtime 版本。
- 区分 stop sequence、EOS、max_new_tokens 和业务层截断。

### 正式作业参考解答

**原始作业：** 计算 logits=[2,1,0] 在 τ=1 和 τ=2 时的近似 Softmax 概率；说明 top-k=2 与 top-p=0.8 的候选集及其差异。

τ=1 的概率约 [0.665,0.245,0.090]；τ=2 约 [0.506,0.307,0.186]。top-k=2 保留最大两项，不考虑累计概率；top-p=0.8 根据排序累计概率选择候选集，以上两个温度例子均保留前两项，但原因是累计和分别达到 0.910、0.813。随后在保留集合内重新归一化并采样。

**评分对照（10 分）：** 概率计算 4；截断规则 3；复现配置 3。

**常见错误：**
- 对概率而不是 logits 做 temperature 缩放。
- 认为 top-p=0.8 永远保留 80% token。
- top-k 后忘记重新归一化。
- 不记录 tokenizer、模型版本和完整生成参数。

## 第三讲：Batching 与请求调度

### 课前准备
- 准备长短请求混合的 arrival trace。
- 画出 static batching 的 padding 与 straggler；对比 iteration-level scheduling。
- 复习吞吐、并发、队列长度和 P95/P99 延迟。

### 教学重点
- Static batching：同一 batch 内请求通常受最长序列/最长生成任务牵制。
- Continuous batching：请求完成后可在迭代边界补入新请求，提高 GPU 时间利用率。
- Scheduler 同时要管理 token budget、KV block、队列优先级、deadline、取消和租户公平。
- 不能只优化 aggregate tokens/s；交互任务还需关注 TTFT，生成阶段需关注 TPOT。

### 学习检查点
1. **为什么高吞吐可能伴随更差的 P95 TTFT？** 队列等待和长请求占用资源会增加短请求排队时间。
2. **背压是什么？** 当系统容量不足时限制新工作进入，防止队列无限增长。
3. **取消请求为什么要释放资源？** 否则 KV cache 和调度槽位被无效任务占用。

### 课后复习
设计三个租户：交互、批量摘要、低优先级后台任务。定义权重、并发上限、队列上限、deadline 和抢占/取消规则。

### 正式作业参考解答

**原始作业：** 设计三租户 continuous batching 策略，在提升输出 token 吞吐的同时为交互请求设定 P95 TTFT 目标。

建议采用分层队列与 token-aware continuous batching：
- Interactive：较高优先级、严格并发/排队上限、TTFT SLO；超限快速拒绝或降级。
- Batch：较低优先级、较大 batch，允许延后执行。
- Background：最低优先级，利用空闲窗口。
- 采用 per-tenant quota/weighted fair queue，避免单一租户占满 KV。
- 监控 P50/P95/P99 TTFT、TPOT、queue wait、output tokens/s、active sequences、KV occupancy、preemption 和 rejection。
- 过载时先背压，再按策略拒绝/延后低优先级任务；不可无限排队。
- 简化 M/M/1 中系统逗留时间 W=1/(μ−λ)，纯排队等待时间 Wq=λ/[μ(μ−λ)]；两者不可混称。LLM 推理有非指数服务时间和 token-aware 调度，此模型只用于说明 λ 接近 μ 时延迟急剧上升。
- 目标 P95 TTFT 必须由业务方定义并通过压测校准，不能凭空写一个通用数值。

**评分对照（10 分）：** 调度机制 4；指标公平 3；过载处理 3。

**常见错误：**
- 把吞吐等同于延迟。
- 只写“优先级高”，不定义队列上限和公平策略。
- 不考虑 KV cache 是调度资源。
- 没有取消、超时和请求完成后的 cache 回收。

## 第四讲：Speculative Decoding 与量化

### 关键推导：权重存储理论下限

若模型有 13B 参数，仅计算权重 payload：
- FP16/BF16：(13\times10^9\times2=26\) GB（约 24.2 GiB）。
- INT8：(13\times10^9\times1=13) GB（约 12.1 GiB）。
- INT4：(13\times10^9\times0.5=6.5) GB（约 6.05 GiB）。

这是十进制 GB 的理想 payload，不含 scale/zero-point、group metadata、padding、未量化层、embedding、临时 buffer 和 runtime workspace。实际显存通常更高。

### Speculative Decoding
Draft model 先提出若干候选 token，target model 对候选序列并行验证；符合目标分布的前缀可接受，遇到不符合条件的位置按算法规则修正并继续。它减少 target model 的串行 decode 步数，但收益取决于 draft 接受率、验证成本、batch、模型匹配和实现。

### 课前准备
- 准备权重存储表和 scale/zero-point 示例。
- 画出 draft → verify → accept/reject 的序列流程。
- 说明权重量化、激活量化、KV 量化是不同对象。

### 学习检查点
1. **INT4 是否意味着整个模型显存正好为 FP16 的四分之一？** 不一定，metadata、未量化层和运行时内存仍存在。
2. **Speculative decoding 是否改变目标模型分布？** 正确实现的验证/接受算法旨在保持目标分布；不能把任意“draft token 直接采纳”称为等价算法。
3. **权重 INT4 能解决 KV OOM 吗？** 不能直接解决；KV 是另一类随并发和上下文增长的内存。

### 课后复习
- 对 7B、13B、70B 重新计算三种精度的理论 payload。
- 设计量化前后质量/延迟/吞吐/显存对照实验。
- 说明 speculative acceptance rate 与端到端速度提升并非线性等价。

### 正式作业参考解答

**原始作业：** 对 13B 参数模型比较 FP16、INT8、INT4 理论权重存储，并设计 32k context 多并发服务的量化评估计划。

13B 权重理论 payload 为 FP16 26GB、INT8 13GB、INT4 6.5GB。报告需同时列出量化算法、group size、scale/zero-point、异常层处理、激活/KV 精度、硬件 kernel 支持和质量回归。公平对照固定任务集、采样配置、batch、context、并发和硬件；指标至少含任务质量、P95 TTFT、TPOT、吞吐、峰值显存。Speculative decoding 需单独评估 draft 接受率和验证开销。

**评分对照（10 分）：** 存储估算 3；机制区分 3；验证计划 4。

**常见错误：**
- 把 GB 与 GiB 混淆。
- 只算权重，不算 KV、activation、workspace。
- 把 weight-only INT4 误称为所有计算均 INT4。
- 把 speculative decoding 与低比特量化当作同一技术。

## 第五讲：推理服务架构与容量工程

### 课前准备
- 准备一张请求从 API Gateway 到 scheduler、model worker、streaming response 的数据路径图。
- 复习 TP、PP、DP 的区别及网络通信开销。
- 准备 OOM、模型不可用、超时、限流和上游 provider 故障场景。

### 教学重点
- TP：切分单层张量/权重，层内需要 collective communication。
- PP：按层切分模型，阶段间传递 activation；流水线 bubble 影响利用率。
- DP：复制模型实例处理不同请求；需要路由和副本负载管理。
- 内存预算至少包括 weights、KV、activations、workspace、communication buffers 和 safety margin。
- SLO 应分解为 availability、TTFT、TPOT、错误率、成本和公平性；不能只报平均延迟。

### 学习检查点
1. **TP 越大越好吗？** 不一定；通信成本和跨节点带宽可能抵消计算分片收益。
2. **OOM 后直接重试是否安全？** 若容量未释放，重试会放大雪崩；应限流、排队或降级。
3. **健康检查应只检查进程存活吗？** 不够；需区分 liveness、readiness、模型加载状态和依赖健康。

### 课后复习
为一个多 GPU 服务画出 API、scheduler、worker、metrics、logs 和 model registry 的依赖关系；标出单点故障和降级路径。

### 正式作业参考解答

**原始作业：** 为 70B 模型设计多 GPU 推理服务，提交并行策略、内存预算、API 数据路径、SLO、监控和 OOM/模型不可用降级方案。

70B 模型设计需先确定精度和设备内存，再拆分权重、KV、激活、workspace、通信 buffer 与余量。根据单卡容量和互联选择 TP/PP/DP 组合；不要只用参数量决定 GPU 数量。服务路径包括鉴权/配额、队列、scheduler、worker、streaming、取消、计量和 tracing。定义 TTFT/TPOT、tokens/s、P95/P99、错误率、OOM、KV occupancy 和成本 SLO。模型不可用时可进入有界队列、切换已评估 fallback、降低最大输出/上下文或返回明确暂不可用；fallback 必须保持租户数据政策与模型质量门槛。

**评分对照（10 分）：** 并行架构 3；容量模型 3；可靠性 4。

**常见错误：**
- 未说明模型精度就给出 GPU 数量。
- 只算权重，不为 KV 留空间。
- 以平均延迟代替 P95/P99。
- 故障时无限重试或切换到未经评估的模型。

## 进阶概念辨析与课堂扩展

### 1. KV Cache 分页管理不是 KV 压缩

PagedAttention 将逻辑 token block 映射到物理 KV blocks，主要解决动态增长、连续大块分配、碎片和共享问题。它不减少单 token 的 K/V 数值维度，也不等同于 INT8/INT4 KV quantization。分页还会引入 block table、尾块浪费和调度管理开销。前缀复用要求 token 前缀、模型/adapter 版本、位置语义和缓存配置兼容，并需要引用计数、copy-on-write 与租户隔离。

### 2. 采样、约束解码与业务校验是三层

Temperature、top-k、top-p、min-p 和 repetition penalty 影响候选分布；grammar-constrained decoding 限制合法 token 序列；应用层解析、Schema validation 和业务规则校验确认输出可用。JSON 语法合法不代表字段事实正确、权限允许或业务结果成立。教师应要求学生分别报告语法成功率、Schema 成功率和任务成功率。

### 3. Continuous batching、chunked prefill 与 phase disaggregation

- Continuous batching 在迭代边界加入/移除请求，管理动态 batch。
- Chunked prefill 将长 prompt 分段调度，减少长 Prefill 对 Decode 的阻塞。
- Prefill/Decode disaggregation 将两阶段放到不同 worker/资源池，允许独立分配硬件和并行策略，但增加 KV/state transfer、网络和故障恢复成本。

三者解决不同层次的问题，不能混为一个优化技术。建议对照 Orca、Sarathi-Serve、DistServe 和 Splitwise 的系统设计。

### 4. Speculative Decoding 的分布保持条件

对 draft 分布 q 采样得到候选 token x，target 分布为 p，标准接受概率为 min(1,p(x)/q(x))；若拒绝，按归一化残差分布 max(0,p−q) 修正采样。不能直接将 draft token 无条件采纳并声称与 target sampling 等价。速度收益还取决于 draft 成本、接受率、验证成本、batch 和内存带宽。

### 5. Goodput 与 SLO-aware admission control

Throughput 是完成速率；Goodput 只计满足定义的质量/延迟/错误率约束的有效请求。Admission control 应在接收请求前检查队列、KV、token 预算、租户配额和 deadline，决定接收、排队、拒绝、降级或路由。压测必须覆盖长短 prompt/output、并发、突发到达、取消、缓存命中和租户分布，并报告 P50/P95/P99 TTFT、TPOT、goodput、tokens/s、KV occupancy、OOM/rejection 与单位有效请求成本。

## 教师批改总表

| 讲次 | 核心计算/能力 | 必须提交 | 高频误区 |
|---|---|---|---|
| 1 | KV cache 公式 | 逐项容量表 | K/V、batch、GiB 漏算 |
| 2 | Softmax/temperature | 概率与候选集合 | top-p 不是固定数量 |
| 3 | Scheduler | 队列、公平性、SLO | 吞吐不等于低延迟 |
| 4 | 量化存储/Speculative | 公平对照实验 | 权重不等于总显存 |
| 5 | 并行/容量/SLO | 架构与降级图 | 只按参数量选 GPU |

