import { courseCatalog } from "../data/courseCatalog";

export type ToolExecutionResult =
  | { ok: true; data: unknown }
  | {
      ok: false;
      error:
        | "permission_denied"
        | "unknown_tool"
        | "invalid_json"
        | "invalid_arguments"
        | "not_found";
      message: string;
    };

export function executeTeachingToolCall(
  toolName: string,
  argumentsJson: string,
  allowed: boolean,
): ToolExecutionResult {
  if (!allowed)
    return {
      ok: false,
      error: "permission_denied",
      message: "Runtime policy denied this tool call.",
    };
  if (argumentsJson.length > 4096)
    return {
      ok: false,
      error: "invalid_arguments",
      message: "Tool arguments exceed the 4096-character limit.",
    };
  let args: unknown;
  try {
    args = JSON.parse(argumentsJson);
  } catch {
    return { ok: false, error: "invalid_json", message: "Tool arguments must be valid JSON." };
  }
  if (!args || typeof args !== "object" || Array.isArray(args)) {
    return {
      ok: false,
      error: "invalid_arguments",
      message: "Tool arguments must be a JSON object.",
    };
  }
  const record = args as Record<string, unknown>;
  if (toolName === "search_course") {
    if (typeof record.query !== "string" || !record.query.trim() || record.query.length > 80) {
      return {
        ok: false,
        error: "invalid_arguments",
        message: "query must be a non-empty string of at most 80 characters.",
      };
    }
    if (Object.keys(record).some((key) => key !== "query"))
      return {
        ok: false,
        error: "invalid_arguments",
        message: "search_course accepts only the query field.",
      };
    const query = record.query.trim().toLocaleLowerCase();
    const matches = courseCatalog.modules
      .filter((module) =>
        [module.id, module.title, module.summary, ...module.objectives]
          .join(" ")
          .toLocaleLowerCase()
          .includes(query),
      )
      .map(({ id, title, summary }) => ({ id, title, summary }));
    return { ok: true, data: { count: matches.length, modules: matches } };
  }
  if (toolName === "get_module") {
    if (typeof record.id !== "string" || !/^M\d{2}$/u.test(record.id)) {
      return {
        ok: false,
        error: "invalid_arguments",
        message: "id must use the MNN module identifier format.",
      };
    }
    if (Object.keys(record).some((key) => key !== "id"))
      return {
        ok: false,
        error: "invalid_arguments",
        message: "get_module accepts only the id field.",
      };
    const module = courseCatalog.modules.find((item) => item.id === record.id);
    if (!module)
      return { ok: false, error: "not_found", message: "The requested module does not exist." };
    return {
      ok: true,
      data: {
        id: module.id,
        title: module.title,
        summary: module.summary,
        objectives: module.objectives,
      },
    };
  }
  return {
    ok: false,
    error: "unknown_tool",
    message: "The requested tool is not registered in this local teaching runtime.",
  };
}
