import { useMemo } from "react";
import type { CourseModuleSummary } from "../../data/courseCatalog";
import { courseCatalog } from "../../data/courseCatalog";
import type { CourseModule } from "../../types/course";
import { IMPLEMENTED_LABS, LEVEL_LABELS } from "./courseMetadata";

type CourseModuleNavigationProps = {
  filteredModules: CourseModuleSummary[];
  selectedModuleId: string;
  completedModules: string[];
  progressPercent: number;
  recommendedModule: CourseModuleSummary | null;
  bookmarkedModuleIds: string[];
  moduleQuery: string;
  onModuleQueryChange: (value: string) => void;
  showBookmarksOnly: boolean;
  onShowBookmarksOnlyChange: (value: boolean) => void;
  searchIndexLoading: boolean;
  searchIndexError: boolean;
  onSelectModule: (module: CourseModuleSummary) => void;
};

export default function CourseModuleNavigation({
  filteredModules,
  selectedModuleId,
  completedModules,
  progressPercent,
  recommendedModule,
  bookmarkedModuleIds,
  moduleQuery,
  onModuleQueryChange,
  showBookmarksOnly,
  onShowBookmarksOnlyChange,
  searchIndexLoading,
  searchIndexError,
  onSelectModule,
}: CourseModuleNavigationProps) {
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

  return (
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
            <button type="button" onClick={() => onSelectModule(recommendedModule)}>
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
          onChange={(event) => onModuleQueryChange(event.target.value)}
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
          onClick={() => onShowBookmarksOnlyChange(!showBookmarksOnly)}
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
                className={selectedModuleId === module.id ? "module-link active" : "module-link"}
                key={module.id}
                onClick={() => onSelectModule(module)}
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
                      title={IMPLEMENTED_LABS.has(module.labId) ? "交互实验已实现" : "实验规划中"}
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
  );
}
