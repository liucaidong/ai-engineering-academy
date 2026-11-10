import { describe, expect, it } from "vitest";
import { getLearningStorageKeys } from "./useLearningState";

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
