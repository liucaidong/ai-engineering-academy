export type AgentFinding = { role: string; title: string; finding: string; confidence: "high" | "medium" };
export type MultiAgentReport = { findings: AgentFinding[]; synthesis: string; coordinationNotes: string[] };

export function runTeachingMultiAgentReview(topic: string): MultiAgentReport {
  const subject = topic.trim() || "AI Engineering Academy";
  const findings: AgentFinding[] = [
    { role: "Research Agent", title: "概念与证据", finding: "围绕“" + subject + "”先识别权威来源、定义和适用范围。", confidence: "high" },
    { role: "Architecture Agent", title: "系统与边界", finding: "将模型、应用、Runtime、工具和数据层分开，明确每个组件的责任。", confidence: "high" },
    { role: "Evaluation Agent", title: "验收与风险", finding: "定义可重复测试、失败案例、权限边界、延迟和成本指标。", confidence: "medium" }
  ];
  return {
    findings,
    synthesis: "对“" + subject + "”的综合建议：先建立可验证的单一责任链路，再按证据引入并行 Agent；所有工具执行仍由 Runtime 统一授权和审计。",
    coordinationNotes: ["三个角色使用独立输出契约。", "汇总阶段保留不同置信度，不把多数意见当成事实证明。", "这是确定性教学演示，没有调用多个模型或执行外部任务。"]
  };
}
