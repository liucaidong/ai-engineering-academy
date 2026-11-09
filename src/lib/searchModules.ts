import type { CourseModuleSummary } from "../data/courseCatalog";
import type { CourseModule } from "../types/course";

type SearchableModule = CourseModule | CourseModuleSummary;

export function searchModules(modules: SearchableModule[], query: string): SearchableModule[] {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return modules;
  return modules.filter((module) => {
    const searchable = [
      module.id,
      module.title,
      module.summary,
      module.labId ?? "",
      ...module.objectives,
      ...("lessons" in module
        ? module.lessons.flatMap((lesson) => [
            lesson.title,
            lesson.summary,
            ...lesson.content.flatMap((section) => [
              section.heading,
              section.body,
              section.markdown ?? "",
            ]),
          ])
        : []),
    ]
      .join(" ")
      .toLocaleLowerCase();
    return searchable.includes(normalized);
  });
}
