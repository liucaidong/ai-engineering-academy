import { courseCatalog } from "./courseCatalog";
import { loadModuleLessons } from "./moduleLessons";
import type { Course } from "../types/course";

/** Load every module only for explicit full-course operations such as export. */
export async function loadFullCourse(): Promise<Course> {
  const lessons = await Promise.all(
    courseCatalog.modules.map(async (module) => [module.id, await loadModuleLessons(module.id)] as const),
  );
  const lessonsByModule = new Map(lessons);

  return {
    ...courseCatalog,
    modules: courseCatalog.modules.map((module) => {
      const moduleLessons = lessonsByModule.get(module.id);
      if (!moduleLessons) throw new Error(`Missing lesson payload for ${module.id}`);
      return { ...module, lessons: moduleLessons };
    }),
  };
}
