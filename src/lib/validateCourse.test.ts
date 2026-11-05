import { describe, expect, it } from "vitest";
import { course } from "../data/curriculum";
import { getCourseValidationErrors, validateCourse } from "./validateCourse";

describe("course content contract", () => {
  it("accepts the academy curriculum", () => {
    expect(validateCourse(course).modules).toHaveLength(20);
  });

  it("rejects modules without learning objectives", () => {
    const invalid = {
      ...course,
      modules: [{ ...course.modules[0], objectives: [] }]
    };
    expect(getCourseValidationErrors(invalid)).toContain(
      "modules.0.objectives: Array must contain at least 1 element(s)"
    );
  });

  it("requires module identifiers to follow the MNN convention", () => {
    const invalid = {
      ...course,
      modules: [{ ...course.modules[0], id: "module-one" }]
    };
    expect(getCourseValidationErrors(invalid).some((error) => error.startsWith("modules.0.id:"))).toBe(true);
  });
});
