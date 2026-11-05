import type { Course } from "../types/course";

/**
 * Flagship M02 course: Transformer and Attention.
 * The sequence moves from a hand-computable attention example to the
 * architecture and systems concerns of modern Transformer inference.
 */
export const flagshipM02Lessons: Course["modules"][number]["lessons"] = [
  {
    id: "m02-01-from-sequences-to-attention",
    title: "第一讲：从序列到注意力——模型如何让 token 彼此交换信息",
    summary: "从序列建模问题出发，理解隐藏状态、Query/Key/Value 投影，以及 scaled dot-product attention 的完整计算链。",
    learningObjectives: [
      "解释序列模型为什么需要在不同 token 位置之间传递信息",
      "区分输入隐藏状态、Query、Key 和 Value",
      "按顺序计算 QKᵀ、缩放、Softmax 和权重聚合",
      "根据矩阵形状推导注意力输出的维度"
    ],
    estimatedMinutes: 65,
    content: [
      {
        heading: "先看一个序列问题：当前位置需要哪些上下文信息",
        body: "语言理解通常依赖多个位置之间的关系；Attention 让一个位置根据当前内容，对其他可见位置的信息进行加权聚合。",
        markdown: "看一句话：“小猫追着球，因为它滚到了沙发下面。”如果模型要处理“它”这个位置，附近的“球”“滚”以及更早的“小猫”都可能提供线索。仅仅逐个读取 token 并把所有历史压进一个固定状态，会让长距离信息的传递变得困难。

Attention 提供另一种信息交互方式：对每个位置，模型计算它与其他可见位置的匹配分数，再按这些分数聚合对应的信息。这里的“匹配”不是人类语义判断器，而是由训练得到的向量投影和点积定义的数值关系。

**关键转变：** 不是让每个 token 只依赖前一个 token 的状态，而是让它在允许访问的位置集合中，直接计算一组内容相关的权重。不同架构通过 mask 决定“允许访问”的范围。"
      },
      {
        heading: "从隐藏状态生成 Q、K、V",
        body: "Q、K、V 通常由同一组输入隐藏状态经过三套可训练线性投影得到，分别参与打分和信息聚合。",
        markdown: "设输入隐藏状态矩阵为 X，包含 T 个 token、每个 token 的隐藏维度为 d_model。一个注意力头通常计算：

- Q = XW_Q：查询向量，参与表达当前位置如何与候选位置进行匹配。
- K = XW_K：键向量，参与提供候选位置被匹配时的特征。
- V = XW_V：值向量，提供最终被加权聚合的信息内容。

W_Q、W_K、W_V 是训练得到的参数矩阵。若 X 的形状是 [T, d_model]，且该头的维度为 d_k，则三个投影结果的形状都是 [T, d_k]。

常见类比是：Q 像检索请求，K 像可匹配的索引，V 像被取回的内容。这个类比只帮助理解计算分工。不能把某个 Q 维度说成“主语查询”，也不能认为 K/V 天生携带固定的人类标签；它们的表示由训练目标和模型参数共同塑造。"
      },
      {
        heading: "手算一次 Scaled Dot-Product Attention",
        body: "Attention 先用 Q 与 K 的点积得到相关性分数，再按 √d_k 缩放、Softmax 归一化，最后对 V 做加权求和。",
        markdown: "单头注意力的核心表达式是：

**Attention(Q,K,V) = softmax(QKᵀ / √d_k) V**

用一个只有两个位置、每个向量两维的教学例子：Q = [[1, 0], [0, 1]]，K = [[1, 0], [1, 1]]，V = [[10, 0], [0, 20]]。先计算 QKᵀ，得到两个查询位置分别对两个键的原始分数；再除以 √2；对每一行执行 Softmax，得到每个查询位置的权重分布；最后用权重矩阵乘 V，得到两个位置的新表示。

请特别注意矩阵方向：Q 的每一行对应一个查询位置，Kᵀ 的每一列对应一个键位置，因此分数矩阵形状是 [T_query, T_key]。Softmax 通常沿最后一个维度进行，使每个查询位置对其可见键位置的权重和为 1。

把这个例子算完：QKᵀ = [[1, 1], [0, 1]]，除以 √2 后约为 [[0.707, 0.707], [0, 0.707]]。逐行 Softmax 后约为 [[0.500, 0.500], [0.330, 0.670]]。乘以 V，输出约为 [[5.00, 10.00], [3.30, 13.40]]。这些数值经过四舍五入；手算时应保留更多小数再比较。第一行平均聚合两个 Value，第二行更偏向第二个 Value。"
      },
      {
        heading: "为什么要缩放，以及 Softmax 权重代表什么",
        body: "当键维度增加时，未缩放点积的数值尺度可能增大，使 Softmax 更容易饱和；缩放有助于稳定梯度。",
        markdown: "若 Q 和 K 的各维分量近似独立、均值为 0、方差为 1，那么它们的点积是 d_k 个乘积项的和，其方差会随 d_k 增长。除以 √d_k 可以把分数尺度拉回更稳定的范围。

Softmax 把一行分数变成非负且和为 1 的权重。权重表示当前参数、输入和 mask 条件下的数值分配，不等于因果解释，也不自动等于人类可解释的重要性。高权重只能说明该位置在这次聚合计算中获得了较大系数。

**练习：** 手算上述 2×2 示例；然后把 K 的第二行改为 [0, 1]，比较分数、权重和输出如何变化。记录你改变的是哪个计算环节，以及哪些结果保持不变。"
      }
    ],
    assessments: [{
      id: "m02-01-attention-by-hand",
      type: "code-task",
      prompt: "使用给定的 2×2 Q、K、V 矩阵，逐步计算 QKᵀ、缩放后的分数、逐行 Softmax 权重和最终输出。提交每一步矩阵，并解释为什么 Softmax 沿键位置维度执行。",
      rubric: [
        { criterion: "分数矩阵", description: "正确计算 QKᵀ，行列含义与矩阵方向正确", points: 3 },
        { criterion: "缩放与归一化", description: "正确使用 √d_k 缩放并对每行执行 Softmax", points: 3 },
        { criterion: "Value 聚合", description: "正确计算权重乘 V 并解释输出含义", points: 2 },
        { criterion: "概念边界", description: "说明权重是计算系数而非自动成立的因果解释", points: 2 }
      ]
    }],
    sources: [
      { title: "Attention Is All You Need", url: "https://arxiv.org/abs/1706.03762", publisher: "Vaswani et al., NeurIPS 2017", note: "Scaled dot-product attention 与 Transformer 的原始定义" },
      { title: "The Annotated Transformer", url: "https://nlp.seas.harvard.edu/annotated-transformer/", publisher: "Harvard NLP", note: "以代码和张量形状逐步解释 Attention 与 Transformer" },
      { title: "Dive into Deep Learning: Attention Mechanisms", url: "https://d2l.ai/chapter_attention-mechanisms-and-transformers/index.html", publisher: "D2L", note: "注意力机制的数学直觉、公式与可执行示例" }
    ]
  },
  {
    id: "m02-02-multi-head-and-masks",
    title: "第二讲：Multi-Head Attention 与 Mask——多个表示子空间如何并行工作",
    summary: "理解多头投影、并行计算、拼接与输出投影，并区分因果掩码和填充掩码。",
    learningObjectives: [
      "推导 Multi-Head Attention 中模型维度与单头维度的关系",
      "解释多头并行计算、拼接和输出投影",
      "区分 Causal Mask 与 Padding Mask",
      "解释 Encoder self-attention、Decoder self-attention 和 Cross-attention 的可见范围"
    ],
    estimatedMinutes: 60,
    content: [
      {
        heading: "为什么不只使用一个注意力头",
        body: "Multi-Head Attention 使用多组独立投影，在不同表示子空间中并行计算注意力，再融合各头输出。",
        markdown: "单头 Attention 对输入做一次 Q/K/V 投影，并产生一组权重。多头注意力则使用多组投影参数：每个头都有自己的 W_Q、W_K、W_V，分别计算注意力输出。

若模型维度 d_model = 512，头数 h = 8，常见设计会让每个头的维度 d_k = d_v = 64。每个头输出 [T, 64]，沿特征维拼接后得到 [T, 512]，再通过 W_O 投影回模型维度。

多头机制增加了并行的表示子空间，使模型可以学习多种信息交互模式。但“一个头负责语法、另一个头负责指代”不是架构保证。头的行为需要通过实验分析，不能仅凭头编号赋予固定语义。"
      },
      {
        heading: "Multi-Head Attention 的完整张量路径",
        body: "多头计算包含投影、reshape/transpose、每头注意力、concat 和输出投影，维度必须前后一致。",
        markdown: "以 batch-first 的输入 X 为例，形状为 [B, T, d_model]。投影后可组织为 Q/K/V = [B, H, T, d_k]，其中 d_model 通常等于 H × d_k（在常见等分头设计中）。

每个头计算 QKᵀ，得到 [B, H, T, T]；Softmax 后乘 V，得到 [B, H, T, d_v]。随后把头维和每头特征维合并，恢复为 [B, T, H × d_v]，再经过输出矩阵 W_O，得到 [B, T, d_model]。

实现中常见的错误是 reshape 后忘记 transpose，或者把 head 维和 sequence 维弄反。只看最终输出形状不够，还要检查每一步的轴语义。"
      },
      {
        heading: "Mask 的第一原则：规定哪些位置可以互相看见",
        body: "Attention Mask 在 Softmax 前屏蔽不允许访问的键位置；不同 Mask 对应不同的数据组织和任务目标。",
        markdown: "Mask 的核心语义是定义可见性。被屏蔽的位置通常在 Softmax 前被赋予极大的负分数，使其归一化权重接近或等于 0。具体实现可能使用布尔 mask、加性 mask 或融合内核中的专用逻辑。

**Causal Mask（因果掩码）**：在自回归语言建模中，位置 i 只能访问位置 1 到 i，不能读取未来 token。矩阵通常呈下三角可见结构。

**Padding Mask（填充掩码）**：一个 batch 中不同样本长度不同时，屏蔽补齐出来的 PAD 位置，避免模型把填充符当作有效内容。

二者目的不同：Causal Mask 保护时间/生成方向上的因果约束；Padding Mask 处理批处理中的无效位置。某些模型会同时应用两者。"
      },
      {
        heading: "Self-Attention 与 Cross-Attention 的差别",
        body: "Self-Attention 的 Q/K/V 来自同一序列；Cross-Attention 的 Query 来自一侧序列，Key/Value 来自另一侧序列。",
        markdown: "在 Encoder self-attention 中，Q、K、V 都由 Encoder 当前层的序列表示生成，通常允许位置之间双向交互（具体仍取决于任务 mask）。

在 Decoder causal self-attention 中，Q、K、V 来自 Decoder 序列，但因果 mask 限制每个位置只能读取当前及过去位置。

在 Encoder–Decoder Cross-Attention 中，Q 来自 Decoder 当前隐藏状态，K/V 来自 Encoder 输出。Decoder 因而可以在生成目标序列时读取输入序列的表示。原始 Transformer 使用了这类结构；纯 Decoder-only LLM 通常没有独立 Encoder，因此常规生成层主要使用 causal self-attention。

**练习：** 为翻译任务分别画出 Encoder self-attention、Decoder causal self-attention 和 Cross-attention 的 Q/K/V 来源，并标出可见范围。"
      }
    ],
    assessments: [{
      id: "m02-02-heads-and-mask",
      type: "knowledge-check",
      prompt: "输入形状为 [B=2,T=10,d_model=512]，使用 8 个头、每头维度 64。写出 Q/K/V、分数矩阵、每头输出、拼接结果和最终输出形状；再说明 Causal Mask 与 Padding Mask 的区别。",
      rubric: [
        { criterion: "维度推导", description: "正确写出 [B,H,T,d_k]、[B,H,T,T] 及 concat 后形状", points: 4 },
        { criterion: "多头机制", description: "解释独立投影、并行计算、拼接与输出投影", points: 2 },
        { criterion: "Mask 语义", description: "准确区分因果约束与 PAD 位置屏蔽", points: 2 },
        { criterion: "Attention 类型", description: "正确区分 Self-Attention 与 Cross-Attention 的 Q/K/V 来源", points: 2 }
      ]
    }],
    sources: [
      { title: "Attention Is All You Need", url: "https://arxiv.org/abs/1706.03762", publisher: "Vaswani et al., NeurIPS 2017", note: "Multi-Head Attention 与 Encoder–Decoder Attention 结构" },
      { title: "The Annotated Transformer", url: "https://nlp.seas.harvard.edu/annotated-transformer/", publisher: "Harvard NLP", note: "多头 reshape、transpose、mask 和输出投影实现" },
      { title: "PyTorch MultiheadAttention", url: "https://pytorch.org/docs/stable/generated/torch.nn.MultiheadAttention.html", publisher: "PyTorch", note: "多头注意力接口、维度约定和 mask 参数说明" }
    ]
  },
  {
    id: "m02-03-position-and-order",
    title: "第三讲：位置机制——Transformer 如何知道 token 的先后顺序",
    summary: "理解 Attention 对排列的性质、绝对位置编码、正弦位置编码、相对位置偏置与 RoPE 的基本原理。",
    learningObjectives: [
      "解释不注入位置机制时 Self-Attention 的排列等变性质",
      "描述正弦绝对位置编码如何与 token 表示结合",
      "区分绝对位置表示与相对位置关系",
      "解释 RoPE 如何通过旋转变换让点积携带相对位置信息"
    ],
    estimatedMinutes: 60,
    content: [
      {
        heading: "Attention 本身不会自动知道第几个 token",
        body: "标准 Self-Attention 根据内容计算交互；若没有位置机制，单纯的注意力层无法区分输入 token 的顺序排列。",
        markdown: "考虑两个 token 表示 A 和 B。若只对它们做不含位置输入的 Self-Attention，把输入顺序从 [A,B] 换成 [B,A]，输出会随输入一起置换，而不会凭空知道哪个 token 原本在前。这种性质称为排列等变（permutation equivariance）。

语言任务显然需要顺序信息：“狗咬人”和“人咬狗”包含相同词项，却表达不同关系。因此，Transformer 必须通过位置编码、相对位置偏置、旋转位置嵌入等机制，把顺序信息引入表示或注意力计算。

这里要区分“模型是否能区分位置”和“模型是否理解语言”。位置机制提供顺序线索，但不单独保证模型学会正确语义。"
      },
      {
        heading: "正弦位置编码：把位置映射为不同频率的向量",
        body: "原始 Transformer 将位置向量加到 token embedding 上，使用不同频率的正弦和余弦函数构造位置表示。",
        markdown: "原始论文定义了：

- PE(pos, 2i) = sin(pos / 10000^(2i/d_model))
- PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))

其中 pos 是序列位置，i 是维度索引。不同维度使用不同频率，使位置向量包含多种尺度的周期信号。原始 Encoder 和 Decoder 将位置编码与 token embedding 相加，再送入后续层。

这种方式不需要为每个位置学习一张独立的查表参数，但它只是众多位置机制之一。现代 LLM 还会使用可学习绝对位置嵌入、相对位置偏置、RoPE 等设计，不能把原始正弦编码当作所有 Transformer 的统一实现。"
      },
      {
        heading: "相对位置：关注两个 token 相隔多远",
        body: "相对位置机制把 token 之间的距离或方向纳入注意力打分或表示，使模型可以利用相对顺序关系。",
        markdown: "在许多任务中，两个 token 相隔几个位置可能比它们各自的绝对编号更重要。相对位置方法会把 i 与 j 的距离、方向或其编码引入注意力计算，例如对注意力分数增加一个与相对位移有关的偏置。

可以把注意力分数抽象为：score(i,j) = q_i · k_j / √d_k + b(i-j)。其中 b(i-j) 是由相对位置关系决定的偏置项。具体实现可能使用可学习表、桶化距离或其他函数。

相对位置机制也有设计取舍：如何处理超出训练长度的距离、是否区分方向、位置参数如何共享，以及推理时如何扩展上下文，都需要结合具体模型分析。"
      },
      {
        heading: "RoPE：通过旋转让点积感知相对位移",
        body: "Rotary Position Embedding 对 Query 和 Key 的成对维度施加与位置相关的旋转，使 Q/K 点积包含相对位置关系。",
        markdown: "RoPE 将向量维度按二维对子分组，对位置 m 的 Query 和 Key 施加角度随 m 变化的旋转。若把二维旋转矩阵记为 R(mθ)，则位置 m 的 q、位置 n 的 k 经旋转后，其点积具有与相对位移 m-n 相关的结构：

(R(mθ)q)ᵀ(R(nθ)k) = qᵀR((n-m)θ)k

这说明旋转后的 Q/K 交互可以编码相对位置差异。真实实现通常对多个维度对使用不同频率，并涉及频率基数、维度配对和上下文扩展策略。

RoPE 是一种位置机制，不等于注意力本身，也不自动保证任意长度外推质量。长上下文扩展方法需要单独评估位置分布变化、注意力行为和任务质量。

**练习：** 比较正弦绝对位置编码和 RoPE：它们把位置信息注入哪个计算环节？哪一种通过 Q/K 点积直接体现相对位移？"
      }
    ],
    assessments: [{
      id: "m02-03-position-mechanisms",
      type: "design-review",
      prompt: "提交一份位置机制对比说明，覆盖原始正弦位置编码、相对位置偏置和 RoPE。说明每种方法将位置信息注入哪里、主要优势、局限，以及为什么不能仅凭使用 RoPE 就宣称模型支持任意长度上下文。",
      rubric: [
        { criterion: "顺序问题", description: "解释无位置机制时 Attention 的排列等变性质及其语言影响", points: 2 },
        { criterion: "绝对位置", description: "正确解释正弦位置编码公式与 embedding 相加方式", points: 2 },
        { criterion: "相对位置", description: "说明相对位移如何进入注意力打分或表示", points: 2 },
        { criterion: "RoPE", description: "正确解释 Q/K 旋转及点积包含相对位置信息", points: 3 },
        { criterion: "适用边界", description: "指出长上下文扩展仍需独立评估", points: 1 }
      ]
    }],
    sources: [
      { title: "Attention Is All You Need", url: "https://arxiv.org/abs/1706.03762", publisher: "Vaswani et al., NeurIPS 2017", note: "原始正弦位置编码定义" },
      { title: "RoFormer: Enhanced Transformer with Rotary Position Embedding", url: "https://arxiv.org/abs/2104.09864", publisher: "Su et al.", note: "RoPE 的旋转位置嵌入方法与相对位置性质" },
      { title: "Self-Attention with Relative Position Representations", url: "https://arxiv.org/abs/1803.02155", publisher: "Shaw et al.", note: "相对位置表示进入 Self-Attention 的经典方法" }
    ]
  },
  {
    id: "m02-04-inside-transformer-block",
    title: "第四讲：走进 Transformer Block——Attention 之外还有什么",
    summary: "理解 Encoder/Decoder 架构、前馈网络、残差连接、LayerNorm、Pre-LN/Post-LN 与堆叠结构。",
    learningObjectives: [
      "描述原始 Transformer Encoder 与 Decoder 的子层构成",
      "解释 Position-wise Feed-Forward Network 的作用",
      "说明残差连接与 LayerNorm 对深层网络训练的意义",
      "区分 Post-LN 与 Pre-LN 的基本数据流"
    ],
    estimatedMinutes: 65,
    content: [
      {
        heading: "Transformer 不是一层 Attention，而是重复堆叠的计算块",
        body: "Transformer 由注意力子层、前馈子层、残差路径和归一化等组件组成，多层堆叠逐步变换 token 表示。",
        markdown: "原始 Transformer Encoder Layer 包含 Multi-Head Self-Attention 和 Position-wise Feed-Forward Network 两个主要子层；每个子层外侧都有残差连接和 LayerNorm。Decoder Layer 除了 masked self-attention 和 FFN，还包含对 Encoder 输出的 Cross-Attention。

现代 Decoder-only LLM 通常移除独立 Encoder 与 Cross-Attention，保留 causal self-attention、FFN、残差和归一化等结构。不同模型可能采用 RMSNorm、SwiGLU 等变体，因此学习原始架构时要把“核心思想”和“具体实现配置”分开。

一个 Transformer 模型通常由多个 Block 堆叠而成。每一层接收上一层的 token 表示，并产生新的表示；模型最终再通过输出头把隐藏状态映射到词表 logits。"
      },
      {
        heading: "Feed-Forward Network：逐位置的非线性变换",
        body: "FFN 通常独立地作用于每个 token 位置，在特征维度上扩展、非线性变换并投影回模型维度。",
        markdown: "经典 FFN 可写为：FFN(x) = max(0, xW₁ + b₁)W₂ + b₂。第一层把 d_model 扩展到 d_ff，经过非线性激活后，第二层再投影回 d_model。

与 Attention 不同，标准 Position-wise FFN 不直接混合不同 token 位置；它在每个位置独立处理特征维。Attention 负责位置之间的信息交互，FFN 负责对每个位置聚合后的特征进行更复杂的非线性变换。

现代 LLM 可能使用 GELU、SwiGLU 等激活/门控结构，隐藏维度也会因模型配置不同而变化。不能把经典 ReLU FFN 公式误认为所有模型的唯一实现。"
      },
      {
        heading: "残差连接：给深层信息和梯度保留一条直通路径",
        body: "残差连接将子层输入与子层变换结果相加，改善深层网络的信息与梯度传播。",
        markdown: "一个带残差的子层可以抽象为 y = x + F(x)。模型不必要求 F(x) 独自重建全部输入信息，而是学习相对于输入的增量变换。

残差路径也为反向传播提供更直接的梯度通道，有助于训练更深的网络。它不是简单地“防止信息丢失”，也不能保证训练一定稳定；初始化、归一化位置、学习率和网络深度等因素仍然重要。

残差相加要求两条路径的张量形状兼容。若子层改变了通道维度，通常需要额外投影或其他结构调整。"
      },
      {
        heading: "LayerNorm、Post-LN 与 Pre-LN",
        body: "LayerNorm 对单个样本的特征维做归一化；Pre-LN 与 Post-LN 的区别在于归一化相对于子层和残差加法的位置。",
        markdown: "LayerNorm 通常对每个 token 的特征维计算均值和方差，再使用可学习缩放与偏移参数调整结果。它与 BatchNorm 不同，不依赖 batch 内其他样本的统计量。

Post-LN 形式可以简化表示为：y = LayerNorm(x + F(x))。Pre-LN 则是：y = x + F(LayerNorm(x))。两种结构的数据流不同，会影响梯度传播和深层训练稳定性。

现代语言模型常见 Pre-LN 或 RMSNorm 等变体，但具体选择与训练配方相关。阅读模型结构时，应检查实际配置与实现，不要只凭“Transformer”名称推断归一化细节。

**练习：** 画出一个简化 Decoder-only Block，标出 RMSNorm/LayerNorm、Causal Self-Attention、残差、FFN 和输出路径。"
      }
    ],
    assessments: [{
      id: "m02-04-transformer-block-review",
      type: "design-review",
      prompt: "绘制一个 Transformer Encoder Layer 和一个 Decoder-only Block 的结构图。标注 Attention、FFN、残差、归一化、mask 和每个子层的输入输出形状，并说明两种架构的差异。",
      rubric: [
        { criterion: "架构组成", description: "正确列出 Encoder、Decoder 和 Decoder-only 的主要子层", points: 3 },
        { criterion: "FFN 职责", description: "说明 FFN 在特征维变换且通常不混合 token 位置", points: 2 },
        { criterion: "残差与归一化", description: "正确区分残差路径、LayerNorm 和 Pre-LN/Post-LN", points: 3 },
        { criterion: "结构表达", description: "图示数据流、mask 和张量维度清晰", points: 2 }
      ]
    }],
    sources: [
      { title: "Attention Is All You Need", url: "https://arxiv.org/abs/1706.03762", publisher: "Vaswani et al., NeurIPS 2017", note: "Encoder、Decoder、FFN、残差与 LayerNorm 的原始架构" },
      { title: "On Layer Normalization in the Transformer Architecture", url: "https://arxiv.org/abs/2002.04745", publisher: "Xiong et al.", note: "Pre-LN 与 Post-LN 梯度和训练稳定性分析" },
      { title: "Root Mean Square Layer Normalization", url: "https://arxiv.org/abs/1910.07467", publisher: "Zhang and Sennrich", note: "RMSNorm 的动机与归一化方式" }
    ]
  },
  {
    id: "m02-05-compute-and-inference",
    title: "第五讲：从理论到推理——注意力复杂度、KV Cache 与高效实现",
    summary: "将注意力公式连接到真实推理系统，理解二次复杂度、KV Cache、FlashAttention 和性能评估边界。",
    learningObjectives: [
      "根据 batch、头数、序列长度和头维度推导注意力张量形状",
      "解释标准全注意力计算与存储中随序列长度平方增长的部分",
      "解释自回归推理为何缓存历史 Key/Value",
      "区分 FlashAttention 的 IO 优化与改变注意力稀疏性的算法",
      "设计一个能解释实验简化边界的 Transformer Lab 观察报告"
    ],
    estimatedMinutes: 75,
    content: [
      {
        heading: "先把所有维度放到同一张图里",
        body: "多头注意力的主要张量维度由 batch B、头数 H、序列长度 T 和每头维度 d_k 决定。",
        markdown: "在常见 batch-first 实现中，Q/K/V 的形状为 [B,H,T,d_k]。计算 QKᵀ 后，分数张量形状为 [B,H,T,T]；Softmax 后仍是该形状；乘 V 后得到 [B,H,T,d_v]。

若 d_model = H × d_k，拼接所有头后恢复为 [B,T,d_model]。在 Cross-Attention 中，Query 序列长度和 Key/Value 序列长度可能不同，分数矩阵会变成 [B,H,T_q,T_k]。

维度分析不仅是数学练习，也是调试工具。出现显存暴涨、广播错误或输出错位时，先检查每个轴代表什么，再检查 transpose、reshape 和 mask 的广播规则。"
      },
      {
        heading: "为什么标准全注意力会出现 T² 项",
        body: "每个查询位置都需要与可见键位置计算分数，完整注意力分数矩阵的元素数量随 T² 增长。",
        markdown: "对长度为 T 的序列，QKᵀ 会产生 T×T 的分数矩阵。对每个注意力头，分数计算的主要乘加量与 T²d_k 同阶；再将权重乘 V，也有相近的序列长度二次项。因此标准全注意力的计算复杂度常写为 O(T²d)，分数矩阵的显式存储规模为 O(T²)（还要乘 batch 和 head 数）。

这不表示 Transformer 所有计算都按 T² 增长。Q/K/V 投影和 FFN 的复杂度还涉及 d_model、d_ff 与 T；在某些配置和短序列场景中，它们可能占据很大比例。准确比较必须说明维度和实现条件。

长上下文带来的压力包括注意力计算、临时中间张量、KV Cache、批量并发和内存带宽。不能只用参数量估算推理成本。"
      },
      {
        heading: "KV Cache：避免每个生成步骤重复计算历史 K/V",
        body: "自回归生成时，KV Cache 保存历史 token 各层的 Key/Value；新 token 到来时只需追加新位置的 K/V。",
        markdown: "在 Decoder-only 自回归生成中，模型每次只需要为新 token 产生下一个 token。若每一步都重新计算完整历史的 K/V，会重复进行大量工作。KV Cache 将已经计算过的各层 Key/Value 保存在内存中，新 token 到来时计算并追加自己的 K/V，再让当前 Query 访问缓存中的历史位置。

Cache 容量大致随层数 L、batch B、缓存长度 T、KV head 数 H_kv、每头维度 d_k 和每个数值占用字节数 b 增长。一个常见估算式是：KV bytes ≈ 2 × L × B × T × H_kv × d_k × b。前面的 2 表示 Key 与 Value 两份缓存。实际实现还受分页管理、对齐、量化、并发请求和共享前缀影响。

KV Cache 主要减少重复计算，但需要占用内存。上下文越长、并发越高，缓存容量压力越明显。Multi-Query Attention 和 Grouped-Query Attention 通过减少 KV Head 数等方式降低缓存规模，但它们属于注意力架构设计选择。"
      },
      {
        heading: "FlashAttention：优化数据搬运，而不是改写注意力定义",
        body: "FlashAttention 通过分块计算和 IO 感知算法减少 GPU 高带宽显存与片上存储之间的数据搬运及中间矩阵物化。",
        markdown: "朴素实现可能把完整的 T×T 注意力分数和 Softmax 权重写入显存，再读取它们与 V 相乘。长序列时，这会产生大量中间数据和显存读写。

FlashAttention 使用分块（tiling）和在线 Softmax 等技巧，在片上存储可容纳的块上逐步计算注意力，避免显式物化完整的注意力矩阵。它的核心是 IO-aware exact attention：目标是在保持标准注意力数学结果（数值精度允许的误差范围内）的同时，减少 HBM 与片上 SRAM 之间的数据搬运。

因此，FlashAttention 不等同于稀疏注意力，也不是把 O(T²) 的标准全注意力数学计算自动变成 O(T)。它主要优化内存访问和中间结果存储，实际速度取决于 GPU、序列长度、数据类型、内核版本和负载形状。"
      },
      {
        heading: "实验报告：从矩阵观察走向工程判断",
        body: "Transformer Lab 使用固定小矩阵在浏览器本地展示注意力数值过程，适合验证公式和 mask，不适合推断真实 GPU 性能。",
        markdown: "打开 Transformer Attention Lab，先使用默认小矩阵观察分数、Softmax 权重和输出；再启用 Causal Mask，检查未来位置对应的权重是否被屏蔽；最后改变输入矩阵，观察输出如何变化。

请在报告中记录：输入矩阵、Q/K/V 形状、分数矩阵、mask 前后权重、输出矩阵，以及你对每个变化的解释。若实验界面只提供固定 Q/K/V 或固定小规模计算，应明确写出这一限制。

**不可从该实验推出的结论：** 不能据此比较不同 GPU 的 tokens/s，不能验证真实模型的训练效果，也不能证明 FlashAttention 已在实验中运行。它是一个 browser-local 数值教学实验，不加载真实权重、不调用外部模型、不进行硬件性能基准测试。

**综合练习：** 给定 B=4、H=8、T=2048、d_k=64，写出 Q/K/V 和分数张量形状；估算单个注意力层的分数矩阵元素数；再解释 KV Cache 和 FlashAttention 分别缓解哪类瓶颈。"
      }
    ],
    assessments: [{
      id: "m02-05-attention-systems-analysis",
      type: "design-review",
      prompt: "提交一份 Transformer Attention 工程分析报告。对 B=4、H=8、T=2048、d_k=64 推导张量形状和分数元素数；解释标准注意力的 T² 项、KV Cache 容量变量、FlashAttention 的 IO 优化目标；最后说明 Transformer Lab 能验证什么、不能验证什么。",
      rubric: [
        { criterion: "形状与规模", description: "正确推导 Q/K/V、分数矩阵形状和元素数量", points: 2 },
        { criterion: "复杂度", description: "解释标准全注意力计算和显式分数存储中的 T² 项", points: 2 },
        { criterion: "KV Cache", description: "正确说明缓存内容、主要容量变量和收益/成本权衡", points: 2 },
        { criterion: "FlashAttention", description: "准确说明 IO 优化目标，不误称为消除标准注意力 T² 计算", points: 2 },
        { criterion: "实验边界", description: "区分浏览器固定矩阵实验与真实模型/GPU 性能评估", points: 2 }
      ]
    }],
    sources: [
      { title: "FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness", url: "https://arxiv.org/abs/2205.14135", publisher: "Dao et al., NeurIPS 2022", note: "IO-aware exact attention、分块和在线 Softmax" },
      { title: "FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning", url: "https://arxiv.org/abs/2307.08691", publisher: "Dao", note: "FlashAttention 的并行化与工作划分优化" },
      { title: "Efficient Memory Management for Large Language Model Serving with PagedAttention", url: "https://arxiv.org/abs/2309.06180", publisher: "Kwon et al., SOSP 2023", note: "PagedAttention 与 KV Cache 服务内存管理" },
      { title: "Grouped-Query Attention", url: "https://arxiv.org/abs/2305.13245", publisher: "Ainslie et al.", note: "通过 KV Head 共享降低缓存和推理成本" }
    ]
  }
];
