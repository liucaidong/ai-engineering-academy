import { executeTeachingToolCall, type ToolExecutionResult } from "./toolCalling";

export type McpCapabilities = {
  tools: Array<{ name: string; description: string }>;
  resources: Array<{ uri: string; name: string }>;
  prompts: Array<{ name: string; description: string }>;
};

export function discoverTeachingMcpCapabilities(): McpCapabilities {
  return {
    tools: [{ name: "search_course", description: "在本地课程目录中搜索模块（只读）。" }],
    resources: [{ uri: "academy://curriculum/index", name: "课程目录索引" }],
    prompts: [{ name: "explain_concept", description: "按定义、机制、边界和示例解释概念。" }]
  };
}

export function callTeachingMcpTool(name: string, argumentsJson: string): ToolExecutionResult {
  if (name !== "search_course") {
    return { ok: false, error: "unknown_tool", message: "This MCP teaching server does not expose the requested tool." };
  }
  return executeTeachingToolCall(name, argumentsJson, true);
}
