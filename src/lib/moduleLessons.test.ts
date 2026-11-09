import { describe, expect, it } from "vitest";
import { courseCatalog } from "../data/courseCatalog";
import { loadFullCourse } from "../data/loadFullCourse";
import { loadModuleLessons } from "../data/moduleLessons";
import { validateCourse } from "../lib/validateCourse";

describe("module-level course payload loading", () => {
  it("loads each module independently with substantive lessons", async () => {
    const lessons = await Promise.all(
      courseCatalog.modules.map((module) => loadModuleLessons(module.id)),
    );

    expect(lessons).toHaveLength(20);
    expect(lessons.every((moduleLessons) => moduleLessons.length >= 3)).toBe(true);
    expect(
      lessons.every((moduleLessons) => moduleLessons.every((lesson) => lesson.content.length >= 3)),
    ).toBe(true);
  });

  it("preserves Markdown paragraph boundaries in M19 and M20 lessons", async () => {
    const [m19, m20] = await Promise.all([loadModuleLessons("M19"), loadModuleLessons("M20")]);
    for (const lessons of [m19, m20]) {
      const markdown = lessons
        .flatMap((lesson) => lesson.content)
        .map((section) => section.markdown ?? "")
        .join("\n");
      expect(markdown).toContain("\n\n");
      expect(markdown).not.toContain("\\n\\n");
    }
  });

  it("reuses the in-flight module load promise", () => {
    const first = loadModuleLessons("M04");
    const second = loadModuleLessons("M04");
    expect(second).toBe(first);
  });

  it("rejects unknown module identifiers", async () => {
    await expect(loadModuleLessons("M99")).rejects.toThrow("Unknown course module: M99");
  });

  it("assembles a complete schema-valid course for explicit full-course operations", async () => {
    const fullCourse = await loadFullCourse();
    expect(validateCourse(fullCourse).modules).toHaveLength(20);
    expect(fullCourse.modules.every((module) => module.lessons.length >= 3)).toBe(true);
    expect(fullCourse.modules.flatMap((module) => module.lessons)).not.toHaveLength(0);
  });
});
