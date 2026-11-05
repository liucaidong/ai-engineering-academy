import { describe, expect, it } from "vitest";
import { callTeachingMcpTool, discoverTeachingMcpCapabilities } from "./mcp";

describe("local MCP protocol simulation", () => {
  it("discovers tools, resources and prompts", () => {
    const capabilities = discoverTeachingMcpCapabilities();
    expect(capabilities.tools.map((tool) => tool.name)).toContain("search_course");
    expect(capabilities.resources).toHaveLength(1);
    expect(capabilities.prompts).toHaveLength(1);
  });
  it("dispatches a discovered read-only tool", () => {
    expect(callTeachingMcpTool("search_course", '{"query":"MCP"}').ok).toBe(true);
  });
  it("does not dispatch tools that were not registered", () => {
    expect(callTeachingMcpTool("delete_everything", "{}")).toMatchObject({ ok: false, error: "unknown_tool" });
  });
});
