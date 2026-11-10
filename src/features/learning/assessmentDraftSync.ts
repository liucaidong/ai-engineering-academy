import {
  type AcademyApiClient,
  ApiClientError,
  type AssessmentAttempt,
  academyApi,
  type CourseRelease,
} from "../../api";
import type { AssessmentResponse } from "../../lib/assessmentProgress";
import { CourseSchema } from "../../types/course";

export type AssessmentDraftApi = Pick<
  AcademyApiClient,
  "listAssessmentDrafts" | "createAssessmentAttempt" | "updateAssessmentAttemptDraft"
>;

export type AssessmentResponses = Record<string, AssessmentResponse>;

export interface AssessmentDraftAcknowledgement {
  assessmentId: string;
  responseText: string;
  reviewedCriteria: string[];
  updatedAt: string;
}

function knownAssessmentIds(release: CourseRelease): Set<string> {
  const parsed = CourseSchema.safeParse(release.content);
  if (
    !parsed.success ||
    parsed.data.id !== release.course_key ||
    parsed.data.version !== release.version
  ) {
    throw new Error("课程快照无法通过测评草稿同步校验。");
  }
  return new Set(
    parsed.data.modules.flatMap((module) =>
      module.lessons.flatMap((lesson) => lesson.assessments.map((assessment) => assessment.id)),
    ),
  );
}

function toLocalDraft(attempt: AssessmentAttempt): AssessmentResponse {
  const responseText = attempt.response.responseText;
  const reviewed =
    attempt.rubric_self_review?.reviewedCriteria ?? attempt.response.reviewedCriteria;
  return {
    responseText: typeof responseText === "string" ? responseText : "",
    reviewedCriteria: Array.isArray(reviewed)
      ? reviewed.filter((item): item is string => typeof item === "string")
      : [],
    updatedAt: attempt.updated_at,
    serverUpdatedAt: attempt.updated_at,
    syncState: "synced",
  };
}

function toApiDraft(value: AssessmentResponse) {
  return {
    response: { responseText: value.responseText },
    rubric_self_review: { reviewedCriteria: value.reviewedCriteria },
  };
}

function sameDraft(left: AssessmentResponse, right: AssessmentResponse): boolean {
  return (
    left.responseText === right.responseText &&
    JSON.stringify(left.reviewedCriteria) === JSON.stringify(right.reviewedCriteria)
  );
}

export async function loadRemoteAssessmentDrafts(
  tenantId: string,
  release: CourseRelease,
  signal?: AbortSignal,
  api: AssessmentDraftApi = academyApi,
): Promise<AssessmentAttempt[]> {
  knownAssessmentIds(release);
  return api.listAssessmentDrafts(tenantId, release.id, signal);
}

/** Remote changes replace a previously synced local value; unsynced local edits are preserved. */
export function mergeRemoteAssessmentDrafts(
  local: AssessmentResponses,
  remoteDrafts: readonly AssessmentAttempt[],
  release: CourseRelease,
): AssessmentResponses {
  const known = knownAssessmentIds(release);
  const merged = { ...local };
  for (const attempt of remoteDrafts) {
    if (attempt.status !== "draft" || !known.has(attempt.assessment_key)) continue;
    const localDraft = local[attempt.assessment_key];
    const remoteDraft = toLocalDraft(attempt);
    if (!localDraft) {
      merged[attempt.assessment_key] = remoteDraft;
      continue;
    }
    if (localDraft.syncState === "synced") {
      if (localDraft.serverUpdatedAt !== attempt.updated_at) {
        merged[attempt.assessment_key] = remoteDraft;
      }
    }
    // Legacy and pending local drafts are never silently overwritten. If their
    // server revision is stale, sync will create a new attempt to preserve both.
  }
  return merged;
}

export async function syncLocalAssessmentDrafts(
  tenantId: string,
  release: CourseRelease,
  local: AssessmentResponses,
  signal?: AbortSignal,
  api: AssessmentDraftApi = academyApi,
): Promise<AssessmentDraftAcknowledgement[]> {
  const known = knownAssessmentIds(release);
  const remoteDrafts = await api.listAssessmentDrafts(tenantId, release.id, signal);
  const remoteByAssessment = new Map(
    remoteDrafts
      .filter((attempt) => attempt.status === "draft" && known.has(attempt.assessment_key))
      .map((attempt) => [attempt.assessment_key, attempt]),
  );
  const acknowledgements: AssessmentDraftAcknowledgement[] = [];

  for (const [assessmentId, value] of Object.entries(local)) {
    if (signal?.aborted) throw signal.reason;
    if (!known.has(assessmentId) || value.syncState === "synced") continue;

    const payload = toApiDraft(value);
    const remote = remoteByAssessment.get(assessmentId);
    let saved: AssessmentAttempt;

    if (remote && value.serverUpdatedAt === remote.updated_at) {
      if (sameDraft(value, toLocalDraft(remote))) {
        saved = remote;
      } else {
        try {
          saved = await api.updateAssessmentAttemptDraft(
            tenantId,
            remote.id,
            { ...payload, expected_updated_at: remote.updated_at },
            signal,
          );
        } catch (error) {
          if (!(error instanceof ApiClientError) || error.category !== "conflict") throw error;
          // Another device changed the draft. Preserve this local edit as a new
          // attempt rather than overwriting the concurrent server revision.
          saved = await api.createAssessmentAttempt(
            tenantId,
            {
              course_release_id: release.id,
              assessment_key: assessmentId,
              ...payload,
            },
            signal,
          );
        }
      }
    } else if (remote && sameDraft(value, toLocalDraft(remote))) {
      // A prior create may have committed while its response was lost. Detect it
      // before retrying so the API's content-idempotent create path is reused.
      saved = remote;
    } else {
      saved = await api.createAssessmentAttempt(
        tenantId,
        {
          course_release_id: release.id,
          assessment_key: assessmentId,
          ...payload,
        },
        signal,
      );
    }

    acknowledgements.push({
      assessmentId,
      responseText: value.responseText,
      reviewedCriteria: [...value.reviewedCriteria],
      updatedAt: saved.updated_at,
    });
  }

  return acknowledgements;
}

export function acknowledgeAssessmentDrafts(
  current: AssessmentResponses,
  acknowledgements: readonly AssessmentDraftAcknowledgement[],
): AssessmentResponses {
  let changed = false;
  const next = { ...current };
  for (const acknowledgement of acknowledgements) {
    const value = current[acknowledgement.assessmentId];
    if (
      !value ||
      value.responseText !== acknowledgement.responseText ||
      JSON.stringify(value.reviewedCriteria) !== JSON.stringify(acknowledgement.reviewedCriteria)
    ) {
      continue;
    }
    next[acknowledgement.assessmentId] = {
      ...value,
      syncState: "synced",
      serverUpdatedAt: acknowledgement.updatedAt,
    };
    changed = true;
  }
  return changed ? next : current;
}
