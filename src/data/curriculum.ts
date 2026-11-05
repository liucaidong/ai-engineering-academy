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
  },
  M04: {
    content: [
      { heading: "預訓練：從大規模資料中學習表示", body: "預訓練通常使用大規模語料和自監督目標，讓模型學習語言、知識和模式的统计结构。", markdown: "預訓練階段會在大規模資料上優化模型參數。自回歸語言模型常使用下一 token 預測目標；遮罩語言模型則可使用被遮蔽 token 預測等目標。\n\n訓練資料、去重、品質篩選、資料污染和計算預算都會影響模型能力。參數量並不是品質的唯一決定因素；資料分佈、訓練配方、架構與推理方式同樣重要。" },
      { heading: "SFT：把基礎能力調整為指令跟隨", body: "Supervised Fine-Tuning 使用示範輸入輸出對，讓模型更貼近指令格式和目標任務。", markdown: "SFT 通常以人工或合成的指令—回應樣本進行監督式訓練。它可以改善指令遵循、格式控制和特定領域任務表現，但結果取決於資料品質、覆蓋範圍和標註一致性。\n\n微調不會自動保證事實正確，也不會自動建立工具權限或安全邊界。對新知識更新，可能需要檢索或資料管線，而不是只依賴微調。" },
      { heading: "偏好對齊與 RLHF", body: "偏好對齊使用比較或評分訊號，讓模型輸出更符合人類偏好和產品目標。", markdown: "一種經典 RLHF 流程包含：收集示範資料、收集多個候選回答的偏好比較、訓練獎勵模型，再使用強化學習優化語言模型。現代系統也可能使用直接偏好優化等替代方法。\n\n偏好訊號是代理指標，不等於客觀真理。偏好模型可能放大標註偏差、過度迎合或獎勵駭客，因此仍需獨立的安全、能力和真實性評測。" },
      { heading: "訓練資料與評測資料治理", body: "資料切分、污染檢查、代表性和可追溯性決定評測能否反映真實泛化能力。", markdown: "訓練集、驗證集和測試集必須有清晰邊界。若測試題目或答案已進入訓練資料，離線分數可能高估模型的泛化能力。\n\n工程交付應記錄資料來源、許可、版本、清洗規則、去重策略和切分方式。模型評測也要覆蓋分佈外案例、長尾輸入和安全拒答，而不只看平均分數。" }
    ],
    assessments: [{ id: "m04-training-pipeline-review", type: "design-review", prompt: "設計一份小型領域模型適配計畫，區分預訓練、SFT、偏好對齊和評測資料治理的目的。", rubric: [{ criterion: "階段區分", description: "正確區分預訓練、SFT 與偏好優化", points: 4 }, { criterion: "資料治理", description: "說明來源、許可、去重和污染控制", points: 3 }, { criterion: "評測設計", description: "建立獨立測試集和安全評測", points: 3 }] }],
    sources: [
      { title: "Language Models are Few-Shot Learners", url: "https://arxiv.org/abs/2005.14165", publisher: "Brown et al., NeurIPS 2020", note: "大規模自回歸預訓練與 few-shot 能力" },
      { title: "Training language models to follow instructions with human feedback", url: "https://arxiv.org/abs/2203.02155", publisher: "Ouyang et al., NeurIPS 2022", note: "InstructGPT 與 RLHF 流程" }
    ]
  },
  M05: {
    content: [
      { heading: "自回歸推理流程", body: "自回歸模型逐 token 生成：模型根據當前上下文計算下一 token 分佈，再依解碼策略選擇 token。", markdown: "推理請求通常先處理 prompt（prefill），計算上下文各位置的隱藏狀態和 KV；接著進入 decode 階段，逐步產生新 token。每一步的輸出會成為下一步上下文的一部分。\n\nPrefill 的工作量與輸入長度相關；decode 需要反覆執行模型前向計算，並可能受到記憶體頻寬、批次策略和 KV Cache 讀取影響。" },
      { heading: "Greedy、Sampling 與解碼參數", body: "解碼策略控制如何從下一 token 機率分佈中選擇輸出，會影響多樣性、可重現性和任務品質。", markdown: "Greedy decoding 每一步選擇機率最高的 token；Sampling 按機率分佈抽樣。Temperature 調整分佈尖銳程度，Top-k 限制候選數量，Top-p 保留累積機率達到門檻的候選集合。\n\n這些參數不是越高越好。確定性任務通常更重視穩定和可控；創意生成可能需要更高多樣性。必須用任務資料集測試，而不是只憑主觀感受調參。" },
      { heading: "KV Cache 與記憶體成本", body: "KV Cache 保存已處理 token 的 Key/Value，避免每生成一個 token 都重新計算整段歷史。", markdown: "在自回歸 decode 中，模型可以保留先前 token 的 K/V 張量，新增 token 時只計算新位置的 K/V，降低重複計算。代價是 Cache 需要 GPU 或其他設備記憶體。\n\nCache 大小受 batch、層數、KV head 數、head dimension、序列長度和資料精度影響。長上下文與高併發會讓 KV Cache 成為部署容量規劃的重要因素。" },
      { heading: "部署指標與服務策略", body: "推理服務需要同時衡量延遲、吞吐、併發、首 token 時間、每 token 延遲和單位成本。", markdown: "常見指標包括 TTFT（Time To First Token）、TPOT（Time Per Output Token）、tokens/s、請求吞吐、P50/P95/P99 延遲、GPU 利用率、Cache 命中和錯誤率。\n\nContinuous batching、請求排隊、模型量化、KV Cache 管理和多模型路由會互相影響。容量規劃應基於真實負載分佈和服務等級目標，而不是單次 benchmark。" }
    ],
    assessments: [{ id: "m05-inference-capacity", type: "code-task", prompt: "建立一份推理服務容量規劃表，至少納入 prompt 長度、輸出長度、併發數、KV Cache 和 P95 延遲。", rubric: [{ criterion: "解碼流程", description: "能區分 Prefill 與 Decode", points: 3 }, { criterion: "Cache 模型", description: "識別 KV Cache 主要維度和記憶體影響", points: 3 }, { criterion: "服務指標", description: "使用 TTFT、TPOT、吞吐和尾延遲建立容量判斷", points: 4 }] }],
    sources: [
      { title: "Generation configuration", url: "https://huggingface.co/docs/transformers/main_classes/text_generation", publisher: "Hugging Face", note: "解碼參數和 KV Cache 配置" },
      { title: "KV cache strategies", url: "https://huggingface.co/docs/transformers/en/kv_cache", publisher: "Hugging Face", note: "KV Cache 類型和記憶體策略" }
    ]
  },
  M06: {
    content: [
      { heading: "Prompt 是可版本化的輸入契約", body: "Prompt 不只是自然語言技巧，而是模型應用中的輸入介面，需要結構、版本、測試和變更治理。", markdown: "一個穩定 Prompt 通常包含任務目標、角色或行為約束、輸入上下文、輸出格式、例外處理和示例。動態資料應透過明確的欄位注入，而不是把使用者內容無限制拼接到指令區。\n\n生產 Prompt 應放入版本控制，與程式碼一起審查、測試和回滾。不要依賴無法追蹤的手工複製版本。" },
      { heading: "指令、上下文與資料邊界", body: "明確分隔指令與不可信資料，能降低模型把引用內容誤當成控制指令的風險。", markdown: "使用清楚的標題、欄位或結構化分隔符區分任務指令、參考資料和使用者輸入。對檢索文件、網頁和附件，應明確告知模型它們是資料而非高優先級指令。\n\nPrompt Injection 不能只靠一句“忽略惡意指令”解決。工具權限、資料存取和外部副作用必須在模型之外由程式控制。" },
      { heading: "Few-shot 與輸出格式約束", body: "少量高品質示例可以展示期望模式；結構化輸出則應由 Schema 和程式驗證兜底。", markdown: "Few-shot 示例應覆蓋典型輸入、邊界案例和錯誤模式，並保持標註一致。若需要 JSON，應定義欄位、型別、必填項和允許值，並在接收端執行驗證。\n\n自然語言要求“只輸出 JSON”並不能替代結構化輸出機制和 Schema 驗證。" },
      { heading: "Prompt 評測與回歸", body: "Prompt 變更應透過固定測試集、品質指標和回歸比較，而不是只看單次示例。", markdown: "建立代表性測試案例，覆蓋正常輸入、歧義輸入、超長內容、注入攻擊和拒答邊界。記錄模型版本、Prompt 版本、參數和評測結果。\n\n可將 Prompt 視為一段可執行的產品配置：每次修改都應回答品質是否改善、哪些案例退化、成本和延遲是否改變。" }
    ],
    assessments: [{ id: "m06-prompt-test-plan", type: "design-review", prompt: "為客服摘要功能設計一份 Prompt 規格和回歸測試計畫，包含不可信輸入隔離和結構化輸出驗證。", rubric: [{ criterion: "提示結構", description: "明確定義任務、上下文、輸出和例外規則", points: 3 }, { criterion: "資料隔離", description: "區分指令與不可信資料，避免越權指令注入", points: 3 }, { criterion: "回歸評測", description: "包含測試案例、品質指標和版本記錄", points: 4 }] }],
    sources: [
      { title: "Prompt engineering", url: "https://developers.openai.com/api/docs/guides/prompt-engineering", publisher: "OpenAI", note: "Prompt 結構、版本化與評測" },
      { title: "Prompting", url: "https://developers.openai.com/api/docs/guides/prompting", publisher: "OpenAI", note: "指令、示例與提示設計" }
    ]
  },
  M07: {
    content: [
      { heading: "Tool Calling 的控制流", body: "模型提出工具呼叫請求，應用程式驗證並執行工具，再把工具結果交還模型；模型本身不會自動執行你的程式。", markdown: "典型流程：應用把可用工具描述和使用者請求傳給模型；模型回傳工具名稱與參數；應用驗證名稱、參數、身份和權限；應用執行工具並回傳結果；模型再根據結果產生回應或提出下一次工具呼叫。\n\n這是多步驟控制流，不是模型直接取得資料庫或作業系統權限。執行責任始終在應用程式和工具服務端。" },
      { heading: "Schema 與參數驗證", body: "工具定義應使用明確 Schema 描述參數，並在服務端重新驗證所有輸入。", markdown: "工具 Schema 應定義欄位名稱、型別、必填性、範圍、列舉值和額外欄位策略。即使模型支援 Strict Structured Outputs，也不能省略服務端授權、業務規則和資源存在性檢查。\n\nSchema 保證的是資料形狀，不代表操作合法、使用者有權執行，或副作用符合業務預期。" },
      { heading: "授權、冪等與副作用", body: "讀取工具和寫入工具應區分權限；支付、刪除、發送等高風險操作需要額外確認和冪等控制。", markdown: "工具執行前應檢查呼叫者身份、租戶範圍、資源所有權、權限和風險等級。對外部寫入操作，使用冪等鍵、審計日誌、超時和補償機制。\n\n不要因為模型提出了工具呼叫就自動授權。高風險操作應要求明確使用者確認或人工審批。" },
      { heading: "錯誤處理與可觀測性", body: "工具錯誤需要結構化回傳、可追蹤關聯 ID 和有限重試，避免 Agent 無限重試或掩蓋失敗。", markdown: "工具回應應包含成功/失敗狀態、穩定錯誤碼、可安全暴露的訊息和關聯 ID。區分參數錯誤、權限拒絕、資源不存在、速率限制和暫時性故障。\n\n重試必須受次數、時間和副作用語義限制。對非冪等操作，不能盲目重試。" }
    ],
    assessments: [{ id: "m07-tool-contract", type: "code-task", prompt: "設計一個只讀的 get_order 工具 Schema 和服務端驗證流程，確保使用者不能讀取其他租戶的訂單。", rubric: [{ criterion: "Schema", description: "定義嚴格且可驗證的輸入輸出欄位", points: 3 }, { criterion: "授權", description: "從可信身份上下文取得租戶，不信任模型自行提供的 tenant ID", points: 4 }, { criterion: "錯誤與審計", description: "處理未授權、資源不存在和關聯追蹤", points: 3 }] }],
    sources: [
      { title: "Function calling", url: "https://developers.openai.com/api/docs/guides/function-calling", publisher: "OpenAI", note: "工具呼叫流程與 Strict Schema" },
      { title: "Function Calling in the OpenAI API", url: "https://help.openai.com/en/articles/8555517-function-calling-in-the-openai-api", publisher: "OpenAI Help Center", note: "Function Calling 與 Structured Outputs" }
    ]
  },
  M08: {
    content: [
      { heading: "RAG 解決什麼問題", body: "RAG 把模型參數中的知識與可更新的外部資料源結合，讓生成可以基於檢索到的上下文。", markdown: "Retrieval-Augmented Generation 將檢索系統與生成模型組合。檢索器從非參數化知識庫中選出相關文件或段落，生成模型再根據問題和檢索上下文生成答案。\n\nRAG 可以改善知識更新和來源追溯，但不能自動保證答案正確。若檢索沒有召回正確證據，或生成模型錯誤解讀證據，答案仍可能錯誤。" },
      { heading: "Ingestion：資料切分與索引", body: "資料匯入通常包含解析、清洗、切分、Metadata 附加、Embedding 和索引建立。", markdown: "Chunking 需要在語義完整性、檢索粒度和上下文成本之間取捨。固定長度切分簡單，但可能切斷段落或表格；結構感知切分可以利用標題、段落、程式碼和文件結構。\n\n每個 chunk 應保留來源、文件版本、權限範圍和定位資訊。Embedding 模型、向量維度和索引配置需要一致，更新時應考慮重建和版本切換。" },
      { heading: "Retrieval、Reranking 與 Context Assembly", body: "向量檢索、關鍵字檢索和混合檢索可召回候選；Reranker 再對候選相關性排序。", markdown: "向量檢索根據 Embedding 空間中的相似度召回候選；BM25 等詞法方法適合精確詞項和專有名詞。混合檢索可結合兩者。\n\nReranker 通常對 query 和候選文本進行更細粒度的相關性判斷，但計算成本較高。Context Assembly 需要去重、排序、截斷和權限過濾，避免把無關或無權限內容送進模型。" },
      { heading: "評測與引用可信度", body: "RAG 評測要分開測量檢索品質、答案品質、引用正確性、延遲和成本。", markdown: "檢索層可衡量 Recall@k、Precision@k、MRR 或 nDCG；生成層可衡量答案正確性、忠實度、引用支持度和拒答表現。\n\n引用必須能回指實際來源片段，不能只生成一個看似可信的 URL。測試集應包含無答案問題、衝突文件、過期文件和權限隔離案例。" }
    ],
    assessments: [{ id: "m08-rag-evaluation-plan", type: "design-review", prompt: "為內部技術知識庫設計 RAG 方案，包含文件權限、切分策略、混合檢索、重排和離線評測。", rubric: [{ criterion: "資料匯入", description: "設計可追溯的 chunk 與 metadata", points: 3 }, { criterion: "檢索鏈路", description: "說明召回、重排和 context assembly", points: 3 }, { criterion: "評測與權限", description: "設計檢索/生成指標並隔離無權限文件", points: 4 }] }],
    sources: [
      { title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks", url: "https://arxiv.org/abs/2005.11401", publisher: "Lewis et al., NeurIPS 2020", note: "RAG 原始研究" },
      { title: "Prompt engineering", url: "https://developers.openai.com/api/docs/guides/prompt-engineering", publisher: "OpenAI", note: "檢索上下文如何提供給生成模型" }
    ]
  },
  M09: {
    content: [
      { heading: "多模態模型的輸入與輸出", body: "多模態系統處理文字、圖像、音訊或影片等不同形式的資料，並在模型內部映射到可共同處理的表示。", markdown: "多模態系統不只是把圖片或音訊轉成文字。不同模態可能使用專門的 encoder、patch/token 化、音訊特徵表示或跨模態投影，再與語言模型的表示進行融合。\n\n需要區分輸入模態、內部表示和輸出模態。模型能接收圖像，不代表它能精確讀取所有細節；能生成音訊，也不代表輸出符合專業聲學或安全要求。" },
      { heading: "圖文對齊與視覺語言模型", body: "圖文對比學習等方法把圖像和文字映射到可比較的表示空間，支持檢索和零樣本分類等任務。", markdown: "CLIP 類方法使用大量圖像—文字配對學習跨模態表示，讓匹配的圖像和文字在嵌入空間中更接近。這類表示可用於圖文檢索和零樣本分類。\n\n但對比式圖文模型不等於具備完整視覺推理能力的通用 VLM。視覺問答、OCR、定位和多步推理需要不同能力與評測。" },
      { heading: "音訊任務與表示", body: "音訊模型可能執行語音辨識、語音生成、語音翻譯、說話者處理或音訊理解。", markdown: "語音辨識通常把音訊轉成文字；語音生成則把文字或其他條件轉成波形或聲學 token。端到端語音模型可能直接處理音訊表示，也可能採用分階段架構。\n\n音訊系統要考慮採樣率、聲道、噪音、延遲、說話者差異、語言覆蓋和隱私。評測不能只看轉寫文字，還要考慮時間戳、專有名詞和不同口音。" },
      { heading: "多模態評測與安全", body: "多模態系統需要按模態和任務設計評測，並處理隱私、版權、偏差和提示注入風險。", markdown: "圖像任務可測量 OCR、物體識別、定位、圖表理解和視覺問答；音訊任務可測量 WER、說話者錯誤、延遲和語音品質。影片還需要時間維度和跨幀一致性評估。\n\n圖像和音訊也可能包含個人資訊、隱藏指令或敏感內容。資料治理、存取控制、保留期限和人工覆核應納入系統設計。" }
    ],
    assessments: [{ id: "m09-multimodal-test-matrix", type: "design-review", prompt: "為一個支援圖片和語音輸入的知識助手建立多模態測試矩陣，列出能力、失敗模式和資料治理控制。", rubric: [{ criterion: "模態流程", description: "說明圖像與音訊各自的輸入/表示/輸出流程", points: 3 }, { criterion: "評測覆蓋", description: "覆蓋 OCR、視覺問答、語音辨識和延遲等任務", points: 4 }, { criterion: "風險治理", description: "處理隱私、偏差、版權和不可信內容", points: 3 }] }],
    sources: [
      { title: "Learning Transferable Visual Models From Natural Language Supervision", url: "https://arxiv.org/abs/2103.00020", publisher: "Radford et al., ICML 2021", note: "CLIP 圖文對齊研究" },
      { title: "Robust Speech Recognition via Large-Scale Weak Supervision", url: "https://arxiv.org/abs/2212.04356", publisher: "Radford et al.", note: "Whisper 大規模弱監督語音辨識" }
    ]
  },
  M10: {
    content: [
      { heading: "Agent 與普通 LLM 應用的區別", body: "Agent 在模型推理之外還具有狀態、工具使用和多步驟控制循環，能根據中間結果決定下一步行動。", markdown: "普通 LLM 呼叫通常是輸入一次、輸出一次；Agent Runtime 則管理一個循環：接收目標和上下文、讓模型提出下一步、執行被授權的工具、觀察結果、更新狀態，直到完成或觸發停止條件。\n\nAgent 不等於“模型自主執行一切”。模型負責提出決策，Runtime 負責控制步驟、權限、超時、預算和狀態。" },
      { heading: "Agent Loop 與狀態機", body: "可恢復的 Agent 需要明確的狀態、事件、轉移條件和終止條件。", markdown: "典型狀態包括 Ready、Planning、ToolRequested、ToolRunning、WaitingForApproval、Completed 和 Failed。每次轉移都應由可觀測事件驅動。\n\n設定最大步數、總時間、token 預算和工具呼叫預算，並為取消、超時、重試和人工接管設計明確路徑。不要只依賴模型說“我已完成”作為完成判斷。" },
      { heading: "Runtime 的責任邊界", body: "Runtime 管理工具註冊、參數驗證、權限檢查、執行隔離、日誌和錯誤恢復。", markdown: "Runtime 應把模型輸出視為不可信的控制請求。工具名稱必須在白名單中，參數需符合 Schema，授權應根據可信使用者上下文判斷。對文件、Shell、網路和資料庫等能力使用最小權限。\n\n外部副作用需要審批、冪等鍵和審計。Agent 需要在限定時間和資源內運行，並能被取消。" }
    ],
    assessments: [{ id: "m10-agent-runtime-design", type: "design-review", prompt: "設計一個只讀知識檢索 Agent 的狀態機，標出模型決策、工具執行、停止條件和錯誤恢復。", rubric: [{ criterion: "狀態與轉移", description: "定義可驗證的狀態、事件和終止條件", points: 4 }, { criterion: "工具控制", description: "模型提出請求、Runtime 驗證和執行的責任分離", points: 3 }, { criterion: "資源與恢復", description: "包含預算、超時、取消和失敗處理", points: 3 }] }],
    sources: [
      { title: "Agents SDK", url: "https://developers.openai.com/api/docs/guides/agents/sdk", publisher: "OpenAI", note: "Agent loop、tools、handoffs 與 runtime" },
      { title: "Tracing", url: "https://developers.openai.com/api/docs/guides/agents-api/tracing", publisher: "OpenAI", note: "Agent session、turn 和 span" }
    ]
  },
  M11: {
    content: [
      { heading: "Planning：把目標轉為可檢查步驟", body: "Planning 將模糊目標分解為有前置條件、輸入輸出和完成判定的任務。", markdown: "計畫可以是線性步驟、依賴 DAG 或動態更新的任務清單。每個子任務都應有完成條件、所需工具、預期副作用和失敗處理。\n\n計畫不是執行事實。工具結果可能讓計畫失效，因此 Runtime 應允許重新規劃，同時限制重規劃次數和總預算。" },
      { heading: "短期狀態與長期記憶", body: "短期狀態支援當前任務恢復；長期記憶保存跨任務可重用資訊，兩者需要不同生命週期和權限。", markdown: "Thread 或 session state 通常保存當前對話、任務進度和中間結果；長期 store 則保存經過選擇、驗證和治理的偏好或知識。\n\n不要把整段對話無差別寫入長期記憶。應定義資料來源、用途、租戶隔離、保留期限、刪除策略和敏感資訊規則。讀取記憶時也要檢查時效性與可信度。" },
      { heading: "Checkpoint、恢復與記憶治理", body: "Checkpoint 讓任務能在中斷後恢復；記憶治理決定哪些內容可以被保存、更新、過期或刪除。", markdown: "Checkpoint 應保存足以重建執行狀態的資料，例如當前節點、已完成步驟、工具結果引用和待審批操作。敏感憑證不應直接放入 checkpoint。\n\n恢復時要防止重複執行外部副作用。對工具操作使用冪等鍵或先查詢執行狀態。記憶應支援來源追溯、版本、過期和使用者控制。" }
    ],
    assessments: [{ id: "m11-memory-policy", type: "design-review", prompt: "為個人助理設計短期狀態與長期記憶方案，包含寫入規則、來源、過期、刪除和恢復語義。", rubric: [{ criterion: "記憶分層", description: "區分 thread state、checkpoint 和跨任務長期記憶", points: 3 }, { criterion: "資料治理", description: "定義敏感資料、來源、保留和刪除規則", points: 4 }, { criterion: "恢復安全", description: "處理重複副作用和中斷恢復", points: 3 }] }],
    sources: [
      { title: "Persistence", url: "https://docs.langchain.com/oss/python/langgraph/persistence", publisher: "LangGraph", note: "Checkpoint 與 long-term store 概念" },
      { title: "Agents SDK", url: "https://developers.openai.com/api/docs/guides/agents/sdk", publisher: "OpenAI", note: "Agent state 和執行模式" }
    ]
  },
  M12: {
    content: [
      { heading: "MCP 的角色與協議邊界", body: "Model Context Protocol 定義 AI Host 與外部 Server 之間發現和使用上下文能力的標準化協議。", markdown: "MCP 通常涉及 Host、Client 和 Server：Host 是承載 AI 應用的環境；Client 管理與 Server 的協議連線；Server 暴露工具、資源或提示模板等能力。\n\nMCP 解決互通協議問題，不會自動替應用完成身份授權、租戶隔離或業務審批。協議連線建立後，Host 仍需決定哪些能力可見、哪些呼叫可執行。" },
      { heading: "Tools、Resources 與 Prompts", body: "Tools 表達可呼叫操作，Resources 提供可讀取上下文，Prompts 提供可重用的提示模板。", markdown: "Tool 呼叫可能產生外部副作用，必須經過權限和風險檢查。Resource 讓 Client 取得資料或內容，但仍要遵循資料存取控制。Prompt 是可重用模板，不等於授權策略。\n\n能力發現只表示 Server 宣告了能力，不表示所有使用者都應該獲得該能力。" },
      { heading: "Transport、生命週期與安全", body: "傳輸方式、連線生命週期和信任邊界會影響 MCP Server 的部署與安全設計。", markdown: "常見傳輸包含本地程序的 stdio 和遠端的 Streamable HTTP。遠端連線需要考慮身份驗證、授權、TLS、來源驗證、請求大小限制和速率限制。\n\n對本地 Server，應審核啟動命令、執行檔路徑、環境變數和檔案/網路權限。對遠端 Server，應驗證來源和授權範圍，並將工具呼叫記錄到可追蹤的審計事件。" }
    ],
    assessments: [{ id: "m12-mcp-threat-model", type: "design-review", prompt: "為一個遠端 MCP Server 設計工具發現與呼叫流程，列出 Host、Client、Server 職責及信任邊界。", rubric: [{ criterion: "協議角色", description: "正確區分 Host、Client、Server", points: 3 }, { criterion: "能力語義", description: "區分 Tools、Resources 和 Prompts", points: 3 }, { criterion: "安全控制", description: "定義身份、授權、傳輸和審計控制", points: 4 }] }],
    sources: [
      { title: "Architecture overview", url: "https://modelcontextprotocol.io/docs/learn/architecture", publisher: "Model Context Protocol", note: "MCP 架構與核心角色" },
      { title: "MCP Specification", url: "https://modelcontextprotocol.io/specification/2026-07-28", publisher: "Model Context Protocol", note: "協議規範與能力定義" }
    ]
  },
  M13: {
    content: [
      { heading: "Skill 是可發現的程序化能力單元", body: "Skill 把任務方法、操作規則和可選資源封裝成可按需載入的目錄，而不是把所有知識塞進每次提示。", markdown: "一個 Skill 通常以資料夾為單位，包含 SKILL.md 和可選的 scripts、references、assets。元資料至少描述名稱和適用情境，正文則提供具體工作流程、邊界和示例。\n\nSkill 的價值在於可發現、可組合和漸進式揭露：系統先載入簡短描述，任務匹配時才載入完整指令與資源。" },
      { heading: "設計輸入、輸出與依賴契約", body: "可維護 Skill 應明確定義觸發條件、前置條件、輸入、輸出、依賴和失敗處理。", markdown: "避免只寫“你是一位專家”這類模糊指令。應描述何時使用、何時不要使用、需要哪些輸入、步驟順序、產物格式和驗收標準。\n\n若包含腳本，需說明執行環境、依賴、權限和輸出副作用。參考資料應拆分為可按需讀取的檔案，避免主指令過長。" },
      { heading: "版本、組合與供應鏈治理", body: "Skill 需要版本、審查、來源和依賴治理；Skill 內容和附帶腳本都應視為可執行或可影響行為的供應鏈輸入。", markdown: "為 Skill 設定維護者、版本、變更紀錄和相容性約束。第三方 Skill 不應因為名稱可信就自動執行；應檢查指令是否要求讀取秘密、上傳資料或執行未審核程式。\n\n將 Skill 分成純指令、讀取資源和可執行腳本等風險級別，並為每類設定不同權限和審批要求。" }
    ],
    assessments: [{ id: "m13-skill-package", type: "code-task", prompt: "建立一個文件審查 Skill 的目錄規格，包含 SKILL.md、觸發條件、參考文件、可選腳本和權限聲明。", rubric: [{ criterion: "元資料與觸發", description: "名稱和描述準確界定使用範圍", points: 3 }, { criterion: "程序契約", description: "定義輸入、步驟、輸出和驗收條件", points: 4 }, { criterion: "安全與版本", description: "說明腳本權限、依賴和版本治理", points: 3 }] }],
    sources: [
      { title: "Agent Skills", url: "https://learn.microsoft.com/en-us/agent-framework/agents/skills", publisher: "Microsoft Learn", note: "Skill 結構與漸進式揭露" },
      { title: "Agent Skills overview", url: "https://github.com/microsoft/skills/blob/main/.github/docs/skills.md", publisher: "Microsoft", note: "SKILL.md 和目錄規範概覽" }
    ]
  },
  M14: {
    content: [
      { heading: "何時需要 Multi-Agent", body: "多 Agent 適合需要不同專業上下文、並行探索或明確責任分工的任務；它不是所有任務的預設架構。", markdown: "先建立單 Agent 基線，再判斷是否存在可獨立分解的子任務、上下文隔離需求或專業角色差異。若任務共享狀態多、耦合高或需要大量協調，Multi-Agent 可能增加延遲、成本和故障面。\n\nAgent 數量增加不等於品質提升。應用任務成功率、總成本、延遲和可診斷性來判斷架構是否值得。" },
      { heading: "協作拓撲與交接", body: "常見模式包括 Manager/Worker、Handoff、Pipeline 和並行專家匯總。", markdown: "Manager/Worker 由管理者分配子任務並彙總；Handoff 將控制權交給專家 Agent；Pipeline 依序處理階段；並行專家可以同時探索，再由仲裁者整合。\n\n每次交接應有明確任務、上下文範圍、輸出 Schema、完成條件和錯誤回傳。共享狀態需要版本和衝突策略，避免多個 Agent 無序寫入。" },
      { heading: "協調成本與故障模式", body: "多 Agent 需要控制循環、重複工作、死鎖、相互矛盾和上下文膨脹。", markdown: "設置最大交接次數、最大並行度、總 token/成本預算和截止時間。對每個子任務記錄 owner、狀態、輸入引用和輸出摘要。\n\n匯總階段需要檢查證據一致性和重複內容。對高風險決策，不應讓多個模型投票替代權限控制或人工審批。" }
    ],
    assessments: [{ id: "m14-orchestration-topology", type: "design-review", prompt: "為一個市場研究任務比較單 Agent、Manager/Worker 和並行專家三種方案，選擇一種並給出成本和失敗控制。", rubric: [{ criterion: "架構選擇", description: "根據任務分解和上下文隔離選擇拓撲", points: 3 }, { criterion: "交接契約", description: "定義子任務輸入輸出和 owner", points: 3 }, { criterion: "協調治理", description: "限制並行度、成本、循環和衝突", points: 4 }] }],
    sources: [
      { title: "Agents SDK", url: "https://developers.openai.com/api/docs/guides/agents/sdk", publisher: "OpenAI", note: "Agent orchestration 和 handoffs" },
      { title: "AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation", url: "https://arxiv.org/abs/2308.08155", publisher: "Wu et al.", note: "多 Agent 對話式協作框架研究" }
    ]
  },
  M15: {
    content: [
      { heading: "威脅模型：模型不是安全邊界", body: "Agent 安全必須建立在應用和基礎設施控制上，不能把提示詞或模型拒答當成唯一防線。", markdown: "威脅面包括直接/間接 Prompt Injection、敏感資訊洩露、不安全輸出處理、工具權限過大、供應鏈風險和資源耗盡。\n\n攻擊內容可能來自使用者訊息，也可能藏在網頁、文件、郵件、檢索結果和工具輸出中。所有外部內容都應視為不可信資料。" },
      { heading: "最小權限與隔離", body: "工具權限應按任務和資源範圍授予，並由服務端強制執行租戶、身份和資源授權。", markdown: "優先使用唯讀工具；將讀取、寫入、刪除、支付和對外發送等操作分級。使用者身份和租戶範圍應從可信認證上下文取得，不接受模型自行指定的權限主體。\n\n檔案、Shell、網路和程式碼執行應使用隔離環境、配額、網路出口控制和檔案系統限制。秘密不應暴露在模型上下文或工具輸出中。" },
      { heading: "人工審批與可審計副作用", body: "高風險操作需要明確確認、不可抵賴的審計記錄和可恢復的執行流程。", markdown: "將“模型建議操作”和“系統執行操作”分開。審批介面應展示操作對象、範圍、影響和不可逆風險；批准後仍由服務端再次校驗權限。\n\n記錄請求者、審批者、工具名稱、參數摘要、資源 ID、結果和關聯追蹤 ID。對可重試操作使用冪等鍵；對可補償操作定義回滾或人工處置。" }
    ],
    assessments: [{ id: "m15-agent-threat-model", type: "design-review", prompt: "對可修改雲端文件的 Agent 完成威脅模型，至少覆蓋 Prompt Injection、越權、資料洩露和破壞性操作。", rubric: [{ criterion: "威脅識別", description: "識別直接/間接注入和資料風險", points: 3 }, { criterion: "控制措施", description: "落實最小權限、租戶隔離和輸出驗證", points: 4 }, { criterion: "審批與審計", description: "設計人工確認、審計和恢復流程", points: 3 }] }],
    sources: [
      { title: "Top 10 for LLM and GenAI", url: "https://genai.owasp.org/initiatives/top-10-for-llm-and-genai/", publisher: "OWASP GenAI Security Project", note: "2025 LLM 應用風險分類" },
      { title: "AI Risk Management Framework", url: "https://www.nist.gov/itl/ai-risk-management-framework", publisher: "NIST", note: "AI 風險治理框架" }
    ]
  },
  M16: {
    content: [
      { heading: "Workflow 與自主 Agent 的取捨", body: "Workflow 使用預先定義的控制流；Agent 則可在執行時動態選擇下一步，兩者可以組合。", markdown: "若流程步驟穩定、可預測且需要強審計，優先使用確定性 Workflow。若任務需要根據上下文動態探索，才引入 Agent 決策。\n\n常見設計是 Workflow 負責外層狀態、權限和交易邊界，Agent 負責受限子任務。不要把整個業務流程交給無限制的自主循環。" },
      { heading: "重試、超時與補償", body: "可靠編排需要區分暫時性故障和永久性錯誤，並為每個活動設定重試、超時和冪等語義。", markdown: "網路超時、速率限制和暫時服務不可用可能適合有限重試；參數錯誤、權限拒絕和業務規則衝突通常不應重試。使用指數退避、最大次數和總截止時間。\n\n重試可能重複外部副作用，因此活動應具備冪等性或執行狀態查詢。對跨系統流程設計補償動作和人工恢復路徑。" },
      { heading: "持久化執行與人工介入", body: "長時間任務需要 checkpoint、事件歷史、取消、暫停和恢復機制。", markdown: "將非確定性外部呼叫放在可重試活動中，讓 Workflow 控制邏輯可重播。持久化事件歷史能支援故障後恢復和稽核。\n\n人工介入點應有明確等待狀態、審批期限、拒絕分支和恢復條件。取消任務時，還要定義已發生的副作用如何處置。" }
    ],
    assessments: [{ id: "m16-durable-workflow", type: "design-review", prompt: "設計一個跨三個外部服務的文件發布 Workflow，說明重試、冪等、補償、審批和恢復。", rubric: [{ criterion: "流程建模", description: "把確定性流程和 Agent 子任務分開", points: 3 }, { criterion: "故障恢復", description: "定義錯誤分類、重試、超時和冪等", points: 4 }, { criterion: "人工介入", description: "設計審批、取消和補償路徑", points: 3 }] }],
    sources: [
      { title: "What is a Temporal Retry Policy?", url: "https://docs.temporal.io/encyclopedia/retry-policies", publisher: "Temporal", note: "活動重試和 Workflow 執行語義" },
      { title: "Agents SDK", url: "https://developers.openai.com/api/docs/guides/agents/sdk", publisher: "OpenAI", note: "Agent Runtime 與 orchestration" }
    ]
  },
  M17: {
    content: [
      { heading: "Evaluation：建立可重現的品質定義", body: "AI Evaluation 用代表性資料集、明確指標和評分器檢查系統是否達到任務要求。", markdown: "先定義任務成功，再選擇指標。分類任務可看準確率、精確率、召回率和 F1；檢索任務可看 Recall@k、MRR 和 nDCG；生成任務需要結合人工評分、規則檢查和模型輔助評分。\n\n測試集應覆蓋正常案例、邊界案例、拒答、注入攻擊、長尾資料和分佈外輸入。每次 Prompt、模型、檢索器或工具變更都應執行回歸。" },
      { heading: "Trace 與 Observability", body: "Trace 把一次端到端任務拆成模型呼叫、工具執行、檢索和交接等可關聯事件。", markdown: "Trace 通常包含多個 Span，每個 Span 記錄操作名稱、開始/結束時間、狀態、屬性和關聯 ID。Metrics 用於聚合趨勢，Logs 用於事件細節，Traces 用於跨服務因果鏈。\n\nAgent Trace 還應關聯模型版本、Prompt 版本、工具名稱、token 用量、重試次數和審批結果。記錄內容需要做敏感資訊遮罩和存取控制。" },
      { heading: "品質、成本與延遲的聯合分析", body: "品質指標必須與延遲、成本、可靠性和安全指標一起分析，避免單一分數驅動錯誤優化。", markdown: "建立分層評測：單元級測試驗證工具和解析器；組件級測試驗證檢索或路由；端到端評測驗證任務完成；線上監控追蹤真實分佈和事故。\n\n對模型輔助評分器進行人工校準，檢查評分偏差。將成本、延遲和品質按任務類型、模型、租戶和版本切片，才能定位回歸來源。" }
    ],
    assessments: [{ id: "m17-eval-observability-plan", type: "design-review", prompt: "為一個 RAG Agent 設計離線評測集、線上指標和 Trace 欄位，並說明如何識別品質回歸。", rubric: [{ criterion: "評測設計", description: "定義資料集、指標和評分器", points: 4 }, { criterion: "可觀測性", description: "設計 Trace/Span/Metric/Log 關聯欄位", points: 3 }, { criterion: "回歸分析", description: "按版本、模型、租戶和任務切片", points: 3 }] }],
    sources: [
      { title: "Tracing", url: "https://developers.openai.com/api/docs/guides/agents-api/tracing", publisher: "OpenAI", note: "Agent Trace 結構和執行步驟" },
      { title: "OpenTelemetry Documentation", url: "https://opentelemetry.io/docs/", publisher: "OpenTelemetry", note: "Vendor-neutral traces、metrics 和 logs" }
    ]
  },
  M18: {
    content: [
      { heading: "AI Platform 的核心平面", body: "AI 平台需要將模型接入、流量治理、身份租戶、配額、執行和觀測分成清晰的責任邊界。", markdown: "常見平台能力包括 Model Gateway、Provider Adapter、模型路由、憑證管理、租戶與身份、配額計量、請求排隊、快取、評測、審計和觀測。\n\n控制平面管理模型/供應商配置、政策、配額和版本；資料平面承接線上請求並執行路由、限流和計量。兩者需要有明確的一致性與故障降級策略。" },
      { heading: "多租戶隔離與公平性", body: "多租戶系統必須隔離資料和權限，同時控制資源公平、噪音鄰居和成本歸屬。", markdown: "租戶邊界應貫穿身份、資料庫查詢、向量檢索、快取鍵、日誌和模型供應商憑證。只在 API 層檢查租戶而不在資料層約束，容易產生跨租戶資料洩露。\n\n資源治理可採用每租戶併發限制、Token 配額、速率限制和優先級隊列。Kubernetes Namespace 只是隔離工具之一，仍需考慮網路、節點、RBAC 和共享控制平面風險。" },
      { heading: "可靠性、性能與成本治理", body: "模型供應商故障、速率限制和成本波動需要透過超時、熔斷、回退、路由和預算策略管理。", markdown: "對供應商設定健康檢查、超時、重試上限和熔斷；重試時要避免放大流量。模型回退需要檢查能力相容性、資料政策和輸出品質，不可只按價格切換。\n\n建立每租戶、每模型和每功能的成本歸因，並監控 TTFT、TPOT、錯誤率、佇列等待和 Token 消耗。平台架構要同時滿足安全、可靠、性能和成本目標。" }
    ],
    assessments: [{ id: "m18-platform-architecture", type: "design-review", prompt: "設計一個多租戶 Model Gateway，描述控制平面、資料平面、配額、路由、憑證和故障降級。", rubric: [{ criterion: "平面劃分", description: "清晰劃分配置治理與線上請求處理", points: 3 }, { criterion: "租戶治理", description: "確保身份、資料、配額和計量隔離", points: 4 }, { criterion: "可靠性與成本", description: "定義限流、熔斷、回退和成本歸因", points: 3 }] }],
    sources: [
      { title: "Multi-tenancy", url: "https://kubernetes.io/docs/concepts/security/multi-tenancy/", publisher: "Kubernetes", note: "多租戶隔離和共享叢集風險" },
      { title: "Google Cloud Well-Architected Framework", url: "https://docs.cloud.google.com/architecture/framework", publisher: "Google Cloud", note: "安全、可靠、性能、成本和運維支柱" }
    ]
  },
  M19: {
    content: [
      { heading: "AI 功能的工程化交付", body: "AI 功能應遵循一般軟體工程的需求、設計、實現、測試、發布和運維流程，同時增加模型行為的不確定性治理。", markdown: "將 Prompt、模型配置、工具 Schema、檢索索引和評測資料視為版本化交付物。建立環境隔離、配置審查、測試、灰度發布和回滾流程。\n\nAI 系統的測試除了傳統單元與整合測試，還需要 Prompt 回歸、模型輸出評測、工具權限測試、檢索品質和安全測試。" },
      { heading: "供應鏈與可重現性", body: "模型、資料集、依賴、容器和 Skill 都可能成為供應鏈風險來源，需要版本和來源證明。", markdown: "記錄模型 ID/版本、權重摘要、Tokenizer 版本、資料集版本、依賴鎖檔、容器映像摘要和建置來源。對外部模型與工具 SDK 做許可、漏洞和來源審查。\n\n生產部署應可追溯到程式碼提交、建置產物和配置版本。對不可完全重現的託管模型，至少保存供應商、模型版本、請求參數和評測快照。" },
      { heading: "運維、事故與持續改進", body: "上線後需要 SLO、告警、事故處置、容量管理和持續評測。", markdown: "定義服務可用性、延遲、錯誤率和任務成功率等 SLI，為關鍵路徑設定 SLO。告警應指向可行動的使用者影響，而不是只報告主機指標。\n\n事故復盤要識別技術根因、檢測缺口和治理缺口，並形成有 owner 和期限的改進項。模型或 Prompt 更新應重新跑評測，避免品質回歸悄然進入生產。" }
    ],
    assessments: [{ id: "m19-release-readiness", type: "design-review", prompt: "為一個使用外部 LLM 和 RAG 的應用建立上線檢查表，覆蓋版本、供應鏈、評測、SLO、回滾和事故響應。", rubric: [{ criterion: "交付流程", description: "建立可追溯版本和灰度/回滾", points: 3 }, { criterion: "供應鏈", description: "記錄模型、資料、依賴和建置來源", points: 3 }, { criterion: "運維治理", description: "定義 SLO、告警和事故復盤", points: 4 }] }],
    sources: [
      { title: "Google Cloud Well-Architected Framework", url: "https://docs.cloud.google.com/architecture/framework", publisher: "Google Cloud", note: "運維、安全、可靠性與成本最佳實踐" },
      { title: "OpenTelemetry Documentation", url: "https://opentelemetry.io/docs/", publisher: "OpenTelemetry", note: "跨服務可觀測性標準" }
    ]
  },
  M20: {
    content: [
      { heading: "Capstone：端到端工程問題", body: "綜合專案需要從真實使用者問題出發，定義成功指標、約束、威脅模型和可驗收的系統邊界。", markdown: "選擇一個可在有限時間內交付的 AI 工程問題，例如企業知識助手、開發者 Agent 或多模態文件處理平台。先明確使用者、任務、資料來源、失敗成本和非目標。\n\n把需求轉成可測量指標：任務成功率、引用正確率、延遲、成本、權限違規率和可用性。沒有明確指標的“效果很好”不能作為驗收標準。" },
      { heading: "架構、實現與安全控制", body: "專案需呈現模型、檢索、工具、Runtime、資料和平台元件的責任分離。", markdown: "提交架構圖、資料流、API/Schema、部署拓撲和狀態機。標出模型決策與應用執行的邊界，列出每個工具的權限、輸入驗證和副作用。\n\n完成威脅模型，至少覆蓋 Prompt Injection、資料洩露、跨租戶存取、工具越權、供應鏈和資源耗盡。高風險操作要有人工審批或其他強制控制。" },
      { heading: "評測、交付與答辯", body: "Capstone 的完成標準是可運行、可測試、可觀測、可審計和可復現，而不是只展示 Demo。", markdown: "提交程式碼、部署說明、測試報告、評測資料集、Trace 範例、成本估算、威脅模型和已知限制。展示至少一個正常流程、一個故障流程和一個安全拒絕流程。\n\n答辯時說明架構取捨、品質指標、失敗案例和後續路線圖。未實現的能力應明確列為限制，不得以介面原型冒充已交付功能。" }
    ],
    assessments: [{ id: "m20-capstone-rubric", type: "design-review", prompt: "交付一個端到端 AI 工程專案，並提交架構、程式碼、測試、評測、威脅模型和運維文件。", rubric: [{ criterion: "問題與架構", description: "需求可驗收，架構邊界和資料流清晰", points: 2 }, { criterion: "工程實現", description: "核心流程可運行且具備測試", points: 3 }, { criterion: "品質與安全", description: "有評測、威脅模型和權限控制證據", points: 3 }, { criterion: "交付與運維", description: "提供部署、觀測、成本和已知限制文件", points: 2 }] }],
    sources: [
      { title: "AI Risk Management Framework", url: "https://www.nist.gov/itl/ai-risk-management-framework", publisher: "NIST", note: "Capstone 風險治理參考" },
      { title: "Google Cloud Well-Architected Framework", url: "https://docs.cloud.google.com/architecture/framework", publisher: "Google Cloud", note: "架構品質與運維檢查框架" }
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
  schemaVersion: 1,
  id: "ai-engineering-foundations",
  title: "AI Engineering Academy",
  description: "从大模型原理、AI 应用开发到 Agent 系统与平台工程的系统化学习路径。",
  version: "0.3.0",
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
    lessons: [lesson(id, title, summary, [...objectives])],
    ...(labId ? { labId } : {})
  }))
};
