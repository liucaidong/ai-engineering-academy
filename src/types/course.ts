import { z } from "zod";

export const ExecutionModeSchema = z.enum([
  "simulation",
  "browser-local",
  "server-sandbox",
  "provider-backed"
]);

export const SourceReferenceSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  publisher: z.string().min(1).optional(),
  accessedAt: z.string().date().optional(),
  note: z.string().optional()
});

export const AssessmentSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["knowledge-check", "code-task", "design-review", "reflection"]),
  prompt: z.string().min(1),
  rubric: z.array(z.object({
    criterion: z.string().min(1),
    description: z.string().min(1),
    points: z.number().positive()
  })).min(1)
});

export const LabDefinitionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  executionMode: ExecutionModeSchema,
  description: z.string().min(1),
  safetyNotes: z.array(z.string().min(1)).min(1),
  inputs: z.array(z.object({ name: z.string().min(1), description: z.string().min(1) })).default([]),
  outputs: z.array(z.object({ name: z.string().min(1), description: z.string().min(1) })).default([]),
  status: z.enum(["planned", "implemented", "beta"]).default("planned")
});

export const LessonSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  learningObjectives: z.array(z.string()).min(1),
  estimatedMinutes: z.number().int().positive(),
  content: z.array(z.object({
    heading: z.string().min(1),
    body: z.string().min(1),
    markdown: z.string().optional(),
    sources: z.array(SourceReferenceSchema).optional()
  })).default([]),
  assessments: z.array(AssessmentSchema).default([]),
  sources: z.array(SourceReferenceSchema).default([])
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
  modules: z.array(ModuleSchema).min(1),
  labs: z.array(LabDefinitionSchema).default([])
}).superRefine((course, ctx) => {
  const moduleIds = new Set<string>();
  const globalLessonIds = new Set<string>();
  const globalAssessmentIds = new Set<string>();
  course.modules.forEach((module, index) => {
    if (moduleIds.has(module.id)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["modules", index, "id"], message: `Duplicate module ID: ${module.id}` });
    }
    moduleIds.add(module.id);
    const lessonIds = new Set<string>();
    module.lessons.forEach((lesson, lessonIndex) => {
      if (lessonIds.has(lesson.id)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["modules", index, "lessons", lessonIndex, "id"], message: `Duplicate lesson ID: ${lesson.id}` });
      }
      lessonIds.add(lesson.id);
      if (globalLessonIds.has(lesson.id)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["modules", index, "lessons", lessonIndex, "id"], message: `Duplicate course lesson ID: ${lesson.id}` });
      }
      globalLessonIds.add(lesson.id);
      lesson.assessments.forEach((assessment, assessmentIndex) => {
        if (globalAssessmentIds.has(assessment.id)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["modules", index, "lessons", lessonIndex, "assessments", assessmentIndex, "id"], message: `Duplicate assessment ID: ${assessment.id}` });
        }
        globalAssessmentIds.add(assessment.id);
        const criteria = new Set<string>();
        assessment.rubric.forEach((criterion, criterionIndex) => {
          if (criteria.has(criterion.criterion)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["modules", index, "lessons", lessonIndex, "assessments", assessmentIndex, "rubric", criterionIndex, "criterion"], message: `Duplicate rubric criterion: ${criterion.criterion}` });
          }
          criteria.add(criterion.criterion);
        });
      });
    });
    const prerequisites = new Set<string>();
    module.prerequisites.forEach((prerequisite, prerequisiteIndex) => {
      if (prerequisites.has(prerequisite)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["modules", index, "prerequisites", prerequisiteIndex], message: `Duplicate prerequisite: ${prerequisite}` });
      }
      prerequisites.add(prerequisite);
      if (prerequisite === module.id) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["modules", index, "prerequisites", prerequisiteIndex], message: "A module cannot depend on itself" });
      } else if (!course.modules.some((candidate) => candidate.id === prerequisite)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["modules", index, "prerequisites", prerequisiteIndex], message: `Unknown prerequisite module: ${prerequisite}` });
      }
    });
  });

  const state = new Map<string, "visiting" | "visited">();
  const byId = new Map(course.modules.map((module) => [module.id, module]));
  const visit = (id: string, stack: string[]) => {
    if (state.get(id) === "visited") return;
    if (state.get(id) === "visiting") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["modules"], message: `Prerequisite cycle detected: ${[...stack, id].join(" -> ")}` });
      return;
    }
    state.set(id, "visiting");
    const module = byId.get(id);
    module?.prerequisites.forEach((dependency) => {
      if (byId.has(dependency)) visit(dependency, [...stack, id]);
    });
    state.set(id, "visited");
  };
  course.modules.forEach((module) => visit(module.id, []));

  const labIds = new Set<string>();
  course.labs.forEach((lab, index) => {
    if (labIds.has(lab.id)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["labs", index, "id"], message: `Duplicate lab ID: ${lab.id}` });
    labIds.add(lab.id);
  });
  course.modules.forEach((module, index) => {
    if (module.labId && course.labs.length > 0 && !labIds.has(module.labId)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["modules", index, "labId"], message: `Unknown lab ID: ${module.labId}` });
    }
  });
});

export type ExecutionMode = z.infer<typeof ExecutionModeSchema>;
export type SourceReference = z.infer<typeof SourceReferenceSchema>;
export type Assessment = z.infer<typeof AssessmentSchema>;
export type LabDefinition = z.infer<typeof LabDefinitionSchema>;
export type Lesson = z.infer<typeof LessonSchema>;
export type CourseModule = z.infer<typeof ModuleSchema>;
export type Course = z.infer<typeof CourseSchema>;

export const EXECUTION_MODE_LABELS: Record<ExecutionMode, string> = {
  simulation: "教学模拟",
  "browser-local": "浏览器本地执行",
  "server-sandbox": "服务端隔离沙箱",
  "provider-backed": "真实模型 / 服务调用"
};
