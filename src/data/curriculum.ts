import type { Course } from "../types/course";
import { flagshipM01Lessons } from "./flagshipM01";
import { flagshipM02Lessons } from "./flagshipM02";

const authoredLessons: Record<string, Pick<Course["modules"][number]["lessons"][number], "content" | "assessments" | "sources">> = {
  M01: {
    content: [
      {
        heading: "AI、机器学习、深度学习与 LLM 的关系",
        body: "AI 是目标与系统范畴，机器学习是实现 AI 的重要方法，深度学习是机器学习中的一类方法，LLM 则是以大规模文本训练为基础的模型类别。",
        markdown: "人工智能（AI）关注的是：机器系统如何根据输入推断并产生预测、内容、建议或决策。机器学习（ML）通过数据和优化过程学习模型参数，而不是只依赖人工编写的固定规则。深度学习（DL）使用多层神经网络学习表示，是机器学习的重要分支。\n\n大语言模型（LLM）通常以大量文本或多模态数据训练，学习 token 序列的统计结构，并在给定上下文时生成后续 token。它是 AI 系统中可以被调用的模型组件，不等于完整的 AI 产品或 Agent。\n\n可以把关系理解为：**AI 系统 ⊃ 机器学习方法 ⊃ 深度学习方法**；LLM 是深度学习模型家族中的一类重要模型，但不是所有 AI 都是 LLM。"
      },
      {
        heading: "模型、应用与系统不是同一个层次",
        body: "模型负责从输入推断输出；应用负责组织交互与业务逻辑；AI 系统还包含数据、工具、运行环境、监控和治理。",
        markdown: "工程实践中需要区分三个层次：\n\n- **模型（Model）**：参数化函数，接收输入并产生输出，例如文本生成模型。\n- **应用（Application）**：把模型接入界面、提示词、检索、工具和业务规则，形成用户可操作的功能。\n- **系统（System）**：除应用外，还包括数据生命周期、身份权限、部署、日志、评测、人工监督、风险控制和退役机制。\n\n因此，“接入一个模型 API”只完成了系统的一部分。生产级 AI 工程还必须回答：数据从哪里来、谁能调用工具、错误如何发现、成本如何限制、输出如何验证，以及发生故障时如何降级。"
      },
      {
        heading: "生成式模型的能力边界",
        body: "生成内容不等于检索事实或执行验证；输出需要结合证据、工具结果和业务规则进行校验。",
        markdown: "LLM 的输出是根据模型参数和当前上下文计算得到的生成结果。流畅、完整的语言形式并不能证明内容正确。\n\n工程上至少要区分：\n\n1. **生成能力**：组织语言、总结、改写、生成代码或候选方案。\n2. **知识依据**：模型参数中学到的统计关联、当前上下文，以及外部检索提供的证据。\n3. **执行能力**：只有在系统明确连接工具并授权后，模型提出的工具调用才可能改变外部状态。\n4. **验证能力**：测试、类型检查、数据库约束、来源核验和人工审核仍然需要独立设计。\n\n对高风险任务，不能把模型自信程度当成正确性证明。应记录输入、模型版本、检索证据、工具调用和验证结果。"
      },
      {
        heading: "建立系统视角",
        body: "理解 AI 系统生命周期，才能把模型能力转化为可运行、可评估、可治理的工程产品。",
        markdown: "一个完整 AI 系统会经历目标与设计、数据收集和处理、模型构建或适配、测试评估、部署、运行监控以及退役等阶段。这些阶段可能反复迭代，而不是一次性线性流程。\n\n**学习检查：** 选择一个“智能客服”产品，分别列出模型、应用层和系统层的组成；再指出一个模型无法独立解决、必须由系统工程承担的问题。"
      }
    ],
    assessments: [{
      id: "m01-system-boundary-review",
      type: "design-review",
      prompt: "为一个 AI 客服系统绘制模型、应用和系统边界图，并说明至少三个不能交给 LLM 单独保证的工程控制。",
      rubric: [
        { criterion: "层次区分", description: "正确区分模型、应用与系统职责", points: 3 },
        { criterion: "数据与工具边界", description: "说明数据来源、工具权限和外部副作用", points: 3 },
        { criterion: "验证与治理", description: "提出测试、监控、人工介入或风险控制措施", points: 4 }
      ]
    }],
    sources: [
      { title: "Updated OECD Definition of an AI System", url: "https://oecd.ai/en/dashboards/policy-initiatives/updated-oecd-definition-of-an-ai-system-4108", publisher: "OECD.AI", note: "AI 系统定义与生命周期语境" },
      { title: "Explanatory Memorandum on the Updated OECD Definition of an AI System", url: "https://www.oecd.org/en/publications/explanatory-memorandum-on-the-updated-oecd-definition-of-an-ai-system_623da898-en.html", publisher: "OECD", note: "定义修订的解释文件" }
    ]
  },
  M02: {
    content: [
      {
        heading: "从序列建模到 Transformer",
        body: "Transformer 使用注意力机制建立 token 之间的内容相关连接，避免依赖传统循环结构逐步传递序列状态。",
        markdown: "文本先被转换成 token ID，再映射为向量表示。Transformer 在这些向量上执行多层变换，让每个位置根据任务和掩码规则聚合其他位置的信息。\n\n原始 Transformer 论文提出了以注意力机制为核心的 Encoder–Decoder 架构。现代 LLM 常见 Decoder-only 变体，但仍共享 token embedding、位置表示、注意力、前馈网络、残差连接和归一化等核心思想。\n\n不要把 Transformer 等同于 Attention：Attention 是核心运算之一，Transformer 是由多个子层、残差路径和归一化等组件组成的整体架构。"
      },
      {
        heading: "Scaled Dot-Product Attention",
        body: "Q 与 K 的点积衡量查询和键的匹配程度，缩放后经 Softmax 变成权重，再对 V 加权求和。",
        markdown: "对单个注意力头，计算过程为：\n\n**Attention(Q,K,V) = softmax(QKᵀ / √dₖ)V**\n\n- **Query（Q）**：当前位置希望从上下文中寻找什么信息。\n- **Key（K）**：每个位置用于被匹配的特征。\n- **Value（V）**：匹配后实际被聚合的信息。\n- **缩放因子 √dₖ**：控制点积随维度增长时的数值尺度。\n- **Softmax**：将每一行分数归一化为权重分布。\n\nQ、K、V 通常由输入隐藏状态经过不同的线性投影得到。它们不是三组固定语义标签，而是训练得到的表示空间。"
      },
      {
        heading: "Multi-Head Attention、Mask 与位置",
        body: "多头机制允许模型在多个投影子空间中并行计算注意力；Mask 限制可见位置，位置编码提供序列顺序信息。",
        markdown: "**多头注意力**把隐藏维度投影到多个头，各头独立计算注意力，再拼接并投影回模型维度。它提供多个并行的信息聚合子空间，但不能简单解释为每个头固定负责一种语言学关系。\n\n**Causal Mask** 在自回归生成中阻止当前位置读取未来 token；Padding Mask 则用于屏蔽无效填充位置。二者解决的问题不同，实际模型可能组合使用。\n\n注意力本身不天然包含 token 的先后顺序。Transformer 需要位置编码或其他位置机制，使模型能够利用序列顺序。"
      },
      {
        heading: "矩阵维度与复杂度直觉",
        body: "序列长度和隐藏维度决定注意力张量规模；标准全注意力的分数矩阵随序列长度平方增长。",
        markdown: "若 batch 为 B、头数为 H、序列长度为 T、每头维度为 dₖ，则 Q、K、V 的典型形状为 [B,H,T,dₖ]，注意力分数矩阵为 [B,H,T,T]。\n\n这意味着标准全注意力的计算与存储开销会受到 T² 项影响。长上下文场景需要关注 KV Cache、分块/稀疏注意力、内存布局和推理内核，而不能只看模型参数量。\n\n**学习检查：** 在 Transformer Lab 中切换 Causal Mask，观察每一行权重如何变化，并解释为什么第一行不能读取后续位置。"
      }
    ],
    assessments: [{
      id: "m02-attention-trace",
      type: "knowledge-check",
      prompt: "给定 Q、K、V 的矩阵形状，写出 Attention 分数矩阵和输出矩阵的形状，并解释 Causal Mask 的作用。",
      rubric: [
        { criterion: "维度推导", description: "正确推导 QKᵀ 与权重乘 V 的形状", points: 4 },
        { criterion: "计算流程", description: "正确解释缩放、Softmax 和加权求和", points: 3 },
        { criterion: "Mask 语义", description: "说明自回归场景为何屏蔽未来位置", points: 3 }
      ]
    }],
    sources: [
      { title: "Attention Is All You Need", url: "https://arxiv.org/abs/1706.03762", publisher: "Vaswani et al., NeurIPS 2017", note: "Transformer 原始论文" },
      { title: "Attention Is All You Need", url: "https://research.google/pubs/attention-is-all-you-need/", publisher: "Google Research", note: "论文发布页面" }
    ]
  },
  M03: {
    content: [
      {
        heading: "Tokenization：文本如何变成模型输入",
        body: "Tokenizer 将原始文本切分为 token，并映射到模型词表中的整数 ID；模型实际处理的是 ID 对应的向量，而不是直接处理字符串。",
        markdown: "典型输入链路是：\n\n**文本 → 规范化/预分词 → 子词切分 → token ID → Embedding**\n\nToken 不等同于自然语言中的词。一个英文单词可能被拆成多个 token；中文字符、标点、空白、代码和 emoji 的切分方式也取决于具体 tokenizer。\n\nTokenizer 是模型接口契约的一部分。使用错误的 tokenizer 会改变输入 ID、上下文长度和模型行为，因此不能把不同模型的 token 数直接互换。"
      },
      {
        heading: "为什么常用子词算法",
        body: "字符级词表太小但序列过长，词级词表容易膨胀并遇到未登录词；子词方法在词表规模和序列长度之间折中。",
        markdown: "常见策略包括：\n\n- **Word-level**：按词切分，语义直观，但词表大且容易遇到词表外词。\n- **Character-level**：按字符切分，覆盖能力强，但序列更长，单个 token 信息量较低。\n- **Subword**：把高频片段合并为子词，兼顾词表规模与组合能力。\n\nBPE 通过反复合并语料中高频相邻符号对构建词表。WordPiece 和 Unigram 使用不同的建模与选择准则。具体算法、预分词规则和特殊 token 由模型训练与发布流程共同确定。"
      },
      {
        heading: "Token ID 与 Embedding 的区别",
        body: "Token ID 是离散词表索引；Embedding 是模型学习到的稠密向量表示，两者不是同一个概念。",
        markdown: "Tokenizer 输出整数 ID，例如 [101, 2023, 2003]。Embedding 层再根据 ID 查表，得到浮点向量。ID 本身不包含可直接进行语义距离计算的连续含义；向量表示才进入后续神经网络运算。\n\n同一段文本使用不同模型 tokenizer，可能得到不同 token 序列和 ID。Embedding 矩阵也与对应模型的词表和权重绑定，不能随意混用。"
      },
      {
        heading: "Context Window 与 Token Budget",
        body: "上下文窗口通常以 token 数量计量；输入、系统提示、工具结果和生成输出都会消耗上下文预算。",
        markdown: "上下文预算不是简单的“用户消息字数”。系统提示、对话历史、检索片段、工具返回和模型生成内容都可能占用 token。\n\n工程上需要：\n\n1. 在目标模型 tokenizer 下计算 token，而不是仅按字符数估算。\n2. 为输出预留预算，避免输入占满窗口。\n3. 对长文档执行切分、摘要或检索，不要无差别拼接。\n4. 关注模型对长上下文的实际利用质量，而不只看标称窗口大小。\n\n**学习检查：** 对同一段中英混合文本，比较不同 tokenizer 的 token 数，并记录模型名称与 tokenizer 版本。"
      }
    ],
    assessments: [{
      id: "m03-token-budget",
      type: "code-task",
      prompt: "设计一个模型请求前的 Token Budget 检查器，输入模型标识、消息列表、最大上下文和输出预留量，输出是否可发送及超限原因。",
      rubric: [
        { criterion: "Tokenizer 选择", description: "明确使用目标模型对应的 tokenizer，而非字符数替代", points: 3 },
        { criterion: "预算计算", description: "正确计入系统消息、历史、工具结果和输出预留", points: 4 },
        { criterion: "边界处理", description: "覆盖未知模型、超限输入和版本不匹配", points: 3 }
      ]
    }],
    sources: [
      { title: "Tokenization algorithms", url: "https://huggingface.co/docs/transformers/tokenizer_summary", publisher: "Hugging Face", note: "词级、字符级与子词算法概览" },
      { title: "LLM Course — Chapter 6: Tokenizers", url: "https://huggingface.co/learn/llm-course/chapter6/1", publisher: "Hugging Face", note: "Tokenizer 训练与算法学习路径" }
    ]
  },
  M04: {
    content: [
      { heading: "预训练：从大规模数据中学习表示", body: "预训练通常使用大规模语料和自监督目标，让模型学习语言、知识和模式的统计结构。", markdown: "预训练阶段会在大规模数据上优化模型参数。自回归语言模型常使用下一 token 预测目标；遮罩语言模型则可使用被遮蔽 token 预测等目标。\n\n训练数据、去重、质量筛选、数据污染和计算预算都会影响模型能力。参数量并不是质量的唯一决定因素；数据分布、训练配方、架构与推理方式同样重要。" },
      { heading: "SFT：把基础能力调整为指令跟随", body: "Supervised Fine-Tuning 使用示范输入输出对，让模型更贴近指令格式和目标任务。", markdown: "SFT 通常以人工或合成的指令—回应样本进行监督式训练。它可以改善指令遵循、格式控制和特定领域任务表现，但结果取决于数据质量、覆盖范围和标注一致性。\n\n微调不会自动保证事实正确，也不会自动建立工具权限或安全边界。对新知识更新，可能需要检索或数据管线，而不是只依赖微调。" },
      { heading: "偏好对齐与 RLHF", body: "偏好对齐使用比较或评分信号，让模型输出更符合人类偏好和产品目标。", markdown: "一种经典 RLHF 流程包含：收集示范数据、收集多个候选回答的偏好比较、训练奖励模型，再使用强化学习优化语言模型。现代系统也可能使用直接偏好优化等替代方法。\n\n偏好信号是代理指标，不等于客观真理。偏好模型可能放大标注偏差、过度迎合或奖励骇客，因此仍需独立的安全、能力和真实性评测。" },
      { heading: "训练数据与评测数据治理", body: "数据切分、污染检查、代表性和可追溯性决定评测能否反映真实泛化能力。", markdown: "训练集、验证集和测试集必须有清晰边界。若测试题目或答案已进入训练数据，离线分数可能高估模型的泛化能力。\n\n工程交付应记录数据来源、许可、版本、清洗规则、去重策略和切分方式。模型评测也要覆盖分布外案例、长尾输入和安全拒答，而不只看平均分数。" }
    ],
    assessments: [{ id: "m04-training-pipeline-review", type: "design-review", prompt: "设计一份小型领域模型适配计划，区分预训练、SFT、偏好对齐和评测数据治理的目的。", rubric: [{ criterion: "阶段区分", description: "正确区分预训练、SFT 与偏好优化", points: 4 }, { criterion: "数据治理", description: "说明来源、许可、去重和污染控制", points: 3 }, { criterion: "评测设计", description: "建立独立测试集和安全评测", points: 3 }] }],
    sources: [
      { title: "Language Models are Few-Shot Learners", url: "https://arxiv.org/abs/2005.14165", publisher: "Brown et al., NeurIPS 2020", note: "大规模自回归预训练与 few-shot 能力" },
      { title: "Training language models to follow instructions with human feedback", url: "https://arxiv.org/abs/2203.02155", publisher: "Ouyang et al., NeurIPS 2022", note: "InstructGPT 与 RLHF 流程" }
    ]
  },
  M05: {
    content: [
      { heading: "自回归推理流程", body: "自回归模型逐 token 生成：模型根据当前上下文计算下一 token 分布，再依解码策略选择 token。", markdown: "推理请求通常先处理 prompt（prefill），计算上下文各位置的隐藏状态和 KV；接着进入 decode 阶段，逐步产生新 token。每一步的输出会成为下一步上下文的一部分。\n\nPrefill 的工作量与输入长度相关；decode 需要反复执行模型前向计算，并可能受到内存带宽、批量策略和 KV Cache 读取影响。" },
      { heading: "Greedy、Sampling 与解码参数", body: "解码策略控制如何从下一 token 概率分布中选择输出，会影响多样性、可重现性和任务质量。", markdown: "Greedy decoding 每一步选择概率最高的 token；Sampling 按概率分布抽样。Temperature 调整分布尖锐程度，Top-k 限制候选数量，Top-p 保留累积概率达到阈值的候选集合。\n\n这些参数不是越高越好。确定性任务通常更重视稳定和可控；创意生成可能需要更高多样性。必须用任务数据集测试，而不是只凭主观感受调参。" },
      { heading: "KV Cache 与内存成本", body: "KV Cache 保存已处理 token 的 Key/Value，避免每生成一个 token 都重新计算整段历史。", markdown: "在自回归 decode 中，模型可以保留先前 token 的 K/V 张量，新增 token 时只计算新位置的 K/V，降低重复计算。代价是 Cache 需要 GPU 或其他设备内存。\n\nCache 大小受 batch、层数、KV head 数、head dimension、序列长度和数据精度影响。长上下文与高并发会让 KV Cache 成为部署容量规划的重要因素。" },
      { heading: "部署指标与服务策略", body: "推理服务需要同时衡量延迟、吞吐、并发、首 Token 延迟、每 token 延迟和单位成本。", markdown: "常见指标包括 TTFT（Time To First Token）、TPOT（Time Per Output Token）、tokens/s、请求吞吐、P50/P95/P99 延迟、GPU 利用率、Cache 命中和错误率。\n\nContinuous batching、请求排队、模型量化、KV Cache 管理和多模型路由会互相影响。容量规划应基于真实负载分布和服务等级目标，而不是单次 benchmark。" }
    ],
    assessments: [{ id: "m05-inference-capacity", type: "code-task", prompt: "建立一份推理服务容量规划表，至少纳入 prompt 长度、输出长度、并发数、KV Cache 和 P95 延迟。", rubric: [{ criterion: "解码流程", description: "能区分 Prefill 与 Decode", points: 3 }, { criterion: "Cache 模型", description: "识别 KV Cache 主要维度和内存影响", points: 3 }, { criterion: "服务指标", description: "使用 TTFT、TPOT、吞吐和尾延迟建立容量判断", points: 4 }] }],
    sources: [
      { title: "Generation configuration", url: "https://huggingface.co/docs/transformers/main_classes/text_generation", publisher: "Hugging Face", note: "解码参数和 KV Cache 配置" },
      { title: "KV cache strategies", url: "https://huggingface.co/docs/transformers/en/kv_cache", publisher: "Hugging Face", note: "KV Cache 类型和内存策略" }
    ]
  },
  M06: {
    content: [
      { heading: "Prompt 是可版本化的输入契约", body: "Prompt 不只是自然语言技巧，而是模型应用中的输入介面，需要结构、版本、测试和变更治理。", markdown: "一个稳定 Prompt 通常包含任务目标、角色或行为约束、输入上下文、输出格式、例外处理和示例。动态数据应透过明确的栏位注入，而不是把用户内容无限制拼接到指令区。\n\n生产 Prompt 应放入版本控制，与代码一起审查、测试和回滚。不要依赖无法追踪的手工复制版本。" },
      { heading: "指令、上下文与数据边界", body: "明确分隔指令与不可信数据，能降低模型把引用内容误当成控制指令的风险。", markdown: "使用清楚的标题、栏位或结构化分隔符区分任务指令、参考数据和用户输入。对检索文件、网页和附件，应明确告知模型它们是数据而非高优先级指令。\n\nPrompt Injection 不能只靠一句“忽略恶意指令”解决。工具权限、数据存取和外部副作用必须在模型之外由程序控制。" },
      { heading: "Few-shot 与输出格式约束", body: "少量高质量示例可以展示期望模式；结构化输出则应由 Schema 和程序验证兜底。", markdown: "Few-shot 示例应覆盖典型输入、边界案例和错误模式，并保持标注一致。若需要 JSON，应定义栏位、型别、必填项和允许值，并在接收端执行验证。\n\n自然语言要求“只输出 JSON”并不能替代结构化输出机制和 Schema 验证。" },
      { heading: "Prompt 评测与回归", body: "Prompt 变更应透过固定测试集、质量指标和回归比较，而不是只看单次示例。", markdown: "建立代表性测试案例，覆盖正常输入、歧义输入、超长内容、注入攻击和拒答边界。记录模型版本、Prompt 版本、参数和评测结果。\n\n可将 Prompt 视为一段可执行的产品配置：每次修改都应回答质量是否改善、哪些案例退化、成本和延迟是否改变。" }
    ],
    assessments: [{ id: "m06-prompt-test-plan", type: "design-review", prompt: "为客服摘要功能设计一份 Prompt 规格和回归测试计画，包含不可信输入隔离和结构化输出验证。", rubric: [{ criterion: "提示结构", description: "明确定义任务、上下文、输出和例外规则", points: 3 }, { criterion: "数据隔离", description: "区分指令与不可信数据，避免越权指令注入", points: 3 }, { criterion: "回归评测", description: "包含测试案例、质量指标和版本记录", points: 4 }] }],
    sources: [
      { title: "Prompt engineering", url: "https://developers.openai.com/api/docs/guides/prompt-engineering", publisher: "OpenAI", note: "Prompt 结构、版本化与评测" },
      { title: "Prompting", url: "https://developers.openai.com/api/docs/guides/prompting", publisher: "OpenAI", note: "指令、示例与提示设计" }
    ]
  },
  M07: {
    content: [
      { heading: "Tool Calling 的控制流", body: "模型提出工具调用请求，应用程序验证并执行工具，再把工具结果交还模型；模型本身不会自动执行你的程序。", markdown: "典型流程：应用把可用工具描述和用户请求传給模型；模型回传工具名称与参数；应用验证名称、参数、身份和权限；应用执行工具并回传结果；模型再根据结果产生回应或提出下一次工具调用。\n\n这是多步骤控制流，不是模型直接获取数据库或作业系统权限。执行责任始终在应用程序和工具服务端。" },
      { heading: "Schema 与参数验证", body: "工具定义应使用明确 Schema 描述参数，并在服务端重新验证所有输入。", markdown: "工具 Schema 应定义栏位名称、型别、必填性、范围、列举值和额外栏位策略。即使模型支持 Strict Structured Outputs，也不能省略服务端授权、业务规则和资源存在性检查。\n\nSchema 保证的是数据形状，不代表操作合法、用户有权执行，或副作用符合业务预期。" },
      { heading: "授权、幂等与副作用", body: "读取工具和写入工具应区分权限；支付、删除、发送等高风险操作需要额外确认和幂等控制。", markdown: "工具执行前应检查调用者身份、租户范围、资源所有权、权限和风险等级。对外部写入操作，使用幂等键、审计日志、超时和补償机制。\n\n不要因为模型提出了工具调用就自动授权。高风险操作应要求明确用户确认或人工审批。" },
      { heading: "错误处理与可观测性", body: "工具错误需要结构化回传、可追踪关联 ID 和有限重试，避免 Agent 无限重试或掩蓋失败。", markdown: "工具回应应包含成功/失败状态、稳定错误碼、可安全暴露的讯息和关联 ID。区分参数错误、权限拒绝、资源不存在、速率限制和暂时性故障。\n\n重试必须受次数、时间和副作用语义限制。对非幂等操作，不能盲目重试。" }
    ],
    assessments: [{ id: "m07-tool-contract", type: "code-task", prompt: "设计一个只读的 get_order 工具 Schema 和服务端验证流程，确保用户不能读取其他租户的订单。", rubric: [{ criterion: "Schema", description: "定义嚴格且可验证的输入输出栏位", points: 3 }, { criterion: "授权", description: "从可信身份上下文获取租户，不信任模型自行提供的 tenant ID", points: 4 }, { criterion: "错误与审计", description: "处理未授权、资源不存在和关联追踪", points: 3 }] }],
    sources: [
      { title: "Function calling", url: "https://developers.openai.com/api/docs/guides/function-calling", publisher: "OpenAI", note: "工具调用流程与 Strict Schema" },
      { title: "Function Calling in the OpenAI API", url: "https://help.openai.com/en/articles/8555517-function-calling-in-the-openai-api", publisher: "OpenAI Help Center", note: "Function Calling 与 Structured Outputs" }
    ]
  },
  M08: {
    content: [
      { heading: "RAG 解决什么问题", body: "RAG 把模型参数中的知识与可更新的外部数据源结合，让生成可以基于检索到的上下文。", markdown: "Retrieval-Augmented Generation 将检索系统与生成模型组合。检索器从非参数化知识库中选出相关文件或段落，生成模型再根据问题和检索上下文生成答案。\n\nRAG 可以改善知识更新和来源追溯，但不能自动保证答案正确。若检索没有召回正确证据，或生成模型错误解读证据，答案仍可能错误。" },
      { heading: "Ingestion：数据切分与索引", body: "数据汇入通常包含解析、清洗、切分、Metadata 附加、Embedding 和索引建立。", markdown: "Chunking 需要在语义完整性、检索粒度和上下文成本之间取舍。固定长度切分简单，但可能切断段落或表格；结构感知切分可以利用标题、段落、代码和文件结构。\n\n每个 chunk 应保留来源、文件版本、权限范围和定位资讯。Embedding 模型、向量维度和索引配置需要一致，更新时应考虑重建和版本切换。" },
      { heading: "Retrieval、Reranking 与 Context Assembly", body: "向量检索、关键字检索和混合检索可召回候选；Reranker 再对候选相关性排序。", markdown: "向量检索根据 Embedding 空间中的相似度召回候选；BM25 等词法方法适合精确词项和专有名词。混合检索可结合两者。\n\nReranker 通常对 query 和候选文本进行更细粒度的相关性判断，但计算成本较高。Context Assembly 需要去重、排序、截断和权限过滤，避免把无关或无权限内容送进模型。" },
      { heading: "评测与引用可信度", body: "RAG 评测要分开测量检索质量、答案质量、引用正确性、延迟和成本。", markdown: "检索层可衡量 Recall@k、Precision@k、MRR 或 nDCG；生成层可衡量答案正确性、忠实度、引用支持度和拒答表现。\n\n引用必须能回指实际来源片段，不能只生成一个看似可信的 URL。测试集应包含无答案问题、冲突文件、过期文件和权限隔离案例。" }
    ],
    assessments: [{ id: "m08-rag-evaluation-plan", type: "design-review", prompt: "为内部技术知识库设计 RAG 方案，包含文件权限、切分策略、混合检索、重排和离线评测。", rubric: [{ criterion: "数据汇入", description: "设计可追溯的 chunk 与 metadata", points: 3 }, { criterion: "检索链路", description: "说明召回、重排和 context assembly", points: 3 }, { criterion: "评测与权限", description: "设计检索/生成指标并隔离无权限文件", points: 4 }] }],
    sources: [
      { title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks", url: "https://arxiv.org/abs/2005.11401", publisher: "Lewis et al., NeurIPS 2020", note: "RAG 原始研究" },
      { title: "Prompt engineering", url: "https://developers.openai.com/api/docs/guides/prompt-engineering", publisher: "OpenAI", note: "检索上下文如何提供給生成模型" }
    ]
  },
  M09: {
    content: [
      { heading: "多模态模型的输入与输出", body: "多模态系统处理文字、图像、音讯或影片等不同形式的数据，并在模型内部映射到可共同处理的表示。", markdown: "多模态系统不只是把图片或音讯转成文字。不同模态可能使用专门的 encoder、patch/token 化、音讯特征表示或跨模态投影，再与语言模型的表示进行融合。\n\n需要区分输入模态、内部表示和输出模态。模型能接收图像，不代表它能精确读取所有细节；能生成音讯，也不代表输出符合专业声学或安全要求。" },
      { heading: "图文对齐与视觉语言模型", body: "图文对比学习等方法把图像和文字映射到可比较的表示空间，支持检索和零样本分类等任务。", markdown: "CLIP 类方法使用大量图像—文字配对学习跨模态表示，让匹配的图像和文字在嵌入空间中更接近。这类表示可用于图文检索和零样本分类。\n\n但对比式图文模型不等于具备完整视觉推理能力的通用 VLM。视觉问答、OCR、定位和多步推理需要不同能力与评测。" },
      { heading: "音讯任务与表示", body: "音讯模型可能执行语音辨识、语音生成、语音翻译、说话者处理或音讯理解。", markdown: "语音辨识通常把音讯转成文字；语音生成则把文字或其他条件转成波形或声学 token。端到端语音模型可能直接处理音讯表示，也可能采用分阶段架构。\n\n音讯系统要考虑采样率、声道、噪音、延迟、说话者差异、语言覆盖和隐私。评测不能只看转写文字，还要考虑时间戳、专有名词和不同口音。" },
      { heading: "多模态评测与安全", body: "多模态系统需要按模态和任务设计评测，并处理隐私、版权、偏差和提示注入风险。", markdown: "图像任务可测量 OCR、物体识别、定位、图表理解和视觉问答；音讯任务可测量 WER、说话者错误、延迟和语音质量。影片还需要时间维度和跨幀一致性评估。\n\n图像和音讯也可能包含个人资讯、隐藏指令或敏感内容。数据治理、存取控制、保留期限和人工覆核应纳入系统设计。" }
    ],
    assessments: [{ id: "m09-multimodal-test-matrix", type: "design-review", prompt: "为一个支持图片和语音输入的知识助手建立多模态测试矩陣，列出能力、失败模式和数据治理控制。", rubric: [{ criterion: "模态流程", description: "说明图像与音讯各自的输入/表示/输出流程", points: 3 }, { criterion: "评测覆盖", description: "覆盖 OCR、视觉问答、语音辨识和延迟等任务", points: 4 }, { criterion: "风险治理", description: "处理隐私、偏差、版权和不可信内容", points: 3 }] }],
    sources: [
      { title: "Learning Transferable Visual Models From Natural Language Supervision", url: "https://arxiv.org/abs/2103.00020", publisher: "Radford et al., ICML 2021", note: "CLIP 图文对齐研究" },
      { title: "Robust Speech Recognition via Large-Scale Weak Supervision", url: "https://arxiv.org/abs/2212.04356", publisher: "Radford et al.", note: "Whisper 大规模弱监督语音辨识" }
    ]
  },
  M10: {
    content: [
      { heading: "Agent 与普通 LLM 应用的区别", body: "Agent 在模型推理之外还具有状态、工具使用和多步骤控制循环，能根据中间结果决定下一步行动。", markdown: "普通 LLM 调用通常是输入一次、输出一次；Agent Runtime 则管理一个循环：接收目标和上下文、让模型提出下一步、执行被授权的工具、观察结果、更新状态，直到完成或觸发停止条件。\n\nAgent 不等于“模型自主执行一切”。模型负责提出决策，Runtime 负责控制步骤、权限、超时、预算和状态。" },
      { heading: "Agent Loop 与状态机", body: "可恢复的 Agent 需要明确的状态、事件、转移条件和终止条件。", markdown: "典型状态包括 Ready、Planning、ToolRequested、ToolRunning、WaitingForApproval、Completed 和 Failed。每次转移都应由可观测事件驅动。\n\n设定最大步数、總时间、token 预算和工具调用预算，并为取消、超时、重试和人工接管设计明确路徑。不要只依赖模型说“我已完成”作为完成判断。" },
      { heading: "Runtime 的责任边界", body: "Runtime 管理工具注册、参数验证、权限检查、执行隔离、日志和错误恢復。", markdown: "Runtime 应把模型输出视为不可信的控制请求。工具名称必须在白名单中，参数需符合 Schema，授权应根据可信用户上下文判断。对文件、Shell、网路和数据库等能力使用最小权限。\n\n外部副作用需要审批、幂等键和审计。Agent 需要在限定时间和资源内运行，并能被取消。" }
    ],
    assessments: [{ id: "m10-agent-runtime-design", type: "design-review", prompt: "设计一个只读知识检索 Agent 的状态机，标出模型决策、工具执行、停止条件和错误恢復。", rubric: [{ criterion: "状态与转移", description: "定义可验证的状态、事件和终止条件", points: 4 }, { criterion: "工具控制", description: "模型提出请求、Runtime 验证和执行的责任分离", points: 3 }, { criterion: "资源与恢復", description: "包含预算、超时、取消和失败处理", points: 3 }] }],
    sources: [
      { title: "Agents SDK", url: "https://developers.openai.com/api/docs/guides/agents/sdk", publisher: "OpenAI", note: "Agent loop、tools、handoffs 与 runtime" },
      { title: "Tracing", url: "https://developers.openai.com/api/docs/guides/agents-api/tracing", publisher: "OpenAI", note: "Agent session、turn 和 span" }
    ]
  },
  M11: {
    content: [
      { heading: "Planning：把目标转为可检查步骤", body: "Planning 将模糊目标分解为有前置条件、输入输出和完成判定的任务。", markdown: "计画可以是线性步骤、依赖 DAG 或动态更新的任务清单。每个子任务都应有完成条件、所需工具、预期副作用和失败处理。\n\n计画不是执行事实。工具结果可能让计画失效，因此 Runtime 应允许重新规划，同时限制重规划次数和總预算。" },
      { heading: "短期状态与长期记忆", body: "短期状态支持当前任务恢復；长期记忆保存跨任务可重用资讯，两者需要不同生命周期和权限。", markdown: "Thread 或 session state 通常保存当前对话、任务进度和中间结果；长期 store 则保存经过选择、验证和治理的偏好或知识。\n\n不要把整段对话无差别写入长期记忆。应定义数据来源、用途、租户隔离、保留期限、删除策略和敏感资讯规则。读取记忆时也要检查时效性与可信度。" },
      { heading: "Checkpoint、恢復与记忆治理", body: "Checkpoint 让任务能在中断后恢復；记忆治理决定哪些内容可以被保存、更新、过期或删除。", markdown: "Checkpoint 应保存足以重建执行状态的数据，例如当前节点、已完成步骤、工具结果引用和待审批操作。敏感凭证不应直接放入 checkpoint。\n\n恢復时要防止重复执行外部副作用。对工具操作使用幂等键或先查詢执行状态。记忆应支持来源追溯、版本、过期和用户控制。" }
    ],
    assessments: [{ id: "m11-memory-policy", type: "design-review", prompt: "为个人助理设计短期状态与长期记忆方案，包含写入规则、来源、过期、删除和恢復语义。", rubric: [{ criterion: "记忆分层", description: "区分 thread state、checkpoint 和跨任务长期记忆", points: 3 }, { criterion: "数据治理", description: "定义敏感数据、来源、保留和删除规则", points: 4 }, { criterion: "恢復安全", description: "处理重复副作用和中断恢復", points: 3 }] }],
    sources: [
      { title: "Persistence", url: "https://docs.langchain.com/oss/python/langgraph/persistence", publisher: "LangGraph", note: "Checkpoint 与 long-term store 概念" },
      { title: "Agents SDK", url: "https://developers.openai.com/api/docs/guides/agents/sdk", publisher: "OpenAI", note: "Agent state 和执行模式" }
    ]
  },
  M12: {
    content: [
      { heading: "MCP 的角色与协議边界", body: "Model Context Protocol 定义 AI Host 与外部 Server 之间发现和使用上下文能力的标准化协議。", markdown: "MCP 通常涉及 Host、Client 和 Server：Host 是承载 AI 应用的环境；Client 管理与 Server 的协議连线；Server 暴露工具、资源或提示模板等能力。\n\nMCP 解决互通协議问题，不会自动替应用完成身份授权、租户隔离或业务审批。协議连线建立后，Host 仍需决定哪些能力可见、哪些调用可执行。" },
      { heading: "Tools、Resources 与 Prompts", body: "Tools 表达可调用操作，Resources 提供可读取上下文，Prompts 提供可重用的提示模板。", markdown: "Tool 调用可能产生外部副作用，必须经过权限和风险检查。Resource 让 Client 获取数据或内容，但仍要遵循数据存取控制。Prompt 是可重用模板，不等于授权策略。\n\n能力发现只表示 Server 宣告了能力，不表示所有用户都应该獲得该能力。" },
      { heading: "Transport、生命周期与安全", body: "传输方式、连线生命周期和信任边界会影响 MCP Server 的部署与安全设计。", markdown: "常见传输包含本地程序的 stdio 和遠端的 Streamable HTTP。遠端连线需要考虑身份验证、授权、TLS、来源验证、请求大小限制和速率限制。\n\n对本地 Server，应审核启动命令、执行檔路徑、环境变数和檔案/网路权限。对遠端 Server，应验证来源和授权范围，并将工具调用记录到可追踪的审计事件。" }
    ],
    assessments: [{ id: "m12-mcp-threat-model", type: "design-review", prompt: "为一个遠端 MCP Server 设计工具发现与调用流程，列出 Host、Client、Server 職责及信任边界。", rubric: [{ criterion: "协議角色", description: "正确区分 Host、Client、Server", points: 3 }, { criterion: "能力语义", description: "区分 Tools、Resources 和 Prompts", points: 3 }, { criterion: "安全控制", description: "定义身份、授权、传输和审计控制", points: 4 }] }],
    sources: [
      { title: "Architecture overview", url: "https://modelcontextprotocol.io/docs/learn/architecture", publisher: "Model Context Protocol", note: "MCP 架构与核心角色" },
      { title: "MCP Specification", url: "https://modelcontextprotocol.io/specification/2026-07-28", publisher: "Model Context Protocol", note: "协議规范与能力定义" }
    ]
  },
  M13: {
    content: [
      { heading: "Skill 是可发现的程序化能力单元", body: "Skill 把任务方法、操作规则和可选资源封裝成可按需载入的目录，而不是把所有知识塞进每次提示。", markdown: "一个 Skill 通常以数据夾为单位，包含 SKILL.md 和可选的 scripts、references、assets。元数据至少描述名称和适用情境，正文则提供具体工作流程、边界和示例。\n\nSkill 的价值在于可发现、可组合和漸进式揭露：系统先载入简短描述，任务匹配时才载入完整指令与资源。" },
      { heading: "设计输入、输出与依赖契约", body: "可维护 Skill 应明确定义觸发条件、前置条件、输入、输出、依赖和失败处理。", markdown: "避免只写“你是一位专家”这类模糊指令。应描述何时使用、何时不要使用、需要哪些输入、步骤順序、产物格式和验收标准。\n\n若包含腳本，需说明执行环境、依赖、权限和输出副作用。参考数据应拆分为可按需读取的檔案，避免主指令过长。" },
      { heading: "版本、组合与供应链治理", body: "Skill 需要版本、审查、来源和依赖治理；Skill 内容和附帶腳本都应视为可执行或可影响行为的供应链输入。", markdown: "为 Skill 设定维护者、版本、变更紀录和相容性约束。第三方 Skill 不应因为名称可信就自动执行；应检查指令是否要求读取秘密、上传数据或执行未审核程序。\n\n将 Skill 分成純指令、读取资源和可执行腳本等风险级别，并为每类设定不同权限和审批要求。" }
    ],
    assessments: [{ id: "m13-skill-package", type: "code-task", prompt: "建立一个文件审查 Skill 的目录规格，包含 SKILL.md、觸发条件、参考文件、可选腳本和权限声明。", rubric: [{ criterion: "元数据与觸发", description: "名称和描述准确界定使用范围", points: 3 }, { criterion: "程序契约", description: "定义输入、步骤、输出和验收条件", points: 4 }, { criterion: "安全与版本", description: "说明腳本权限、依赖和版本治理", points: 3 }] }],
    sources: [
      { title: "Agent Skills", url: "https://learn.microsoft.com/en-us/agent-framework/agents/skills", publisher: "Microsoft Learn", note: "Skill 结构与漸进式揭露" },
      { title: "Agent Skills overview", url: "https://github.com/microsoft/skills/blob/main/.github/docs/skills.md", publisher: "Microsoft", note: "SKILL.md 和目录规范概覽" }
    ]
  },
  M14: {
    content: [
      { heading: "何时需要 Multi-Agent", body: "多 Agent 适合需要不同专业上下文、并行探索或明确责任分工的任务；它不是所有任务的预设架构。", markdown: "先建立单 Agent 基线，再判断是否存在可独立分解的子任务、上下文隔离需求或专业角色差异。若任务共享状态多、耦合高或需要大量协调，Multi-Agent 可能增加延迟、成本和故障面。\n\nAgent 数量增加不等于质量提升。应用任务成功率、總成本、延迟和可診断性来判断架构是否值得。" },
      { heading: "协作拓撲与交接", body: "常见模式包括 Manager/Worker、Handoff、Pipeline 和并行专家汇總。", markdown: "Manager/Worker 由管理者分配子任务并彙總；Handoff 将控制权交給专家 Agent；Pipeline 依序处理阶段；并行专家可以同时探索，再由仲裁者整合。\n\n每次交接应有明确任务、上下文范围、输出 Schema、完成条件和错误回传。共享状态需要版本和冲突策略，避免多个 Agent 无序写入。" },
      { heading: "协调成本与故障模式", body: "多 Agent 需要控制循环、重复工作、死鎖、相互矛盾和上下文膨脹。", markdown: "设置最大交接次数、最大并行度、總 token/成本预算和截止时间。对每个子任务记录 owner、状态、输入引用和输出摘要。\n\n汇總阶段需要检查证据一致性和重复内容。对高风险决策，不应让多个模型投票替代权限控制或人工审批。" }
    ],
    assessments: [{ id: "m14-orchestration-topology", type: "design-review", prompt: "为一个市場研究任务比较单 Agent、Manager/Worker 和并行专家三种方案，选择一种并給出成本和失败控制。", rubric: [{ criterion: "架构选择", description: "根据任务分解和上下文隔离选择拓撲", points: 3 }, { criterion: "交接契约", description: "定义子任务输入输出和 owner", points: 3 }, { criterion: "协调治理", description: "限制并行度、成本、循环和冲突", points: 4 }] }],
    sources: [
      { title: "Agents SDK", url: "https://developers.openai.com/api/docs/guides/agents/sdk", publisher: "OpenAI", note: "Agent orchestration 和 handoffs" },
      { title: "AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation", url: "https://arxiv.org/abs/2308.08155", publisher: "Wu et al.", note: "多 Agent 对话式协作框架研究" }
    ]
  },
  M15: {
    content: [
      { heading: "威脅模型：模型不是安全边界", body: "Agent 安全必须建立在应用和基础设施控制上，不能把提示词或模型拒答当成唯一防线。", markdown: "威脅面包括直接/间接 Prompt Injection、敏感资讯洩露、不安全输出处理、工具权限过大、供应链风险和资源耗盡。\n\n攻击内容可能来自用户讯息，也可能藏在网页、文件、郵件、检索结果和工具输出中。所有外部内容都应视为不可信数据。" },
      { heading: "最小权限与隔离", body: "工具权限应按任务和资源范围授予，并由服务端强制执行租户、身份和资源授权。", markdown: "优先使用唯读工具；将读取、写入、删除、支付和对外发送等操作分级。用户身份和租户范围应从可信认证上下文获取，不接受模型自行指定的权限主体。\n\n檔案、Shell、网路和代码执行应使用隔离环境、配额、网路出口控制和檔案系统限制。秘密不应暴露在模型上下文或工具输出中。" },
      { heading: "人工审批与可审计副作用", body: "高风险操作需要明确确认、不可抵赖的审计记录和可恢复的执行流程。", markdown: "将“模型建議操作”和“系统执行操作”分开。审批介面应展示操作对象、范围、影响和不可逆风险；批准后仍由服务端再次校验权限。\n\n记录请求者、审批者、工具名称、参数摘要、资源 ID、结果和关联追踪 ID。对可重试操作使用幂等键；对可补償操作定义回滚或人工处置。" }
    ],
    assessments: [{ id: "m15-agent-threat-model", type: "design-review", prompt: "对可修改云端文件的 Agent 完成威脅模型，至少覆盖 Prompt Injection、越权、数据洩露和破壞性操作。", rubric: [{ criterion: "威脅识别", description: "识别直接/间接注入和数据风险", points: 3 }, { criterion: "控制措施", description: "落实最小权限、租户隔离和输出验证", points: 4 }, { criterion: "审批与审计", description: "设计人工确认、审计和恢復流程", points: 3 }] }],
    sources: [
      { title: "Top 10 for LLM and GenAI", url: "https://genai.owasp.org/initiatives/top-10-for-llm-and-genai/", publisher: "OWASP GenAI Security Project", note: "2025 LLM 应用风险分类" },
      { title: "AI Risk Management Framework", url: "https://www.nist.gov/itl/ai-risk-management-framework", publisher: "NIST", note: "AI 风险治理框架" }
    ]
  },
  M16: {
    content: [
      { heading: "Workflow 与自主 Agent 的取舍", body: "Workflow 使用预先定义的控制流；Agent 则可在执行时动态选择下一步，两者可以组合。", markdown: "若流程步骤稳定、可预测且需要强审计，优先使用确定性 Workflow。若任务需要根据上下文动态探索，才引入 Agent 决策。\n\n常见设计是 Workflow 负责外层状态、权限和交易边界，Agent 负责受限子任务。不要把整个业务流程交給无限制的自主循环。" },
      { heading: "重试、超时与补償", body: "可靠編排需要区分暂时性故障和永久性错误，并为每个活动设定重试、超时和幂等语义。", markdown: "网路超时、速率限制和暂时服务不可用可能适合有限重试；参数错误、权限拒绝和业务规则冲突通常不应重试。使用指数退避、最大次数和總截止时间。\n\n重试可能重复外部副作用，因此活动应具备幂等性或执行状态查詢。对跨系统流程设计补償动作和人工恢復路徑。" },
      { heading: "持久化执行与人工介入", body: "长时间任务需要 checkpoint、事件历史、取消、暂停和恢復机制。", markdown: "将非确定性外部调用放在可重试活动中，让 Workflow 控制逻辑可重播。持久化事件历史能支持故障后恢復和稽核。\n\n人工介入点应有明确等待状态、审批期限、拒绝分支和恢復条件。取消任务时，还要定义已发生的副作用如何处置。" }
    ],
    assessments: [{ id: "m16-durable-workflow", type: "design-review", prompt: "设计一个跨三个外部服务的文件发布 Workflow，说明重试、幂等、补償、审批和恢復。", rubric: [{ criterion: "流程建模", description: "把确定性流程和 Agent 子任务分开", points: 3 }, { criterion: "故障恢復", description: "定义错误分类、重试、超时和幂等", points: 4 }, { criterion: "人工介入", description: "设计审批、取消和补償路徑", points: 3 }] }],
    sources: [
      { title: "What is a Temporal Retry Policy?", url: "https://docs.temporal.io/encyclopedia/retry-policies", publisher: "Temporal", note: "活动重试和 Workflow 执行语义" },
      { title: "Agents SDK", url: "https://developers.openai.com/api/docs/guides/agents/sdk", publisher: "OpenAI", note: "Agent Runtime 与 orchestration" }
    ]
  },
  M17: {
    content: [
      { heading: "Evaluation：建立可重现的质量定义", body: "AI Evaluation 用代表性数据集、明确指标和评分器检查系统是否达到任务要求。", markdown: "先定义任务成功，再选择指标。分类任务可看准确率、精确率、召回率和 F1；检索任务可看 Recall@k、MRR 和 nDCG；生成任务需要结合人工评分、规则检查和模型輔助评分。\n\n测试集应覆盖正常案例、边界案例、拒答、注入攻击、长尾数据和分布外输入。每次 Prompt、模型、检索器或工具变更都应执行回归。" },
      { heading: "Trace 与 Observability", body: "Trace 把一次端到端任务拆成模型调用、工具执行、检索和交接等可关联事件。", markdown: "Trace 通常包含多个 Span，每个 Span 记录操作名称、开始/结束时间、状态、属性和关联 ID。Metrics 用于聚合趨勢，Logs 用于事件细节，Traces 用于跨服务因果链。\n\nAgent Trace 还应关联模型版本、Prompt 版本、工具名称、token 用量、重试次数和审批结果。记录内容需要做敏感资讯遮罩和存取控制。" },
      { heading: "质量、成本与延迟的联合分析", body: "质量指标必须与延迟、成本、可靠性和安全指标一起分析，避免单一分数驅动错误优化。", markdown: "建立分层评测：单元级测试验证工具和解析器；组件级测试验证检索或路由；端到端评测验证任务完成；线上监控追踪真实分布和事故。\n\n对模型輔助评分器进行人工校准，检查评分偏差。将成本、延迟和质量按任务类型、模型、租户和版本切片，才能定位回归来源。" }
    ],
    assessments: [{ id: "m17-eval-observability-plan", type: "design-review", prompt: "为一个 RAG Agent 设计离线评测集、线上指标和 Trace 栏位，并说明如何识别质量回归。", rubric: [{ criterion: "评测设计", description: "定义数据集、指标和评分器", points: 4 }, { criterion: "可观测性", description: "设计 Trace/Span/Metric/Log 关联栏位", points: 3 }, { criterion: "回归分析", description: "按版本、模型、租户和任务切片", points: 3 }] }],
    sources: [
      { title: "Tracing", url: "https://developers.openai.com/api/docs/guides/agents-api/tracing", publisher: "OpenAI", note: "Agent Trace 结构和执行步骤" },
      { title: "OpenTelemetry Documentation", url: "https://opentelemetry.io/docs/", publisher: "OpenTelemetry", note: "Vendor-neutral traces、metrics 和 logs" }
    ]
  },
  M18: {
    content: [
      { heading: "AI Platform 的核心平面", body: "AI 平台需要将模型接入、流量治理、身份租户、配额、执行和观测分成清晰的责任边界。", markdown: "常见平台能力包括 Model Gateway、Provider Adapter、模型路由、凭证管理、租户与身份、配额计量、请求排队、快取、评测、审计和观测。\n\n控制平面管理模型/供应商配置、政策、配额和版本；数据平面承接线上请求并执行路由、限流和计量。两者需要有明确的一致性与故障降级策略。" },
      { heading: "多租户隔离与公平性", body: "多租户系统必须隔离数据和权限，同时控制资源公平、噪音鄰居和成本归属。", markdown: "租户边界应貫穿身份、数据库查詢、向量检索、快取键、日志和模型供应商凭证。只在 API 层检查租户而不在数据层约束，容易产生跨租户数据洩露。\n\n资源治理可采用每租户并发限制、Token 配额、速率限制和优先级队列。Kubernetes Namespace 只是隔离工具之一，仍需考虑网路、节点、RBAC 和共享控制平面风险。" },
      { heading: "可靠性、性能与成本治理", body: "模型供应商故障、速率限制和成本波动需要透过超时、熔断、回退、路由和预算策略管理。", markdown: "对供应商设定健康检查、超时、重试上限和熔断；重试时要避免放大流量。模型回退需要检查能力相容性、数据政策和输出质量，不可只按价格切换。\n\n建立每租户、每模型和每功能的成本归因，并监控 TTFT、TPOT、错误率、佇列等待和 Token 消耗。平台架构要同时滿足安全、可靠、性能和成本目标。" }
    ],
    assessments: [{ id: "m18-platform-architecture", type: "design-review", prompt: "设计一个多租户 Model Gateway，描述控制平面、数据平面、配额、路由、凭证和故障降级。", rubric: [{ criterion: "平面划分", description: "清晰划分配置治理与线上请求处理", points: 3 }, { criterion: "租户治理", description: "确保身份、数据、配额和计量隔离", points: 4 }, { criterion: "可靠性与成本", description: "定义限流、熔断、回退和成本归因", points: 3 }] }],
    sources: [
      { title: "Multi-tenancy", url: "https://kubernetes.io/docs/concepts/security/multi-tenancy/", publisher: "Kubernetes", note: "多租户隔离和共享叢集风险" },
      { title: "Google Cloud Well-Architected Framework", url: "https://docs.cloud.google.com/architecture/framework", publisher: "Google Cloud", note: "安全、可靠、性能、成本和运维支柱" }
    ]
  },
  M19: {
    content: [
      { heading: "AI 功能的工程化交付", body: "AI 功能应遵循一般軟体工程的需求、设计、实现、测试、发布和运维流程，同时增加模型行为的不确定性治理。", markdown: "将 Prompt、模型配置、工具 Schema、检索索引和评测数据视为版本化交付物。建立环境隔离、配置审查、测试、灰度发布和回滚流程。\n\nAI 系统的测试除了传统单元与整合测试，还需要 Prompt 回归、模型输出评测、工具权限测试、检索质量和安全测试。" },
      { heading: "供应链与可重现性", body: "模型、数据集、依赖、容器和 Skill 都可能成为供应链风险来源，需要版本和来源证明。", markdown: "记录模型 ID/版本、权重摘要、Tokenizer 版本、数据集版本、依赖鎖檔、容器映像摘要和建置来源。对外部模型与工具 SDK 做许可、漏洞和来源审查。\n\n生产部署应可追溯到代码提交、建置产物和配置版本。对不可完全重现的託管模型，至少保存供应商、模型版本、请求参数和评测快照。" },
      { heading: "运维、事故与持续改进", body: "上线后需要 SLO、告警、事故处置、容量管理和持续评测。", markdown: "定义服务可用性、延迟、错误率和任务成功率等 SLI，为关键路徑设定 SLO。告警应指向可行动的用户影响，而不是只報告主机指标。\n\n事故復盤要识别技术根因、检测缺口和治理缺口，并形成有 owner 和期限的改进项。模型或 Prompt 更新应重新跑评测，避免质量回归悄然进入生产。" }
    ],
    assessments: [{ id: "m19-release-readiness", type: "design-review", prompt: "为一个使用外部 LLM 和 RAG 的应用建立上线检查表，覆盖版本、供应链、评测、SLO、回滚和事故响应。", rubric: [{ criterion: "交付流程", description: "建立可追溯版本和灰度/回滚", points: 3 }, { criterion: "供应链", description: "记录模型、数据、依赖和建置来源", points: 3 }, { criterion: "运维治理", description: "定义 SLO、告警和事故復盤", points: 4 }] }],
    sources: [
      { title: "Google Cloud Well-Architected Framework", url: "https://docs.cloud.google.com/architecture/framework", publisher: "Google Cloud", note: "运维、安全、可靠性与成本最佳实踐" },
      { title: "OpenTelemetry Documentation", url: "https://opentelemetry.io/docs/", publisher: "OpenTelemetry", note: "跨服务可观测性标准" }
    ]
  },
  M20: {
    content: [
      { heading: "Capstone：端到端工程问题", body: "綜合项目需要从真实用户问题出发，定义成功指标、约束、威脅模型和可验收的系统边界。", markdown: "选择一个可在有限时间内交付的 AI 工程问题，例如企业知识助手、开发者 Agent 或多模态文件处理平台。先明确用户、任务、数据来源、失败成本和非目标。\n\n把需求转成可测量指标：任务成功率、引用正确率、延迟、成本、权限違规率和可用性。没有明确指标的“效果很好”不能作为验收标准。" },
      { heading: "架构、实现与安全控制", body: "项目需呈现模型、检索、工具、Runtime、数据和平台元件的责任分离。", markdown: "提交架构图、数据流、API/Schema、部署拓撲和状态机。标出模型决策与应用执行的边界，列出每个工具的权限、输入验证和副作用。\n\n完成威脅模型，至少覆盖 Prompt Injection、数据洩露、跨租户存取、工具越权、供应链和资源耗盡。高风险操作要有人工审批或其他强制控制。" },
      { heading: "评测、交付与答辯", body: "Capstone 的完成标准是可运行、可测试、可观测、可审计和可復现，而不是只展示 Demo。", markdown: "提交代码、部署说明、测试報告、评测数据集、Trace 范例、成本估算、威脅模型和已知限制。展示至少一个正常流程、一个故障流程和一个安全拒绝流程。\n\n答辯时说明架构取舍、质量指标、失败案例和后续路线图。未实现的能力应明确列为限制，不得以介面原型冒充已交付功能。" }
    ],
    assessments: [{ id: "m20-capstone-rubric", type: "design-review", prompt: "交付一个端到端 AI 工程项目，并提交架构、代码、测试、评测、威脅模型和运维文件。", rubric: [{ criterion: "问题与架构", description: "需求可验收，架构边界和数据流清晰", points: 2 }, { criterion: "工程实现", description: "核心流程可运行且具备测试", points: 3 }, { criterion: "质量与安全", description: "有评测、威脅模型和权限控制证据", points: 3 }, { criterion: "交付与运维", description: "提供部署、观测、成本和已知限制文件", points: 2 }] }],
    sources: [
      { title: "AI Risk Management Framework", url: "https://www.nist.gov/itl/ai-risk-management-framework", publisher: "NIST", note: "Capstone 风险治理参考" },
      { title: "Google Cloud Well-Architected Framework", url: "https://docs.cloud.google.com/architecture/framework", publisher: "Google Cloud", note: "架构质量与运维检查框架" }
    ]
  }
};

const lesson = (moduleId: string, title: string, summary: string, objectives: string[]) => {
  const authored = authoredLessons[moduleId];
  if (!authored) throw new Error(`Missing authored lesson content for module ${moduleId}`);
  return {
    id: `${moduleId.toLowerCase()}-intro`,
    title: `${title}：核心概念与工作机制`,
    summary,
    learningObjectives: objectives,
    estimatedMinutes: moduleId === "M01" ? 35 : 40,
    assessments: authored.assessments,
    sources: authored.sources,
    content: authored.content
  };
};

const moduleRows = [
  ["M01","L1","AI、机器学习与大语言模型","建立人工智能、机器学习、深度学习和 LLM 的概念地图。",[],["区分 AI、机器学习、深度学习、生成式 AI 与 LLM","解释机器学习训练数据、参数、损失和泛化","理解神经网络与自回归语言模型的基本机制","识别大模型的能力边界、失败模式和验证要求","完成一个具有数据流、权限边界和评测指标的 AI 系统设计"],""],
  ["M02","L2","Transformer 与 Attention","理解 Transformer 的核心组件和信息交互机制。",["M01"],["从输入 token 表示推导 Q、K、V 的来源与张量形状","手工计算 scaled dot-product attention 的分数、权重与输出","解释 Multi-Head Attention 的投影、拼接和输出变换","区分 Encoder self-attention、Decoder causal self-attention 与 cross-attention","比较绝对位置编码、相对位置机制与 RoPE 的基本思想","解释残差连接、LayerNorm、FFN 与 Transformer Block 的职责","分析注意力的计算复杂度、KV Cache 与 FlashAttention 的优化目标","使用 Transformer Lab 验证 mask、权重和张量维度"],"transformer"],
  ["M03","L2","Token、Embedding 与 Context","理解文本如何转化为模型可处理的表示。",["M01"],["解释 Tokenization 与 Embedding 的区别","分析上下文窗口和 token 预算"],"tokenizer"],
  ["M04","L2","预训练、微调与对齐","理解模型训练阶段、数据和优化目标。",["M02"],["区分预训练、SFT 与偏好对齐","理解训练数据和评估集的作用"],""],
  ["M05","L2","推理、解码与部署","理解模型生成过程及推理服务的性能指标。",["M02","M03"],["解释采样、温度和 KV Cache","识别吞吐、延迟和显存瓶颈"],""],
  ["M06","L3","Prompt Engineering","构建可测试、可复用的提示词设计方法。",["M01","M03"],["设计指令、上下文和输出约束","建立提示词测试用例"],""],
  ["M07","L3","结构化输出与 Tool Calling","掌握模型与外部工具之间的契约交互。",["M06"],["定义工具 schema 与参数校验","区分工具请求和工具执行"],"tool-calling"],
  ["M08","L3","检索增强生成 RAG","构建可追溯知识检索与生成链路。",["M03","M07"],["解释切分、向量检索和重排","设计引用与检索评估"],"rag"],
  ["M09","L3","多模态 AI","理解文本、图像、音频等模态的输入输出路径。",["M03","M05"],["识别多模态编码与融合方式","分析模态数据的限制和风险"],""],
  ["M10","L4","Agent 基础与 Runtime","理解 Agent 循环、状态和工具执行边界。",["M07","M08"],["描述观察、决策、行动循环","设计可终止、可恢复的 Agent 状态机"],"agent"],
  ["M11","L4","Planning、Memory 与状态","理解任务分解、记忆读写和状态持久化。",["M10"],["区分短期状态与长期记忆","设计计划更新和记忆治理"],""],
  ["M12","L4","MCP 协议与集成","理解 MCP 的参与角色、能力发现和消息交互。",["M07","M10"],["解释 Host、Client、Server 关系","理解工具、资源和提示模板"],"mcp"],
  ["M13","L4","Skills 与可复用能力","设计可发现、可组合、可维护的 Agent 能力单元。",["M10","M12"],["定义 Skill 的输入输出契约","设计版本、依赖和权限边界"],""],
  ["M14","L4","Multi-Agent 系统","分析多 Agent 分工、协作、协调和成本。",["M10","M11"],["比较常见协作拓扑","设计消息、终止和冲突处理"],"multi-agent"],
  ["M15","L4","安全、权限与人工审批","建立 Agent 工具执行的安全控制体系。",["M07","M10"],["识别 Prompt Injection 与越权风险","设计最小权限和人工审批"],""],
  ["M16","L4","Workflow 与编排","区分确定性工作流和自主 Agent 的适用场景。",["M10","M15"],["设计可观测的工作流状态","定义重试、补偿和人工介入点"],""],
  ["M17","L5","Evaluation 与 Observability","建立离线评测、线上观测和回归治理。",["M08","M10"],["设计数据集、评分器和指标","分析延迟、成本、质量和失败率"],"evaluation"],
  ["M18","L5","AI 平台架构","理解模型网关、租户、队列和服务治理。",["M05","M17"],["设计模型路由和配额边界","分析可靠性、扩展性与成本"],""],
  ["M19","L5","应用工程化与交付","将 AI 能力转化为可部署、可维护的产品。",["M15","M17","M18"],["设计测试、发布和运维流程","建立安全、数据和成本治理"],""],
  ["M20","L6","Capstone 综合项目","完成覆盖需求、架构、实现、评测和交付的综合项目。",["M01","M02","M03","M04","M05","M06","M07","M08","M09","M10","M11","M12","M13","M14","M15","M16","M17","M18","M19"],["交付端到端 AI 工程系统","提交测试、威胁模型和运行文档"],""]
] as const;

export const course: Course = {
  schemaVersion: 1,
  id: "ai-engineering-foundations",
  title: "AI Engineering Academy",
  description: "从大模型原理、AI 应用开发到 Agent 系统与平台工程的系统化学习路径。",
  version: "0.5.0",
  language: "zh-CN",
  labs: [
    { id: "tokenizer", title: "Tokenizer Lab", executionMode: "browser-local", description: "使用玩具 BPE 词表观察子词合并。", safetyNotes: ["仅使用内置示例词表，不调用外部模型。"], inputs: [{ name: "text", description: "待切分文本" }], outputs: [{ name: "tokens", description: "示例 token 片段与合并过程" }], status: "implemented" },
    { id: "transformer", title: "Transformer Attention Lab", executionMode: "browser-local", description: "使用固定小矩阵计算 scaled dot-product attention。", safetyNotes: ["仅在浏览器内执行固定矩阵运算，不加载模型权重。"], inputs: [{ name: "mask", description: "可选因果注意力掩码" }], outputs: [{ name: "attention", description: "分数、权重与加权输出矩阵" }], status: "implemented" },
    { id: "rag", title: "RAG Pipeline Lab", executionMode: "simulation", description: "演示 chunking、教学向量、Top-K 检索与重排。", safetyNotes: ["使用内置虚构语料和确定性教学向量，不连接外部数据或模型。"], inputs: [{ name: "query", description: "检索查询" }], outputs: [{ name: "results", description: "教学检索与重排结果" }], status: "implemented" },
    { id: "tool-calling", title: "Tool Calling Lab", executionMode: "simulation", description: "演示工具 Schema、参数验证、Runtime 权限和只读执行。", safetyNotes: ["只调用本地课程目录只读工具，不访问网络、Shell 或外部 API。", "模型请求不构成授权，Runtime 策略可拒绝调用。"], inputs: [{ name: "tool", description: "注册工具名称与 JSON 参数" }], outputs: [{ name: "result", description: "结构化工具执行结果或拒绝原因" }], status: "implemented" },
    { id: "agent", title: "Agent Runtime Lab", executionMode: "simulation", description: "演示 Agent 状态机、人工审批、执行、观察和终止条件。", safetyNotes: ["使用确定性状态机，不调用 LLM。", "工具执行前必须经过人工批准，拒绝后进入终止状态。"], inputs: [{ name: "decision", description: "推进状态或批准/拒绝工具请求" }], outputs: [{ name: "trace", description: "状态转移与运行事件" }], status: "implemented" },
    { id: "mcp", title: "MCP Protocol Lab", executionMode: "simulation", description: "演示 Host、Client、Server 和 Tools、Resources、Prompts 能力发现。", safetyNotes: ["仅浏览器本地模拟，不建立 JSON-RPC 连接或启动真实 MCP Server。"], inputs: [{ name: "discovery", description: "发现本地模拟 Server 能力" }], outputs: [{ name: "capabilities", description: "工具、资源和提示模板清单" }], status: "implemented" },
    { id: "multi-agent", title: "Multi-Agent Lab", executionMode: "simulation", description: "演示专业角色分工、独立发现和 Manager 综合。", safetyNotes: ["角色输出由确定性函数模拟，不执行并发模型调用。", "综合结果不替代证据核验或人工决策。"], inputs: [{ name: "topic", description: "多 Agent 协作主题" }], outputs: [{ name: "report", description: "角色发现与综合建议" }], status: "implemented" },
    { id: "evaluation", title: "Evaluation Lab", executionMode: "simulation", description: "使用固定数据集演示 Exact Match、通过率和失败案例。", safetyNotes: ["不调用模型评分器；固定答案仅用于教学，不代表真实模型能力。"], inputs: [{ name: "dataset", description: "内置评测案例" }], outputs: [{ name: "metrics", description: "通过数、准确率和逐案例结果" }], status: "implemented" }
  ],
  modules: moduleRows.map(([id, level, title, summary, prerequisites, objectives, labId]) => ({
    id, level, title, summary, prerequisites: [...prerequisites], objectives: [...objectives],
    lessons: id === "M01" ? flagshipM01Lessons : id === "M02" ? flagshipM02Lessons : [lesson(id, title, summary, [...objectives])],
    ...(labId ? { labId } : {})
  }))
};
