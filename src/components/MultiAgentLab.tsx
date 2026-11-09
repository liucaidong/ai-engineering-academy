import { useState } from "react";
import { type MultiAgentReport, runTeachingMultiAgentReview } from "../labs/multiAgent";

export default function MultiAgentLab() {
  const [topic, setTopic] = useState("RAG evaluation");
  const [report, setReport] = useState<MultiAgentReport | null>(null);
  return (
    <section className="lab-panel" aria-labelledby="multi-agent-title">
      <div className="lab-heading">
        <div>
          <span className="eyebrow">INTERACTIVE LAB · M14</span>
          <h2 id="multi-agent-title">Multi-Agent Orchestration Lab</h2>
          <p>比较专业角色输出，观察并行协作与最终综合的责任边界。</p>
        </div>
        <span className="execution-tag">确定性模拟</span>
      </div>
      <label className="field-label" htmlFor="multi-agent-topic">
        协作主题
      </label>
      <input
        id="multi-agent-topic"
        className="lab-input"
        value={topic}
        maxLength={100}
        onChange={(event) => {
          setTopic(event.target.value);
          setReport(null);
        }}
      />
      <button
        className="primary-button"
        type="button"
        onClick={() => setReport(runTeachingMultiAgentReview(topic))}
      >
        运行三个专业 Agent
      </button>
      {report && (
        <div className="multi-agent-findings" aria-live="polite">
          {report.findings.map((finding) => (
            <article key={finding.role}>
              <div>
                <strong>{finding.role}</strong>
                <span>confidence: {finding.confidence}</span>
              </div>
              <h3>{finding.title}</h3>
              <p>{finding.finding}</p>
            </article>
          ))}
          <article className="multi-agent-synthesis">
            <strong>Manager Synthesis</strong>
            <p>{report.synthesis}</p>
          </article>
          <ul>
            {report.coordinationNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      )}
      <aside className="lab-notice">
        <strong>实验边界</strong>
        <p>
          三个角色由确定性函数模拟，没有并发模型调用、共享记忆或真实 Agent
          通信。生产系统需要定义消息契约、预算、冲突解决和任务终止策略。
        </p>
      </aside>
    </section>
  );
}
