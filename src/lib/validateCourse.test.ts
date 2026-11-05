import { describe, expect, it } from "vitest";
import { course } from "../data/curriculum";
import { getCourseValidationErrors, validateCourse } from "./validateCourse";
import { parseCoursePayload } from "./courseMigration";

describe("course content contract", () => {
  it("accepts the academy curriculum", () => {
    expect(validateCourse(course).modules).toHaveLength(20);
    expect(course.modules.slice(0, 3).every((module) => module.lessons[0].content.length >= 4)).toBe(true);
    expect(course.modules.slice(0, 3).every((module) => module.lessons[0].sources.length >= 2)).toBe(true);
    expect(course.modules.every((module) => module.lessons[0].content.length >= 3)).toBe(true);
    expect(course.modules.every((module) => module.lessons[0].content.every((section) => section.body.trim().length > 0))).toBe(true);
    expect(course.modules.every((module) => module.lessons[0].sources.length >= 2)).toBe(true);
    expect(course.modules.every((module) => module.lessons[0].assessments.length === 1)).toBe(true);
    expect(course.labs.filter((lab) => lab.status === "implemented")).toHaveLength(8);
  });

  it("migrates legacy payloads without schemaVersion to version 1", () => {
    const legacy = Object.fromEntries(Object.entries(course).filter(([key]) => key !== "schemaVersion"));
    expect(parseCoursePayload(legacy).schemaVersion).toBe(1);
    expect(getCourseValidationErrors(legacy)).toEqual([]);
  });

  it("rejects unsupported course schema versions", () => {
    expect(() => parseCoursePayload({ ...course, schemaVersion: 2 })).toThrow();
  });

  it("requires substantive lesson content, sources and assessments", () => {
    const incomplete = { ...course, modules: [{ ...course.modules[0], lessons: [{ ...course.modules[0].lessons[0], content: [], sources: [], assessments: [] }] }] };
    expect(getCourseValidationErrors(incomplete).join(" ")).toMatch(/content|sources|assessments/);
  });

  it("rejects non-SemVer curriculum versions", () => {
    expect(getCourseValidationErrors({ ...course, version: "draft" }).some((error) => error.includes("version"))).toBe(true);
  });

  it("rejects modules without learning objectives", () => {
    const invalid = { ...course, modules: [{ ...course.modules[0], objectives: [] }] };
    expect(getCourseValidationErrors(invalid).some((error) => error.includes("objectives"))).toBe(true);
  });

  it("requires module identifiers to follow the MNN convention", () => {
    const invalid = { ...course, modules: [{ ...course.modules[0], id: "module-one" }] };
    expect(getCourseValidationErrors(invalid).some((error) => error.startsWith("modules.0.id:"))).toBe(true);
  });

  it("rejects unknown prerequisite references", () => {
    const invalid = { ...course, modules: course.modules.map((module, index) => index === 0 ? { ...module, prerequisites: ["M99"] } : module) };
    expect(getCourseValidationErrors(invalid).some((error) => error.includes("Unknown prerequisite module: M99"))).toBe(true);
  });

  it("rejects self references and duplicate prerequisites", () => {
    const invalid = { ...course, modules: course.modules.map((module, index) => index === 0 ? { ...module, prerequisites: ["M01", "M01"] } : module) };
    const errors = getCourseValidationErrors(invalid).join(" ");
    expect(errors).toContain("A module cannot depend on itself");
    expect(errors).toContain("Duplicate prerequisite: M01");
  });

  it("detects prerequisite cycles", () => {
    const invalid = { ...course, modules: course.modules.map((module) => module.id === "M01" ? { ...module, prerequisites: ["M02"] } : module) };
    expect(getCourseValidationErrors(invalid).some((error) => error.includes("Prerequisite cycle detected"))).toBe(true);
  });

  it("rejects duplicate module identifiers", () => {
    const invalid = { ...course, modules: [course.modules[0], { ...course.modules[1], id: "M01" }] };
    expect(getCourseValidationErrors(invalid).some((error) => error.includes("Duplicate module ID: M01"))).toBe(true);
  });

  it("rejects unresolved lab references when a lab registry is present", () => {
    const invalid = { ...course, labs: course.labs.filter((lab) => lab.id !== "transformer") };
    expect(getCourseValidationErrors(invalid).some((error) => error.includes("Unknown lab ID: transformer"))).toBe(true);
  });

  it("rejects duplicate lesson identifiers", () => {
    const first = course.modules[0];
    const invalid = { ...course, modules: [{ ...first, lessons: [first.lessons[0], first.lessons[0]] }, ...course.modules.slice(1)] };
    expect(getCourseValidationErrors(invalid).some((error) => error.includes("Duplicate lesson ID"))).toBe(true);
  });

  it("rejects duplicate lesson identifiers across different modules", () => {
    const duplicateLesson = { ...course, modules: course.modules.map((module, index) => index === 1 ? { ...module, lessons: [{ ...module.lessons[0], id: course.modules[0].lessons[0].id }] } : module) };
    expect(getCourseValidationErrors(duplicateLesson).some((error) => error.includes("Duplicate course lesson ID"))).toBe(true);
  });

  it("requires globally unique assessment identifiers and rubric criteria", () => {
    const duplicateAssessment = { ...course, modules: course.modules.map((module, index) => index === 1 ? { ...module, lessons: [{ ...module.lessons[0], assessments: [{ ...course.modules[0].lessons[0].assessments[0], id: "m01-system-boundary-review" }] }] } : module) };
    expect(getCourseValidationErrors(duplicateAssessment).some((error) => error.includes("Duplicate assessment ID"))).toBe(true);
    const first = course.modules[0];
    const duplicateCriterion = { ...course, modules: [{ ...first, lessons: [{ ...first.lessons[0], assessments: [{ ...first.lessons[0].assessments[0], rubric: [first.lessons[0].assessments[0].rubric[0], first.lessons[0].assessments[0].rubric[0]] }] }] }, ...course.modules.slice(1)] };
    expect(getCourseValidationErrors(duplicateCriterion).some((error) => error.includes("Duplicate rubric criterion"))).toBe(true);
  });
  it("rejects unknown fields instead of silently stripping imported data", () => {
    const invalid = { ...course, unexpected: "must-not-be-discarded" };
    expect(getCourseValidationErrors(invalid).some((error) => error.includes("Unrecognized key(s)"))).toBe(true);
  });

  it("rejects unknown fields inside modules and lesson sections", () => {
    const moduleExtra = { ...course, modules: [{ ...course.modules[0], unexpected: true }] };
    expect(getCourseValidationErrors(moduleExtra).some((error) => error.includes("modules.0"))).toBe(true);

    const sectionExtra = {
      ...course,
      modules: course.modules.map((module, index) => index === 0
        ? { ...module, lessons: [{ ...module.lessons[0], content: [{ ...module.lessons[0].content[0], unexpected: true }, ...module.lessons[0].content.slice(1)] }] }
        : module)
    };
    expect(getCourseValidationErrors(sectionExtra).some((error) => error.includes("unexpected"))).toBe(true);
  });

  it("keeps the curriculum release and Simplified Chinese locale aligned", () => {
    expect(course.version).toBe("0.3.1");
    expect(course.language).toBe("zh-CN");
    expect(course.modules.find((module) => module.id === "M04")?.lessons[0].content[0].heading)
      .toBe("预训练：从大规模数据中学习表示");
  });

});
