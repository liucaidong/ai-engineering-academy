import type { CourseModule } from "../types/course";

export function getUnlockedModules(modules: CourseModule[], completedModuleIds: readonly string[]): CourseModule[] {
  const completed = new Set(completedModuleIds);
  return modules.filter((module) => module.prerequisites.every((id) => completed.has(id)));
}

export function getNextRecommendedModule(modules: CourseModule[], completedModuleIds: readonly string[]): CourseModule | null {
  const completed = new Set(completedModuleIds);
  return getUnlockedModules(modules, completedModuleIds).find((module) => !completed.has(module.id)) ?? null;
}
