# M02 实验工作簿：Transformer 与 Attention

> 课程版本：0.40.9

> **证据等级：** E2 Simulated（固定矩阵/玩具 Attention Lab）+ E3 Local-tested（本地代码与测试）；不证明真实 GPU 或模型权重。 统一定义见[全课程证据等级](../CURRICULUM_EVIDENCE_LEVELS.md)。

> 配合浏览器内 Transformer Attention Lab。Lab 使用固定小矩阵，不加载真实权重、不代表 GPU 性能。手算结果应与 Lab 输出交叉核对。

## 学习成果
能够推导 Q/K/V、计算 scaled dot-product attention、解释多头和 Mask、位置机制、Transformer Block 与推理复杂度。

## 实验环境
- 浏览器内 Transformer Lab；
- 纸笔或计算器；
- 无需 GPU、API Key 或模型权重。

## 实验一：单头 Attention 手算
**对应课程：** 第一讲《从序列到注意力》

给定 Q=[1,0]，K1=[1,0]，K2=[0,1]，V1=[2,0]，V2=[0,4]。

1. 计算两个未缩放点积；
2. 按 key 维度 d_k=2 使用 sqrt(d_k) 缩放；
3. 计算 Softmax 权重；
4. 对 V 做加权求和；
5. 与 Transformer Lab 中等价输入对照，记录浮点误差和实现假设。

提交：中间分数、权重、输出向量、Lab 对照结果。

## 实验二：多头维度与 Mask
**对应课程：** 第二讲《Multi-Head Attention 与 Mask》

1. 对 d_model=8、h=2 推导每个 head 的维度；
2. 画出 Q/K/V 投影、分头、Attention、拼接和输出投影；
3. 比较 causal mask 与 padding mask；
4. 构造一个未来 token 不可见的测试和一个 padding key 不参与注意力的测试。

提交：张量形状表、Mask 矩阵、两项预期结果和负向测试。

## 实验三：位置机制比较
**对应课程：** 第三讲《位置机制》

对 learned absolute position embedding、sinusoidal position encoding、relative position bias 和 RoPE 建立对照表。

必须讨论：
- 位置信息如何进入计算；
- 对相对位置信息的表达方式；
- 长度外推的限制和证据；
- 不能从某一模型的实现推断所有 Transformer 都采用相同机制。

提交：机制对照表和一段不超过 300 字的选型说明。

## 实验四：Transformer Block 数据流
**对应课程：** 第四讲《走进 Transformer Block》

画出一个 Pre-LN Transformer Block，标出 Attention、Residual、LayerNorm、FFN 和输出形状。再比较 Post-LN 的主要结构差异。

提交：结构图、每一步张量形状、两个常见实现错误及检测办法。

## 实验五：复杂度与推理优化边界
**对应课程：** 第五讲《从理论到推理》

1. 写出标准全注意力随序列长度变化的主要计算/内存增长项；
2. 解释 KV Cache 如何避免自回归 Decode 时重复计算历史 K/V；
3. 解释 FlashAttention 的 IO-aware 分块思想；
4. 区分数学结果、内存优化、内核效率和实际端到端延迟；
5. 说明 Prefill 与 Decode 的不同瓶颈。

提交：复杂度表、KV Cache 数据流、优化边界说明。

## 统一评价 Rubric（每项 2 分，共 10 分）
| 维度 | 2 分标准 |
|---|---|
| Attention 推导 | 分数、缩放、Softmax 和加权输出正确 |
| 张量与 Mask | 维度一致，causal/padding 语义正确 |
| 位置机制 | 能解释差异和外推限制 |
| Block 结构 | 组件、残差、归一化和 FFN 位置准确 |
| 工程边界 | 区分复杂度、KV Cache、IO 优化与实测性能 |

低于 7 分需重做错误推导；Mask 语义错误或把 FlashAttention 误述为改变标准注意力定义时必须重做对应部分。


## 延伸阅读与来源

- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)：Scaled dot-product attention 和 Transformer 原始论文。
- [PyTorch MultiheadAttention](https://docs.pytorch.org/docs/stable/generated/torch.nn.MultiheadAttention.html)：多头注意力接口、维度和 Mask 参数。
- [FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness](https://arxiv.org/abs/2205.14135)：IO-aware exact attention 和分块计算。
- [The Annotated Transformer](https://nlp.seas.harvard.edu/annotated-transformer/)：Attention/Transformer 的代码和张量形状讲解。
