import { describe, expect, it } from "vitest";
import { executeTeachingToolCall } from "./toolCalling";

describe("teaching tool-call runtime", () => {
  it("executes an allowed read-only course search", () => {
    const result = executeTeachingToolCall(
      "search_course",
      JSON.stringify({ query: "Transformer" }),
      true,
    );
    expect(result.ok).toBe(true);
    if (result.ok)
      expect(
        (result.data as { modules: Array<{ id: string }> }).modules.some(
          (module) => module.id === "M02",
        ),
      ).toBe(true);
  });
  it("blocks calls when runtime permission is denied", () => {
    expect(executeTeachingToolCall("search_course", '{"query":"MCP"}', false)).toMatchObject({
      ok: false,
      error: "permission_denied",
    });
  });
  it("rejects malformed JSON and invalid arguments", () => {
    expect(executeTeachingToolCall("search_course", "{", true)).toMatchObject({
      ok: false,
      error: "invalid_json",
    });
    expect(executeTeachingToolCall("search_course", "[]", true)).toMatchObject({
      ok: false,
      error: "invalid_arguments",
    });
    expect(
      executeTeachingToolCall("search_course", '{"query":"MCP","tenant":"other"}', true),
    ).toMatchObject({ ok: false, error: "invalid_arguments" });
    expect(executeTeachingToolCall("search_course", "x".repeat(4097), true)).toMatchObject({
      ok: false,
      error: "invalid_arguments",
    });
    expect(executeTeachingToolCall("search_course", '{"query":""}', true)).toMatchObject({
      ok: false,
      error: "invalid_arguments",
    });
  });
  it("rejects unknown tools and missing modules", () => {
    expect(executeTeachingToolCall("shell_exec", "{}", true)).toMatchObject({
      ok: false,
      error: "unknown_tool",
    });
    expect(executeTeachingToolCall("get_module", '{"id":"M99"}', true)).toMatchObject({
      ok: false,
      error: "not_found",
    });
  });
});
