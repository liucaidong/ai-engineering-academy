import type { Dispatch, SetStateAction } from "react";
import type { AssessmentResponse } from "../../lib/assessmentProgress";
import SessionTenantControl from "../session/SessionTenantControl";
import type { AcademySession } from "../session/useAcademySession";
import { useGuestLearningImport } from "./useGuestLearningImport";
import { useLearnerAssessmentSync } from "./useLearnerAssessmentSync";
import { useLearnerProgressSync } from "./useLearnerProgressSync";

const AUTH_UI_ENABLED = import.meta.env.VITE_ACADEMY_AUTH_UI_ENABLED === "true";
const LEARNER_SYNC_ENABLED =
  AUTH_UI_ENABLED && import.meta.env.VITE_ACADEMY_LEARNER_SYNC_ENABLED === "true";

interface LearningAccountControlsProps {
  session: AcademySession;
  learningScope: string;
  bookmarkedModuleIds: string[];
  completedModules: string[];
  assessmentResponses: Record<string, AssessmentResponse>;
  setBookmarkedModuleIds: Dispatch<SetStateAction<string[]>>;
  setCompletedModules: Dispatch<SetStateAction<string[]>>;
  setAssessmentResponses: Dispatch<SetStateAction<Record<string, AssessmentResponse>>>;
}

export default function LearningAccountControls({
  session,
  learningScope,
  bookmarkedModuleIds,
  completedModules,
  assessmentResponses,
  setBookmarkedModuleIds,
  setCompletedModules,
  setAssessmentResponses,
}: LearningAccountControlsProps) {
  const tenantId = session.status === "authenticated" ? session.selectedTenantId : null;
  const learnerSync = useLearnerProgressSync({
    enabled: LEARNER_SYNC_ENABLED,
    tenantId,
    completedModules,
    setCompletedModules,
  });
  const assessmentSync = useLearnerAssessmentSync({
    enabled: LEARNER_SYNC_ENABLED,
    tenantId,
    release: learnerSync.release,
    assessmentResponses,
    setAssessmentResponses,
  });
  const guestImport = useGuestLearningImport({
    enabled: session.status === "authenticated" && Boolean(session.selectedTenantId),
    scope: learningScope,
    current: { bookmarkedModuleIds, completedModules, assessmentResponses },
    setBookmarkedModuleIds,
    setCompletedModules,
    setAssessmentResponses,
  });

  return (
    <>
      <SessionTenantControl session={session} />
      {guestImport.enabled && guestImport.hasGuestData && !guestImport.alreadyImported && (
        <div className="account-control">
          <span className="account-state">发现未导入的访客学习记录</span>
          <button className="account-action" type="button" onClick={guestImport.importGuestData}>
            导入访客记录
          </button>
        </div>
      )}
      {guestImport.importResult && (
        <div className="account-control" role="status">
          <span className="account-state">
            {guestImport.importResult.assessmentDraftConflicts > 0
              ? `有 ${guestImport.importResult.assessmentDraftConflicts} 份测评草稿冲突，未覆盖账户数据；访客原件已保留。`
              : `访客记录导入完成：新增收藏 ${guestImport.importResult.bookmarkedModulesAdded} 项、完成记录 ${guestImport.importResult.completedModulesAdded} 项、测评草稿 ${guestImport.importResult.assessmentDraftsAdded} 份。`}
          </span>
        </div>
      )}
      {learnerSync.status !== "disabled" && (
        <div className="account-control" aria-live="polite">
          <span className="account-state">
            {learnerSync.status === "waiting-tenant"
              ? "选择租户后同步学习记录"
              : learnerSync.status === "loading"
                ? "正在加载云端学习记录…"
                : learnerSync.status === "error"
                  ? "学习记录同步异常"
                  : learnerSync.syncing
                    ? "正在同步学习记录…"
                    : "学习记录已同步"}
          </span>
          {learnerSync.error && (
            <span className="account-error" role="status">
              {learnerSync.error}
            </span>
          )}
          {learnerSync.status === "error" && (
            <button className="account-action" type="button" onClick={learnerSync.retry}>
              重试同步
            </button>
          )}
        </div>
      )}
      {assessmentSync.status !== "disabled" && (
        <div className="account-control" aria-live="polite">
          <span className="account-state">
            {assessmentSync.status === "waiting-release"
              ? "等待课程发布后同步测评草稿"
              : assessmentSync.status === "loading"
                ? "正在加载测评草稿…"
                : assessmentSync.status === "error"
                  ? "测评草稿同步异常"
                  : assessmentSync.syncing
                    ? "正在同步测评草稿…"
                    : "测评草稿已同步"}
          </span>
          {assessmentSync.error && (
            <span className="account-error" role="status">
              {assessmentSync.error}
            </span>
          )}
          {assessmentSync.status === "error" && (
            <button className="account-action" type="button" onClick={assessmentSync.retry}>
              重试测评同步
            </button>
          )}
        </div>
      )}
    </>
  );
}
