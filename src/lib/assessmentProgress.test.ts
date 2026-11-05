import { describe, expect, it } from "vitest";
import { loadAssessmentProgress, serializeAssessmentProgress } from "./assessmentProgress";

describe("browser-local assessment progress", () => {
  it("round-trips answer drafts and rubric self-review", () => {
    const responses = {
      "m01-review": { responseText: "Model, application and runtime are separate.", reviewedCriteria: ["scope", "safety"] }
    };
    expect(loadAssessmentProgress(serializeAssessmentProgress(responses), ["m01-review"])).toEqual(responses);
  });

  it("filters assessments that no longer exist", () => {
    const serialized = JSON.stringify({ version: 1, responses: { old: { responseText: "draft", reviewedCriteria: [] } } });
    expect(loadAssessmentProgress(serialized, ["current"])).toEqual({});
  });

  it("ignores malformed and unsupported storage payloads", () => {
    expect(loadAssessmentProgress("{", ["m01-review"])).toEqual({});
    expect(loadAssessmentProgress(JSON.stringify({ version: 2, responses: {} }), ["m01-review"])).toEqual({});
    expect(loadAssessmentProgress(null, ["m01-review"])).toEqual({});
  });
});
