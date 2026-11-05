import type { CourseModule } from "../types/course";

export function searchModules(modules: CourseModule[], query: string): CourseModule[] {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return modules;
  return modules.filter((module) => {
    const searchable = [
      module.id,
      module.title,
      module.summary,
      module.labId ?? "",
      ...module.objectives,
      ...module.lessons.flatMap((lesson) => [
        lesson.title,
        lesson.summary,
        ...lesson.content.flatMap((section) => [section.heading, section.body, section.markdown ?? ""])
      ])
    ].join(" ").toLocaleLowerCase();
    return searchable.includes(normalized);
  });
}
