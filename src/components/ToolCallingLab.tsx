import { useState } from "react";
import { executeTeachingToolCall, type ToolExecutionResult } from "../labs/toolCalling";

export default function ToolCallingLab() {
  const [toolName, setToolName] = useState("search_course");
  const [argumentsJson, setArgumentsJson] = useState('{"query":"Transformer"}');
  const [allowed, setAllowed] = useState(true);
  const [result, setResult] = useState<ToolExecutionResult | null>(null);

  return <section className="lab-panel" aria-labelledby="tool-calling-title">
    <div className="lab-heading"><div><span className="eyebrow">INTERACTIVE LAB · M07</span><h2 id="tool-calling-title">Tool Calling Lab</h2><p>观察模型请求如何经过 Schema、权限检查和 Runtime 执行。</p></div><span className="execution-tag">本地模拟</span></div>
    <div className="tool-flow" aria-label="工具调用流程"><span>Model Request</span><b>→</b><span>Schema</span><b>→</b><span>Policy</span><b>→</b><span>Runtime</span><b>→</b><span>Result</span></div>
    <label className="field-label" htmlFor="tool-name">注册工具</label>
    <select id="tool-name" className="lab-input" value={toolName} onChange={(event) => { setToolName(event.target.value); setResult(null); }}>
      <option value="search_course">search_course · 只读课程搜索</option>
      <option value="get_module">get_module · 只读模块详情</option>
      <option value="shell_exec">shell_exec · 未注册工具（拒绝）</option>
    </select>
    <label className="field-label tool-args-label" htmlFor="tool-arguments">模型生成的参数 JSON</label>
    <textarea id="tool-arguments" value={argumentsJson} onChange={(event) => { setArgumentsJson(event.target.value); setResult(null); }} rows={4} spellCheck={false} />
    <label className="toggle-row"><input type="checkbox" checked={allowed} onChange={(event) => { setAllowed(event.target.checked); setResult(null); }} /> Runtime 策略允许本次工具调用</label>
    <button className="primary-button" type="button" onClick={() => setResult(executeTeachingToolCall(toolName, argumentsJson, allowed))}>提交工具调用</button>
    <div className="result-block"><h3>Runtime 执行结果</h3><pre className="lab-json" aria-live="polite">{result ? JSON.stringify(result, null, 2) : "等待工具调用。可修改参数或关闭权限，观察 Runtime 的拒绝路径。"}</pre></div>
    <aside className="lab-notice"><strong>安全边界</strong><p>只包含 search_course 和 get_module 两个本地只读工具。没有 Shell、文件系统、网络或外部 API 能力；模型请求本身不构成授权。</p></aside>
  </section>;
}
