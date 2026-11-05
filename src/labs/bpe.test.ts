import { describe, expect, it } from "vitest";
import { encodeWithToyBpe } from "./bpe";

describe("encodeWithToyBpe", () => {
  it("applies the lowest-rank available pair first", () => {
    const result = encodeWithToyBpe("the");
    expect(result.steps[0]).toMatchObject({ left: "t", right: "h", merged: "th", rank: 0 });
    expect(result.tokens).toEqual(["the"]);
  });

  it("preserves whitespace as separate pieces", () => {
    expect(encodeWithToyBpe("hi there").tokens.join("")).toBe("hi there");
  });

  it("handles empty input", () => {
    expect(encodeWithToyBpe("").tokens).toEqual([]);
  });

  it("normalizes letters to lowercase for this toy vocabulary", () => {
    expect(encodeWithToyBpe("THE").tokens).toEqual(["the"]);
  });
});
