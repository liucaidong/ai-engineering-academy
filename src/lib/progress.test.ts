import { describe, expect, it } from "vitest";
import { loadProgress, serializeProgress, toggleModuleProgress } from "./progress";

describe("browser-local learner progress", () => {
  it("round-trips completed module IDs", () => {
    const serialized = serializeProgress(["M01", "M02"]);
    expect(loadProgress(serialized, ["M01", "M02", "M03"])).toEqual(["M01", "M02"]);
  });

  it("ignores unknown and duplicate module IDs", () => {
    const serialized = JSON.stringify({ version: 1, completedModuleIds: ["M01", "M99", "M01"] });
    expect(loadProgress(serialized, ["M01", "M02"])).toEqual(["M01"]);
  });

  it("fails closed for malformed or unsupported data", () => {
    expect(loadProgress("{", ["M01"])).toEqual([]);
    expect(loadProgress(JSON.stringify({ version: 2, completedModuleIds: ["M01"] }), ["M01"])).toEqual([]);
    expect(loadProgress(null, ["M01"])).toEqual([]);
  });

  it("toggles completion without mutating the original list", () => {
    const original = ["M01"];
    expect(toggleModuleProgress(original, "M02")).toEqual(["M01", "M02"]);
    expect(toggleModuleProgress(original, "M01")).toEqual([]);
    expect(original).toEqual(["M01"]);
  });
});
