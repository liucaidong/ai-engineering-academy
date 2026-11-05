import { describe, expect, it } from "vitest";
import { isWithinUtf8ByteLimit, utf8ByteLength } from "./utf8";

describe("UTF-8 size helpers", () => {
  it("counts encoded bytes rather than JavaScript string code units", () => {
    expect(utf8ByteLength("A")).toBe(1);
    expect(utf8ByteLength("中")).toBe(3);
    expect(utf8ByteLength("😀")).toBe(4);
  });

  it("enforces byte limits for multibyte text", () => {
    expect(isWithinUtf8ByteLimit("中", 3)).toBe(true);
    expect(isWithinUtf8ByteLimit("中", 2)).toBe(false);
    expect(isWithinUtf8ByteLimit("😀", 3)).toBe(false);
    expect(isWithinUtf8ByteLimit("A", -1)).toBe(false);
  });
});
