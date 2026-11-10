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
  const [bookmarkedModuleIds, setBookmarkedModuleIds] = useState<string[]>(() =>
    loadBookmarks(loadScopedValue("bookmarks", scope), MODULE_IDS),
  );
  const [completedModules, setCompletedModules] = useState<string[]>(() =>
    loadProgress(loadScopedValue("progress", scope), MODULE_IDS),
  );
  const [assessmentResponses, setAssessmentResponses] = useState<
    Record<string, AssessmentResponse>
  >(() => loadAssessmentProgress(loadScopedValue("assessments", scope)));

  // Reset synchronously before effects run so a newly authenticated account never
  // receives another account's in-memory state or writes it into the new scope.
  if (activeScope !== scope) {
    setActiveScope(scope);
    setBookmarkedModuleIds(loadBookmarks(loadScopedValue("bookmarks", scope), MODULE_IDS));
    setCompletedModules(loadProgress(loadScopedValue("progress", scope), MODULE_IDS));
    setAssessmentResponses(loadAssessmentProgress(loadScopedValue("assessments", scope)));
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
