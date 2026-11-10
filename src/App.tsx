import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import AssessmentWorkspace from "./components/AssessmentWorkspace";
import type { CourseModuleSummary } from "./data/courseCatalog";
import { courseCatalog } from "./data/courseCatalog";
import { loadFullCourse } from "./data/loadFullCourse";
import { loadModuleLessons } from "./data/moduleLessons";
import { useLearningState } from "./features/learning/useLearningState";
import SessionTenantControl from "./features/session/SessionTenantControl";
import { toggleBookmark } from "./lib/bookmarks";
import { getNextRecommendedModule } from "./lib/learningPath";
import { toggleModuleProgress } from "./lib/progress";
import { searchModules } from "./lib/searchModules";
import { getModuleValidationErrors } from "./lib/validateCourse";
import { type Course, type CourseModule, EXECUTION_MODE_LABELS, type Lesson } from "./types/course";

const AgentRuntimeLab = lazy(() => import("./components/AgentRuntimeLab"));
const CourseAuthoringWorkspace = lazy(() => import("./components/CourseAuthoringWorkspace"));
const EvaluationLab = lazy(() => import("./components/EvaluationLab"));
const MarkdownContent = lazy(() => import("./components/MarkdownContent"));
const McpLab = lazy(() => import("./components/McpLab"));
const MultiAgentLab = lazy(() => import("./components/MultiAgentLab"));
const RagLab = lazy(() => import("./components/RagLab"));
const TokenizerLab = lazy(() => import("./components/TokenizerLab"));
const ToolCallingLab = lazy(() => import("./components/ToolCallingLab"));
const TransformerLab = lazy(() => import("./components/TransformerLab"));

const LEVEL_LABELS: Record<CourseModule["level"], string> = {
  L1: "基础认知",
  L2: "模型原理",
  L3: "应用工程",
  L4: "Agent 工程",
  L5: "平台工程",
  L6: "综合实践",
};
const IMPLEMENTED_LABS = new Set(
  courseCatalog.labs.filter((lab) => lab.status === "implemented").map((lab) => lab.id),
);

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
  const groupedModules = useMemo(
    () =>
      filteredModules.reduce<Record<string, CourseModuleSummary[]>>((groups, item) => {
        const levelModules = groups[item.level] ?? [];
        levelModules.push(item);
        groups[item.level] = levelModules;
        return groups;
      }, {}),
    [filteredModules],
  );
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
        <aside className="sidebar" aria-label="课程目录">
          <div className="sidebar-intro">
            <span className="eyebrow">LEARNING PATH</span>
            <h2>课程目录</h2>
            <p>从模型原理走向 AI 系统工程</p>
          </div>
          <div className="course-progress">
            <div className="progress-copy">
              <span>已完成模块</span>
              <strong>
                {completedModules.length} / {courseCatalog.modules.length}
              </strong>
            </div>
            <div
              className="progress-track"
              role="progressbar"
              aria-label="课程模块完成进度"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressPercent}
            >
              <span style={{ width: `${progressPercent}%` }} />
            </div>
            <small>{progressPercent}% · 仅保存在当前浏览器</small>
          </div>
          <div className="recommendation-card">
            <span>下一步建议</span>
            {recommendedModule ? (
              <>
                <strong>
                  {recommendedModule.id} · {recommendedModule.title}
                </strong>
                <button type="button" onClick={() => selectModule(recommendedModule)}>
                  继续学习
                </button>
              </>
            ) : (
              <strong>所有课程模块均已完成</strong>
            )}
          </div>
          <nav className="module-nav" aria-label="课程模块导航">
            <label className="module-search-label" htmlFor="module-search">
              搜索课程模块
            </label>
            <input
              id="module-search"
              className="module-search"
              type="search"
              value={moduleQuery}
              onChange={(event) => setModuleQuery(event.target.value)}
              placeholder="输入模块名称、主题、目标或正文关键词"
            />
            {moduleQuery.trim() && searchIndexLoading && (
              <p className="module-search-empty" role="status">
                正在检索课程正文…
              </p>
            )}
            {moduleQuery.trim() && searchIndexError && (
              <p className="module-search-empty" role="status">
                全文索引暂不可用，已按目录信息搜索。
              </p>
            )}
            <button
              className="bookmark-filter"
              type="button"
              aria-pressed={showBookmarksOnly}
              onClick={() => setShowBookmarksOnly((value) => !value)}
            >
              {showBookmarksOnly ? "显示全部模块" : `只看收藏 (${bookmarkedModuleIds.length})`}
            </button>
            {Object.entries(groupedModules).map(([level, modules]) => (
              <section className="nav-group" key={level}>
                <h2>
                  <span>{level}</span>
                  {LEVEL_LABELS[level as CourseModule["level"]]}
                </h2>
                {modules.map((module) => (
                  <button
                    className={
                      selectedModuleId === module.id ? "module-link active" : "module-link"
                    }
                    key={module.id}
                    onClick={() => selectModule(module)}
                    aria-current={selectedModuleId === module.id ? "page" : undefined}
                    type="button"
                  >
                    <span className="module-id">{module.id}</span>
                    <span>{module.title}</span>
                    {completedModules.includes(module.id) && (
                      <>
                        <span className="sr-only">已完成</span>
                        <span className="module-complete" aria-hidden="true">
                          ✓
                        </span>
                      </>
                    )}
                    {module.labId && (
                      <>
                        <span className="sr-only">
                          {IMPLEMENTED_LABS.has(module.labId) ? "交互实验已实现" : "实验规划中"}
                        </span>
                        <span
                          className={
                            IMPLEMENTED_LABS.has(module.labId)
                              ? "lab-indicator implemented"
                              : "lab-indicator"
                          }
                          title={
                            IMPLEMENTED_LABS.has(module.labId) ? "交互实验已实现" : "实验规划中"
                          }
                          aria-hidden="true"
                        >
                          ◈
                        </span>
                      </>
                    )}
                  </button>
                ))}
              </section>
            ))}
            {filteredModules.length === 0 && (
              <p className="module-search-empty">没有匹配的课程模块。</p>
            )}
          </nav>
          <div className="sidebar-footer">学习路径 · 课程版本 {courseCatalog.version}</div>
        </aside>
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
                <article className="lesson-card">
                  <span className="eyebrow">LESSON 01 · {selectedLesson.estimatedMinutes} MIN</span>
                  <h2>{selectedLesson.title}</h2>
                  <p className="lesson-summary">{selectedLesson.summary}</p>
                  {selectedLesson.content.map((section) => (
                    <section className="lesson-section" key={section.heading}>
                      <h3>{section.heading}</h3>
                      <MarkdownContent content={section.markdown ?? section.body} />
                    </section>
                  ))}
                  <div className="objectives">
                    <h3>本节学习目标</h3>
                    <ul>
                      {selectedLesson.learningObjectives.map((objective) => (
                        <li key={objective}>{objective}</li>
                      ))}
                    </ul>
                  </div>
                  <button
                    className={
                      completedModules.includes(selectedModule.id)
                        ? "completion-button completed"
                        : "completion-button"
                    }
                    type="button"
                    aria-pressed={completedModules.includes(selectedModule.id)}
                    onClick={() =>
                      setCompletedModules((current) =>
                        toggleModuleProgress(current, selectedModule.id),
                      )
                    }
                  >
                    {completedModules.includes(selectedModule.id)
                      ? "✓ 已标记完成 · 点击撤销"
                      : "标记本模块为已完成"}
                  </button>
                  {selectedLesson.assessments.length > 0 && (
                    <div className="objectives">
                      <h3>本节测评</h3>
                      {selectedLesson.assessments.map((assessment) => (
                        <AssessmentWorkspace
                          key={assessment.id}
                          assessment={assessment}
                          value={
                            assessmentResponses[assessment.id] ?? {
                              responseText: "",
                              reviewedCriteria: [],
                            }
                          }
                          onChange={(value) =>
                            setAssessmentResponses((current) => ({
                              ...current,
                              [assessment.id]: value,
                            }))
                          }
                        />
                      ))}
                    </div>
                  )}
                  {selectedLesson.sources.length > 0 && (
                    <div className="source-list">
                      <h3>参考来源</h3>
                      {selectedLesson.sources.map((source) => (
                        <p key={source.url}>
                          <a href={source.url} target="_blank" rel="noreferrer">
                            {source.title}
                          </a>{" "}
                          · {source.publisher}
                        </p>
                      ))}
                    </div>
                  )}
                  <div className="coming-next">
                    <span>课程内容状态</span>
                    <p>
                      课程内容基线已覆盖 M01–M20；运行验收、更多交互实验和后端能力仍按路线图推进。
                    </p>
                  </div>
                  {openLab && (
                    <button
                      className="primary-button"
                      onClick={() => setActiveView("lab")}
                      type="button"
                    >
                      打开交互实验 <span>→</span>
                    </button>
                  )}
                </article>
                <aside className="learning-aside">
                  <div className="aside-card">
                    <span className="eyebrow">PREREQUISITES</span>
                    <h3>先修模块</h3>
                    {selectedModule.prerequisites.length ? (
                      selectedModule.prerequisites.map((id) => (
                        <button
                          className="prerequisite-link"
                          key={id}
                          onClick={() => {
                            setSelectedModuleId(id);
                            setActiveView("lesson");
                          }}
                          type="button"
                        >
                          {id} · {courseCatalog.modules.find((item) => item.id === id)?.title}
                        </button>
                      ))
                    ) : (
                      <p className="muted">无先修要求</p>
                    )}
                  </div>
                  <div className="aside-card">
                    <span className="eyebrow">LEARNING OUTCOMES</span>
                    <h3>完成后你将能够</h3>
                    <ul>
                      {selectedModule.objectives.map((objective) => (
                        <li key={objective}>{objective}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="aside-card execution-card">
                    <span className="eyebrow">LAB EXECUTION</span>
                    <h3>实验执行说明</h3>
                    <p>
                      {selectedLab
                        ? EXECUTION_MODE_LABELS[selectedLab.executionMode]
                        : selectedModule.labId
                          ? "当前实验尚未登记执行定义"
                          : "本模块当前没有关联实验。"}{" "}
                      实验执行模式与安全边界以实验定义为准。
                    </p>
                  </div>
                </aside>
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
