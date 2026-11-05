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
