import type { AssessmentResponse } from "../lib/assessmentProgress";
import type { Assessment } from "../types/course";

type Props = {
  assessment: Assessment;
  value: AssessmentResponse;
  onChange: (value: AssessmentResponse) => void;
};

export default function AssessmentWorkspace({ assessment, value, onChange }: Props) {
  const reviewed = new Set(value.reviewedCriteria);
  const reviewedPoints = assessment.rubric
    .filter((criterion) => reviewed.has(criterion.criterion))
    .reduce((sum, criterion) => sum + criterion.points, 0);
  const totalPoints = assessment.rubric.reduce((sum, criterion) => sum + criterion.points, 0);

  return (
    <section className="assessment-workspace" aria-labelledby={`${assessment.id}-title`}>
      <h4 id={`${assessment.id}-title`}>{assessment.prompt}</h4>
      <label className="field-label" htmlFor={`${assessment.id}-response`}>
        你的回答 / 設計說明
      </label>
      <textarea
        id={`${assessment.id}-response`}
        rows={6}
        maxLength={10000}
        value={value.responseText}
        onChange={(event) => onChange({ ...value, responseText: event.target.value })}
        placeholder="記錄你的推導、設計決策或程式實現思路……"
      />
      <div className="rubric-review">
        <div className="rubric-heading">
          <strong>Rubric 自評</strong>
          <span aria-live="polite">
            {reviewedPoints} / {totalPoints} 分已勾選
          </span>
        </div>
        {assessment.rubric.map((criterion) => (
          <label className="rubric-item" key={criterion.criterion}>
            <input
              type="checkbox"
              checked={reviewed.has(criterion.criterion)}
              onChange={(event) => {
                const next = new Set(value.reviewedCriteria);
                if (event.target.checked) next.add(criterion.criterion);
                else next.delete(criterion.criterion);
                onChange({ ...value, reviewedCriteria: [...next] });
              }}
            />
            <span>
              <strong>
                {criterion.criterion} · {criterion.points} 分
              </strong>
              <small>{criterion.description}</small>
            </span>
          </label>
        ))}
      </div>
      <p className="assessment-storage-note">
        草稿和自評保存在目前瀏覽器；此自評分數不是教師評分或模型自動評分。
      </p>
    </section>
  );
}
