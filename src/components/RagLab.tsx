import { useMemo, useState } from "react";
import { chunkText, retrieveToy } from "../labs/rag";

const SOURCE_TEXT = "Retrieval augmented generation combines a language model with an external knowledge source. Documents are split into chunks, transformed into vectors, and indexed. At query time, the system retrieves relevant chunks and may rerank candidates before the model generates an answer grounded in evidence. Evaluation should measure retrieval quality, answer faithfulness, citation correctness, latency, and cost.";
const DOCUMENTS = [
  { id: "D1", text: "RAG combines generation with external knowledge. Chunking divides documents into retrievable passages.", source: "RAG handbook · section 1" },
  { id: "D2", text: "Vector retrieval compares query and document embeddings. Reranking improves candidate ordering.", source: "Search engineering notes · section 2" },
  { id: "D3", text: "Evaluation measures recall, precision, faithfulness, citation correctness, latency and cost.", source: "Evaluation guide · section 3" },
  { id: "D4", text: "Agent planning decomposes goals into steps and uses tools to change external state.", source: "Agent systems notes · section 4" }
];

export default function RagLab() {
  const [query, setQuery] = useState("How does vector retrieval and reranking work?");
  const chunks = useMemo(() => chunkText(SOURCE_TEXT, 96, 18), []);
  const results = useMemo(() => retrieveToy(query, DOCUMENTS, 3), [query]);
  return <section className="lab-panel" aria-labelledby="rag-title">
    <div className="lab-heading"><div><span className="eyebrow">INTERACTIVE LAB · M08</span><h2 id="rag-title">RAG Pipeline Lab</h2><p>拆解文本切分、向量表示、Top-K 检索与候选重排。</p></div><span className="execution-tag">教学模拟</span></div>
    <div className="rag-pipeline"><span>Documents</span><b>→</b><span>Chunking</span><b>→</b><span>Embedding</span><b>→</b><span>Retrieval</span><b>→</b><span>Reranking</span></div>
    <div className="result-block"><h3>1 · Chunking 示例</h3><p className="muted">固定演示语料，chunk size = 96 characters，overlap = 18 characters。</p><div className="chunk-list">{chunks.map((chunk, index) => <article key={index}><small>CHUNK {index + 1}</small><p>{chunk}</p></article>)}</div></div>
    <div className="result-block"><h3>2 · Retrieval + Reranking</h3><label className="field-label" htmlFor="rag-query">检索查询</label><input className="lab-input" id="rag-query" value={query} maxLength={180} onChange={(event) => setQuery(event.target.value)} /><div className="rag-results" aria-live="polite" aria-relevant="additions text">{results.map((item, index) => <article key={item.id}><div><strong>{index + 1}. {item.id}</strong><span>{item.source}</span></div><p>{item.text}</p><small>vector similarity {item.score.toFixed(3)} · rerank score {item.rerankScore.toFixed(3)}</small></article>)}</div></div>
    <aside className="lab-notice"><strong>实验边界</strong><p>Embedding 是确定性的教学哈希向量，不是真实语义 Embedding；相似度和重排仅用于展示流水线概念。没有连接向量数据库、外部文档或 LLM，也不应将结果用于真实检索质量判断。</p></aside>
  </section>;
}
