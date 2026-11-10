import { lazy, Suspense, useMemo, useState } from "react";
import type { CourseModuleSummary } from "./data/courseCatalog";
import { courseCatalog } from "./data/courseCatalog";
import LabWorkspace from "./features/labs/LabWorkspace";
import CourseModuleNavigation from "./features/learning/CourseModuleNavigation";
import { IMPLEMENTED_LABS, LEVEL_LABELS } from "./features/learning/courseMetadata";
import LearningContextAside from "./features/learning/LearningContextAside";
import LessonArticle from "./features/learning/LessonArticle";
import { useAcademyCourseData } from "./features/learning/useAcademyCourseData";
import { useGuestLearningImport } from "./features/learning/useGuestLearningImport";
import { useLearnerAssessmentSync } from "./features/learning/useLearnerAssessmentSync";
import { useLearnerProgressSync } from "./features/learning/useLearnerProgressSync";
import { useLearningState } from "./features/learning/useLearningState";
import SessionTenantControl from "./features/session/SessionTenantControl";
import { useAcademySession } from "./features/session/useAcademySession";
import { toggleBookmark } from "./lib/bookmarks";
import { getNextRecommendedModule } from "./lib/learningPath";
import { toggleModuleProgress } from "./lib/progress";
import { searchModules } from "./lib/searchModules";

const CourseAuthoringWorkspace = lazy(() => import("./components/CourseAuthoringWorkspace"));

const AUTH_UI_ENABLED = import.meta.env.VITE_ACADEMY_AUTH_UI_ENABLED === "true";
const LEARNER_SYNC_ENABLED =
  AUTH_UI_ENABLED && import.meta.env.VITE_ACADEMY_LEARNER_SYNC_ENABLED === "true";

export default function App() {
  const session = useAcademySession(AUTH_UI_ENABLED);
  const learningScope =
    session.status === "authenticated" && session.session
      ? `user:${session.session.user_id}:tenant:${session.selectedTenantId ?? "unassigned"}`
      : "guest";
  const [selectedModuleId, setSelectedModuleId] = useState("M01");
  const [activeView, setActiveView] = useState<"lesson" | "lab" | "authoring">("lesson");
  const [moduleQuery, setModuleQuery] = useState("");
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const {
    assessmentResponses,
    bookmarkedModuleIds,
    completedModules,
    progressPercent,
    setAssessmentResponses,
    setBookmarkedModuleIds,
    setCompletedModules,
  } = useLearningState(learningScope);
  const learnerSync = useLearnerProgressSync({
    enabled: LEARNER_SYNC_ENABLED,
    tenantId: session.status === "authenticated" ? session.selectedTenantId : null,
    completedModules,
    setCompletedModules,
  });
  const assessmentSync = useLearnerAssessmentSync({
    enabled: LEARNER_SYNC_ENABLED,
    tenantId: session.status === "authenticated" ? session.selectedTenantId : null,
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
  const {
    authoringCourse,
    authoringLoadError,
    fullTextSearchModules,
    lessonLoadError,
    retryAuthoringLoad,
    retryLessonLoad,
    searchIndexError,
    searchIndexLoading,
    selectedLesson,
    selectedModule,
    validationErrors,
  } = useAcademyCourseData({ selectedModuleId, activeView, moduleQuery });
  const filteredModules = useMemo(() => {
    const searched = searchModules(fullTextSearchModules ?? courseCatalog.modules, moduleQuery);
    return showBookmarksOnly
      ? searched.filter((module) => bookmarkedModuleIds.includes(module.id))
      : searched;
  }, [moduleQuery, showBookmarksOnly, bookmarkedModuleIds, fullTextSearchModules]);
  const selectModule = (module: CourseModuleSummary) => {
    setSelectedModuleId(module.id);
    setActiveView(module.labId && IMPLEMENTED_LABS.has(module.labId) ? "lab" : "lesson");
  };
  const recommendedModule = useMemo(
    () => getNextRecommendedModule(courseCatalog.modules, completedModules),
    [completedModules],
  );
  const openLab = selectedModule.labId && IMPLEMENTED_LABS.has(selectedModule.labId);
  const selectedLab = selectedModule.labId
    ? courseCatalog.labs.find((lab) => lab.id === selectedModule.labId)
    : undefined;

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="skip-link" href="#main-content">
          跳至主要內容
        </a>
        <a className="brand" href="#main-content">
          <span className="brand-mark">A</span>
          <span>
            AI Engineering <b>Academy</b>
          </span>
        </a>
        <div className="topbar-meta">
          <span className="version-pill">CURRICULUM v{courseCatalog.version}</span>
          <span className="status-dot" /> 学习环境
          <SessionTenantControl session={session} />
          {guestImport.enabled && guestImport.hasGuestData && !guestImport.alreadyImported && (
            <div className="account-control">
              <span className="account-state">发现未导入的访客学习记录</span>
              <button
                className="account-action"
                type="button"
                onClick={guestImport.importGuestData}
              >
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
        </div>
      </header>
      <div className="workspace">
        <CourseModuleNavigation
          filteredModules={filteredModules}
          selectedModuleId={selectedModuleId}
          completedModules={completedModules}
          progressPercent={progressPercent}
          recommendedModule={recommendedModule}
          bookmarkedModuleIds={bookmarkedModuleIds}
          moduleQuery={moduleQuery}
          onModuleQueryChange={setModuleQuery}
          showBookmarksOnly={showBookmarksOnly}
          onShowBookmarksOnlyChange={setShowBookmarksOnly}
          searchIndexLoading={searchIndexLoading}
          searchIndexError={searchIndexError}
          onSelectModule={selectModule}
        />
        <main className="main-content" id="main-content" tabIndex={-1}>
          <div className="breadcrumb">
            课程 / {LEVEL_LABELS[selectedModule.level]} / <strong>{selectedModule.id}</strong>
          </div>
          <section className="module-hero">
            <div>
              <span className="eyebrow">
                {selectedModule.level} · {selectedModule.id}
              </span>
              <h1>{selectedModule.title}</h1>
              <p>{selectedModule.summary}</p>
            </div>
            <div className="module-hero-actions">
              <button
                className={
                  bookmarkedModuleIds.includes(selectedModule.id)
                    ? "bookmark-button active"
                    : "bookmark-button"
                }
                type="button"
                aria-pressed={bookmarkedModuleIds.includes(selectedModule.id)}
                onClick={() =>
                  setBookmarkedModuleIds((current) => toggleBookmark(current, selectedModule.id))
                }
              >
                {bookmarkedModuleIds.includes(selectedModule.id) ? "★ 已收藏" : "☆ 收藏模块"}
              </button>
              <div className="module-count">
                <strong>{selectedModule.id}</strong>
                <span>MODULE</span>
              </div>
            </div>
          </section>
          {validationErrors.length > 0 && (
            <div className="validation-warning" role="alert">
              课程内容校验失败：{validationErrors.join("；")}
            </div>
          )}
          <div className="content-tabs" role="toolbar" aria-label="学习内容视图">
            <button
              className={activeView === "lesson" ? "content-tab active" : "content-tab"}
              onClick={() => setActiveView("lesson")}
              aria-pressed={activeView === "lesson"}
              type="button"
            >
              课程内容
            </button>
            <button
              className={activeView === "authoring" ? "content-tab active" : "content-tab"}
              onClick={() => setActiveView("authoring")}
              aria-pressed={activeView === "authoring"}
              type="button"
            >
              课程编辑
            </button>
            {openLab && (
              <button
                className={activeView === "lab" ? "content-tab active" : "content-tab"}
                onClick={() => setActiveView("lab")}
                aria-pressed={activeView === "lab"}
                type="button"
              >
                交互实验
              </button>
            )}
          </div>
          <Suspense
            fallback={
              <div className="lesson-card" role="status" aria-live="polite">
                正在加载课程工作区…
              </div>
            }
          >
            {activeView === "authoring" ? (
              authoringCourse ? (
                <CourseAuthoringWorkspace initialCourse={authoringCourse} />
              ) : authoringLoadError ? (
                <div className="lesson-card" role="alert">
                  <p>{authoringLoadError}</p>
                  <button type="button" className="secondary-button" onClick={retryAuthoringLoad}>
                    重试加载
                  </button>
                </div>
              ) : (
                <div className="lesson-card" role="status" aria-live="polite">
                  正在加载完整课程数据以打开编辑器…
                </div>
              )
            ) : activeView === "lab" && selectedModule.labId ? (
              <LabWorkspace labId={selectedModule.labId} />
            ) : selectedLesson ? (
              <div className="lesson-layout">
                <LessonArticle
                  lesson={selectedLesson}
                  isCompleted={completedModules.includes(selectedModule.id)}
                  onToggleCompletion={() =>
                    setCompletedModules((current) =>
                      toggleModuleProgress(current, selectedModule.id),
                    )
                  }
                  assessmentResponses={assessmentResponses}
                  onAssessmentResponseChange={(assessmentId, value) =>
                    setAssessmentResponses((current) => ({
                      ...current,
                      [assessmentId]: {
                        ...value,
                        updatedAt: new Date().toISOString(),
                        syncState: "pending",
                      },
                    }))
                  }
                  showOpenLabButton={Boolean(openLab)}
                  onOpenLab={() => setActiveView("lab")}
                />
                <LearningContextAside
                  selectedModule={selectedModule}
                  modules={courseCatalog.modules}
                  selectedLab={selectedLab}
                  onSelectPrerequisite={(moduleId) => {
                    setSelectedModuleId(moduleId);
                    setActiveView("lesson");
                  }}
                />
              </div>
            ) : (
              <div className="lesson-card" role="status" aria-live="polite">
                {lessonLoadError ?? `正在加载 ${selectedModule.id} 课程正文…`}
                {lessonLoadError && (
                  <button type="button" className="secondary-button" onClick={retryLessonLoad}>
                    重试
                  </button>
                )}
              </div>
            )}
          </Suspense>
          <footer className="page-footer">
            AI Engineering Academy <span>·</span> Learn the system, build the system.
          </footer>
        </main>
      </div>
    </div>
  );
}
