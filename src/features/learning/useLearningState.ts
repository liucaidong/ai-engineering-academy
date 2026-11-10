import { useEffect, useState } from "react";
import { courseCatalog } from "../../data/courseCatalog";
import {
  type AssessmentResponse,
  loadAssessmentProgress,
  serializeAssessmentProgress,
} from "../../lib/assessmentProgress";
import { loadBookmarks, serializeBookmarks } from "../../lib/bookmarks";
import { loadProgress, serializeProgress } from "../../lib/progress";

const MODULE_IDS = courseCatalog.modules.map((module) => module.id);

const LEGACY_STORAGE_KEYS = {
  bookmarks: "ai-engineering-academy:bookmarks:v1",
  progress: "ai-engineering-academy:progress:v1",
  assessments: "ai-engineering-academy:assessments:v1",
} as const;

export type LearningStorageScope = string;

export function getLearningStorageKeys(scope: LearningStorageScope) {
  const encodedScope = encodeURIComponent(scope);
  return {
    bookmarks: `ai-engineering-academy:${encodedScope}:bookmarks:v1`,
    progress: `ai-engineering-academy:${encodedScope}:progress:v1`,
    assessments: `ai-engineering-academy:${encodedScope}:assessments:v1`,
  } as const;
}

function loadScopedValue(key: keyof typeof LEGACY_STORAGE_KEYS, scope: LearningStorageScope) {
  const scoped = readStorage(getLearningStorageKeys(scope)[key]);
  if (scoped !== null || scope !== "guest") return scoped;
  return readStorage(LEGACY_STORAGE_KEYS[key]);
}

function readStorage(key: string): string | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export interface LocalLearningState {
  bookmarkedModuleIds: string[];
  completedModules: string[];
  assessmentResponses: Record<string, AssessmentResponse>;
}

export function loadLocalLearningState(scope: LearningStorageScope): LocalLearningState {
  return {
    bookmarkedModuleIds: loadBookmarks(loadScopedValue("bookmarks", scope), MODULE_IDS),
    completedModules: loadProgress(loadScopedValue("progress", scope), MODULE_IDS),
    assessmentResponses: loadAssessmentProgress(loadScopedValue("assessments", scope)),
  };
}

export interface GuestLearningImportResult {
  bookmarkedModulesAdded: number;
  completedModulesAdded: number;
  assessmentDraftsAdded: number;
  assessmentDraftConflicts: number;
}

function sameAssessmentResponse(left: AssessmentResponse, right: AssessmentResponse): boolean {
  return (
    left.responseText === right.responseText &&
    JSON.stringify(left.reviewedCriteria) === JSON.stringify(right.reviewedCriteria)
  );
}

export function mergeGuestLearningState(
  current: LocalLearningState,
  guest: LocalLearningState,
): { state: LocalLearningState; result: GuestLearningImportResult } {
  const bookmarkedModuleIds = [
    ...new Set([...current.bookmarkedModuleIds, ...guest.bookmarkedModuleIds]),
  ];
  const completedModules = [...new Set([...current.completedModules, ...guest.completedModules])];
  const assessmentResponses = { ...current.assessmentResponses };
  let assessmentDraftsAdded = 0;
  let assessmentDraftConflicts = 0;

  for (const [assessmentId, guestResponse] of Object.entries(guest.assessmentResponses)) {
    const existing = assessmentResponses[assessmentId];
    if (!existing) {
      assessmentResponses[assessmentId] = guestResponse;
      assessmentDraftsAdded += 1;
    } else if (!sameAssessmentResponse(existing, guestResponse)) {
      assessmentDraftConflicts += 1;
    }
  }

  return {
    state: { bookmarkedModuleIds, completedModules, assessmentResponses },
    result: {
      bookmarkedModulesAdded: bookmarkedModuleIds.length - current.bookmarkedModuleIds.length,
      completedModulesAdded: completedModules.length - current.completedModules.length,
      assessmentDraftsAdded,
      assessmentDraftConflicts,
    },
  };
}

export function getGuestImportMarkerKey(scope: LearningStorageScope): string {
  return `${getLearningStorageKeys(scope).bookmarks.replace(":bookmarks:v1", "")}:guest-import:v1`;
}

function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage restrictions must never block access to learning content.
  }
}

/**
 * Owns account/tenant-scoped browser learning state and its persistence boundary.
 * Cloud synchronization is handled separately by useLearnerProgressSync.
 */
export function useLearningState(scope: LearningStorageScope = "guest") {
  const [activeScope, setActiveScope] = useState(scope);
  const [bookmarkedModuleIds, setBookmarkedModuleIds] = useState<string[]>(
    () => loadLocalLearningState(scope).bookmarkedModuleIds,
  );
  const [completedModules, setCompletedModules] = useState<string[]>(
    () => loadLocalLearningState(scope).completedModules,
  );
  const [assessmentResponses, setAssessmentResponses] = useState<
    Record<string, AssessmentResponse>
  >(() => loadLocalLearningState(scope).assessmentResponses);

  // Reset synchronously before effects run so a newly authenticated account never
  // receives another account's in-memory state or writes it into the new scope.
  if (activeScope !== scope) {
    setActiveScope(scope);
    const next = loadLocalLearningState(scope);
    setBookmarkedModuleIds(next.bookmarkedModuleIds);
    setCompletedModules(next.completedModules);
    setAssessmentResponses(next.assessmentResponses);
  }

  useEffect(() => {
    writeStorage(getLearningStorageKeys(scope).bookmarks, serializeBookmarks(bookmarkedModuleIds));
  }, [scope, bookmarkedModuleIds]);

  useEffect(() => {
    writeStorage(getLearningStorageKeys(scope).progress, serializeProgress(completedModules));
  }, [scope, completedModules]);

  useEffect(() => {
    writeStorage(
      getLearningStorageKeys(scope).assessments,
      serializeAssessmentProgress(assessmentResponses),
    );
  }, [scope, assessmentResponses]);

  const progressPercent = Math.round((completedModules.length / MODULE_IDS.length) * 100);

  return {
    assessmentResponses,
    bookmarkedModuleIds,
    completedModules,
    progressPercent,
    setAssessmentResponses,
    setBookmarkedModuleIds,
    setCompletedModules,
  };
}
