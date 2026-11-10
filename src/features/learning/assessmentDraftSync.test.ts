import { describe, expect, it, vi } from "vitest";
import { ApiClientError, type AssessmentAttempt, type CourseRelease } from "../../api";
import { loadFullCourse } from "../../data/loadFullCourse";
import type { AssessmentResponse } from "../../lib/assessmentProgress";
import {
  type AssessmentDraftApi,
  acknowledgeAssessmentDrafts,
  mergeRemoteAssessmentDrafts,
  syncLocalAssessmentDrafts,
} from "./assessmentDraftSync";

const tenantId = "e0b48e25-c3c7-4c15-85c5-65a3a6ac8d09";
const releaseId = "d65ef96e-947d-4d37-a2d6-7d807c93a6d0";
const assessmentId = "m01-01-product-decomposition";

async function fixture() {
  const content = await loadFullCourse();
  const firstAssessment = content.modules[0]?.lessons[0]?.assessments[0];
  if (!firstAssessment) throw new Error("Expected a course assessment fixture");
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
  return { release, assessmentId: firstAssessment.id };
}

function attempt(id: string, updatedAt: string, responseText: string): AssessmentAttempt {
  return {
    id,
    course_release_id: releaseId,
    assessment_key: assessmentId,
    attempt_number: 1,
    status: "draft",
    grading_mode: "self_review",
    response: { responseText },
    rubric_self_review: { reviewedCriteria: ["correctness"] },
    score: null,
    submitted_at: null,
    graded_at: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: updatedAt,
  };
}

const localDraft = (responseText: string, overrides: Partial<AssessmentResponse> = {}) => ({
  responseText,
  reviewedCriteria: ["correctness"],
  updatedAt: "2026-01-03T00:00:00Z",
  syncState: "pending" as const,
  ...overrides,
});

describe("assessment draft synchronization", () => {
  it("hydrates missing local drafts from the server", async () => {
    const { release, assessmentId: key } = await fixture();
    const remote = attempt("attempt-1", "2026-01-02T00:00:00Z", "remote answer");
    const merged = mergeRemoteAssessmentDrafts({}, [remote], release);

    expect(merged[key]).toMatchObject({
      responseText: "remote answer",
      reviewedCriteria: ["correctness"],
      syncState: "synced",
      serverUpdatedAt: remote.updated_at,
    });
  });

  it("preserves pending local edits and prefers a newer remote revision over synced state", async () => {
    const { release, assessmentId: key } = await fixture();
    const remote = attempt("attempt-1", "2026-01-04T00:00:00Z", "remote answer");
    const pending = mergeRemoteAssessmentDrafts(
      { [key]: localDraft("local answer") },
      [remote],
      release,
    );
    const synced = mergeRemoteAssessmentDrafts(
      {
        [key]: localDraft("old answer", {
          syncState: "synced",
          serverUpdatedAt: "2026-01-02T00:00:00Z",
        }),
      },
      [remote],
      release,
    );

    expect(pending[key]?.responseText).toBe("local answer");
    expect(synced[key]?.responseText).toBe("remote answer");
  });

  it("updates a known server draft using optimistic concurrency", async () => {
    const { release, assessmentId: key } = await fixture();
    const remote = attempt("attempt-1", "2026-01-02T00:00:00Z", "old answer");
    const api = {
      listAssessmentDrafts: vi.fn().mockResolvedValue([remote]),
      updateAssessmentAttemptDraft: vi.fn().mockResolvedValue({
        ...remote,
        response: { responseText: "new answer" },
        updated_at: "2026-01-05T00:00:00Z",
      }),
      createAssessmentAttempt: vi.fn(),
    } as unknown as AssessmentDraftApi;

    const acknowledgements = await syncLocalAssessmentDrafts(
      tenantId,
      release,
      {
        [key]: localDraft("new answer", { serverUpdatedAt: remote.updated_at }),
      },
      undefined,
      api,
    );

    expect(api.updateAssessmentAttemptDraft).toHaveBeenCalledWith(
      tenantId,
      remote.id,
      {
        response: { responseText: "new answer" },
        rubric_self_review: { reviewedCriteria: ["correctness"] },
        expected_updated_at: remote.updated_at,
      },
      undefined,
    );
    expect(api.createAssessmentAttempt).not.toHaveBeenCalled();
    expect(acknowledgements[0]?.updatedAt).toBe("2026-01-05T00:00:00Z");
  });

  it("creates a server draft when a local assessment has never been synchronized", async () => {
    const { release, assessmentId: key } = await fixture();
    const created = {
      ...attempt("attempt-1", "2026-01-05T00:00:00Z", "new local answer"),
      assessment_key: key,
    };
    const api = {
      listAssessmentDrafts: vi.fn().mockResolvedValue([]),
      createAssessmentAttempt: vi.fn().mockResolvedValue(created),
    } as unknown as AssessmentDraftApi;

    const acknowledgements = await syncLocalAssessmentDrafts(
      tenantId,
      release,
      { [key]: localDraft("new local answer") },
      undefined,
      api,
    );

    expect(api.createAssessmentAttempt).toHaveBeenCalledWith(
      tenantId,
      {
        course_release_id: release.id,
        assessment_key: key,
        response: { responseText: "new local answer" },
        rubric_self_review: { reviewedCriteria: ["correctness"] },
      },
      undefined,
    );
    expect(acknowledgements[0]?.updatedAt).toBe(created.updated_at);
  });

  it("preserves concurrent remote edits by creating a new attempt after a 409", async () => {
    const { release, assessmentId: key } = await fixture();
    const remote = attempt("attempt-1", "2026-01-02T00:00:00Z", "remote answer");
    const updated = {
      ...remote,
      id: "attempt-2",
      attempt_number: 2,
      updated_at: "2026-01-06T00:00:00Z",
    };
    const api = {
      listAssessmentDrafts: vi.fn().mockResolvedValue([remote]),
      updateAssessmentAttemptDraft: vi
        .fn()
        .mockRejectedValue(new ApiClientError("conflict", "conflict", 409)),
      createAssessmentAttempt: vi.fn().mockResolvedValue(updated),
    } as unknown as AssessmentDraftApi;

    const acknowledgements = await syncLocalAssessmentDrafts(
      tenantId,
      release,
      { [key]: localDraft("local answer", { serverUpdatedAt: remote.updated_at }) },
      undefined,
      api,
    );

    expect(api.createAssessmentAttempt).toHaveBeenCalledWith(
      tenantId,
      {
        course_release_id: release.id,
        assessment_key: key,
        response: { responseText: "local answer" },
        rubric_self_review: { reviewedCriteria: ["correctness"] },
      },
      undefined,
    );
    expect(acknowledgements[0]?.updatedAt).toBe(updated.updated_at);
  });

  it("does not mark an edited-again local value as synced", () => {
    const original = localDraft("sent answer");
    const changed = localDraft("newer local answer");
    const result = acknowledgeAssessmentDrafts({ [assessmentId]: changed }, [
      {
        assessmentId,
        responseText: original.responseText,
        reviewedCriteria: original.reviewedCriteria,
        updatedAt: "2026-01-05T00:00:00Z",
      },
    ]);

    expect(result[assessmentId]?.syncState).toBe("pending");
  });
});
