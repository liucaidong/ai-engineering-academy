import { lazy } from "react";
import type { ComponentType, LazyExoticComponent } from "react";

export const LAB_COMPONENTS: Record<string, LazyExoticComponent<ComponentType>> = {
  tokenizer: lazy(() => import("../../components/TokenizerLab")),
  transformer: lazy(() => import("../../components/TransformerLab")),
  rag: lazy(() => import("../../components/RagLab")),
  "tool-calling": lazy(() => import("../../components/ToolCallingLab")),
  agent: lazy(() => import("../../components/AgentRuntimeLab")),
  mcp: lazy(() => import("../../components/McpLab")),
  "multi-agent": lazy(() => import("../../components/MultiAgentLab")),
  evaluation: lazy(() => import("../../components/EvaluationLab")),
};
