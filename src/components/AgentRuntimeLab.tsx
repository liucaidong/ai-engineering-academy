import { useState } from "react";
import { type AgentPhase, advanceAgent, createAgentState } from "../labs/agentRuntime";

const PHASE_LABELS: Record<AgentPhase, string> = {
  ready: "Ready · 等待启动",
  planning: "Planning · 规划中",
  tool_request: "Tool Request · 请求工具",
  approval: "Approval · 等待人工批准",
  executing: "Executing · 执行中",
  observing: "Observing · 观察结果",
  completed: "Completed · 已完成",
  blocked: "Blocked · 已阻止",
};

export default function AgentRuntimeLab() {
  const [state, setState] = useState(createAgentState);
  const terminal = state.phase === "completed" || state.phase === "blocked";
  const awaitingApproval = state.phase === "approval";
  return (
    <section className="lab-panel" aria-labelledby="agent-runtime-title">
      <div className="lab-heading">
        <div>
          <span className="eyebrow">INTERACTIVE LAB · M10</span>
          <h2 id="agent-runtime-title">Agent Runtime Lab</h2>
          <p>逐步推进 Agent 状态机，观察工具调用审批与终止条件。</p>
        </div>
        <span className="execution-tag">确定性模拟</span>
      </div>
      <div className="agent-goal">
        <span>任务目标</span>
        <strong>查找 Transformer Attention 的课程模块，并返回学习目标。</strong>
      </div>
      <div className="agent-state">
        <span>当前状态</span>
        <strong>{PHASE_LABELS[state.phase]}</strong>
        <small>Transitions: {state.steps}</small>
      </div>
      <div className="agent-controls">
        {!awaitingApproval && !terminal && (
          <button
            className="primary-button"
            type="button"
            onClick={() => setState((current) => advanceAgent(current))}
          >
            {state.phase === "ready" ? "启动 Agent" : "推进下一步"}
          </button>
        )}
        {awaitingApproval && (
          <>
            <button
              className="primary-button"
              type="button"
              onClick={() => setState((current) => advanceAgent(current, "approve"))}
            >
              批准只读工具调用
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => setState((current) => advanceAgent(current, "reject"))}
            >
              拒绝并终止
            </button>
          </>
        )}
        {terminal && (
          <button
            className="secondary-button"
            type="button"
            onClick={() => setState(createAgentState())}
          >
            重置任务
          </button>
        )}
      </div>
      <div className="result-block">
        <h3>运行 Trace</h3>
        <ol className="agent-trace" aria-live="polite">
          {state.events.map((event, index) => (
            <li key={event}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {event}
            </li>
          ))}
        </ol>
      </div>
      <aside className="lab-notice">
        <strong>Runtime 约束</strong>
        <p>
          这是固定状态机，不调用 LLM。工具执行前必须经过人工批准；拒绝、完成均为终止状态。真实 Agent
          还需要超时、预算、取消、幂等和审计。
        </p>
      </aside>
    </section>
  );
}
