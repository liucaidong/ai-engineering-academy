import type { CourseModuleSummary } from "../../data/courseCatalog";
import type { Course } from "../../types/course";
import { EXECUTION_MODE_LABELS } from "../../types/course";

type LearningContextAsideProps = {
  selectedModule: CourseModuleSummary;
  modules: CourseModuleSummary[];
  selectedLab: Course["labs"][number] | undefined;
  onSelectPrerequisite: (moduleId: string) => void;
};

export default function LearningContextAside({
  selectedModule,
  modules,
  selectedLab,
  onSelectPrerequisite,
}: LearningContextAsideProps) {
  return (
    <aside className="learning-aside">
      <div className="aside-card">
        <span className="eyebrow">PREREQUISITES</span>
        <h3>先修模块</h3>
        {selectedModule.prerequisites.length ? (
          selectedModule.prerequisites.map((id) => (
            <button
              className="prerequisite-link"
              key={id}
              onClick={() => onSelectPrerequisite(id)}
              type="button"
            >
              {id} · {modules.find((item) => item.id === id)?.title}
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
  );
}
