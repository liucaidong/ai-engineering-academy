import type { Course } from "../types/course";

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
  }
};

const lesson = (moduleId: string, title: string, summary: string, objectives: string[]) => {
  const authored = authoredLessons[moduleId];
  return {
    id: `${moduleId.toLowerCase()}-intro`,
    title: `${title}：核心概念与工作机制`,
    summary,
    learningObjectives: objectives,
    estimatedMinutes: moduleId === "M01" ? 35 : 40,
    assessments: authored?.assessments ?? [],
    sources: authored?.sources ?? [],
    content: authored?.content ?? [
      { heading: "本节要解决的问题", body: summary, sources: [] },
      { heading: "学习方法", sources: [], markdown: "先建立概念模型，再观察数据流和边界条件，最后通过实验或工程任务验证理解。\n\n- 识别核心对象\n- 跟踪关键数据流\n- 明确系统边界" }
    ]
  };
};

const moduleRows = [
  ["M01","L1","AI、机器学习与大语言模型","建立人工智能、机器学习、深度学习和 LLM 的概念地图。",[],["区分 AI、ML、DL 与 LLM","识别生成式 AI 的能力边界"],""],
  ["M02","L2","Transformer 与 Attention","理解 Transformer 的核心组件和信息交互机制。",["M01"],["解释 Attention 的输入、权重与输出","理解 Encoder、Decoder 与层堆叠"],"transformer"],
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
  id: "ai-engineering-foundations",
  title: "AI Engineering Academy",
  description: "从大模型原理、AI 应用开发到 Agent 系统与平台工程的系统化学习路径。",
  version: "0.2.0",
  language: "zh-CN",
  labs: [
    { id: "tokenizer", title: "Tokenizer Lab", executionMode: "browser-local", description: "使用玩具 BPE 词表观察子词合并。", safetyNotes: ["仅使用内置示例词表，不调用外部模型。"], inputs: [{ name: "text", description: "待切分文本" }], outputs: [{ name: "tokens", description: "示例 token 片段与合并过程" }], status: "implemented" },
    { id: "transformer", title: "Transformer Attention Lab", executionMode: "browser-local", description: "使用固定小矩阵计算 scaled dot-product attention。", safetyNotes: ["仅在浏览器内执行固定矩阵运算，不加载模型权重。"], inputs: [{ name: "mask", description: "可选因果注意力掩码" }], outputs: [{ name: "attention", description: "分数、权重与加权输出矩阵" }], status: "implemented" },
    { id: "rag", title: "RAG Pipeline Lab", executionMode: "simulation", description: "演示 chunking、教学向量、Top-K 检索与重排。", safetyNotes: ["使用内置虚构语料和确定性教学向量，不连接外部数据或模型。"], inputs: [{ name: "query", description: "检索查询" }], outputs: [{ name: "results", description: "教学检索与重排结果" }], status: "implemented" },
    ...["tool-calling", "agent", "mcp", "multi-agent", "evaluation"].map((id) => ({ id, title: id, executionMode: "simulation" as const, description: "尚处于规划阶段。", safetyNotes: ["未实现，不会执行真实工具或外部操作。"], inputs: [], outputs: [], status: "planned" as const }))
  ],
  modules: moduleRows.map(([id, level, title, summary, prerequisites, objectives, labId]) => ({
    id, level, title, summary, prerequisites: [...prerequisites], objectives: [...objectives],
    lessons: [lesson(id, title, summary, [...objectives])],
    ...(labId ? { labId } : {})
  }))
};
