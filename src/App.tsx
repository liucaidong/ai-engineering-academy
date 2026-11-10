import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import type { CourseModuleSummary } from "./data/courseCatalog";
import { courseCatalog } from "./data/courseCatalog";
import { loadFullCourse } from "./data/loadFullCourse";
import { loadModuleLessons } from "./data/moduleLessons";
import CourseModuleNavigation from "./features/learning/CourseModuleNavigation";
import LearningContextAside from "./features/learning/LearningContextAside";
import { IMPLEMENTED_LABS, LEVEL_LABELS } from "./features/learning/courseMetadata";
import LessonArticle from "./features/learning/LessonArticle";
import { useLearningState } from "./features/learning/useLearningState";
import SessionTenantControl from "./features/session/SessionTenantControl";
import { toggleBookmark } from "./lib/bookmarks";
import { getNextRecommendedModule } from "./lib/learningPath";
import { toggleModuleProgress } from "./lib/progress";
import { searchModules } from "./lib/searchModules";
import { getModuleValidationErrors } from "./lib/validateCourse";
import type { Course, CourseModule, Lesson } from "./types/course";

const AgentRuntimeLab = lazy(() => import("./components/AgentRuntimeLab"));
const CourseAuthoringWorkspace = lazy(() => import("./components/CourseAuthoringWorkspace"));
const EvaluationLab = lazy(() => import("./components/EvaluationLab"));
const McpLab = lazy(() => import("./components/McpLab"));
const MultiAgentLab = lazy(() => import("./components/MultiAgentLab"));
const RagLab = lazy(() => import("./components/RagLab"));
const TokenizerLab = lazy(() => import("./components/TokenizerLab"));
const ToolCallingLab = lazy(() => import("./components/ToolCallingLab"));
const TransformerLab = lazy(() => import("./components/TransformerLab"));

export default function App() {
  const [selectedModuleId, setSelectedModuleId] = useState("M01");
  const [activeView, setActiveView] = useState<"lesson" | "lab" | "authoring">("lesson");
  const [moduleQuery, setModuleQuery] = useState("");
  const [lessonsByModule, setLessonsByModule] = useState<Record<string, Lesson[]>>({});
  const [lessonLoadError, setLessonLoadError] = useState<string | null>(null);
  const [authoringCourse, setAuthoringCourse] = useState<Course | null>(null);
  const [authoringLoadError, setAuthoringLoadError] = useState<string | null>(null);
  const [authoringLoadAttempt, setAuthoringLoadAttempt] = useState(0);
  const [fullTextSearchModules, setFullTextSearchModules] = useState<CourseModule[] | null>(null);
  const [searchIndexLoading, setSearchIndexLoading] = useState(false);
  const [searchIndexError, setSearchIndexError] = useState(false);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const {
    assessmentResponses,
    bookmarkedModuleIds,
    completedModules,
    progressPercent,
    setAssessmentResponses,
    setBookmarkedModuleIds,
    setCompletedModules,
  } = useLearningState();
  const selectedModule =
    courseCatalog.modules.find((item) => item.id === selectedModuleId) ?? courseCatalog.modules[0];
  const selectedLessons = lessonsByModule[selectedModule.id];
  const selectedLesson = selectedLessons?.[0];
  const validationErrors = useMemo(
    () => (selectedLessons ? getModuleValidationErrors(selectedModule, selectedLessons) : []),
    [selectedModule, selectedLessons],
  );
  useEffect(() => {
    if (lessonsByModule[selectedModuleId]) return;
    let cancelled = false;
    setLessonLoadError(null);
    void loadModuleLessons(selectedModuleId).then(
      (lessons) => {
        if (!cancelled) {
          setLessonsByModule((current) => ({ ...current, [selectedModuleId]: lessons }));
        }
      },
      () => {
        if (!cancelled) setLessonLoadError(`课程模块 ${selectedModuleId} 加载失败，请重试。`);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [selectedModuleId, lessonsByModule]);
  useEffect(() => {
    if (activeView !== "authoring" || authoringCourse) return;
    let cancelled = false;
    setAuthoringLoadError(null);
    void loadFullCourse().then(
      (course) => {
        if (!cancelled) setAuthoringCourse(course);
      },
      () => {
        if (!cancelled) {
          setAuthoringLoadError(
            `完整课程数据加载失败（第 ${authoringLoadAttempt + 1} 次），请重试。`,
          );
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [activeView, authoringCourse, authoringLoadAttempt]);
  useEffect(() => {
    if (!moduleQuery.trim() || fullTextSearchModules) return;
    let cancelled = false;
    setSearchIndexLoading(true);
    setSearchIndexError(false);
    void loadFullCourse()
      .then(
        (fullCourse) => {
          if (!cancelled) setFullTextSearchModules(fullCourse.modules);
        },
        () => {
          if (!cancelled) setSearchIndexError(true);
        },
      )
      .finally(() => {
        if (!cancelled) setSearchIndexLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [moduleQuery, fullTextSearchModules]);
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
          <SessionTenantControl />
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
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setAuthoringLoadAttempt((attempt) => attempt + 1)}
                  >
                    重试加载
                  </button>
                </div>
              ) : (
                <div className="lesson-card" role="status" aria-live="polite">
                  正在加载完整课程数据以打开编辑器…
                </div>
              )
            ) : activeView === "lab" && selectedModule.labId === "tokenizer" ? (
              <TokenizerLab />
            ) : activeView === "lab" && selectedModule.labId === "transformer" ? (
              <TransformerLab />
            ) : activeView === "lab" && selectedModule.labId === "rag" ? (
              <RagLab />
            ) : activeView === "lab" && selectedModule.labId === "tool-calling" ? (
              <ToolCallingLab />
            ) : activeView === "lab" && selectedModule.labId === "agent" ? (
              <AgentRuntimeLab />
            ) : activeView === "lab" && selectedModule.labId === "mcp" ? (
              <McpLab />
            ) : activeView === "lab" && selectedModule.labId === "multi-agent" ? (
              <MultiAgentLab />
            ) : activeView === "lab" && selectedModule.labId === "evaluation" ? (
              <EvaluationLab />
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
                      [assessmentId]: value,
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
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setLessonsByModule((current) => {
                        const next = { ...current };
                        delete next[selectedModule.id];
                        return next;
                      });
                      setLessonLoadError(null);
                    }}
                  >
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
