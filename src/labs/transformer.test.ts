import { describe, expect, it } from "vitest";
import { scaledDotProductAttention, softmax } from "./transformer";

describe("scaled dot-product attention", () => {
  it("normalizes each attention row and returns weighted values", () => {
    const result = scaledDotProductAttention([[1, 0]], [[1, 0], [0, 1]], [[10, 0], [0, 20]]);
    expect(result.weights[0].reduce((sum, value) => sum + value, 0)).toBeCloseTo(1);
    expect(result.output[0][0]).toBeGreaterThan(5);
    expect(result.output[0][1]).toBeGreaterThan(5);
  });

  it("applies a boolean attention mask", () => {
    const result = scaledDotProductAttention([[1, 0]], [[1, 0], [0, 1]], [[10], [20]], [[true, false]]);
    expect(result.weights[0]).toEqual([1, 0]);
    expect(result.output[0][0]).toBeCloseTo(10);
  });

  it("returns zero weights for a fully masked row", () => {
    const result = scaledDotProductAttention([[1, 0]], [[1, 0], [0, 1]], [[10], [20]], [[false, false]]);
    expect(result.weights[0]).toEqual([0, 0]);
    expect(result.output[0][0]).toBe(0);
  });

  it("handles numerically stable softmax", () => {
    expect(softmax([1000, 1000])).toEqual([0.5, 0.5]);
  });

  it("rejects incompatible dimensions", () => {
    expect(() => scaledDotProductAttention([[1, 2]], [[1]], [[1]])).toThrow("dimensions are incompatible");
  });
});
