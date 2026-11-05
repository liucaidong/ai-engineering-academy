import type { Course } from "../types/course";

/** M08 — retrieval-augmented generation and production knowledge systems. */
export const flagshipM08Lessons: Course["modules"][number]["lessons"] = [
{id:"m08-01-rag-pipeline",title:"第一讲：RAG 系统边界与端到端数据流",summary:"理解检索增强生成的组成、知识时效和系统责任。",learningObjectives:["画出离线索引与在线检索两条流水线","区分参数知识与外部证据","定义引用、权限和无答案行为"],estimatedMinutes:70,content:[
{heading:"为什么需要 RAG",body:"RAG 将外部可更新知识检索到上下文，降低模型仅依赖参数记忆的风险。",markdown:"模型参数知识存在时效、来源不可见和领域覆盖不足问题。RAG 在请求时检索文档片段，把证据放入上下文，再让模型基于证据回答。RAG 不保证事实正确：检索可能漏召回、文档可能过期、模型可能误读或引用不支持结论。"},
{heading:"离线与在线两条流水线",body:"离线管线负责摄取、解析、切分、Embedding 和索引；在线管线负责 query、检索、重排、组装和生成。",markdown:"Offline: source connector → parse/OCR → normalize → chunk → metadata/ACL → embed → index。Online: query normalize → retrieve → filter by ACL → rerank → context assemble → generate → citation validate。两条管线通过文档版本、chunk ID 和 embedding model 版本关联。"},
{heading:"证据与引用契约",body:"回答中的引用必须指向真实检索片段，并支持对应声明。",markdown:"每个 chunk 保留 source_id、document_version、page/section、offset、ACL、ingested_at 和 content_hash。引用应可定位到原文；不能只让模型编造 URL 或引用编号。将声明拆分为原子事实并检查证据支持，冲突证据应显式呈现。"},
{heading:"无答案与权限边界",body:"检索无证据时应拒答或澄清；访问控制必须在检索服务端执行。",markdown:"先按用户身份和资源权限过滤候选，再进行检索与重排，避免先检索全库再依赖 Prompt 隐藏结果。若证据低于阈值，返回无法确认或请求补充信息。RAG 不能成为绕过源系统权限的旁路。"},
{heading:"复现练习：追踪一次可引用 RAG 请求",body:"用同一文档版本贯通离线索引和在线检索，明确每个阶段的可追溯标识。",markdown:"场景：员工询问差旅报销上限。离线阶段登记来源和版本，解析章节与表格，生成 chunk_id、content_hash、ACL 和 embedding_version，再写入关键词与向量索引。在线阶段先验证用户身份和文档范围，再检索、重排、组装上下文并生成带 citation_id 的回答。检查引用能否回到具体文档版本、页码/章节和原文片段；无支持证据时应标记 not_found 或请求澄清。\\n\\n提交证据：离线/在线数据流图、一条 chunk 元数据记录和一条从答案引用回溯原文的证据链。"}
],assessments:[{id:"m08-01-rag-blueprint",type:"design-review",prompt:"为企业知识助手画出离线/在线 RAG 数据流，定义 chunk 元数据、引用定位、ACL 过滤和无答案策略。",rubric:[{criterion:"流水线",description:"离线摄取与在线检索阶段完整",points:3},{criterion:"证据追溯",description:"chunk 和 citation 可回到原文版本",points:3},{criterion:"安全边界",description:"检索前/查询时执行 ACL 并定义无答案",points:4}]}],sources:[
{title:"Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",url:"https://arxiv.org/abs/2005.11401",publisher:"Lewis et al., NeurIPS 2020",note:"RAG 原始论文"},
{title:"Lost in the Middle: How Language Models Use Long Contexts",url:"https://arxiv.org/abs/2307.03172",publisher:"Liu et al., TACL 2024",note:"上下文位置利用限制"},
{title:"OWASP Top 10 for LLM Applications",url:"https://owasp.org/www-project-top-10-for-large-language-model-applications/",publisher:"OWASP",note:"检索与上下文安全风险"}
]},
{id:"m08-02-ingestion-chunking",title:"第二讲：文档摄取、解析与 Chunking",summary:"处理格式、结构、边界和元数据，避免语义断裂。",learningObjectives:["设计可追溯文档解析管线","比较固定长度、递归和结构感知切分","计算 chunk overlap 对索引规模的影响"],estimatedMinutes:75,content:[
{heading:"文档解析与规范化",body:"PDF、HTML、Office、代码和扫描件需要不同解析策略，并保留结构信息。",markdown:"解析阶段要处理编码、表格、页眉页脚、脚注、OCR、阅读顺序和重复模板。清洗不能破坏标题层级、表格列关系、代码块和来源定位。保存原始文件摘要和解析器版本，便于重建索引。"},
{heading:"Chunking 策略",body:"Chunk 需要在语义完整、检索粒度和上下文成本之间折中。",markdown:"固定 token 窗口简单但可能切断段落；递归切分按标题/段落/句子逐级拆分；结构感知切分保留章节、表格和代码边界。Chunk size 过小导致上下文不足，过大降低检索区分度并浪费 token。"},
{heading:"Overlap 与索引规模计算",body:"重叠可保留跨边界语义，但会增加冗余和索引成本。",markdown:"近似 chunk 数 N≈ceil((D−O)/(C−O))，D 为文档 token 数，C chunk size，O overlap。例：D=10,000，C=500，O=50，则 N≈ceil(9950/450)=23。无 overlap 则约 20 个。该公式是均匀切分近似，结构边界会改变实际数量。"},
{heading:"元数据与版本追踪",body:"文档元数据决定过滤、权限、引用和增量更新是否可靠。",markdown:"记录 tenant、owner、ACL、source URI、document_id、version、section path、page、chunk index、parser version、embedding version 和 content hash。文档更新后应可定位受影响 chunk 并删除旧版本，避免新旧内容混合。"},
{heading:"复现练习：计算 Chunk Overlap 对索引规模的影响",body:"用明确公式估算切分后 chunk 数量，并解释重叠对召回与存储的影响。",markdown:"假设文档长度 10,000 tokens，chunk_size=500，overlap=100，步长 400。近似 chunk 数 N=ceil((10,000−500)/(500−100))+1=25。若 overlap 提高到 200，步长 300，N=ceil(9,500/300)+1=33。重叠可减少跨边界信息丢失，但增加索引条目、重复召回和上下文冗余。实际切分应优先尊重标题、段落、表格和代码结构。\\n\\n提交证据：计算表、切分示意、三种 chunk 策略的检索对照及存储成本。"}
],assessments:[{id:"m08-02-chunking-design",type:"code-task",prompt:"对 10,000 token 文档比较 chunk=500/overlap=50 与无 overlap 的 chunk 数，并设计保留标题、表格、ACL 和来源定位的解析策略。",rubric:[{criterion:"计算",description:"正确得到约 23 与 20 个 chunk 的估算",points:3},{criterion:"切分取舍",description:"说明粒度、语义完整和冗余成本",points:3},{criterion:"元数据",description:"保留版本、权限、来源和结构定位",points:4}]}],sources:[
{title:"Unstructured Documentation",url:"https://docs.unstructured.io/",publisher:"Unstructured",note:"多格式文档解析和分块"},
{title:"LlamaIndex — Node Parsers and Text Splitters",url:"https://docs.llamaindex.ai/en/stable/module_guides/loading/node_parsers/",publisher:"LlamaIndex",note:"节点解析与切分策略"},
{title:"LangChain — Text Splitters",url:"https://python.langchain.com/docs/concepts/text_splitters/",publisher:"LangChain",note:"递归与结构化文本切分"}
]},
{id:"m08-03-embedding-vector-search",title:"第三讲：Embedding 与向量检索",summary:"理解向量表示、距离函数、ANN 索引和召回质量。",learningObjectives:["解释 embedding 向量与相似度函数","比较 cosine、dot product 和 L2","理解 HNSW/IVF 的近似检索权衡"],estimatedMinutes:80,content:[
{heading:"Embedding 表示与模型契约",body:"Embedding 模型把文本映射为向量，向量空间的相似性只在模型训练语义和配置范围内有意义。",markdown:"同一文档与 query 应使用兼容的 embedding 模型、维度、归一化方式和输入模板。更换模型通常需要重建索引；不同模型的向量不能直接混合比较。记录模型版本、维度、语言覆盖、最大输入长度和归一化策略。"},
{heading:"相似度与距离",body:"Cosine 衡量方向相似度，dot product 同时受向量长度影响，L2 衡量欧氏距离。",markdown:"cos(u,v)=u·v/(||u|| ||v||)。例：u=(1,0)，v=(0.8,0.6)，cos=0.8；若 v 放大为 (8,6)，cos 仍为 0.8，但 dot product 从 0.8 变为 8。若向量已归一化，cosine 与 dot product 排序等价。"},
{heading:"ANN 索引机制",body:"HNSW 通过分层图导航近邻，IVF 先分桶再搜索候选，均用近似换取速度。",markdown:"HNSW 构建多层近邻图，查询从高层稀疏入口逐层下降；M、efConstruction 影响图质量/构建成本，efSearch 影响查询候选与召回。IVF 聚类向量中心，查询若干倒排桶；nlist/nprobe 控制索引粒度和搜索范围。近似检索必须测 Recall@k。"},
{heading:"召回质量与过滤顺序",body:"向量相似度不等于相关性，元数据过滤和权限约束会改变有效候选集合。",markdown:"评测 Recall@k、MRR、nDCG 和延迟，并按语言、文档类型、租户和权限分层。过滤可在 ANN 前、ANN 后或混合执行；若先全库检索再过滤，可能造成召回损失或侧信道风险。优先选择支持安全过滤的索引路径。"},
{heading:"复现练习：用 Recall@k 与 ANN 参数定位漏召回",body:"区分向量表示质量、近似索引误差和过滤条件导致的召回损失。",markdown:"构造带人工相关性标注的 query/document 数据。先用 exact nearest-neighbor 作为基线，再与 ANN 索引比较 Recall@10、nDCG@10、P95 检索延迟和索引内存。若 exact 本身召回差，问题可能在 query、embedding 或数据覆盖；若 ANN 低于 exact，检查索引参数和候选预算。同时测试 metadata filter/ACL 是否在检索阶段正确执行。\\n\\n提交证据：query 集、相关性标签、exact/ANN 对照表和一次失败查询归因。"}
],assessments:[{id:"m08-03-vector-search",type:"knowledge-check",prompt:"给定 u=(1,0)、v=(0.8,0.6)、2v=(1.6,1.2)，计算 cosine 和 dot product，并比较 HNSW 与 IVF 的主要调参变量。",rubric:[{criterion:"相似度计算",description:"正确算出 cosine=0.8 且 dot 随缩放变化",points:3},{criterion:"索引机制",description:"说明 HNSW 图导航与 IVF 分桶",points:4},{criterion:"评测",description:"提出 Recall@k、延迟和过滤安全验证",points:3}]}],sources:[
{title:"Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks",url:"https://arxiv.org/abs/1908.10084",publisher:"Reimers and Gurevych, 2019",note:"句向量表示"},
{title:"FAISS Documentation",url:"https://faiss.ai/",publisher:"Meta",note:"向量相似度搜索与索引"},
{title:"HNSW: Efficient and Robust Approximate Nearest Neighbor Search",url:"https://arxiv.org/abs/1603.09320",publisher:"Malkov and Yashunin, 2016",note:"HNSW 原始算法"}
]},
{id:"m08-04-hybrid-reranking",title:"第四讲：Hybrid Search、Reranking 与查询改写",summary:"融合稀疏/稠密召回，使用重排提高候选相关性。",learningObjectives:["比较 BM25 与 dense retrieval","解释 RRF 融合机制","设计 reranker 的候选与延迟预算"],estimatedMinutes:75,content:[
{heading:"稀疏检索 BM25",body:"BM25 通过词项频率、逆文档频率和长度归一化计算词汇匹配分数。",markdown:"BM25 对精确术语、产品编号和专有名词通常有优势；dense retrieval 可捕捉语义近似但可能忽略精确字符串。两者错误模式互补。"},
{heading:"Hybrid Search 与 RRF",body:"混合检索融合不同召回器的排名，避免直接比较量纲不同的分数。",markdown:"Reciprocal Rank Fusion: RRF(d)=Σᵢ 1/(k+rankᵢ(d))。若 k=60，某文档在两路分别排名 1 和 5，则分数为 1/61+1/65≈0.0320。RRF 只依赖名次，不要求 BM25 与 cosine 分数处于同一尺度。"},
{heading:"Reranking",body:"Cross-encoder 对 query 与候选文档联合打分，通常更准确但成本高于向量召回。",markdown:"常见两阶段架构：快速召回 top-N → cross-encoder 对 query/document pair 打分 → 取 top-k 进入上下文。N 越大覆盖可能越高，但重排延迟和费用增加。对候选长度要截断或分块，并评估长文档证据丢失。"},
{heading:"查询改写与多查询",body:"Query expansion 可弥补术语不一致，但也可能引入错误意图。",markdown:"查询改写、HyDE 和多查询生成应保留原始 query，并对扩展查询设数量/成本上限。对实体、数字、日期和否定条件进行保真检查；不要让模型改写丢失用户限定词。通过消融验证每种改写是否提高目标任务指标。"},
{heading:"复现练习：手算 Hybrid Search 的 RRF 排名",body:"用两路排名计算融合分数，再设计 reranker 的候选预算。",markdown:"RRF 分数 score(d)=Σᵣ 1/(k+rankᵣ(d))。取 k=60：文档 A 在 BM25 排名 1、dense 排名 5，分数为 1/61+1/65；文档 B 在 BM25 排名 3、dense 排名 2，分数为 1/63+1/62。分别计算后排序，注意 rank 从 1 开始。设计 top-50 初召回、rerank top-10、最终上下文 top-5 的预算，记录候选覆盖、重排延迟和 token 成本。\\n\\n提交证据：RRF 计算表、候选截断策略和 Recall/nDCG/延迟评测计划。"}
],assessments:[{id:"m08-04-hybrid-search",type:"code-task",prompt:"给定文档在 BM25 和 dense 两路的排名，使用 k=60 计算 RRF 分数，并设计 top-50 召回、rerank top-5 的延迟与质量评测。",rubric:[{criterion:"RRF 计算",description:"公式和排名代入正确",points:3},{criterion:"架构取舍",description:"说明稀疏/稠密互补及 rerank 成本",points:3},{criterion:"评测设计",description:"包含 Recall@k、nDCG、延迟和查询改写消融",points:4}]}],sources:[
{title:"The Probabilistic Relevance Framework: BM25 and Beyond",url:"https://www.staff.city.ac.uk/~sbrp622/papers/foundations_bm25_review.pdf",publisher:"Robertson and Zaragoza",note:"BM25 概率相关性框架"},
{title:"Reciprocal Rank Fusion outperforms Condorcet and individual Rank Learning Methods",url:"https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf",publisher:"Cormack et al., SIGIR 2009",note:"RRF 排名融合"},
{title:"BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",url:"https://arxiv.org/abs/1810.04805",publisher:"Devlin et al., NAACL 2019",note:"Cross-encoder 重排基础模型"}
]},
{id:"m08-05-rag-evaluation-production",title:"第五讲：RAG 评测与生产工程",summary:"分离检索、生成和端到端评测，治理数据更新、成本和故障。",learningObjectives:["构建检索与生成分层评测集","解释 faithfulness、answer relevance 和 context precision","设计索引更新、缓存和故障降级"],estimatedMinutes:85,content:[
{heading:"检索层与生成层分开评测",body:"端到端答案失败可能源于检索漏召回，也可能源于模型未使用正确证据。",markdown:"检索评测包括 Recall@k、MRR、nDCG、context precision/recall；生成评测包括事实支持率、引用正确率、答案相关性和无答案判断。先分别评测，再进行端到端分析，才能定位责任环节。"},
{heading:"Faithfulness 与引用验证",body:"Faithfulness 衡量回答是否被上下文支持，不等于来源本身真实或最新。",markdown:"把答案拆成原子声明，检查每条声明是否能由引用片段蕴含。RAGAS 等框架提供自动指标，但 LLM judge 可能偏差，必须用人工标注集校准。引用存在不代表引用支持声明。"},
{heading:"索引更新与缓存失效",body:"文档变更需要版本化、增量索引和删除传播，避免陈旧知识残留。",markdown:"用 content hash 检测变更；记录 source version 与 embedding model version；删除或 ACL 变更要传播到向量索引、关键词索引和缓存。缓存键需纳入用户权限与索引版本，避免跨租户缓存泄漏。"},
{heading:"生产降级与成本治理",body:"RAG 服务需要为 embedding、向量库、reranker 和模型故障定义降级路径。",markdown:"监控 ingestion lag、索引覆盖、检索延迟、rerank 延迟、context tokens、引用错误率和每请求成本。依赖故障时可返回明确不可用、使用已验证缓存或转人工；不能静默返回无来源的模型记忆答案。"},
{heading:"复现练习：建立 RAG 检索、生成与 ACL 回归门禁",body:"用分层测试定位错误来源，并验证文档更新和权限变更是否传播到索引与缓存。",markdown:"将测试集分为检索相关性、答案证据支持、引用定位、无答案判断、ACL 越权和文档删除六类。分别报告 Recall@k、MRR/nDCG、citation support、faithfulness、abstention accuracy 和 unauthorized retrieval rate。更新文档版本后检查旧 chunk 是否失效；撤销用户权限后检查向量索引、关键词索引和缓存是否同步更新。缓存 key 必须包含用户/租户权限上下文和索引版本。\\n\\n提交证据：分层指标、删除/ACL 变更测试、缓存失效记录和故障降级方案。LLM Judge 结果需用人工标注集校准。"}
],assessments:[{id:"m08-05-rag-acceptance",type:"design-review",prompt:"为企业知识助手建立 RAG 验收计划，分层定义检索/生成指标、引用验证、索引更新、ACL 缓存隔离和故障降级。",rubric:[{criterion:"分层评测",description:"检索、生成和端到端指标区分清楚",points:3},{criterion:"数据治理",description:"覆盖版本、删除、ACL 和缓存失效",points:3},{criterion:"可靠性",description:"定义监控、成本和有证据的降级",points:4}]}],sources:[
{title:"RAGAS: Automated Evaluation of Retrieval Augmented Generation",url:"https://arxiv.org/abs/2309.15217",publisher:"Es et al., 2023",note:"RAG 自动评测指标"},
{title:"ARES: An Automated Evaluation Framework for Retrieval-Augmented Generation Systems",url:"https://arxiv.org/abs/2311.09476",publisher:"Saad-Falcon et al., 2024",note:"RAG 分层评测"},
{title:"BEIR: A Heterogeneous Benchmark for Zero-shot Evaluation of Information Retrieval Models",url:"https://arxiv.org/abs/2104.08663",publisher:"Thakur et al., NeurIPS 2021",note:"检索模型跨领域评测"}
]}
];
