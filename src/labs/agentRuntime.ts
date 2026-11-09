export type AgentPhase =
  | "ready"
  | "planning"
  | "tool_request"
  | "approval"
  | "executing"
  | "observing"
  | "completed"
  | "blocked";
export type AgentDecision = "approve" | "reject";
export type AgentState = { phase: AgentPhase; events: string[]; steps: number };

export function createAgentState(): AgentState {
  return { phase: "ready", events: ["任务已创建，等待 Agent Runtime 启动。"], steps: 0 };
}

export function advanceAgent(state: AgentState, decision?: AgentDecision): AgentState {
  const transition: Record<
    Exclude<AgentPhase, "approval" | "completed" | "blocked">,
    { phase: AgentPhase; event: string }
  > = {
    ready: { phase: "planning", event: "Runtime 接收目标并建立任务上下文。" },
    planning: { phase: "tool_request", event: "模型提出只读 search_course 工具请求。" },
    tool_request: { phase: "approval", event: "Runtime 暂停执行，等待人工批准工具请求。" },
    executing: { phase: "observing", event: "Runtime 在本地教学环境执行只读工具并收集结果。" },
    observing: { phase: "completed", event: "Runtime 验证结果并满足任务终止条件。" },
  };
  if (state.phase === "approval") {
    if (!decision) return state;
    return {
      phase: decision === "approve" ? "executing" : "blocked",
      events: [
        ...state.events,
        decision === "approve"
          ? "人工批准：允许执行本次只读工具调用。"
          : "人工拒绝：Runtime 阻止工具调用并终止任务。",
      ],
      steps: state.steps + 1,
    };
  }
  if (state.phase === "completed" || state.phase === "blocked") return state;
  const next = transition[state.phase];
  return { phase: next.phase, events: [...state.events, next.event], steps: state.steps + 1 };
}
