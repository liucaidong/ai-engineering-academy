import { type Course, type CourseModule, CourseSchema, ModuleSchema } from "../types/course";
import { migrateCoursePayload } from "./courseMigration";

export function validateCourse(input: unknown): Course {
  return CourseSchema.parse(migrateCoursePayload(input));
}

export function getCourseValidationErrors(input: unknown): string[] {
  const result = CourseSchema.safeParse(migrateCoursePayload(input));
  if (result.success) return [];
  return result.error.issues.map((issue) => {
    const path = issue.path.length ? issue.path.join(".") : "course";
    return `${path}: ${issue.message}`;
  });
}

export function getModuleValidationErrors(
  module: Omit<CourseModule, "lessons">,
  lessons: CourseModule["lessons"],
): string[] {
  const result = ModuleSchema.safeParse({ ...module, lessons });
  if (result.success) return [];
  return result.error.issues.map((issue) => {
    const path = issue.path.length ? issue.path.join(".") : "module";
    return `${path}: ${issue.message}`;
  });
}
