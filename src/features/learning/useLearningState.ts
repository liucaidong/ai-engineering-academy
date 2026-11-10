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

const STORAGE_KEYS = {
  bookmarks: "ai-engineering-academy:bookmarks:v1",
  progress: "ai-engineering-academy:progress:v1",
  assessments: "ai-engineering-academy:assessments:v1",
} as const;

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
 * Owns browser-local learning state and its persistence boundary.
 * This state is device-local and is not an account-level synchronization service.
 */
export function useLearningState() {
  const [bookmarkedModuleIds, setBookmarkedModuleIds] = useState<string[]>(() =>
    loadBookmarks(readStorage(STORAGE_KEYS.bookmarks), MODULE_IDS),
  );

  useEffect(() => {
    writeStorage(STORAGE_KEYS.bookmarks, serializeBookmarks(bookmarkedModuleIds));
  }, [bookmarkedModuleIds]);

  const [completedModules, setCompletedModules] = useState<string[]>(() =>
    loadProgress(readStorage(STORAGE_KEYS.progress), MODULE_IDS),
  );

  useEffect(() => {
    writeStorage(STORAGE_KEYS.progress, serializeProgress(completedModules));
  }, [completedModules]);

  const [assessmentResponses, setAssessmentResponses] = useState<
    Record<string, AssessmentResponse>
  >(() => loadAssessmentProgress(readStorage(STORAGE_KEYS.assessments)));

  useEffect(() => {
    writeStorage(STORAGE_KEYS.assessments, serializeAssessmentProgress(assessmentResponses));
  }, [assessmentResponses]);

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
