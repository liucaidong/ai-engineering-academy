import { useEffect, useState } from "react";
import type { AssessmentResponse } from "../../lib/assessmentProgress";
import {
  type GuestLearningImportResult,
  getGuestImportMarkerKey,
  type LocalLearningState,
  loadLocalLearningState,
  mergeGuestLearningState,
} from "./useLearningState";

interface UseGuestLearningImportOptions {
  enabled: boolean;
  scope: string;
  current: LocalLearningState;
  setBookmarkedModuleIds: (value: string[]) => void;
  setCompletedModules: (value: string[]) => void;
  setAssessmentResponses: (value: Record<string, AssessmentResponse>) => void;
}

function readMarker(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeMarker(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Import remains idempotent even when marker persistence is unavailable.
  }
}

function fingerprint(value: LocalLearningState): string {
  return JSON.stringify(value);
}

export function useGuestLearningImport({
  enabled,
  scope,
  current,
  setBookmarkedModuleIds,
  setCompletedModules,
  setAssessmentResponses,
}: UseGuestLearningImportOptions) {
  const [guest, setGuest] = useState<LocalLearningState>(() => loadLocalLearningState("guest"));
  const [importResult, setImportResult] = useState<GuestLearningImportResult | null>(null);
  const [importedFingerprint, setImportedFingerprint] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setImportResult(null);
      setImportedFingerprint(null);
      return;
    }
    const nextGuest = loadLocalLearningState("guest");
    setGuest(nextGuest);
    setImportedFingerprint(readMarker(getGuestImportMarkerKey(scope)));
  }, [enabled, scope]);

  const guestFingerprint = fingerprint(guest);
  const hasGuestData =
    guest.bookmarkedModuleIds.length > 0 ||
    guest.completedModules.length > 0 ||
    Object.keys(guest.assessmentResponses).length > 0;

  const importGuestData = () => {
    const latestGuest = loadLocalLearningState("guest");
    const merged = mergeGuestLearningState(current, latestGuest);
    setBookmarkedModuleIds(merged.state.bookmarkedModuleIds);
    setCompletedModules(merged.state.completedModules);
    setAssessmentResponses(merged.state.assessmentResponses);
    setImportResult(merged.result);
    setGuest(latestGuest);
    const nextFingerprint = fingerprint(latestGuest);
    if (merged.result.assessmentDraftConflicts === 0) {
      writeMarker(getGuestImportMarkerKey(scope), nextFingerprint);
      setImportedFingerprint(nextFingerprint);
    }
  };

  return {
    enabled,
    hasGuestData,
    alreadyImported: importedFingerprint === guestFingerprint,
    importResult,
    importGuestData,
  };
}
