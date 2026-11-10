import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { academyApi, type CourseRelease } from "../../api";
import {
  loadRemoteCompletedModules,
  reconcileLearningProgress,
  resolveCurrentCourseRelease,
} from "./learnerProgressSync";

export type LearnerSyncStatus = "disabled" | "waiting-tenant" | "loading" | "ready" | "error";

interface LearnerSyncState {
  status: LearnerSyncStatus;
  release: CourseRelease | null;
  tenantId: string | null;
  error: string | null;
  syncing: boolean;
}

interface UseLearnerProgressSyncOptions {
  enabled: boolean;
  tenantId: string | null;
  completedModules: string[];
  setCompletedModules: Dispatch<SetStateAction<string[]>>;
}

export function useLearnerProgressSync({
  enabled,
  tenantId,
  completedModules,
  setCompletedModules,
}: UseLearnerProgressSyncOptions) {
  const [retryKey, setRetryKey] = useState(0);
  const [state, setState] = useState<LearnerSyncState>({
    status: enabled ? "waiting-tenant" : "disabled",
    release: null,
    tenantId: null,
    error: null,
    syncing: false,
  });

  useEffect(() => {
    if (!enabled) {
      setState({ status: "disabled", release: null, tenantId: null, error: null, syncing: false });
      return;
    }
    if (!tenantId) {
      setState({
        status: "waiting-tenant",
        release: null,
        tenantId: null,
        error: null,
        syncing: false,
      });
      return;
    }

    const controller = new AbortController();
    setState({ status: "loading", release: null, tenantId, error: null, syncing: false });
    void (async () => {
      try {
        const release = await resolveCurrentCourseRelease(tenantId, controller.signal);
        const remoteCompletedModuleIds = await loadRemoteCompletedModules(
          tenantId,
          release.id,
          controller.signal,
          academyApi,
        );
        if (controller.signal.aborted) return;
        setCompletedModules((current) => {
          const merged = [...new Set([...current, ...remoteCompletedModuleIds])];
          return merged.length === current.length ? current : merged;
        });
        setState({ status: "ready", release, tenantId, error: null, syncing: false });
      } catch (error) {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          release: null,
          tenantId,
          error:
            error instanceof Error
              ? error.message
              : `学习记录同步初始化失败（第 ${retryKey + 1} 次）。`,
          syncing: false,
        });
      }
    })();
    return () => controller.abort();
  }, [enabled, tenantId, retryKey, setCompletedModules]);

  useEffect(() => {
    if (
      !enabled ||
      !tenantId ||
      state.status !== "ready" ||
      state.tenantId !== tenantId ||
      !state.release
    ) {
      return;
    }

    const controller = new AbortController();
    setState((current) => ({ ...current, syncing: true, error: null }));
    void reconcileLearningProgress(
      tenantId,
      state.release.id,
      completedModules,
      controller.signal,
    ).then(
      () => {
        if (!controller.signal.aborted) {
          setState((current) => ({ ...current, syncing: false, error: null }));
        }
      },
      (error: unknown) => {
        if (!controller.signal.aborted) {
          setState((current) => ({
            ...current,
            status: "error",
            syncing: false,
            error: error instanceof Error ? error.message : "学习记录同步失败。",
          }));
        }
      },
    );
    return () => controller.abort();
  }, [enabled, tenantId, completedModules, state.status, state.tenantId, state.release]);

  return {
    ...state,
    retry: () => setRetryKey((current) => current + 1),
  };
}
