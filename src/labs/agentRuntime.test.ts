import { describe, expect, it } from "vitest";
import { advanceAgent, createAgentState } from "./agentRuntime";

describe("agent runtime state machine", () => {
  it("requires approval before executing a tool request", () => {
    let state = createAgentState();
    state = advanceAgent(state);
    state = advanceAgent(state);
    state = advanceAgent(state);
    expect(state.phase).toBe("approval");
    expect(advanceAgent(state).phase).toBe("approval");
    expect(advanceAgent(state, "approve").phase).toBe("executing");
  });
  it("can reject a tool request and reach a terminal blocked state", () => {
    let state = createAgentState();
    state = advanceAgent(state);
    state = advanceAgent(state);
    state = advanceAgent(state);
    state = advanceAgent(state, "reject");
    expect(state.phase).toBe("blocked");
    expect(advanceAgent(state).phase).toBe("blocked");
  });
  it("completes the approved path deterministically", () => {
    let state = createAgentState();
    for (let index = 0; index < 3; index += 1) state = advanceAgent(state);
    state = advanceAgent(state, "approve");
    state = advanceAgent(state);
    state = advanceAgent(state);
    expect(state.phase).toBe("completed");
  });
});
