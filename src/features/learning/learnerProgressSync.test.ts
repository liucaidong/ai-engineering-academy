import { describe, expect, it, vi } from "vitest";
import type { CourseRelease, LearningProgress } from "../../api";
import { loadFullCourse } from "../../data/loadFullCourse";
import {
  type LearnerProgressApi,
  reconcileLearningProgress,
  resolveCurrentCourseRelease,
} from "./learnerProgressSync";

const releaseId = "d65ef96e-947d-4d37-a2d6-7d807c93a6d0";
const tenantId = "e0b48e25-c3c7-4c15-85c5-65a3a6ac8d09";

function progress(
  moduleKey: string,
  status: string,
  id = `progress-${moduleKey}`,
): LearningProgress {
  return {
    id,
    course_release_id: releaseId,
    module_key: moduleKey,
    completion_status: status,
    started_at: "2026-01-01T00:00:00Z",
    completed_at: status === "completed" ? "2026-01-02T00:00:00Z" : null,
    last_accessed_at: "2026-01-02T00:00:00Z",
    updated_at: "2026-01-02T00:00:00Z",
  };
}

describe("learner progress synchronization", () => {
  it("resolves only the exact published version and validates its complete snapshot", async () => {
    const content = await loadFullCourse();
    const release: CourseRelease = {
      id: releaseId,
      course_key: content.id,
      version: content.version,
      schema_version: content.schemaVersion,
      status: "published",
      content,
      content_sha256: "a".repeat(64),
      created_at: "2026-01-01T00:00:00Z",
      published_at: "2026-01-02T00:00:00Z",
    };
    const api = {
      listPublishedCourseReleases: vi.fn().mockResolvedValue([
        { ...release, version: "0.40.8" },
        {
          id: releaseId,
          course_key: release.course_key,
          version: release.version,
          schema_version: release.schema_version,
          content_sha256: release.content_sha256,
          published_at: release.published_at,
        },
      ]),
      getCourseRelease: vi.fn().mockResolvedValue(release),
    } as unknown as LearnerProgressApi;

    await expect(resolveCurrentCourseRelease(tenantId, undefined, api)).resolves.toEqual(release);
    expect(api.getCourseRelease).toHaveBeenCalledWith(tenantId, releaseId, undefined);
  });

  it("fails closed when the current frontend version has no exact published release", async () => {
    const api = {
      listPublishedCourseReleases: vi.fn().mockResolvedValue([]),
      getCourseRelease: vi.fn(),
    } as unknown as LearnerProgressApi;

    await expect(resolveCurrentCourseRelease(tenantId, undefined, api)).rejects.toThrow("尚未发布");
    expect(api.getCourseRelease).not.toHaveBeenCalled();
  });

  it("completes desired modules, creates missing records and reopens removed completions", async () => {
    const rows = [
      progress("M01", "completed"),
      progress("M02", "in_progress"),
      progress("M04", "completed"),
    ];
    const api = {
      listLearningProgress: vi.fn().mockResolvedValue(rows),
      beginLearningProgress: vi.fn().mockResolvedValue(progress("M03", "in_progress")),
      completeLearningProgress: vi
        .fn()
        .mockImplementation(async (_tenant: string, id: string) =>
          progress(id.replace("progress-", ""), "completed", id),
        ),
      reopenLearningProgress: vi
        .fn()
        .mockImplementation(async (_tenant: string, id: string) =>
          progress(id.replace("progress-", ""), "in_progress", id),
        ),
    } as unknown as LearnerProgressApi;

    const result = await reconcileLearningProgress(
      tenantId,
      releaseId,
      ["M02", "M03"],
      undefined,
      api,
    );

    expect(api.beginLearningProgress).toHaveBeenCalledWith(
      tenantId,
      { course_release_id: releaseId, module_key: "M03" },
      undefined,
    );
    expect(api.completeLearningProgress).toHaveBeenCalledTimes(2);
    expect(api.reopenLearningProgress).toHaveBeenCalledTimes(2);
    expect(result.remoteCompletedModuleIds).toEqual(["M02", "M03"]);
  });
});
