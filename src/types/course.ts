import { z } from "zod";

export const ExecutionModeSchema = z.enum([
  "simulation",
  "browser-local",
  "server-sandbox",
  "provider-backed"
]);

export const LessonSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  learningObjectives: z.array(z.string()).min(1),
  estimatedMinutes: z.number().int().positive(),
  content: z.array(z.object({
    heading: z.string().min(1),
    body: z.string().min(1)
  })).default([])
});

export const ModuleSchema = z.object({
  id: z.string().regex(/^M\d{2}$/),
  level: z.enum(["L1", "L2", "L3", "L4", "L5", "L6"]),
  title: z.string().min(1),
  summary: z.string().min(1),
  prerequisites: z.array(z.string()),
  objectives: z.array(z.string()).min(1),
  lessons: z.array(LessonSchema).min(1),
  labId: z.string().optional()
});

export const CourseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  version: z.string().min(1),
  language: z.string().min(2),
  modules: z.array(ModuleSchema).min(1)
});

export type ExecutionMode = z.infer<typeof ExecutionModeSchema>;
export type Lesson = z.infer<typeof LessonSchema>;
export type CourseModule = z.infer<typeof ModuleSchema>;
export type Course = z.infer<typeof CourseSchema>;

export const EXECUTION_MODE_LABELS: Record<ExecutionMode, string> = {
  simulation: "教学模拟",
  "browser-local": "浏览器本地执行",
  "server-sandbox": "服务端隔离沙箱",
  "provider-backed": "真实模型 / 服务调用"
};
