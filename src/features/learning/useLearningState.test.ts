import { describe, expect, it } from "vitest";
import {
  getLearningStorageKeys,
  type LocalLearningState,
  mergeGuestLearningState,
} from "./useLearningState";

describe("learning storage scopes", () => {
  it("separates guest, account and tenant learning records", () => {
    const guest = getLearningStorageKeys("guest");
    const accountA = getLearningStorageKeys("user:user-a:tenant:tenant-a");
    const accountB = getLearningStorageKeys("user:user-b:tenant:tenant-a");
    const tenantB = getLearningStorageKeys("user:user-a:tenant:tenant-b");

    expect(
      new Set([guest.progress, accountA.progress, accountB.progress, tenantB.progress]).size,
    ).toBe(4);
    expect(accountA.assessments).not.toBe(accountB.assessments);
    expect(accountA.bookmarks).not.toBe(tenantB.bookmarks);
  });

  it("encodes arbitrary scope values before using them in storage keys", () => {
    const keys = getLearningStorageKeys("user:unsafe/id?x=1");
    expect(keys.progress).not.toContain("/id?");
    expect(keys.progress).toContain("%2F");
  });
});

describe("guest learning data import", () => {
  const current: LocalLearningState = {
    bookmarkedModuleIds: ["M01"],
    completedModules: ["M01"],
    assessmentResponses: {
      "m01-01-product-decomposition": { responseText: "account answer", reviewedCriteria: [] },
    },
  };
  const guest: LocalLearningState = {
    bookmarkedModuleIds: ["M01", "M02"],
    completedModules: ["M02", "M03"],
    assessmentResponses: {
      "m01-01-product-decomposition": { responseText: "guest conflict", reviewedCriteria: [] },
      "m01-02-learning-process": { responseText: "guest answer", reviewedCriteria: ["evidence"] },
    },
  };

  it("merges bookmarks and completion while preserving account drafts on conflict", () => {
    const merged = mergeGuestLearningState(current, guest);

    expect(merged.state.bookmarkedModuleIds).toEqual(["M01", "M02"]);
    expect(merged.state.completedModules).toEqual(["M01", "M02", "M03"]);
    expect(merged.state.assessmentResponses["m01-01-product-decomposition"]?.responseText).toBe(
      "account answer",
    );
    expect(merged.state.assessmentResponses["m01-02-learning-process"]?.responseText).toBe(
      "guest answer",
    );
    expect(merged.result).toEqual({
      bookmarkedModulesAdded: 1,
      completedModulesAdded: 2,
      assessmentDraftsAdded: 1,
      assessmentDraftConflicts: 1,
    });
  });

  it("is idempotent and does not mutate the guest source", () => {
    const first = mergeGuestLearningState(current, guest);
    const second = mergeGuestLearningState(first.state, guest);

    expect(second.state).toEqual(first.state);
    expect(second.result).toEqual({
      bookmarkedModulesAdded: 0,
      completedModulesAdded: 0,
      assessmentDraftsAdded: 0,
      assessmentDraftConflicts: 1,
    });
    expect(guest.assessmentResponses["m01-01-product-decomposition"]?.responseText).toBe(
      "guest conflict",
    );
  });
});
