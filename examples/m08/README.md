# M08 可复现实验代码

M08 五个 Python 标准库示例覆盖 RAG trace、chunking、简化 BM25/RRF、引用定位和检索评测指标。无需 GPU、模型权重、向量数据库或 API Key。

## 环境与运行

Python 3.10+，从仓库根目录执行：

    python3 examples/m08/01_rag_pipeline_trace.py
    python3 examples/m08/02_chunking_budget.py
    python3 examples/m08/03_hybrid_retrieval.py
    python3 examples/m08/04_grounding_citations.py
    python3 examples/m08/05_rag_eval_metrics.py
    python3 -m unittest discover -s examples/m08 -p 'test_examples.py'

## 文件映射

| 文件 | 课程主题 | 输出 |
|---|---|---|
| 01_rag_pipeline_trace.py | RAG 数据流 | 阶段延迟和失败归因 |
| 02_chunking_budget.py | Chunking | chunk 数、实际重复 token、末块填充与固定容量槽位 |
| 03_hybrid_retrieval.py | Hybrid Search | 简化 BM25 与 RRF 融合 |
| 04_grounding_citations.py | Grounding | citation ID、文档版本和定位校验 |
| 05_rag_eval_metrics.py | RAG Evaluation | Recall@k、MRR、nDCG 和 claim support rate |

## 重要边界

- Chunking 使用词窗口教学实现，不等于真实 tokenizer 或结构感知文档解析。
- BM25 是简化实现，未覆盖生产引擎的 analyzer、字段权重和复杂 query parser。
- RRF 只融合排名，不比较原始分数；参数和候选截断需在目标工作负载评估。
- Citation resolution 只证明引用 ID/版本存在，不证明语义蕴含。
- RAG 指标依赖人工相关性和 claim 标注；样例数据不能代表真实系统质量。
