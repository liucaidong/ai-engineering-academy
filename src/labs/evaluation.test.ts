import { describe, expect, it } from "vitest";
import { evaluateTeachingDataset } from "./evaluation";

describe("teaching evaluation metrics", () => {
  it("calculates exact-match accuracy after trimming and case normalization", () => {
    const result = evaluateTeachingDataset([
      { id: "a", prompt: "Q1", expected: "Transformer", actual: " transformer " },
      { id: "b", prompt: "Q2", expected: "RAG", actual: "Agent" }
    ]);
    expect(result).toMatchObject({ total: 2, passed: 1, accuracy: 0.5 });
  });
  it("handles an empty dataset without division by zero", () => {
    expect(evaluateTeachingDataset([])).toMatchObject({ total: 0, passed: 0, accuracy: 0 });
  });
});
