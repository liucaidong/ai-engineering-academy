import { describe, expect, it } from "vitest";
import { courseCatalog } from "../data/courseCatalog";
import { course } from "../data/curriculum";
import { searchModules } from "./searchModules";

describe("course module search", () => {
  it("returns all modules for an empty query", () => {
    expect(searchModules(course.modules, " ")).toHaveLength(20);
  });

  it("matches module titles and identifiers without case sensitivity", () => {
    expect(searchModules(course.modules, "mcp").map((module) => module.id)).toContain("M12");
  });

  it("searches module metadata without loading lesson payloads", () => {
    expect(searchModules(courseCatalog.modules, "MCP").map((module) => module.id)).toContain("M12");
    expect(searchModules(courseCatalog.modules, "KV Cache").map((module) => module.id)).toContain(
      "M05",
    );
  });

  it("matches learning objectives and lesson content", () => {
    expect(searchModules(course.modules, "KV Cache").map((module) => module.id)).toContain("M05");
    expect(searchModules(course.modules, "Prompt Injection").map((module) => module.id)).toContain(
      "M15",
    );
  });

  it("returns no results for an unknown phrase", () => {
    expect(searchModules(course.modules, "no-such-course-topic")).toEqual([]);
  });
});
