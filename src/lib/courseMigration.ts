import { type Course, CourseSchema } from "../types/course";

export const CURRENT_COURSE_SCHEMA_VERSION = 1;

export function migrateCoursePayload(input: unknown): unknown {
  if (!input || typeof input !== "object" || Array.isArray(input)) return input;
  const payload = input as Record<string, unknown>;
  if (payload.schemaVersion === undefined) {
    return { ...payload, schemaVersion: CURRENT_COURSE_SCHEMA_VERSION };
  }
  return payload;
}

export function parseCoursePayload(input: unknown): Course {
  return CourseSchema.parse(migrateCoursePayload(input));
}
