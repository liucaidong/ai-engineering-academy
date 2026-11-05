import { useEffect, useMemo, useState } from "react";
import TokenizerLab from "./components/TokenizerLab";
import TransformerLab from "./components/TransformerLab";
import RagLab from "./components/RagLab";
import MarkdownContent from "./components/MarkdownContent";
import { course } from "./data/curriculum";
import { getCourseValidationErrors } from "./lib/validateCourse";
import { EXECUTION_MODE_LABELS, type CourseModule } from "./types/course";
import { loadProgress, serializeProgress, toggleModuleProgress } from "./lib/progress";

const LEVEL_LABELS: Record<CourseModule["level"], string> = {
  L1: "基础认知", L2: "模型原理", L3: "应用工程", L4: "Agent 工程", L5: "平台工程", L6: "综合实践"
};
const IMPLEMENTED_LABS = new Set(["tokenizer", "transformer", "rag"]);

export default function App() {
  const [selectedModuleId, setSelectedModuleId] = useState("M01");
  const [activeView, setActiveView] = useState<"lesson" | "lab">("lesson");
  const [completedModules, setCompletedModules] = useState<string[]>(() => {
    try { return loadProgress(typeof window === "undefined" ? null : window.localStorage.getItem("ai-engineering-academy:progress:v1"), course.modules.map((module) => module.id)); }
    catch { return []; }
  });
  useEffect(() => {
    try { window.localStorage.setItem("ai-engineering-academy:progress:v1", serializeProgress(completedModules)); }
    catch { /* Private browsing or storage restrictions must not block learning. */ }
  }, [completedModules]);
  const progressPercent = Math.round((completedModules.length / course.modules.length) * 100);
  const validationErrors = useMemo(() => getCourseValidationErrors(course), []);
  const selectedModule = course.modules.find((item) => item.id === selectedModuleId) ?? course.modules[0];
  const selectedLesson = selectedModule.lessons[0];
  const groupedModules = course.modules.reduce<Record<string, CourseModule[]>>((groups, item) => {
    (groups[item.level] ??= []).push(item);
    return groups;
  }, {});
  const selectModule = (module: CourseModule) => {
    setSelectedModuleId(module.id);
    setActiveView(module.labId && IMPLEMENTED_LABS.has(module.labId) ? "lab" : "lesson");
  };
  const openLab = selectedModule.labId && IMPLEMENTED_LABS.has(selectedModule.labId);

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#" aria-label="AI Engineering Academy 首页"><span className="brand-mark">A</span><span>AI Engineering <b>Academy</b></span></a>
      <div className="topbar-meta"><span className="version-pill">CURRICULUM v{course.version}</span><span className="status-dot" /> 学习环境</div>
    </header>
    <div className="workspace">
      <aside className="sidebar" aria-label="课程目录">
        <div className="sidebar-intro"><span className="eyebrow">LEARNING PATH</span><h1>课程目录</h1><p>从模型原理走向 AI 系统工程</p></div>
        <div className="course-progress"><div className="progress-copy"><span>已完成模块</span><strong>{completedModules.length} / {course.modules.length}</strong></div><div className="progress-track" role="progressbar" aria-label="课程模块完成进度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercent}><span style={{ width: `${progressPercent}%` }} /></div><small>{progressPercent}% · 仅保存在当前浏览器</small></div>
        <nav className="module-nav">{Object.entries(groupedModules).map(([level, modules]) => <section className="nav-group" key={level}>
          <h2><span>{level}</span>{LEVEL_LABELS[level as CourseModule["level"]]}</h2>
          {modules.map((module) => <button className={selectedModuleId === module.id ? "module-link active" : "module-link"} key={module.id} onClick={() => selectModule(module)} aria-current={selectedModuleId === module.id ? "page" : undefined} type="button">
            <span className="module-id">{module.id}</span><span>{module.title}</span>{completedModules.includes(module.id) && <span className="module-complete" aria-label="已完成">✓</span>}
            {module.labId && <span className={IMPLEMENTED_LABS.has(module.labId) ? "lab-indicator implemented" : "lab-indicator"} title={IMPLEMENTED_LABS.has(module.labId) ? "交互实验已实现" : "实验规划中"} aria-label={IMPLEMENTED_LABS.has(module.labId) ? "交互实验已实现" : "实验规划中"}>◈</span>}
          </button>)}
        </section>)}</nav>
        <div className="sidebar-footer">学习路径 · 版本 0.1.0</div>
      </aside>
      <main className="main-content">
        <div className="breadcrumb">课程 / {LEVEL_LABELS[selectedModule.level]} / <strong>{selectedModule.id}</strong></div>
        <section className="module-hero"><div><span className="eyebrow">{selectedModule.level} · {selectedModule.id}</span><h1>{selectedModule.title}</h1><p>{selectedModule.summary}</p></div><div className="module-count"><strong>{selectedModule.id}</strong><span>MODULE</span></div></section>
        {validationErrors.length > 0 && <div className="validation-warning" role="alert">课程内容校验失败：{validationErrors.join("；")}</div>}
        <div className="content-tabs" aria-label="学习内容视图">
          <button className={activeView === "lesson" ? "content-tab active" : "content-tab"} onClick={() => setActiveView("lesson")} aria-pressed={activeView === "lesson"} type="button">课程内容</button>
          {openLab && <button className={activeView === "lab" ? "content-tab active" : "content-tab"} onClick={() => setActiveView("lab")} aria-pressed={activeView === "lab"} type="button">交互实验</button>}
        </div>
        {activeView === "lab" && selectedModule.labId === "tokenizer" ? <TokenizerLab /> :
         activeView === "lab" && selectedModule.labId === "transformer" ? <TransformerLab /> :
         activeView === "lab" && selectedModule.labId === "rag" ? <RagLab /> :
         <div className="lesson-layout">
          <article className="lesson-card">
            <span className="eyebrow">LESSON 01 · {selectedLesson.estimatedMinutes} MIN</span><h2>{selectedLesson.title}</h2><p className="lesson-summary">{selectedLesson.summary}</p>
            {selectedLesson.content.map((section) => <section className="lesson-section" key={section.heading}><h3>{section.heading}</h3><MarkdownContent content={section.markdown ?? section.body} /></section>)}
            <div className="objectives"><h3>本节学习目标</h3><ul>{selectedLesson.learningObjectives.map((objective) => <li key={objective}>{objective}</li>)}</ul></div>
            <button className={completedModules.includes(selectedModule.id) ? "completion-button completed" : "completion-button"} type="button" aria-pressed={completedModules.includes(selectedModule.id)} onClick={() => setCompletedModules((current) => toggleModuleProgress(current, selectedModule.id))}>{completedModules.includes(selectedModule.id) ? "✓ 已标记完成 · 点击撤销" : "标记本模块为已完成"}</button>
            {selectedLesson.assessments.length > 0 && <div className="objectives"><h3>本节测评</h3>{selectedLesson.assessments.map((assessment) => <section key={assessment.id}><strong>{assessment.prompt}</strong><ul>{assessment.rubric.map((criterion) => <li key={criterion.criterion}>{criterion.criterion}（{criterion.points} 分）：{criterion.description}</li>)}</ul></section>)}</div>}
            {selectedLesson.sources.length > 0 && <div className="source-list"><h3>参考来源</h3>{selectedLesson.sources.map((source) => <p key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a> · {source.publisher}</p>)}</div>}
            <div className="coming-next"><span>课程内容状态</span><p>当前课程目录已建立；正式教材、测评和参考来源按模块逐步补齐。空缺内容不会被伪装成已完成教材。</p></div>
            {openLab && <button className="primary-button" onClick={() => setActiveView("lab")} type="button">打开交互实验 <span>→</span></button>}
          </article>
          <aside className="learning-aside">
            <div className="aside-card"><span className="eyebrow">PREREQUISITES</span><h3>先修模块</h3>{selectedModule.prerequisites.length ? selectedModule.prerequisites.map((id) => <button className="prerequisite-link" key={id} onClick={() => { setSelectedModuleId(id); setActiveView("lesson"); }} type="button">{id} · {course.modules.find((item) => item.id === id)?.title}</button>) : <p className="muted">无先修要求</p>}</div>
            <div className="aside-card"><span className="eyebrow">LEARNING OUTCOMES</span><h3>完成后你将能够</h3><ul>{selectedModule.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul></div>
            <div className="aside-card execution-card"><span className="eyebrow">LAB EXECUTION</span><h3>实验执行说明</h3><p>{selectedModule.labId ? course.labs.find((lab) => lab.id === selectedModule.labId)?.executionMode ? EXECUTION_MODE_LABELS[course.labs.find((lab) => lab.id === selectedModule.labId)!.executionMode] : "当前实验尚未登记执行定义" : "本模块当前没有关联实验。"} 实验执行模式与安全边界以实验定义为准。</p></div>
          </aside>
         </div>}
        <footer className="page-footer">AI Engineering Academy <span>·</span> Learn the system, build the system.</footer>
      </main>
    </div>
  </div>;
}
