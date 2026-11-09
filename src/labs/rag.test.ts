import { describe, expect, it } from "vitest";
import { chunkText, retrieveToy } from "./rag";

describe("RAG teaching primitives", () => {
  it("splits text with a configured overlap", () => {
    const chunks = chunkText("abcdefghijklmnop", 8, 2);
    expect(chunks).toEqual(["abcdefgh", "ghijklmn", "mnop"]);
  });

  it("normalizes repeated whitespace", () => {
    expect(chunkText("alpha   beta\n\tgamma", 40, 0)).toEqual(["alpha beta gamma"]);
  });

  it("rejects invalid chunk settings", () => {
    expect(() => chunkText("text", 4, 4)).toThrow("chunkSize > overlap");
  });

  it("returns ranked top-k documents", () => {
    const results = retrieveToy(
      "vector retrieval",
      [
        { id: "a", text: "Vector retrieval uses embeddings", source: "guide-a" },
        { id: "b", text: "Cooking pasta with tomato", source: "guide-b" },
        { id: "c", text: "Retrieval augmented generation", source: "guide-c" },
      ],
      2,
    );
    expect(results).toHaveLength(2);
    expect(results[0].rerankScore).toBeGreaterThanOrEqual(results[1].rerankScore);
  });
});
