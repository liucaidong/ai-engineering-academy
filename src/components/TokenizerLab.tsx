import { useMemo, useState } from "react";
import { encodeWithToyBpe } from "../labs/bpe";

const DEFAULT_TEXT = "the learning model is learning";

export default function TokenizerLab() {
  const [input, setInput] = useState(DEFAULT_TEXT);
  const result = useMemo(() => encodeWithToyBpe(input), [input]);

  return (
    <section className="lab-panel" aria-labelledby="tokenizer-title">
      <div className="lab-heading">
        <div>
          <span className="eyebrow">INTERACTIVE LAB · M03</span>
          <h2 id="tokenizer-title">Tokenizer Lab</h2>
          <p>观察一个极简 BPE 合并表如何逐步合并相邻字符片段。</p>
        </div>
        <span className="execution-tag">浏览器本地执行</span>
      </div>

      <label className="field-label" htmlFor="tokenizer-input">输入文本</label>
      <textarea
        id="tokenizer-input"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        rows={3}
        maxLength={240}
        placeholder="输入英文文本，例如: the learning model"
      />

      <div className="token-stats" aria-live="polite">
        <div><strong>{result.tokens.length}</strong><span>最终片段数</span></div>
        <div><strong>{result.steps.length}</strong><span>合并次数</span></div>
        <div><strong>{Array.from(input).length}</strong><span>输入字符数</span></div>
      </div>

      <div className="result-block">
        <h3>最终切分结果</h3>
        <div className="token-list" role="list" aria-label="切分后的 token 片段">
          {result.tokens.length ? result.tokens.map((token, index) => (
            <span role="listitem" className={/^\s+$/u.test(token) ? "token whitespace-token" : "token"} key={`${index}-${token}`}>
              {/^\s+$/u.test(token) ? "␠".repeat(Math.min(token.length, 4)) : token}
            </span>
          )) : <span className="muted">输入内容后显示结果</span>}
        </div>
      </div>

      <div className="result-block">
        <h3>合并过程</h3>
        {result.steps.length ? (
          <ol className="merge-list">
            {result.steps.map((step, index) => (
              <li key={`${index}-${step.rank}`}>
                <span className="step-number">{index + 1}</span>
                <code>{step.left} + {step.right}</code>
                <span className="merge-arrow">→</span>
                <code className="merged-token">{step.merged}</code>
                <span className="rank-label">rank {step.rank}</span>
              </li>
            ))}
          </ol>
        ) : <p className="muted">当前输入没有匹配到示例合并规则。</p>}
      </div>

      <aside className="lab-notice">
        <strong>实验边界</strong>
        <p>这是用于讲解 BPE 合并思想的玩具词表，不是 GPT、Qwen 或其他模型的真实 tokenizer。真实模型使用各自训练得到的词表、预分词规则和特殊 token 约定；本实验不输出真实模型 token 数或 token ID。</p>
      </aside>
    </section>
  );
}
