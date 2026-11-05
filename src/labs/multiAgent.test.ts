import { describe, expect, it } from "vitest";
import { runTeachingMultiAgentReview } from "./multiAgent";

describe("teaching multi-agent orchestration", () => {
  it("returns independent findings and a bounded synthesis", () => {
    const report = runTeachingMultiAgentReview("RAG evaluation");
    expect(report.findings).toHaveLength(3);
    expect(report.synthesis).toContain("RAG evaluation");
    expect(report.coordinationNotes.length).toBeGreaterThan(0);
  });
  it("handles an empty topic with a safe default", () => {
    expect(runTeachingMultiAgentReview(" ").synthesis).toContain("AI Engineering Academy");
  });
});
