import { lazy, Suspense, useMemo, useState } from "react";
import type { CourseModuleSummary } from "./data/courseCatalog";
import { courseCatalog } from "./data/courseCatalog";
import LabWorkspace from "./features/labs/LabWorkspace";
import CourseModuleNavigation from "./features/learning/CourseModuleNavigation";
import { IMPLEMENTED_LABS, LEVEL_LABELS } from "./features/learning/courseMetadata";
import LearningAccountControls from "./features/learning/LearningAccountControls";
import LearningContextAside from "./features/learning/LearningContextAside";
import LessonArticle from "./features/learning/LessonArticle";
import { useAcademyCourseData } from "./features/learning/useAcademyCourseData";
import { useLearningState } from "./features/learning/useLearningState";
import { useAcademySession } from "./features/session/useAcademySession";
import { toggleBookmark } from "./lib/bookmarks";
import { getNextRecommendedModule } from "./lib/learningPath";
import { toggleModuleProgress } from "./lib/progress";
import { searchModules } from "./lib/searchModules";

const CourseAuthoringWorkspace = lazy(() => import("./components/CourseAuthoringWorkspace"));

const AUTH_UI_ENABLED = import.meta.env.VITE_ACADEMY_AUTH_UI_ENABLED === "true";
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
          <LearningAccountControls
            session={session}
            learningScope={learningScope}
            bookmarkedModuleIds={bookmarkedModuleIds}
            completedModules={completedModules}
            assessmentResponses={assessmentResponses}
            setBookmarkedModuleIds={setBookmarkedModuleIds}
            setCompletedModules={setCompletedModules}
            setAssessmentResponses={setAssessmentResponses}
          />
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
