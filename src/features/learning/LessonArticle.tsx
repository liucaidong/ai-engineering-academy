import { lazy } from "react";
import AssessmentWorkspace from "../../components/AssessmentWorkspace";
import type { AssessmentResponse } from "../../lib/assessmentProgress";
import type { Lesson } from "../../types/course";

const MarkdownContent = lazy(() => import("../../components/MarkdownContent"));

type LessonArticleProps = {
  lesson: Lesson;
  isCompleted: boolean;
  onToggleCompletion: () => void;
  assessmentResponses: Record<string, AssessmentResponse>;
  onAssessmentResponseChange: (assessmentId: string, response: AssessmentResponse) => void;
  showOpenLabButton: boolean;
  onOpenLab: () => void;
};

export default function LessonArticle({
  lesson,
  isCompleted,
  onToggleCompletion,
  assessmentResponses,
  onAssessmentResponseChange,
  showOpenLabButton,
  onOpenLab,
}: LessonArticleProps) {
  return (
    <article className="lesson-card">
      <span className="eyebrow">LESSON 01 · {lesson.estimatedMinutes} MIN</span>
      <h2>{lesson.title}</h2>
      <p className="lesson-summary">{lesson.summary}</p>
      {lesson.content.map((section) => (
        <section className="lesson-section" key={section.heading}>
          <h3>{section.heading}</h3>
          <MarkdownContent content={section.markdown ?? section.body} />
        </section>
      ))}
      <div className="objectives">
        <h3>本节学习目标</h3>
        <ul>
          {lesson.learningObjectives.map((objective) => (
            <li key={objective}>{objective}</li>
          ))}
        </ul>
      </div>
      <button
        className={isCompleted ? "completion-button completed" : "completion-button"}
        type="button"
        aria-pressed={isCompleted}
        onClick={onToggleCompletion}
      >
        {isCompleted ? "✓ 已标记完成 · 点击撤销" : "标记本模块为已完成"}
      </button>
      {lesson.assessments.length > 0 && (
        <div className="objectives">
          <h3>本节测评</h3>
          {lesson.assessments.map((assessment) => (
            <AssessmentWorkspace
              key={assessment.id}
              assessment={assessment}
              value={
                assessmentResponses[assessment.id] ?? {
                  responseText: "",
                  reviewedCriteria: [],
                }
              }
              onChange={(value) => onAssessmentResponseChange(assessment.id, value)}
            />
          ))}
        </div>
      )}
      {lesson.sources.length > 0 && (
        <div className="source-list">
          <h3>参考来源</h3>
          {lesson.sources.map((source) => (
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
        <p>课程内容基线已覆盖 M01–M20；运行验收、更多交互实验和后端能力仍按路线图推进。</p>
      </div>
      {showOpenLabButton && (
        <button className="primary-button" onClick={onOpenLab} type="button">
          打开交互实验 <span>→</span>
        </button>
      )}
    </article>
  );
}
