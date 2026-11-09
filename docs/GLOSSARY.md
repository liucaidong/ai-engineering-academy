# AI Engineering Academy 课程术语表

本术语表统一 M01–M20 核心概念。具体 API、协议和模型行为以相应版本的官方文档为准。

## A. AI 与机器学习基础

| 术语 | 定义 |
|---|---|
| Artificial Intelligence（AI） | 构建能够执行感知、推断、规划、生成或决策任务的机器系统这一领域。 |
| Machine Learning（ML） | 通过数据或反馈优化模型参数，使系统学习任务映射的方法集合。 |
| Deep Learning（DL） | 使用多层神经网络学习表示和函数映射的机器学习方法。 |
| Foundation Model | 在广泛数据上预训练、可通过提示或适配支持多种下游任务的模型。 |
| Large Language Model（LLM） | 以语言 token 序列为主要建模对象的大规模神经网络模型家族。 |
| Training | 根据训练目标和数据更新模型参数的过程。 |
| Inference | 使用已训练模型对给定输入执行前向计算并产生输出的过程。 |
| Parameter | 模型训练得到的内部数值，如权重和偏置。 |
| Loss Function | 把预测与训练目标差异映射为可优化标量的函数。 |
| Generalization | 模型在未参与训练的数据或目标分布上保持有效表现的能力。 |
| Overfitting | 模型过度适应训练样本中的偶然模式，导致未见数据表现下降。 |
| Data Leakage | 训练或评估意外使用本不应可见的信息，导致结果失真。 |
| Supervised Learning | 使用输入与目标标签作为学习信号的范式。 |
| Unsupervised Learning | 从未显式提供目标标签的数据中发现结构或学习表示的范式。 |
| Reinforcement Learning | 通过状态、动作和奖励反馈优化策略的学习范式。 |

## B. 模型架构、Token 与推理

| 术语 | 定义 |
|---|---|
| Token | Tokenizer 按模型词表和规则切分/编码后得到的离散单元。 |
| Tokenizer | 将输入文本或字节序列编码为 token ID，并支持解码的组件。 |
| BPE | 通过迭代合并相邻符号对构建子词词表的一类算法。 |
| WordPiece | 通过词片段评分/选择机制构建子词词表的方法家族。 |
| Unigram Tokenization | 以子词概率模型和候选分段为基础的 tokenizer 方法。 |
| Token ID | 词表条目的离散整数索引，不是语义向量。 |
| Embedding | 把离散 ID 映射到可学习稠密向量空间的参数矩阵或表示。 |
| Hidden State | 模型中间层对当前 token/上下文计算得到的表示。 |
| Logits | Softmax 前的未归一化类别分数；语言模型中通常对应词表 token。 |
| Context Window | 一次模型请求可处理的 token 序列容量约束，具体计量依模型和接口而定。 |
| Chat Template | 将结构化角色/消息内容序列化为目标模型输入格式的模板。 |
| Attention | 根据 Query-Key 匹配分数计算权重，并对 Value 信息加权聚合的机制。 |
| Query / Key / Value（Q/K/V） | 分别用于注意力打分查询、匹配键和信息聚合的投影表示。 |
| Multi-Head Attention | 在多个投影子空间并行计算注意力并融合输出的结构。 |
| Causal Mask | 自回归任务中禁止当前位置读取未来 token 的可见性约束。 |
| Padding Mask | 屏蔽批处理序列中补齐位置的约束。 |
| RoPE | 对 Query/Key 施加位置相关旋转，使注意力点积携带相对位置信息的机制。 |
| KV Cache | 自回归推理时缓存历史 token 的 Key/Value，避免重复计算历史投影。 |
| Prefill | 推理阶段处理已有输入上下文并建立 KV Cache 的阶段。 |
| Decode | 基于已有上下文逐步生成新 token 的阶段。 |
| Quantization | 用较低数值精度表示权重或激活，以降低存储/计算成本的技术。 |
| Continuous Batching | 在请求生成过程中动态加入/移除序列，提高批处理资源利用率的调度方式。 |
| Mixture of Experts（MoE） | 通过路由器为 token 选择部分专家网络执行计算的稀疏模型结构。 |

## C. 应用、检索与工具

| 术语 | 定义 |
|---|---|
| Prompt Contract | 对任务目标、输入、约束、输出格式、失败策略和验证方式的结构化约定。 |
| Structured Output | 由模型产生、并按约定结构（如 JSON Schema）校验的输出。 |
| JSON Schema | 描述 JSON 数据结构、字段、类型、约束和组合规则的标准。 |
| Function / Tool Calling | 模型提出结构化工具调用请求，由宿主校验、授权并决定是否执行的协议模式。 |
| Idempotency | 同一逻辑请求重复提交时，不重复产生额外副作用的性质。 |
| RAG | 将外部检索证据与生成模型结合的架构模式。 |
| Chunking | 将文档拆分为可检索片段并保留元数据的过程。 |
| Embedding Model | 将文本、图像或其他输入映射到向量表示的模型。 |
| BM25 | 基于词项频率和文档统计的经典稀疏检索排序函数。 |
| ANN | Approximate Nearest Neighbor，近似最近邻检索方法，用计算近似换取规模和延迟优势。 |
| Reranking | 对初步召回候选再次评分并重新排序的过程。 |
| Recall@k | 相关目标中有多少比例出现在前 k 个检索结果中的指标。 |
| MRR | Mean Reciprocal Rank，按首个相关结果排名倒数计算的平均指标。 |
| nDCG | Normalized Discounted Cumulative Gain，考虑相关性等级和排序位置的归一化指标。 |
| Citation Faithfulness | 回答中的声明是否被所引用证据真实支持的性质。 |

## D. Agent、协议与工作流

| 术语 | 定义 |
|---|---|
| Agent | 能基于目标、状态和观察选择下一步行动，并可能调用工具的模型驱动系统。 |
| Runtime | 管理 Agent 状态、工具执行、权限、预算、超时、恢复和审计的宿主运行环境。 |
| State Machine | 以状态和允许转移定义系统行为的模型。 |
| Checkpoint | 为任务恢复保存的状态、版本、进度和副作用引用快照。 |
| Planning | 将目标分解为子任务、依赖和可验证完成条件的过程。 |
| Memory | 经策略筛选后跨步骤或任务保留的信息；必须有来源、时效、权限和删除规则。 |
| MCP | Model Context Protocol，为 Host、Client 与 Server 间能力发现和交互定义协议。 |
| Tool | 可被宿主执行的动作接口，可能产生外部副作用。 |
| Resource | 通过协议提供给客户端读取的数据对象或内容资源。 |
| Skill | 带契约、说明、资源和可选脚本的可发现能力包；本身不授予权限。 |
| Multi-Agent | 多个 Agent 按分工、消息协议和共享状态协作完成任务的系统。 |
| Workflow | 由显式状态、条件、事件和确定性步骤控制的业务流程。 |
| Saga | 将跨服务长事务拆分为局部事务，并在失败时执行补偿动作的模式。 |
| Human-in-the-Loop（HITL） | 在关键判断或副作用前后纳入人工审核、确认、纠错或接管的机制。 |

## E. 安全、评测与平台

| 术语 | 定义 |
|---|---|
| Prompt Injection | 不可信输入试图改变模型遵循的指令或诱导其泄露信息/滥用工具的攻击。 |
| ACL | Access Control List，针对主体和资源定义访问许可的控制列表。 |
| RBAC | Role-Based Access Control，基于角色分配权限的访问控制模型。 |
| ABAC | Attribute-Based Access Control，根据主体、资源、动作和环境属性作出授权决策。 |
| Tenant Isolation | 确保不同租户的数据、缓存、队列、日志和执行资源互相隔离的系统性质。 |
| Benchmark | 具有样本、标注、指标和版本的标准化评测集合。 |
| LLM Judge | 使用语言模型按 Rubric 对候选输出评分的评估器，需人工校准和偏差审查。 |
| Trace | 关联一次请求跨组件执行过程的分布式追踪记录。 |
| Metric | 随时间或请求聚合的数值观测，需治理标签基数和隐私。 |
| SLI | Service Level Indicator，衡量服务某项可观察表现的指标。 |
| SLO | Service Level Objective，对 SLI 设定的目标范围或阈值。 |
| Model Gateway | 对模型供应商、模型版本、路由、配额、策略和计量进行统一管理的服务层。 |
| Rate Limiting | 按请求数、token、并发或时间窗口限制调用速率的机制。 |
| Canary Release | 先向小比例流量/用户发布并观测，再逐步扩大的发布策略。 |
| Rollback | 将系统恢复到已知可用的兼容版本组合，而不只回退单个代码文件。 |
| RTO | Recovery Time Objective，故障后恢复服务允许的目标时间。 |
| RPO | Recovery Point Objective，故障时允许丢失的数据时间窗口。 |


## F. 教学评价、模型评测与证据

| 术语 | 定义 |
|---|---|
| Evaluation（评测） | 对模型、检索、Agent 或系统的输出与行为进行质量测量；应说明任务、数据、指标、基线和适用边界。 |
| Assessment（学习者评价） | 判断学习者是否达到课程目标的过程，依据任务表现和可复核交付证据作出结论。 |
| Rubric（评分量规） | 将评价维度、分值/等级、表现描述和可观察证据对应起来的评分工具。 |
| Acceptance Gate（验收门槛） | 必须满足的通过条件；安全、隐私和证据诚信等硬门槛不能由其他维度高分补偿。 |
| Groundedness（证据依据性） | 输出中的事实性主张是否能由给定来源或检索证据支持；不等同于语言流畅度。 |
| Evidence Level（证据等级） | 对设计、静态检查、模拟、本机测试、目标环境测试和生产观测等证据强度的分层描述；不得跨级推断。 |
| Confidence Interval（置信区间） | 在给定统计模型和抽样假设下，对参数不确定性给出的区间估计；不是单次预测的确定性保证。 |
| Human-in-the-Loop Review（人工复核） | 由具备相应职责的人对高影响决策、异常结果或副作用执行审核、批准、纠正或接管。 |

术语使用约定：模型/系统质量测量统一使用“评测（Evaluation）”；学习者课程表现统一使用“评价（Assessment）”；评分工具统一使用“评分量规（Rubric）”。“指标（Metric）”“目标（Objective）”和“验收门槛（Gate）”是不同概念，不得互换。
