import { useMemo, useState } from "react";
import { scaledDotProductAttention } from "../labs/transformer";

export default function TransformerLab() {
  const [causalMask, setCausalMask] = useState(false);
  const result = useMemo(
    () =>
      scaledDotProductAttention(
        [
          [1, 0],
          [0, 1],
          [1, 1],
        ],
        [
          [1, 0],
          [0, 1],
          [1, 1],
        ],
        [
          [1, 0],
          [0, 1],
          [1, 1],
        ],
        causalMask
          ? [
              [true, false, false],
              [true, true, false],
              [true, true, true],
            ]
          : undefined,
      ),
    [causalMask],
  );

  const matrix = (label: string, values: number[][]) => {
    const rowOccurrences = new Map<string, number>();
    const rows = values.map((row) => {
      const rowSignature = row.join(",");
      const rowOccurrence = rowOccurrences.get(rowSignature) ?? 0;
      rowOccurrences.set(rowSignature, rowOccurrence + 1);

      const cellOccurrences = new Map<string, number>();
      const cells = row.map((value) => {
        const cellSignature = value.toFixed(2);
        const cellOccurrence = cellOccurrences.get(cellSignature) ?? 0;
        cellOccurrences.set(cellSignature, cellOccurrence + 1);
        return <td key={`${cellSignature}:${cellOccurrence}`}>{cellSignature}</td>;
      });
      return <tr key={`${rowSignature}:${rowOccurrence}`}>{cells}</tr>;
    });

    return (
      <div className="matrix-card">
        <h3>{label}</h3>
        <table className="matrix-grid" aria-label={label}>
          <tbody>{rows}</tbody>
        </table>
      </div>
    );
  };

  return (
    <section className="lab-panel" aria-labelledby="transformer-title">
      <div className="lab-heading">
        <div>
          <span className="eyebrow">INTERACTIVE LAB · M02</span>
          <h2 id="transformer-title">Transformer Attention Lab</h2>
          <p>查看 Q、K、V 如何产生注意力分数、归一化权重与加权输出。</p>
        </div>
        <span className="execution-tag">浏览器本地执行</span>
      </div>
      <label className="toggle-row">
        <input
          type="checkbox"
          checked={causalMask}
          onChange={(event) => setCausalMask(event.target.checked)}
        />
        启用因果 Mask（屏蔽当前位置之后的 token）
      </label>
      <div className="matrix-grid-layout">
        {matrix("Q · Query", [
          [1, 0],
          [0, 1],
          [1, 1],
        ])}
        {matrix("K · Key", [
          [1, 0],
          [0, 1],
          [1, 1],
        ])}
        {matrix("V · Value", [
          [1, 0],
          [0, 1],
          [1, 1],
        ])}
      </div>
      <div className="matrix-grid-layout">
        {matrix("Attention Scores · QKᵀ / √dₖ", result.scores)}
        {matrix("Softmax Weights", result.weights)}
        {matrix("Output · Weights × V", result.output)}
      </div>
      <aside className="lab-notice">
        <strong>实验边界</strong>
        <p>
          使用固定的 3×2 教学矩阵在浏览器中计算单头 scaled dot-product attention。Mask 中 false
          表示屏蔽。该实验不加载模型权重、不执行完整 Transformer，也不代表任何模型的真实注意力图。
        </p>
      </aside>
    </section>
  );
}
