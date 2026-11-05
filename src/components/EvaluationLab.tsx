import { useState } from "react";
import { evaluateTeachingDataset, type EvaluationCase } from "../labs/evaluation";

const DATASET: EvaluationCase[] = [
  { id: "E01", prompt: "Transformer 的核心信息交互机制？", expected: "Attention", actual: "Attention" },
  { id: "E02", prompt: "RAG 的检索结果应保留什么？", expected: "Source citation", actual: "Source citation" },
  { id: "E03", prompt: "工具执行前由谁进行权限校验？", expected: "Runtime", actual: "Model" },
  { id: "E04", prompt: "Agent 工具请求被拒绝后应如何处理？", expected: "Stop", actual: "Stop" }
];

export default function EvaluationLab() {
  const [result, setResult] = useState<ReturnType<typeof evaluateTeachingDataset> | null>(null);
  return <section className="lab-panel" aria-labelledby="evaluation-title">
    <div className="lab-heading"><div><span className="eyebrow">INTERACTIVE LAB · M17</span><h2 id="evaluation-title">AI Evaluation Lab</h2><p>运行固定测试集，查看 Exact Match、通过率和失败案例。</p></div><span className="execution-tag">本地评测</span></div>
    <div className="eval-dataset">{DATASET.map((item) => <article key={item.id}><small>{item.id}</small><strong>{item.prompt}</strong><span>Expected: {item.expected}</span></article>)}</div>
    <button className="primary-button" type="button" onClick={() => setResult(evaluateTeachingDataset(DATASET))}>运行评测集</button>
    {result && <div className="eval-summary" aria-live="polite"><div><span>Passed</span><strong>{result.passed}/{result.total}</strong></div><div><span>Exact Match</span><strong>{Math.round(result.accuracy * 100)}%</strong></div><div><span>Failed</span><strong>{result.total - result.passed}</strong></div></div>}
    {result && <div className="eval-results">{result.results.map((item) => <article key={item.id} className={item.passed ? "eval-pass" : "eval-fail"}><strong>{item.id} · {item.passed ? "PASS" : "FAIL"}</strong><p>Expected: {item.expected}</p><p>Actual: {item.actual}</p></article>)}</div>}
    <aside className="lab-notice"><strong>评测边界</strong><p>使用内置答案和 Exact Match 规则，不调用模型评分器。真实 AI Evaluation 需要版本化数据集、任务适配指标、人工校准和分布外测试。</p></aside>
  </section>;
}
