import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import type { CourseRelease } from "../../api";
import type { AssessmentResponse } from "../../lib/assessmentProgress";
import {
  acknowledgeAssessmentDrafts,
  loadRemoteAssessmentDrafts,
  mergeRemoteAssessmentDrafts,
  syncLocalAssessmentDrafts,
} from "./assessmentDraftSync";

export type AssessmentSyncStatus = "disabled" | "waiting-release" | "loading" | "ready" | "error";

interface AssessmentSyncState {
  status: AssessmentSyncStatus;
  releaseId: string | null;
  tenantId: string | null;
  syncing: boolean;
  error: string | null;
}

interface UseLearnerAssessmentSyncOptions {
  enabled: boolean;
  tenantId: string | null;
  release: CourseRelease | null;
  assessmentResponses: Record<string, AssessmentResponse>;
  setAssessmentResponses: Dispatch<SetStateAction<Record<string, AssessmentResponse>>>;
}

export function useLearnerAssessmentSync({
  enabled,
  tenantId,
  release,
  assessmentResponses,
  setAssessmentResponses,
}: UseLearnerAssessmentSyncOptions) {
  const [retryKey, setRetryKey] = useState(0);
  const [state, setState] = useState<AssessmentSyncState>({
    status: enabled ? "waiting-release" : "disabled",
    releaseId: null,
    tenantId: null,
    syncing: false,
    error: null,
  });

  useEffect(() => {
    if (!enabled) {
      setState({
        status: "disabled",
        releaseId: null,
        tenantId: null,
        syncing: false,
        error: null,
      });
      return;
    }
    if (!tenantId || !release) {
      setState({
        status: "waiting-release",
        releaseId: null,
        tenantId,
        syncing: false,
        error: null,
      });
      return;
    }

    const controller = new AbortController();
    setState({
      status: "loading",
      releaseId: release.id,
      tenantId,
      syncing: false,
      error: null,
    });
    void loadRemoteAssessmentDrafts(tenantId, release, controller.signal).then(
      (drafts) => {
        if (controller.signal.aborted) return;
        setAssessmentResponses((current) => mergeRemoteAssessmentDrafts(current, drafts, release));
        setState({
          status: "ready",
          releaseId: release.id,
          tenantId,
          syncing: false,
          error: null,
        });
      },
      (error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          releaseId: release.id,
          tenantId,
          syncing: false,
          error:
            error instanceof Error ? error.message : `测评草稿加载失败（第 ${retryKey + 1} 次）。`,
        });
      },
    );
    return () => controller.abort();
  }, [enabled, tenantId, release, retryKey, setAssessmentResponses]);

  useEffect(() => {
    if (
      !enabled ||
      !tenantId ||
      !release ||
      state.status !== "ready" ||
      state.releaseId !== release.id ||
      state.tenantId !== tenantId ||
      !Object.values(assessmentResponses).some((value) => value.syncState !== "synced")
    ) {
      return;
    }

    const controller = new AbortController();
    const debounce = setTimeout(() => {
      setState((current) => ({ ...current, syncing: true, error: null }));
      void syncLocalAssessmentDrafts(
        tenantId,
        release,
        assessmentResponses,
        controller.signal,
      ).then(
        (acknowledgements) => {
          if (controller.signal.aborted) return;
          setAssessmentResponses((current) =>
            acknowledgeAssessmentDrafts(current, acknowledgements),
          );
          setState((current) => ({ ...current, syncing: false, error: null }));
        },
        (error: unknown) => {
          if (controller.signal.aborted) return;
          setState((current) => ({
            ...current,
            status: "error",
            syncing: false,
            error: error instanceof Error ? error.message : "测评草稿同步失败。",
          }));
        },
      );
    }, 700);
    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [
    enabled,
    tenantId,
    release,
    assessmentResponses,
    state.status,
    state.releaseId,
    state.tenantId,
    setAssessmentResponses,
  ]);

  return {
    ...state,
    retry: () => setRetryKey((current) => current + 1),
  };
}
