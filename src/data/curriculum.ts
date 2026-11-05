import type { Course } from "../types/course";

const lesson = (moduleId: string, title: string, summary: string, objectives: string[]) => ({
  id: `${moduleId.toLowerCase()}-intro`,
  title: `${title}：核心概念与工作机制`,
  summary,
  learningObjectives: objectives,
  estimatedMinutes: 25,
  content: [
    { heading: "本节要解决的问题", body: summary },
    { heading: "学习方法", body: "先建立概念模型，再观察数据流和边界条件，最后通过实验或工程任务验证理解。" }
  ]
});

const moduleRows = [
  ["M01","L1","AI、机器学习与大语言模型","建立人工智能、机器学习、深度学习和 LLM 的概念地图。",[],["区分 AI、ML、DL 与 LLM","识别生成式 AI 的能力边界"],""],
  ["M02","L2","Transformer 与 Attention","理解 Transformer 的核心组件和信息交互机制。",["M01"],["解释 Attention 的输入、权重与输出","理解 Encoder、Decoder 与层堆叠"],"transformer"],
  ["M03","L2","Token、Embedding 与 Context","理解文本如何转化为模型可处理的表示。",["M01"],["解释 Tokenization 与 Embedding 的区别","分析上下文窗口和 token 预算"],"tokenizer"],
  ["M04","L2","预训练、微调与对齐","理解模型训练阶段、数据和优化目标。",["M02"],["区分预训练、SFT 与偏好对齐","理解训练数据和评估集的作用"],""],
  ["M05","L2","推理、解码与部署","理解模型生成过程及推理服务的性能指标。",["M02","M03"],["解释采样、温度和 KV Cache","识别吞吐、延迟和显存瓶颈"],""],
  ["M06","L3","Prompt Engineering","构建可测试、可复用的提示词设计方法。",["M01","M03"],["设计指令、上下文和输出约束","建立提示词测试用例"],""],
  ["M07","L3","结构化输出与 Tool Calling","掌握模型与外部工具之间的契约交互。",["M06"],["定义工具 schema 与参数校验","区分工具请求和工具执行"],"tool-calling"],
  ["M08","L3","检索增强生成 RAG","构建可追溯知识检索与生成链路。",["M03","M07"],["解释切分、向量检索和重排","设计引用与检索评估"],"rag"],
  ["M09","L3","多模态 AI","理解文本、图像、音频等模态的输入输出路径。",["M03","M05"],["识别多模态编码与融合方式","分析模态数据的限制和风险"],""],
  ["M10","L4","Agent 基础与 Runtime","理解 Agent 循环、状态和工具执行边界。",["M07","M08"],["描述观察、决策、行动循环","设计可终止、可恢复的 Agent 状态机"],"agent"],
  ["M11","L4","Planning、Memory 与状态","理解任务分解、记忆读写和状态持久化。",["M10"],["区分短期状态与长期记忆","设计计划更新和记忆治理"],""],
  ["M12","L4","MCP 协议与集成","理解 MCP 的参与角色、能力发现和消息交互。",["M07","M10"],["解释 Host、Client、Server 关系","理解工具、资源和提示模板"],"mcp"],
  ["M13","L4","Skills 与可复用能力","设计可发现、可组合、可维护的 Agent 能力单元。",["M10","M12"],["定义 Skill 的输入输出契约","设计版本、依赖和权限边界"],""],
  ["M14","L4","Multi-Agent 系统","分析多 Agent 分工、协作、协调和成本。",["M10","M11"],["比较常见协作拓扑","设计消息、终止和冲突处理"],"multi-agent"],
  ["M15","L4","安全、权限与人工审批","建立 Agent 工具执行的安全控制体系。",["M07","M10"],["识别 Prompt Injection 与越权风险","设计最小权限和人工审批"],""],
  ["M16","L4","Workflow 与编排","区分确定性工作流和自主 Agent 的适用场景。",["M10","M15"],["设计可观测的工作流状态","定义重试、补偿和人工介入点"],""],
  ["M17","L5","Evaluation 与 Observability","建立离线评测、线上观测和回归治理。",["M08","M10"],["设计数据集、评分器和指标","分析延迟、成本、质量和失败率"],"evaluation"],
  ["M18","L5","AI 平台架构","理解模型网关、租户、队列和服务治理。",["M05","M17"],["设计模型路由和配额边界","分析可靠性、扩展性与成本"],""],
  ["M19","L5","应用工程化与交付","将 AI 能力转化为可部署、可维护的产品。",["M15","M17","M18"],["设计测试、发布和运维流程","建立安全、数据和成本治理"],""],
  ["M20","L6","Capstone 综合项目","完成覆盖需求、架构、实现、评测和交付的综合项目。",["M01","M02","M03","M04","M05","M06","M07","M08","M09","M10","M11","M12","M13","M14","M15","M16","M17","M18","M19"],["交付端到端 AI 工程系统","提交测试、威胁模型和运行文档"],""]
] as const;

export const course: Course = {
  id: "ai-engineering-foundations",
  title: "AI Engineering Academy",
  description: "从大模型原理、AI 应用开发到 Agent 系统与平台工程的系统化学习路径。",
  version: "0.1.0",
  language: "zh-CN",
  modules: moduleRows.map(([id, level, title, summary, prerequisites, objectives, labId]) => ({
    id, level, title, summary, prerequisites: [...prerequisites], objectives: [...objectives],
    lessons: [lesson(id, title, summary, [...objectives])],
    ...(labId ? { labId } : {})
  }))
};
