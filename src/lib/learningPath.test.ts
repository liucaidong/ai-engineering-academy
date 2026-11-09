import { describe, expect, it } from "vitest";
import { course } from "../data/curriculum";
import { getNextRecommendedModule, getUnlockedModules } from "./learningPath";

describe("prerequisite-aware learning path", () => {
  it("starts with the root module", () => {
    expect(getNextRecommendedModule(course.modules, [])?.id).toBe("M01");
  });
  it("recommends the first newly unlocked module", () => {
    expect(getNextRecommendedModule(course.modules, ["M01"])?.id).toBe("M02");
  });
  it("unlocks only modules whose prerequisites are complete", () => {
    const unlocked = getUnlockedModules(course.modules, []);
    expect(unlocked.map((module) => module.id)).toEqual(["M01"]);
  });
  it("returns null when every module is complete", () => {
    expect(
      getNextRecommendedModule(
        course.modules,
        course.modules.map((module) => module.id),
      ),
    ).toBeNull();
  });
});
