import { CourseSchema, type Course } from "../types/course";
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
