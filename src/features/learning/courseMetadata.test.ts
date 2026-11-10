import { describe, expect, it } from "vitest";
import { courseCatalog } from "../../data/courseCatalog";
import { LAB_COMPONENTS } from "../labs/labRegistry";
import { IMPLEMENTED_LABS } from "./courseMetadata";

describe("course lab registry", () => {
  it("provides a lazy workspace for every catalog lab marked implemented", () => {
    const implementedLabs = courseCatalog.labs.filter((lab) => lab.status === "implemented");

    expect(implementedLabs.length).toBeGreaterThan(0);
    for (const lab of implementedLabs) {
      expect(LAB_COMPONENTS).toHaveProperty(lab.id);
      expect(IMPLEMENTED_LABS.has(lab.id)).toBe(true);
    }
  });

  it("does not mark planned or unmapped labs as implemented", () => {
    for (const lab of courseCatalog.labs.filter((item) => item.status !== "implemented")) {
      expect(IMPLEMENTED_LABS.has(lab.id)).toBe(false);
    }
  });
});
