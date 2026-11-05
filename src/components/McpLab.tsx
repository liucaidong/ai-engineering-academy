import { useState } from "react";
import { callTeachingMcpTool, discoverTeachingMcpCapabilities, type McpCapabilities } from "../labs/mcp";
import type { ToolExecutionResult } from "../labs/toolCalling";

export default function McpLab() {
  const [capabilities, setCapabilities] = useState<McpCapabilities | null>(null);
  const [result, setResult] = useState<ToolExecutionResult | null>(null);
  return <section className="lab-panel" aria-labelledby="mcp-title">
    <div className="lab-heading"><div><span className="eyebrow">INTERACTIVE LAB · M12</span><h2 id="mcp-title">MCP Protocol Lab</h2><p>理解 Host、Client、Server 的职责，以及 Tools、Resources、Prompts 的能力发现。</p></div><span className="execution-tag">协议模拟</span></div>
    <div className="mcp-roles" aria-label="MCP 角色关系"><article><strong>Host</strong><span>AI 应用与用户交互</span></article><b>↔</b><article><strong>Client</strong><span>管理协议请求与响应</span></article><b>↔</b><article><strong>Server</strong><span>暴露受控能力</span></article></div>
    <button className="primary-button" type="button" onClick={() => { setCapabilities(discoverTeachingMcpCapabilities()); setResult(null); }}>发现 Server 能力</button>
    {capabilities && <div className="mcp-capabilities" aria-live="polite">
      <section><h3>Tools</h3>{capabilities.tools.map((item) => <p key={item.name}><strong>{item.name}</strong> · {item.description}</p>)}</section>
      <section><h3>Resources</h3>{capabilities.resources.map((item) => <p key={item.uri}><strong>{item.name}</strong> · {item.uri}</p>)}</section>
      <section><h3>Prompts</h3>{capabilities.prompts.map((item) => <p key={item.name}><strong>{item.name}</strong> · {item.description}</p>)}</section>
      <button className="secondary-button" type="button" onClick={() => setResult(callTeachingMcpTool("search_course", '{"query":"MCP"}'))}>调用 search_course Tool</button>
    </div>}
    {result && <div className="result-block"><h3>Tool Result</h3><pre className="lab-json">{JSON.stringify(result, null, 2)}</pre></div>}
    <aside className="lab-notice"><strong>协议边界</strong><p>此实验只在浏览器内模拟能力发现和本地工具分发，不建立 JSON-RPC 连接、不启动 MCP Server，也不代表真实协议兼容性测试。</p></aside>
  </section>;
}
