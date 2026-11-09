import type { CourseModuleSummary } from "../data/courseCatalog";
import type { CourseModule } from "../types/course";

type LearningPathModule = CourseModule | CourseModuleSummary;

export function getUnlockedModules(
  modules: LearningPathModule[],
  completedModuleIds: readonly string[],
): LearningPathModule[] {
  const completed = new Set(completedModuleIds);
  return modules.filter((module) => module.prerequisites.every((id) => completed.has(id)));
}

export function getNextRecommendedModule(
  modules: LearningPathModule[],
  completedModuleIds: readonly string[],
): LearningPathModule | null {
  const completed = new Set(completedModuleIds);
  return (
    getUnlockedModules(modules, completedModuleIds).find((module) => !completed.has(module.id)) ??
    null
  );
}
