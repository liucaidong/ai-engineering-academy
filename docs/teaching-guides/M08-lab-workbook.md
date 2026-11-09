# M08 实验工作簿：从文档摄取到可验证 RAG

> 课程版本：0.40.9

> **证据等级：** E2 Simulated（合成语料与离线 RAG）+ E3 Local-tested（本地检索/计算测试）；不证明企业语料 ACL 或生产向量库。 统一定义见[全课程证据等级](../CURRICULUM_EVIDENCE_LEVELS.md)。

> 五项实验对应 M08 五讲。代码仅依赖 Python 标准库，不连接真实向量数据库、模型或企业文档系统。所有数据均为虚构教学样本。

## 学习成果

完成本工作簿后，学习者应能够：

1. 选择 RAG、Long Context 和 Fine-tuning 的适用边界；
2. 设计保留文档结构、权限和版本的 Chunking 策略；
3. 比较 BM25、Dense Retrieval、ANN、Hybrid Search 和 Reranking；
4. 验证引用定位、证据支持、无答案和冲突处理；
5. 建立检索、生成、权限、更新和线上质量的分层评测闭环。

## 环境

- Python 3.10+
- 从仓库根目录执行
- 无 GPU、模型权重、API Key 或第三方依赖

    python3 examples/m08/01_rag_pipeline_trace.py
    python3 examples/m08/02_chunking_budget.py
    python3 examples/m08/03_hybrid_retrieval.py
    python3 examples/m08/04_grounding_citations.py
    python3 examples/m08/05_rag_eval_metrics.py
    python3 -m unittest discover -s examples/m08 -p 'test_examples.py'

---

## 实验一：RAG 端到端数据流与失败归因

**对应课程：** 第一讲《RAG 系统边界与端到端数据流》

### 任务

为企业差旅政策助手建立离线摄取和在线问答两条流水线，并对一次回答失败进行阶段归因。

### 操作

1. 运行 python3 examples/m08/01_rag_pipeline_trace.py。
2. 构造检索为空、ACL 拒绝、引用失效和生成未使用证据四种 trace。
3. 说明何时选 RAG、Long Context、Fine-tuning 或组合方案。
4. 为每个阶段定义 document_version、chunk_id、trace_id、citation_id 和 model/embedding version。

### 必须提交

- 离线/在线架构图；
- RAG/Long Context/Fine-tuning 选择矩阵；
- 每阶段延迟和失败分类；
- 引用回溯原始文件、版本、页码/章节的证据链；
- 无答案、证据冲突和权限拒绝策略。

### 常见错误

- 将 RAG 描述成“把向量数据库接给模型”；
- 认为检索到文档就能保证回答正确；
- 将模型参数知识和外部证据混为一谈；
- 在检索全库后才由 Prompt 隐藏无权限内容。

---

## 实验二：Chunking、父子结构与索引预算

**对应课程：** 第二讲《文档摄取、解析与 Chunking》

### 任务

对 10,000 token 文档比较 chunk_size=500、overlap=50/100 的索引规模，并设计保留表格、代码和章节结构的父子切分。

### 操作

1. 运行 python3 examples/m08/02_chunking_budget.py。
2. 计算不同 overlap 的 chunk 数、实际索引 token 数、重复 token 数和固定长度容量槽位。
3. 设计 parent section 与 child chunk 的元数据关系。
4. 为表格、代码、PDF OCR 和 HTML 页面分别定义 parser strategy。
5. 模拟文档版本更新、删除和 ACL 撤销，检查父子 chunk 是否同步失效。

**计算口径校准（D=10,000、C=500）：** overlap=50 时为 23 个 chunk、11,100 个实际索引 token（含重复）、1,100 个重复 token（占源文档 11%）、11,500 个固定长度容量槽位和 400 个末块填充槽位；overlap=100 时为 25 个 chunk、12,400 个实际索引 token、2,400 个重复 token（24%）、12,500 个容量槽位和 100 个填充槽位。重复率以源文档 token 数为分母；固定长度容量槽位是存储/批处理上界，不得写成实际索引 token 数。这里假设等长滑动窗口和最后一个 chunk 不补齐实际内容；结构感知切分和 tokenizer 边界会改变结果。

### 必须提交

- chunk size/overlap 对照表；
- 结构感知切分策略；
- parent_id、section_path、page、offset、ACL、version 和 content_hash 字段；
- 索引存储和重复召回成本；
- 删除与权限撤销传播测试。

### 常见错误

- 只按固定字符数切分；
- 表格丢失列头、单位和脚注；
- 父级上下文扩大后忘记继承 ACL；
- overlap 越大越好，不评估重复和索引成本。

---

## 实验三：BM25、Dense、ANN 与 Hybrid Search

**对应课程：** 第三讲《Embedding 与向量检索》

### 任务

以关键词检索和向量检索两路排名为输入，计算 RRF 并建立 exact/ANN/hybrid 的评测对照。

### 操作

1. 运行 python3 examples/m08/03_hybrid_retrieval.py。
2. 手工计算 BM25 相关性排序和 RRF 分数。
3. 将 BM25-only、dense-only、hybrid 和 reranker 作为四个 ablation 组。
4. 使用 exact nearest-neighbor 作为 ANN 召回基线。
5. 在 pre-filter/post-filter 两种 ACL 路径下比较有效 Recall@k 和延迟。

### 必须提交

- BM25 与 Dense 错误模式对照；
- RRF 排名计算表；
- HNSW/IVF 参数和 exact/ANN 召回对照；
- Recall@k、MRR、nDCG、P95 latency 和索引内存；
- document_version、content_hash、ACL 和删除语义的一致性方案。

### 常见错误

- 直接相加量纲不同的 BM25 和 cosine 分数；
- 用 ANN 的速度提升掩盖 Recall@k 下降；
- 在全库检索后再过滤权限；
- 不做 BM25/dense/reranker 消融。

---

## 实验四：查询改写、证据充分性与引用校验

**对应课程：** 第四讲《Hybrid Search、Reranking 与查询改写》

### 任务

为原始查询、改写查询、HyDE、多查询和 corrective retrieval 定义预算，并验证回答引用是否能回溯到文档版本。

### 操作

1. 运行 python3 examples/m08/04_grounding_citations.py。
2. 构造 missing citation、unknown citation、unversioned citation 和冲突证据样本。
3. 比较原始 query、HyDE、multi-query 和 reranker 的召回变化。
4. 为 evidence insufficiency 定义 retry budget、fallback 和 abstention。
5. 对过期政策与新旧冲突政策定义来源优先级和回答策略。

### 必须提交

- Query transformation ablation；
- citation_id 到 source/document_version/page/chunk 的映射；
- 原子声明与引用证据表；
- 冲突证据呈现和无答案策略；
- query rewrite 造成实体/数字/否定条件丢失的回归用例。

### 常见错误

- 让模型生成引用 URL 或引用编号；
- 引用存在就认为引用支持声明；
- 多查询无限扩张候选和成本；
- 证据冲突时只选择相似度最高的一条。

---

## 实验五：RAG 评测、权限回归与生产治理

**对应课程：** 第五讲《RAG 评测与生产工程》

### 任务

计算 Recall@k、MRR、nDCG 和 claim support rate，并建立索引更新、ACL 变更和缓存失效门禁。

### 操作

1. 运行 python3 examples/m08/05_rag_eval_metrics.py。
2. 为 query 建立人工相关性标签和 graded relevance。
3. 将检索指标与 faithfulness、citation precision、answer correctness、abstention accuracy 分开。
4. 按语言、租户、文档类型、权限、长尾主题和数据新旧分层。
5. 模拟文档删除、ACL 撤销、embedding 版本升级和缓存失效。

### 必须提交

- Recall@k、MRR、nDCG 的分母和标签规范；
- claim-level grounding/citation 标注；
- ACL violation、unauthorized retrieval 和 cache leakage 测试；
- ingestion lag、index freshness、latency、cost 和引用失败监控；
- 人工 Judge 校准、置信区间、降级和回滚策略。

### 常见错误

- 只报告端到端“回答正确率”；
- 把 RAGAS/LLM Judge 输出当作事实真值；
- 缺少无答案、冲突证据和 ACL 测试；
- 删除/权限撤销没有传播到所有索引和缓存。

---

## 统一评分建议

| 维度 | 权重 | 达标证据 |
|---|---:|---|
| 架构与边界 | 20% | RAG/Long Context/Fine-tuning 选型及两条流水线 |
| 文档与索引 | 20% | 结构感知 Chunking、元数据和版本治理 |
| 检索质量 | 20% | BM25/Dense/ANN/Hybrid 的可复核对照 |
| Grounding | 20% | 引用定位、证据充分性、冲突和拒答 |
| 生产评测 | 20% | ACL、删除传播、分层指标、SLO 和回滚 |

所有结果必须区分理论估算、合成样本和真实检索系统实测。没有连接真实数据源和索引引擎的示例不能标记为生产 RAG 验收通过。


**单位约束：** 所有 chunk 数量公式中的 D、C、O 必须使用同一单位。若 D 按 tokens 计，切分器必须使用 tokenizer-aware length function；LangChain 默认 RecursiveCharacterTextSplitter 按字符计数，Unstructured `chunk_by_character`/`max_characters` 也按字符计数。
