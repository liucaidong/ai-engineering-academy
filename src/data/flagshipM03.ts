import type { Course } from "../types/course";

/**
 * Flagship M03: Token, Embedding and Context.
 * Teaches the representation pipeline from text to discrete token IDs,
 * learned vectors, and an explicitly budgeted model context.
 */
export const flagshipM03Lessons: Course["modules"][number]["lessons"] = [
  {
    id: "m03-01-text-to-token-ids",
    title: "第一讲：从文本到 Token ID——模型输入的离散化过程",
    summary: "建立文本、Unicode 字符、字节、token 与 token ID 的边界，理解预处理、预分词、子词算法和特殊 token。",
    learningObjectives: [
      "区分 Unicode 码点、UTF-8 字节、自然语言词、token 和 token ID",
      "解释词级、字符级与子词切分的覆盖率和序列长度权衡",
      "描述 BPE、WordPiece、Unigram 的基本构建思路及其差异",
      "说明预分词、规范化、词表和特殊 token 对最终编码的影响"
    ],
    estimatedMinutes: 70,
    content: [
      {
        heading: "一段文本经过了哪些表示层",
        body: "Tokenizer 把文本转换为模型词表中的离散 token ID；字符、字节、token 和 ID 是不同层次的对象。",
        markdown: "以字符串 `Hello, 世界!` 为例，计算机首先处理的是编码后的字节序列。Unicode 为字符分配码点，UTF-8 再把码点编码为一个或多个字节。Tokenizer 在其规定的预处理和切分规则下，将输入映射为 token 序列，最后把每个 token 映射为词表中的整数 ID。\n\n可以把输入链路写成：\n\n**字符串 → 规范化/预处理 → 预分词（若有）→ 子词或字节片段 → token → token ID**\n\n这条链路不是所有 tokenizer 都完全相同。有些实现会先按空白、标点或正则模式预分词；有些采用 byte-level 表示以提升任意输入覆盖能力；特殊 token 也可能通过独立规则识别。\n\n请始终区分：\n\n- **Unicode 码点**：字符编码标准中的抽象编号；一个用户感知字符可能由多个码点组成。\n- **UTF-8 字节**：文本在 UTF-8 编码下的字节表示，一个码点可能占多个字节。\n- **Token**：由特定 tokenizer 规则定义的离散切分单元，不等于一个字或一个字符。\n- **Token ID**：token 在该模型词表中的整数索引，不是向量，也不是跨模型通用编号。\n\n工程结论：token 数量不能通过字符数、字节数或空格分隔的单词数精确推导。必须指定 tokenizer、版本和输入处理方式。"
      },
      {
        heading: "词级、字符级与子词：三种切分策略的取舍",
        body: "词级切分容易形成大词表，字符级切分序列通常更长，子词方法试图在词表规模、覆盖率和序列长度之间取得折中。",
        markdown: "假设语料包含 `play`、`player`、`playing` 和 `replay`：\n\n| 策略 | 可能切分 | 优点 | 主要代价 |\n|---|---|---|---|\n| 词级 | `playing` | 片段接近词语 | 词形变化扩大词表；未登录词处理困难 |\n| 字符级 | `p l a y i n g` | 字符覆盖面广 | 序列变长，模型需要组合更多位置 |\n| 子词级 | `play + ing` | 复用高频片段 | 切分依赖训练语料和算法规则 |\n\n这只是说明策略的教学示意，不代表某个真实模型一定会这样切分。子词词表让常见片段可以作为一个 token 出现，同时允许较少见的词通过多个片段组合表示。\n\n中文也不能简单理解为“一字一个 token”。一个汉字可能对应一个或多个 token；常见词组、标点、空白、数字、英文混排、代码和 emoji 都可能采用不同切分。模型训练语料、词表预算、预分词规则和 byte-level 设计都会改变结果。\n\n**思考题：** 对中文、英文、源代码和 emoji 混合的输入，为什么“每个单词约一个 token”不能作为可靠的容量规划规则？"
      },
      {
        heading: "BPE：通过高频相邻片段合并构建词表",
        body: "Byte Pair Encoding（BPE）从基础符号开始，反复合并语料中符合规则的高频相邻符号对，逐步形成更大的子词单元。",
        markdown: "一个极简 BPE 教学例子。假设预分词后语料只有以下单词及频次：\n\n| 词 | 频次 | 初始字符序列 |\n|---|---:|---|\n| `low` | 5 | l o w |\n| `lower` | 2 | l o w e r |\n| `new` | 6 | n e w |\n| `newest` | 3 | n e w e s t |\n\n第一轮统计相邻符号对时，`l o` 在 `low` 和 `lower` 中出现，`n e` 在 `new` 和 `newest` 中出现。若按频次选择最高的一对并合并，语料中该对会成为一个新符号。随后重新统计相邻对，继续执行合并，直到达到词表规模或停止条件。\n\n真实 BPE 训练会受到词频加权、边界标记、预分词策略、初始字母表、特殊 token 和实现细节影响。上面的频次表用于解释“统计相邻对—选择—合并—重算”的过程，不应当作任何真实 tokenizer 的完整训练配方。\n\nBPE 的一个重要性质是：训练时学到的合并规则会影响推理时的切分顺序。只知道最终词表而不知道 merge ranks 或实现约定，未必足以复现编码结果。"
      },
      {
        heading: "WordPiece、Unigram 与 Byte-level 设计",
        body: "WordPiece 和 Unigram 使用不同于经典 BPE 的词片段选择或概率建模思路；byte-level 设计强调输入覆盖能力，不能把它们都简单称为同一种算法。",
        markdown: "**WordPiece** 常与基于子词词表的似然目标联系起来，编码时按模型定义的最长匹配或搜索策略选择片段；不同实现细节可能不同。它与 BPE 的“按相邻符号对频次合并”不是同一个训练算法。\n\n**Unigram Language Model** 通常先有一个较大的候选子词集合，再根据概率模型和目标函数逐步裁剪候选项，寻找能够较好解释训练语料的子词词表。SentencePiece 提供了 Unigram 和 BPE 等 tokenizer 模型的实现，并可直接处理原始句子，不要求先由空格切出词语。\n\n**Byte-level BPE** 将字节级符号作为覆盖基础，再学习更大的合并单元。其优势之一是能够表示任意字节序列，减少传统字符词表中的未知符号问题；但 token 数量、可读性和实际切分仍依赖具体词表与规则。\n\n比较算法时至少记录：基础字母表、预分词规则、训练目标、词表构建过程、编码策略、未知输入处理和特殊 token 规则。只写“使用 BPE”通常不足以复现一个 tokenizer。"
      },
      {
        heading: "特殊 Token、Chat Template 与序列边界",
        body: "特殊 token 用于表达消息边界、角色、任务或控制标记；它们不是普通文本中偶然出现的字符串。",
        markdown: "对话模型通常不只是把用户可见文本直接拼接起来。运行时会把消息序列化为模型约定的格式，其中可能包含角色边界、消息结束、轮次结束、工具交接、拒绝标记或多模态任务标记。\n\n例如某些模型家族使用专门的消息起始和结束 token；另一些模型采用不同的 Chat Template。即使两套模板呈现相似的可读字符串，其 token ID、结束语义和控制流也可能不同。\n\n应区分三个概念：\n\n1. **Special token**：词表或 tokenizer 配置中具有特殊身份的 token。\n2. **可见拼写**：调试或文档中展示的字符串形式；它未必就是普通文本编码得到的结果。\n3. **Chat template**：把结构化消息转换为模型输入序列的模板规则，可能添加角色标记、分隔符和生成提示。\n\n把模板中的结束标记混为一谈会造成控制流错误：消息结束不一定意味着 Assistant 回合结束，工具交接标记也不等于普通文本结束。工程实现必须遵循目标模型的官方模板和接口契约。"
      }
    ],
    assessments: [{
      id: "m03-01-tokenization-audit",
      type: "design-review",
      prompt: "为一组中英混合、含代码、空白和 emoji 的输入设计 tokenizer 审计记录。说明从字符串到 token ID 的处理层次，比较至少两种子词算法，并列出复现切分结果所需的配置。",
      rubric: [
        { criterion: "表示层次", description: "正确区分 Unicode、UTF-8 字节、token 与 token ID", points: 3 },
        { criterion: "算法比较", description: "准确比较 BPE 与 WordPiece 或 Unigram 的基本思想", points: 3 },
        { criterion: "复现条件", description: "记录预处理、词表、版本、特殊 token 和模板", points: 2 },
        { criterion: "语言覆盖", description: "解释多语言、代码和 emoji 切分不能按字符数推断", points: 2 }
      ]
    }],
    sources: [
      { title: "Neural Machine Translation of Rare Words with Subword Units", url: "https://arxiv.org/abs/1508.07909", publisher: "Sennrich, Haddow and Birch, ACL 2016", note: "神经机器翻译中的 BPE 子词单元方法" },
      { title: "SentencePiece: A simple and language independent subword tokenizer and detokenizer for Neural Text Processing", url: "https://arxiv.org/abs/1808.06226", publisher: "Kudo and Richardson, EMNLP 2018", note: "SentencePiece、BPE 与 Unigram 词表建模" },
      { title: "Subword Regularization: Improving Neural Network Translation Models with Multiple Subword Candidates", url: "https://arxiv.org/abs/1804.10959", publisher: "Kudo, ACL 2018", note: "Unigram 子词模型与采样正则化" },
      { title: "Hugging Face: Summary of the tokenizers", url: "https://huggingface.co/docs/transformers/tokenizer_summary", publisher: "Hugging Face", note: "BPE、WordPiece、Unigram 与 WordLevel 概览" }
    ]
  },
  {
    id: "m03-02-embedding-and-representations",
    title: "第二讲：从 Token ID 到 Embedding——离散索引如何变成向量",
    summary: "理解 Embedding 查表、参数规模、训练更新、输入输出权重共享，以及静态词向量与上下文表示的差异。",
    learningObjectives: [
      "解释 Token ID 是离散索引而不是具有语义距离的向量",
      "根据词表大小和 embedding 维度计算参数量与存储量",
      "说明 embedding lookup、梯度更新和 weight tying 的基本机制",
      "区分输入 embedding、输出投影、位置表示和 contextual representation"
    ],
    estimatedMinutes: 65,
    content: [
      {
        heading: "Token ID 是索引，不是语义向量",
        body: "Token ID 只标识词表中的一个离散条目；Embedding 层通过该索引取出可学习的稠密向量。",
        markdown: "假设词表有 50,000 个 token，token ID 为 0 到 49,999。输入序列 `[314, 27, 908]` 表示三个词表条目的索引。整数 908 并不意味着它在语义上比 314 更接近 27，也不能把 ID 差值当作语义距离。\n\nEmbedding 矩阵记作 E，形状为 [V, d]：V 是词表大小，d 是 embedding 维度。对 token ID i，Embedding lookup 取出矩阵第 i 行：\n\n**eᵢ = E[i]，其中 eᵢ ∈ Rᵈ**\n\n所以输入序列的 ID 张量 [T] 会变成向量张量 [T,d]（忽略 batch 维度）。这一步是按索引取参数行，不是把整数 ID 直接转换成浮点数后当作语义特征。\n\n**必须记住：Token ID 是离散符号索引；Embedding 才是模型训练得到的稠密向量表示。** 不同模型的 ID 空间和 embedding 权重都可能不同，不能将一个 tokenizer 的 ID 直接送入另一个模型的 embedding 矩阵。"
      },
      {
        heading: "Embedding 参数量与内存估算",
        body: "Embedding 矩阵参数量等于词表大小乘以向量维度；权重精度决定其原始存储量，但训练还需要额外状态。",
        markdown: "假设词表大小 V=50,000，embedding 维度 d=4,096：\n\n- 参数量 = V × d = 50,000 × 4,096 = **204,800,000 个参数**。\n- 若每个参数按 BF16/FP16 的 2 bytes 存储，权重原始大小约为 409,600,000 bytes，按十进制约 409.6 MB，按二进制约 390.6 MiB。\n- 若按 FP32 的 4 bytes 存储，原始大小约为 819.2 MB（约 781.3 MiB）。\n\n这是单个 embedding 矩阵的简化估算，不包含对齐、分片、量化元数据、优化器状态、梯度、输出投影或框架额外开销。训练时总内存通常显著高于权重本身。\n\n在大词表模型中，Embedding 和输出词表投影可能占据可观参数量。若模型隐藏维度与 embedding 维度相同，输入 embedding 矩阵形状常为 [V,d_model]；输出 logits 投影常将隐藏状态映射回 V 个词表分数。"
      },
      {
        heading: "Embedding 如何在训练中学习",
        body: "Embedding 矩阵是模型参数的一部分；参与训练的 token 行会通过损失函数反向传播获得梯度并被优化器更新。",
        markdown: "一个简化训练步骤如下：\n\n1. Tokenizer 把训练文本转换为 token ID。\n2. Embedding lookup 根据 ID 从矩阵 E 取出向量。\n3. Transformer 对向量序列执行多层计算，产生隐藏状态。\n4. 输出头计算目标 token 的预测分布，并与训练目标计算损失。\n5. 反向传播把损失梯度传回参与计算的参数，包括相关 embedding 行。\n6. 优化器根据梯度和自身状态更新参数。\n\n对于普通稠密 embedding lookup，某个 batch 中没有被索引到的行通常不会从该 batch 的 lookup 路径获得梯度；实际优化器、权重衰减和分布式训练实现会影响更新细节。\n\n这解释了为什么 embedding 不是人为给每个 token 填入一个固定语义标签。向量空间是在训练目标、上下文、模型结构和优化过程共同作用下形成的。"
      },
      {
        heading: "输入 Embedding、输出投影与 Weight Tying",
        body: "输入 embedding 把 token ID 映射到隐藏空间；输出投影把隐藏状态映射为词表 logits；部分模型会共享两者的权重。",
        markdown: "自回归语言模型在输入侧使用 embedding 矩阵 E 将 ID 映射为向量；在输出侧，模型通常使用线性层把最后隐藏状态 h 映射为词表大小的 logits：\n\n**logits = h Wᵀ + b**\n\n若 W 与输入 embedding 矩阵 E 共享权重，这种设计称为 **weight tying**。在常见形状约定下，E 为 [V,d]，输出层使用 Eᵀ 将 d 维隐藏状态投影到 V 个词表分数。共享权重可以减少参数，并建立输入/输出词表表示之间的约束；但不是所有模型都采用相同设计。\n\n要阅读模型配置或源码，应确认：词表大小、hidden size、embedding padding 行、输出头结构、是否共享权重、是否存在额外 bias，以及权重是否分片。不要仅凭模型架构名称推断这些实现细节。"
      },
      {
        heading: "位置表示与上下文表示不是同一件事",
        body: "Token embedding 表示词表条目的可学习向量；位置机制提供顺序信息；经过 Transformer 后的隐藏状态则包含上下文交互结果。",
        markdown: "一个输入位置的初始表示可能由 token embedding 与位置表示组合而来。绝对位置编码可以加到 token embedding 上；RoPE 等机制则在注意力计算中以不同方式注入位置信息。它们不是 token ID 本身的属性。\n\n经过多层 self-attention 和 FFN 后，每个位置的隐藏状态会受到其他可见 token 的影响。这个随上下文变化的表示常被称为 contextual representation。相同 token ID 出现在不同上下文中，其最终隐藏状态通常可以不同。\n\n| 表示 | 由什么决定 | 是否直接依赖当前上下文 |\n|---|---|---|\n| Token ID | tokenizer 词表和编码规则 | 否，给定文本片段与 tokenizer 后固定 |\n| Token embedding | 模型参数矩阵对应行 | 查表本身不依赖其他 token |\n| Position signal | 位置机制与位置索引 | 依赖序列位置 |\n| Contextual hidden state | 模型层、输入序列、mask 和参数 | 是 |\n\n**学习检查：** 用一句话解释为什么“一个 token 有一个 embedding”不等于“一个 token 在所有句子里都只有一个固定的最终表示”。"
      }
    ],
    assessments: [{
      id: "m03-02-embedding-calculation",
      type: "code-task",
      prompt: "给定词表 V=48,000、embedding 维度 d=3,072、BF16 权重，计算 embedding 参数量和原始权重存储量；再画出 token ID、embedding lookup、Transformer hidden state 和输出 logits 的数据流，并解释 weight tying。",
      rubric: [
        { criterion: "离散与连续表示", description: "明确区分 token ID 与 embedding vector", points: 2 },
        { criterion: "参数计算", description: "正确计算 V×d 参数量和 BF16 存储量", points: 3 },
        { criterion: "数据流", description: "正确表达输入 lookup、隐藏状态和输出投影", points: 3 },
        { criterion: "权重共享", description: "说明 weight tying 的机制及其并非普遍必选", points: 2 }
      ]
    }],
    sources: [
      { title: "Efficient Estimation of Word Representations in Vector Space", url: "https://arxiv.org/abs/1301.3781", publisher: "Mikolov et al., ICLR Workshop 2013", note: "经典静态词向量训练方法背景" },
      { title: "GloVe: Global Vectors for Word Representation", url: "https://nlp.stanford.edu/projects/glove/", publisher: "Stanford NLP", note: "基于全局词共现统计的静态词向量" },
      { title: "Attention Is All You Need", url: "https://arxiv.org/abs/1706.03762", publisher: "Vaswani et al., NeurIPS 2017", note: "Transformer 输入表示、位置编码与输出结构" },
      { title: "The Illustrated Transformer", url: "https://jalammar.github.io/illustrated-transformer/", publisher: "Jay Alammar", note: "Embedding、位置编码与 Transformer 数据流的教学图解" }
    ]
  },
  {
    id: "m03-03-context-window-and-budget",
    title: "第三讲：Context Window 与 Token Budget——上下文容量如何规划",
    summary: "把上下文窗口转化为可计算预算，覆盖消息、工具结果、检索内容、输出预留和截断策略。",
    learningObjectives: [
      "解释上下文窗口与有效记忆之间的区别",
      "建立包含系统消息、历史、检索、工具结果和输出预留的 token 预算",
      "计算请求是否超过上下文限制并定义安全余量",
      "比较截断、滑动窗口、摘要和检索等上下文压缩策略"
    ],
    estimatedMinutes: 70,
    content: [
      {
        heading: "Context Window 是一次模型调用可处理的序列范围",
        body: "上下文窗口通常以 token 数计量，约束一次请求中模型可处理的输入和输出范围；具体计量规则依模型和服务接口而定。",
        markdown: "在工程语境中，context 通常是模型当前请求能够访问的输入序列，包括系统指令、开发者指令、用户消息、历史对话、工具结果、检索片段和其他结构化内容。模型生成的输出也可能受到同一上下文上限或独立输出上限约束。\n\n不能把 context window 简化为“用户最多能输入多少 token”。实际请求可能还包含：\n\n- system/developer 指令和安全策略；\n- 对话历史及消息边界标记；\n- 工具定义、工具调用和工具返回；\n- RAG 检索到的文档片段、引用和元数据；\n- 多模态输入对应的内部表示或服务端计量；\n- 本次生成的输出 token 及预留空间。\n\n不同 API 对输入 token、输出 token、缓存 token、图像/音频输入的计费与窗口计算方式可能不同。必须以目标模型和 API 的当前文档为准。"
      },
      {
        heading: "建立可复算的 Token Budget",
        body: "预算应把不同输入来源分项计量，并为模型输出和不可预见的模板开销保留空间。",
        markdown: "假设某模型本次请求可用上下文上限为 16,000 tokens。下面给出一个教学预算示例，所有数字均是假设值，不代表任何厂商模型的固定比例：\n\n| 请求组成 | 预算 token |\n|---|---:|\n| System 指令 | 700 |\n| Developer 指令与工具契约 | 900 |\n| 当前用户请求 | 500 |\n| 近期对话历史 | 2,400 |\n| RAG 文档片段 | 5,000 |\n| 工具返回与结构化元数据 | 1,000 |\n| 输出预留 | 3,000 |\n| 模板/边界开销与安全余量 | 1,000 |\n| **总计** | **14,500** |\n\n剩余 1,500 tokens。若实际序列化开销高于估计，或者工具结果超出预期，余量可以吸收部分偏差。若输入与输出上限由 API 分开规定，还必须分别校验两种约束。\n\n通用检查式：\n\n**estimated_input + reserved_output + safety_margin ≤ effective_context_limit**\n\n这里的 estimated_input 应在目标模型 tokenizer 和真实消息序列化规则下测量。字符数估算只能用于早期粗略预估，不能作为最终发送前的硬性校验。"
      },
      {
        heading: "一个逐步计算的超限案例",
        body: "预算表能帮助定位超限来自历史、检索还是输出预留，而不是简单地删除最后一段文本。",
        markdown: "继续使用 16,000 token 的教学上限。假设请求实际计量结果为：\n\n- 固定 system/developer 与工具定义：1,600\n- 当前用户消息：600\n- 历史对话：4,800\n- RAG 片段：7,000\n- 工具返回：1,200\n- 输出预留：2,000\n- 安全余量：500\n\n总预算为 1,600 + 600 + 4,800 + 7,000 + 1,200 + 2,000 + 500 = **17,700 tokens**，超过上限 1,700 tokens。\n\n一种可解释的调整方案：\n\n1. 将历史从 4,800 压缩到 2,800，节省 2,000。\n2. RAG 从 7,000 降到 6,000，节省 1,000，但必须检查证据覆盖是否下降。\n3. 保留 2,000 输出预算和 500 安全余量。\n\n调整后总量为 14,700 tokens，低于 16,000 上限，余下 1,300 tokens。该方案只是算术上可行；最终是否可用，还要检查摘要是否丢失约束、检索是否漏掉关键证据，以及目标 API 的真实计量规则。\n\n**工程原则：** 不应为了让请求通过而盲目压缩 system/developer 指令或删除安全约束。优先优化重复历史、低相关检索片段、冗余工具输出和可重新获取的数据。"
      },
      {
        heading: "截断、滑动窗口、摘要与检索",
        body: "上下文管理策略需要根据任务对精确历史、长期事实和证据可追溯性的要求选择，而不是采用单一截断规则。",
        markdown: "**截断（Truncation）**：删除较旧或低优先级内容，简单且可预测，但可能丢失早期约束、决策或关键事实。应定义保留顺序和不可删除的系统约束。\n\n**滑动窗口（Sliding Window）**：保留最近 N 个 token 或若干轮消息。适合局部连续对话，但窗口之外的信息不会自动保留。\n\n**摘要（Summarization）**：把历史压缩成较短状态。摘要应区分用户明确事实、已完成决策、未决事项、来源和不确定性；压缩过程可能引入遗漏或错误，关键事实应能回溯原文。\n\n**检索（Retrieval）**：把长期文档或历史存储在上下文之外，按当前问题取回相关片段。检索提高可扩展性，但需要评估召回率、排序、权限过滤和引用正确性。\n\n常见工程方案会组合使用：保留固定系统指令和最近对话，对更早历史生成结构化摘要，再按需检索原始文档。检索结果应标注来源、版本和访问权限。"
      },
      {
        heading: "上下文窗口不等于有效记忆",
        body: "更大的上下文窗口扩大可输入序列范围，但不保证模型能同等可靠地利用其中每个位置的信息。",
        markdown: "模型可以在一个请求中接收大量 token，不代表它能像数据库一样稳定检索每个位置的所有事实。长序列可能带来注意力计算成本、噪声、冲突信息、位置偏差和证据定位困难。\n\n研究中常用“Lost in the Middle”描述某些长上下文设置下，模型对位于输入中部的信息利用效果可能低于开头或结尾的信息。该现象依模型、任务、提示结构和评测设置而变化，不能泛化为所有模型必然遵循固定的位置曲线。\n\n因此，系统设计不能只比较标称窗口大小。还应评估：\n\n- 目标任务所需事实在不同位置时的准确率；\n- 关键约束是否被长文档中的无关内容淹没；\n- 冲突来源和时间版本如何处理；\n- 模型能否引用正确片段并区分证据与推断；\n- 延迟、成本和输入规模是否满足服务目标。\n\n**学习检查：** 设计一个 20 页政策文件问答任务，说明为什么把全文塞入 prompt 不一定比“检索相关段落 + 保留来源”更可靠。"
      }
    ],
    assessments: [{
      id: "m03-03-context-budget-plan",
      type: "design-review",
      prompt: "为一个标称上下文上限 32,000 tokens 的模型请求设计预算表。必须纳入 system/developer、工具契约、用户消息、历史、RAG、工具返回、输出预留和安全余量；提供一次超限计算及压缩方案，并说明如何验证摘要/检索没有破坏关键约束。",
      rubric: [
        { criterion: "预算完整性", description: "覆盖所有主要输入来源与输出预留", points: 3 },
        { criterion: "计算准确性", description: "总量、超限值和调整后预算计算正确", points: 3 },
        { criterion: "压缩策略", description: "选择合理的截断、摘要或检索策略并说明代价", points: 2 },
        { criterion: "质量验证", description: "检查约束保留、证据召回和来源可追溯性", points: 2 }
      ]
    }],
    sources: [
      { title: "Lost in the Middle: How Language Models Use Long Contexts", url: "https://arxiv.org/abs/2307.03172", publisher: "Liu et al., TACL 2024", note: "长上下文中位置信息利用的实验研究" },
      { title: "LongBench: A Bilingual, Multitask Benchmark for Long Context Understanding", url: "https://arxiv.org/abs/2308.14508", publisher: "Bai et al., ACL 2024", note: "长上下文多任务评测基准" },
      { title: "Gemini 1.5: Unlocking multimodal understanding across millions of tokens of context", url: "https://arxiv.org/abs/2403.05530", publisher: "Google, 2024", note: "长上下文模型能力与评测报告" },
      { title: "OpenAI Cookbook: How to count tokens with tiktoken", url: "https://cookbook.openai.com/examples/how_to_count_tokens_with_tiktoken", publisher: "OpenAI", note: "使用目标 tokenizer 计数的示例；消息格式开销需结合 API 版本" }
    ]
  },
  {
    id: "m03-04-context-engineering-and-serialization",
    title: "第四讲：Context Engineering——把消息、模板与证据组织成模型输入",
    summary: "理解消息序列化、模板、上下文构造、RAG 与长上下文的互补关系，形成可审计的输入构建流程。",
    learningObjectives: [
      "解释结构化消息如何通过 Chat Template 序列化为模型输入",
      "区分普通文本、特殊 token、工具调用标记和多模态标记",
      "设计具有来源、优先级和版本信息的上下文组装流程",
      "比较 RAG 与长上下文在成本、覆盖率、可追溯性和任务适配上的取舍"
    ],
    estimatedMinutes: 65,
    content: [
      {
        heading: "Context Engineering 不只是写一段更长的 Prompt",
        body: "上下文工程关注哪些信息进入模型、以什么结构和优先级进入、如何更新与验证，以及哪些内容必须留在模型之外。",
        markdown: "Prompt Engineering 常聚焦指令表达、示例和输出格式；Context Engineering 的范围更广，包含消息组织、历史管理、检索、工具定义、状态摘要、证据来源、权限过滤和 token 预算。\n\n一个可维护的上下文构建流程至少需要回答：\n\n1. 当前任务的目标和成功条件是什么？\n2. 哪些规则必须稳定保留，哪些信息可以按需检索？\n3. 不同来源的信息是否有可信度、时间和权限差异？\n4. 冲突信息如何呈现，模型是否应该拒绝推断？\n5. 输入如何计量、压缩、版本化和审计？\n\n上下文不是“把能找到的东西全部塞进去”。冗余、过期或权限不匹配的信息会增加成本并干扰决策。"
      },
      {
        heading: "从结构化消息到模型序列",
        body: "Chat API 中的 role/content/tool 等结构通常需要被序列化为模型专用的消息格式，具体模板取决于模型和接口。",
        markdown: "应用层可能维护如下结构化消息：\n\n```json\n[\n  { "role": "system", "content": "遵守安全策略" },\n  { "role": "user", "content": "查找退款政策" },\n  { "role": "assistant", "tool_calls": [{ "name": "search_policy", "arguments": { "query": "退款" } }] },\n  { "role": "tool", "name": "search_policy", "content": "政策片段与来源" }\n]\n```\n\n服务端或客户端会根据协议把这些结构转成目标模型可识别的 token 序列。Chat Template 可能加入角色边界、通道信息、工具交接标记、生成前缀或其他控制符号。\n\n不要将 JSON 对象本身等同于模型输入 token。也不要手工拼接某模型的特殊 token 字符串来替代官方 SDK/模板，除非你明确掌握该模型的序列化契约。模板版本变化可能改变 token 用量、角色边界或工具控制流。"
      },
      {
        heading: "上下文中的优先级、来源与冲突",
        body: "上下文构建应保留来源和适用范围，使模型能够区分系统规则、用户目标、检索证据和不可信外部内容。",
        markdown: "建议将上下文内容按职责分类，而不是把所有片段拼成无差别长文本：\n\n| 类别 | 典型内容 | 工程处理 |\n|---|---|---|\n| 运行约束 | system/developer 规则 | 固定、版本化、优先保护 |\n| 当前目标 | 用户请求和任务参数 | 保留原意，必要时结构化 |\n| 状态摘要 | 已确认事实、决策、待办 | 标注时间、来源和置信边界 |\n| 外部证据 | RAG 文档、网页、工具结果 | 标注出处、版本、权限和时间 |\n| 不可信内容 | 用户文件、网页正文、邮件 | 当作数据，不提升为系统指令 |\n\n若两个来源冲突，应保留冲突和来源，而不是静默把它们合并成一个“事实”。对政策、价格、配置等时效性内容，时间戳和版本尤其重要。\n\n检索到的文档即使包含看似指令的文字，也不因此获得更高权限。上下文组装层应将外部内容明确标记为引用数据，并由工具和应用策略执行权限控制。"
      },
      {
        heading: "RAG 与长上下文：不是二选一",
        body: "长上下文适合需要广泛输入覆盖的任务，RAG 适合从较大外部语料中按问题选择证据；二者可以组合。",
        markdown: "**长上下文**可以一次提供大量文档，减少检索漏召回的风险，并保留跨段落关系；但会增加输入成本、延迟和噪声，也不能保证模型均匀利用所有位置。\n\n**RAG** 将文档切分、索引并按查询检索相关片段，通常能控制输入规模、附带来源，并让语料规模超出单次上下文窗口；但检索质量受切分、embedding、查询改写、召回、重排和权限过滤影响。\n\n| 维度 | 长上下文 | RAG |\n|---|---|---|\n| 语料范围 | 受单次输入预算限制 | 可扩展到外部索引规模 |\n| 证据覆盖 | 可输入完整材料 | 依赖召回和排序质量 |\n| 输入成本 | 文档越长成本越高 | 只输入检索片段，仍有索引成本 |\n| 可追溯性 | 需要自行标注位置和来源 | 可将 chunk ID/来源直接带入上下文 |\n| 主要风险 | 噪声、位置利用和成本 | 漏召回、错排序、过期索引 |\n\n常见组合是：对小型、紧密关联的材料使用长上下文；对大型知识库使用 RAG；对检索结果再用较长上下文进行跨证据综合。选择应由任务评测决定，而不是由窗口大小单独决定。"
      },
      {
        heading: "可审计的 Context Assembly Pipeline",
        body: "生产级上下文构建应有明确输入来源、过滤、排序、预算、序列化和记录步骤。",
        markdown: "一个可操作的上下文装配流程：\n\n1. **Resolve task**：识别任务类型、用户目标、输出格式和成功条件。\n2. **Load policy**：载入固定系统/开发者规则和当前模型的工具契约。\n3. **Collect state**：读取近期消息与结构化任务状态，校验租户和资源权限。\n4. **Retrieve evidence**：按问题检索文档，执行访问控制、去重、时间过滤和重排。\n5. **Compose**：将指令、目标、状态、证据和工具结果放入明确的结构区块。\n6. **Count and fit**：使用目标 tokenizer/接口计量，应用预算和压缩策略。\n7. **Serialize**：按目标模型 Chat Template 或 API 契约构造最终请求。\n8. **Record**：记录模板版本、来源 ID、token 计量、截断动作和模型标识，敏感内容按策略脱敏。\n\n注意：记录 token 数并不意味着必须记录完整敏感 prompt。审计设计应采用数据最小化原则，保存足以解释请求构成的元数据，并对原文访问施加严格控制。"
      }
    ],
    assessments: [{
      id: "m03-04-context-assembly-design",
      type: "design-review",
      prompt: "为企业知识助手设计 Context Assembly Pipeline。必须包含消息序列化、来源标注、权限过滤、RAG、token 预算、模板版本、冲突处理和审计字段；说明哪些内容属于不可信数据。",
      rubric: [
        { criterion: "序列化理解", description: "区分结构化消息、Chat Template 与 token 序列", points: 2 },
        { criterion: "来源与权限", description: "为检索证据和工具结果保留来源及权限边界", points: 3 },
        { criterion: "RAG/长上下文取舍", description: "结合任务解释两种策略的组合方式", points: 2 },
        { criterion: "审计和预算", description: "定义 token 检查、模板版本和最小化审计元数据", points: 3 }
      ]
    }],
    sources: [
      { title: "Chat templates", url: "https://huggingface.co/docs/transformers/chat_templating", publisher: "Hugging Face", note: "结构化对话消息到模型输入序列的模板机制" },
      { title: "Messages and roles", url: "https://platform.openai.com/docs/guides/text-generation", publisher: "OpenAI API Documentation", note: "消息输入与文本生成接口概念；具体接口以当前文档为准" },
      { title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks", url: "https://arxiv.org/abs/2005.11401", publisher: "Lewis et al., NeurIPS 2020", note: "RAG 将参数化生成与非参数化检索结合" },
      { title: "Lost in the Middle: How Language Models Use Long Contexts", url: "https://arxiv.org/abs/2307.03172", publisher: "Liu et al., TACL 2024", note: "长上下文输入组织与信息位置影响" }
    ]
  },
  {
    id: "m03-05-tokenizer-lab-and-integrated-practice",
    title: "第五讲：综合实操——Token 计量、Embedding 估算与上下文预算审计",
    summary: "使用现有 Tokenizer Lab 观察玩具 BPE 合并，完成表示链路、embedding 规模估算和一次完整上下文预算审计。",
    learningObjectives: [
      "使用 Tokenizer Lab 观察玩具 BPE 合并与 token 片段变化",
      "说明教学 tokenizer 与真实模型 tokenizer 的差异和实验边界",
      "完成 embedding 参数规模与上下文预算的可复算计算",
      "提交可追溯的 tokenizer、context 和请求预算审计报告"
    ],
    estimatedMinutes: 80,
    content: [
      {
        heading: "实验前：明确你要验证的假设",
        body: "Tokenizer Lab 用内置玩具 BPE 词表展示子词合并过程，验证的是算法直觉而不是任何厂商 tokenizer 的真实编码结果。",
        markdown: "本课程已有的 Tokenizer Lab 在浏览器本地运行，使用内置示例词表展示文本片段和玩具 BPE 合并。它适合观察：\n\n- 相邻符号对合并后，token 片段如何变化；\n- 重复片段如何在词表中被复用；\n- 不同输入文本可能产生不同的片段序列；\n- 合并规则会影响最终 token 数量。\n\n它**不**加载 OpenAI、Anthropic、Google、Meta 或其他厂商的真实 tokenizer 词表，不保证与任何生产模型得到相同 token ID 或 token count，也不模拟完整的 Unicode 预处理、Chat Template、多模态计量或服务端请求开销。\n\n实验报告必须记录“教学模拟”边界。若要获得某个具体模型的真实 token 数，应使用该模型官方推荐的 tokenizer、SDK 或计量接口，并注明模型和版本。"
      },
      {
        heading: "实验任务 A：观察 BPE 合并",
        body: "通过改变输入文本观察教学词表中的片段组合，并解释为什么合并后的 token 数可能下降。",
        markdown: "操作步骤：\n\n1. 打开课程中的 Tokenizer Lab，先使用默认示例文本。\n2. 记录初始字符/符号片段、每轮合并结果和最终 token 片段。\n3. 输入包含重复子串的文本，观察重复片段是否更容易被合并。\n4. 输入中英混合文本、数字、标点和代码，观察玩具词表覆盖不足时的行为。\n5. 将结果与算法预期比较，记录不符合预期的情况。\n\n**观察表：**\n\n| 记录项 | 应记录的内容 |\n|---|---|\n| 输入文本 | 原始文本及字符编码注意事项 |\n| 初始片段 | Lab 展示的起始符号 |\n| 合并轨迹 | 每轮被合并的相邻片段 |\n| 最终片段 | 最终 token 序列和数量 |\n| 解释 | 高频复用、词表覆盖或规则顺序如何影响结果 |\n| 限制 | 玩具词表与真实 tokenizer 的差异 |\n\n不要把实验中显示的片段数量称为真实模型 token 数，也不要把玩具 token ID 传给真实模型。"
      },
      {
        heading: "实验任务 B：计算 Embedding 参数和权重存储",
        body: "根据词表规模和 embedding 维度估算参数量，理解词表扩张对模型参数与存储的影响。",
        markdown: "练习设定：词表 V=65,536，embedding 维度 d=2,048。\n\n- 参数量：65,536 × 2,048 = **134,217,728**。\n- BF16/FP16 权重存储：134,217,728 × 2 bytes = 268,435,456 bytes，即 **256 MiB**。\n- FP32 权重存储：134,217,728 × 4 bytes = 536,870,912 bytes，即 **512 MiB**。\n\n请进一步回答：\n\n1. 若词表扩大 25%，维度不变，参数量如何变化？\n2. 若维度扩大一倍，词表不变，存储量如何变化？\n3. 为什么训练时显存占用不能只按 embedding 权重大小估算？\n4. 如果输入 embedding 与输出投影不共享权重，额外参数可能来自哪里？\n\n这是对单个矩阵的理论估算。真实模型可能使用分片、量化、padding、共享权重或不同输出头结构，必须检查实际配置。"
      },
      {
        heading: "实验任务 C：建立一份请求 Token Budget",
        body: "把真实请求拆成可计量的消息与内容类别，先做预算估算，再用目标模型的 tokenizer 或接口进行实际核验。",
        markdown: "请为一个企业知识助手设计 24,000 token 的教学预算。示例分配如下：\n\n| 组成 | 计划预算 |\n|---|---:|\n| System 规则 | 900 |\n| Developer 指令与工具 schema | 1,100 |\n| 用户问题 | 400 |\n| 近期历史 | 2,600 |\n| 结构化任务状态/摘要 | 1,000 |\n| RAG 证据片段 | 8,000 |\n| 工具结果 | 1,500 |\n| 输出预留 | 5,000 |\n| 模板开销与安全余量 | 1,500 |\n| **合计** | **22,000** |\n\n尚有 2,000 tokens 未分配。请说明是否保留为动态余量，还是根据任务分配给检索或输出。不要为了用满窗口而无理由增加输入。\n\n随后构造一个超限情景：RAG 结果增加 3,000 tokens，工具输出增加 1,500 tokens。新总量为 26,500 tokens，超过 24,000 上限 2,500 tokens。提出调整顺序，并解释哪些内容不可随意删除。"
      },
      {
        heading: "综合交付：Token 与 Context 审计报告",
        body: "最终产物应把 tokenizer 选择、表示层次、embedding 估算、预算计算和压缩质量验证连成一条可审计证据链。",
        markdown: "提交一份报告，至少包含以下部分：\n\n**A. Tokenizer 说明**\n- 目标模型/Tokenizer 名称与版本；若使用教学 Lab，明确标记为 toy BPE。\n- 输入文本、切分结果、token 数和计量工具。\n- 预处理、特殊 token 和 Chat Template 的注意事项。\n\n**B. 表示链路**\n- 从原始文本到 token ID 的流程图。\n- 明确指出 token ID 是离散索引，embedding 是可学习向量。\n- 说明 contextual hidden state 为什么随上下文变化。\n\n**C. 参数估算**\n- 词表大小、embedding 维度、参数量和数据类型。\n- 计算过程、单位换算和未包含的额外开销。\n\n**D. Context Budget**\n- 输入各分项、输出预留、模板开销和安全余量。\n- 超限情景、压缩动作和调整后的总量。\n- 关键指令、权限边界和必要证据的保留策略。\n\n**E. 质量验证**\n- 对压缩前后的任务集进行事实保持检查。\n- 检查来源引用、关键约束、冲突信息和权限过滤。\n- 记录模型、Tokenizer、模板和评测数据版本。\n\n验收重点不是“把窗口塞满”，而是证明模型收到的是足够、相关、可信、可计量且符合权限约束的上下文。"
      }
    ],
    assessments: [{
      id: "m03-05-integrated-context-audit",
      type: "design-review",
      prompt: "提交一份 Token 与 Context 综合审计报告：记录 Tokenizer 实验、真实 tokenizer 核验计划、embedding 参数估算、24,000-token 请求预算、超限调整和压缩前后质量验证。",
      rubric: [
        { criterion: "实验记录与边界", description: "完整记录 toy BPE 合并，并明确不等同于真实厂商 tokenizer", points: 2 },
        { criterion: "表示链路", description: "正确区分文本、token、ID、embedding 和上下文隐藏状态", points: 2 },
        { criterion: "参数估算", description: "参数量、字节数和单位换算正确", points: 2 },
        { criterion: "预算与超限处理", description: "预算分项完整，超限计算和压缩顺序合理", points: 2 },
        { criterion: "验证与可追溯性", description: "定义事实保持检查并记录模型、tokenizer、模板和数据版本", points: 2 }
      ]
    }],
    sources: [
      { title: "Tokenizer documentation", url: "https://huggingface.co/docs/tokenizers/index", publisher: "Hugging Face", note: "Tokenizer 构建、训练和编码 API" },
      { title: "tiktoken", url: "https://github.com/openai/tiktoken", publisher: "OpenAI", note: "OpenAI tokenizer 实现与编码名称说明；须匹配模型" },
      { title: "How to count tokens with tiktoken", url: "https://cookbook.openai.com/examples/how_to_count_tokens_with_tiktoken", publisher: "OpenAI Cookbook", note: "真实 tokenizer 计量示例及消息开销注意事项" },
      { title: "Llama 3 model card", url: "https://huggingface.co/meta-llama/Meta-Llama-3-8B", publisher: "Meta / Hugging Face", note: "具体模型 tokenizer 与模型资产的版本化示例" }
    ]
  }
];
