import type { Course, CourseModule } from "../types/course";

export type CourseModuleSummary = Omit<CourseModule, "lessons">;
export type CourseCatalog = Omit<Course, "modules"> & { modules: CourseModuleSummary[] };

const moduleRows = [
  ["M01","L1","AI、机器学习与大语言模型","建立人工智能、机器学习、深度学习和 LLM 的概念地图。",[],["区分 AI、机器学习、深度学习、生成式 AI 与 LLM","解释机器学习训练数据、参数、损失和泛化","理解神经网络与自回归语言模型的基本机制","识别大模型的能力边界、失败模式和验证要求","完成一个具有数据流、权限边界和评测指标的 AI 系统设计"],""],
  ["M02","L2","Transformer 与 Attention","理解 Transformer 的核心组件和信息交互机制。",["M01"],["从输入 token 表示推导 Q、K、V 的来源与张量形状","手工计算 scaled dot-product attention 的分数、权重与输出","解释 Multi-Head Attention 的投影、拼接和输出变换","区分 Encoder self-attention、Decoder causal self-attention 与 cross-attention","比较绝对位置编码、相对位置机制与 RoPE 的基本思想","解释残差连接、LayerNorm、FFN 与 Transformer Block 的职责","分析注意力的计算复杂度、KV Cache 与 FlashAttention 的优化目标","使用 Transformer Lab 验证 mask、权重和张量维度"],"transformer"],
  ["M03","L2","Token、Embedding 与 Context","从文本离散化、向量表示到上下文预算，建立模型输入表示的完整认知。",["M01","M02"],["区分 Unicode 码点、UTF-8 字节、token 与 token ID","比较词级、字符级、BPE、WordPiece 与 Unigram 的基本思想","解释特殊 token、Chat Template 和消息序列化的作用","明确 Token ID 是离散索引，Embedding 是可学习的稠密向量","计算 embedding 参数量、权重存储量并解释 weight tying","区分 token embedding、位置表示和 contextual hidden state","建立包含指令、历史、检索、工具结果和输出预留的 token budget","比较截断、滑动窗口、摘要、RAG 与长上下文的取舍","使用 Tokenizer Lab 并提交可追溯的 Token/Context 审计报告"],"tokenizer"],
  ["M04","L2","预训练、微调与对齐","从训练目标、数据工程、架构家族、参数高效微调到偏好对齐，理解模型能力的形成与验证。",["M02","M03"],["区分 Causal LM、Masked LM 与 Span Corruption，解释架构和训练目标的关系","审查训练语料许可、去重、污染、PII 处理和数据 lineage","比较 Encoder-only、Decoder-only、Encoder–Decoder、Dense 与 MoE 的信息流和系统成本","设计 SFT 样本、token-level loss mask，并推导 LoRA 参数量","比较 LoRA 与 QLoRA 的量化、资源账本和训练质量边界","解释 RLHF/PPO、DPO、RLAIF 与 Constitutional AI 的流程层级和偏好风险","设计校准、分层评测、模型卡和发布门禁"],""],
  ["M05","L2","推理、解码与部署","从 Prefill/Decode、KV Cache、解码、批处理、量化到推理服务架构，建立完整的性能与容量工程方法。",["M02","M03"],["区分 Prefill 与 Decode 并推导 KV Cache 内存模型","解释 PagedAttention 的块分配、前缀复用和缓存隔离边界","解释 Temperature、Top-k、Top-p 与结构化约束解码的不同职责","比较 Continuous Batching、Chunked Prefill 与 Prefill/Decode 分离","推导 Speculative Decoding 的接受/拒绝校正并比较量化方法","建立包含权重、KV、激活、workspace 和安全余量的容量账本","设计 TTFT、TPOT、goodput、Admission Control 与 SLO 压测"],""],
  ["M06","L3","Prompt Engineering","把 Prompt 作为可版本化的任务契约，覆盖示例选择、结构化输出、安全边界和回归评测。",["M01","M03"],["定义绑定模型、工具和评测版本的 Prompt manifest","在 token budget 下兼顾 Few-shot 覆盖、相关性、多样性和顺序稳健性","区分 JSON parse、Schema、grammar constraints、业务语义和授权","识别直接/间接 Prompt Injection 并设计服务端信任边界与工具控制","用 BIPIA 风格攻击矩阵验证模型输出和工具执行端","校准 LLM Judge，检查位置/长度偏差并报告统计不确定性","建立 Prompt 数据集、Canary、发布门禁和回滚流程"],""],
  ["M07","L3","结构化输出与 Tool Calling","从工具协议、参数契约、发现路由、副作用幂等到安全评测，建立可靠的模型—工具执行边界。",["M06"],["区分 Provider Tool Calling、Host Runtime、MCP Tools 和 JSON-RPC 协议层次","建立 provider-specific strict Schema 兼容矩阵和服务端二次校验","设计 Deferred Tool Discovery、最小候选集合和程序化工具编排","实现 unknown outcome、幂等键、RFC 9457 错误契约和补偿机制","分层评测工具选择、参数、授权、执行与业务结果","区分静态、mock、sandbox、provider-backed 和生产 canary 证据等级"],"tool-calling"],
  ["M08","L3","检索增强生成 RAG","覆盖文档摄取、Chunking、Embedding、向量/混合检索、重排、引用和生产评测。",["M03","M07"],["设计离线索引与在线检索两条流水线","比较文档切分策略并计算索引规模","解释 embedding、相似度和 ANN 索引机制","融合 BM25 与 dense retrieval 并设计 reranking","分离检索/生成评测并治理 ACL、更新和故障降级"],"rag"],
  ["M09","L3","多模态 AI","从表示对齐、Vision Transformer、图像生成、音频 tokenization 到多模态系统工程。",["M03","M05"],["比较 early/late fusion 与 cross-attention","计算 ViT patch 序列与注意力规模","解释扩散模型去噪目标和条件引导","设计 ASR/TTS 音频数据流并计算 PCM 数据量","构建多模态评测、时间同步、成本和隐私治理"],""],
  ["M10","L4","Agent 基础与 Runtime","从 Agent 基本模型、决策循环、状态机、工具上下文到可靠性验收，建立受控 Agent Runtime 设计方法。",["M07","M08"],["区分 Agent、普通 LLM 应用和确定性 workflow","设计 Plan/Act/Observe 循环和可验证终止条件","构建状态机、并行调度、checkpoint 与恢复","管理上下文、工具生命周期、租户和执行隔离","通过轨迹、故障注入和人工接管验证可靠性"],"agent"],
  ["M11","L4","Planning、Memory 与状态","深化任务 DAG、动态重规划、记忆分层、检索巩固、人类反馈和生命周期治理。",["M10"],["把目标拆分为可执行子任务和依赖 DAG","比较上下文、状态、短期记忆和知识库","设计记忆写入、检索、TTL、冲突和删除策略","将审批和用户更正纳入持久化状态机","评测计划质量、记忆准确性、过期率和恢复能力"],""],
  ["M12","L4","MCP 协议与集成","从 MCP 架构、能力协商、传输会话、安全授权到互操作运维，掌握协议工程。",["M07","M10"],["区分 Host、Client、Server 和 JSON-RPC 消息语义","比较 Tools、Resources、Prompts 和能力协商","设计 stdio/HTTP transport、会话和断连恢复","建立 Server 身份、scope、工具投毒防护和审计","构建协议一致性、互操作和生产运维验收"],"mcp"],
  ["M13","L4","Skills 与可复用能力","从能力契约、包结构、组合路由、安全供应链到目录治理，建设可复用 Agent Skill。",["M10","M12"],["区分 Skill、Tool、Prompt 和 Workflow","定义 Skill 输入输出、前置条件和完成标准","设计包结构、元数据和渐进式资源加载","治理依赖、权限、脚本执行和供应链风险","建立 Skill 测试、SemVer、发布和撤销流程"],""],
  ["M14","L4","Multi-Agent 系统","比较协作拓扑，设计任务路由、消息协议、共享状态、冲突仲裁和成本评测。",["M10","M11"],["判断多 Agent 相对单 Agent 的净收益","比较 Manager/Worker、Peer 和流水线拓扑","定义角色、Task/Result 协议和路由策略","处理共享状态竞态、死锁、冲突和证据仲裁","建立单 Agent baseline、成本模型和可靠性指标"],"multi-agent"],
  ["M15","L4","安全、权限与人工审批","覆盖 AI 威胁建模、数据隐私、工具授权、输出治理和安全事件响应。",["M07","M10"],["使用 STRIDE/攻击树识别模型、数据和工具风险","防护 Prompt Injection、数据泄露和跨租户越权","设计认证、授权、ABAC/RBAC、沙箱和高风险审批","治理输出偏差、高影响决策和人工监督","建立红队测试、安全指标、事件响应和风险接受流程"],""],
  ["M16","L4","Workflow 与编排","从 Workflow/Agent 边界、事件编排、重试补偿、人工审批到版本化测试，掌握确定性流程工程。",["M10","M15"],["比较 Workflow、状态机和 Agent 的适用边界","设计顺序/并行/事件驱动 DAG 与 Saga","建立有界重试、超时、熔断和补偿策略","将审批、参数绑定和审计纳入状态机","通过状态覆盖、故障注入和回放验收流程"],""],
  ["M17","L5","Evaluation 与 Observability","从评测指标、数据集、自动评分、Trace/Metrics/Logs 到线上 SLO，建立质量闭环。",["M08","M10"],["定义模型/组件/端到端评测层次和指标分母","设计无泄漏 benchmark、标注和统计区间","校准规则评分、LLM Judge 与人工评审","设计 GenAI trace、低基数 metrics 和隐私日志","监测线上漂移并建立质量 SLI/SLO 与回归闭环"],"evaluation"],
  ["M18","L5","AI 平台架构","设计控制/数据平面、Model Gateway、租户配额、密钥策略和平台可靠性。",["M05","M17"],["划分控制平面、数据平面和应用责任","建立模型能力目录、路由和安全 fallback","设计多维配额、限流、计量与成本归因","构建租户隔离、secret broker 和 policy engine","定义平台故障域、弹性、RTO/RPO 和 SLO"],""],
  ["M19","L5","应用工程化与交付","从用户问题、AI UX、人机协作、单位经济性、产品实验到持续交付，完成 AI 产品工程闭环。",["M15","M17","M18"],["定义可验证用户任务、AI 适用性和产品价值","设计不确定性表达、人工复核、纠错和撤销体验","计算模型/人工/工具成本并建立单位经济性","设计产品质量指标树、A/B 实验和反馈漏斗","建立版本化交付、canary、回滚、运营和退役机制"],""],
  ["M20","L6","Capstone 综合项目","以可验收的真实问题为起点，交付涵盖模型、RAG、Agent、工具、安全、评测、观测和部署的端到端系统。",["M01","M02","M03","M04","M05","M06","M07","M08","M09","M10","M11","M12","M13","M14","M15","M16","M17","M18","M19"],["编写项目章程、范围、非目标和验收指标","提交架构图、数据流、ADR 和信任边界","集成模型、RAG、Agent 与工具并保留执行审计","完成端到端评测、威胁模型、SLO 和部署方案","提交可复现演示、答辩材料和未验证事项清单"],""],
] as const;

export const courseCatalog: CourseCatalog = {
  schemaVersion: 1,
  id: "ai-engineering-foundations",
  title: "AI Engineering Academy",
  description: "从大模型原理、AI 应用开发到 Agent 系统与平台工程的系统化学习路径。",
  version: "0.40.9",
  language: "zh-CN",
  labs: [
    { id: "tokenizer", title: "Tokenizer Lab", executionMode: "browser-local", description: "使用玩具 BPE 词表观察子词合并。", safetyNotes: ["仅使用内置示例词表，不调用外部模型。"], inputs: [{ name: "text", description: "待切分文本" }], outputs: [{ name: "tokens", description: "示例 token 片段与合并过程" }], status: "implemented" },
    { id: "transformer", title: "Transformer Attention Lab", executionMode: "browser-local", description: "使用固定小矩阵计算 scaled dot-product attention。", safetyNotes: ["仅在浏览器内执行固定矩阵运算，不加载模型权重。"], inputs: [{ name: "mask", description: "可选因果注意力掩码" }], outputs: [{ name: "attention", description: "分数、权重与加权输出矩阵" }], status: "implemented" },
    { id: "rag", title: "RAG Pipeline Lab", executionMode: "simulation", description: "演示 chunking、教学向量、Top-K 检索与重排。", safetyNotes: ["使用内置虚构语料和确定性教学向量，不连接外部数据或模型。"], inputs: [{ name: "query", description: "检索查询" }], outputs: [{ name: "results", description: "教学检索与重排结果" }], status: "implemented" },
    { id: "tool-calling", title: "Tool Calling Lab", executionMode: "simulation", description: "演示工具 Schema、参数验证、Runtime 权限和只读执行。", safetyNotes: ["只调用本地课程目录只读工具，不访问网络、Shell 或外部 API。", "模型请求不构成授权，Runtime 策略可拒绝调用。"], inputs: [{ name: "tool", description: "注册工具名称与 JSON 参数" }], outputs: [{ name: "result", description: "结构化工具执行结果或拒绝原因" }], status: "implemented" },
    { id: "agent", title: "Agent Runtime Lab", executionMode: "simulation", description: "演示 Agent 状态机、人工审批、执行、观察和终止条件。", safetyNotes: ["使用确定性状态机，不调用 LLM。", "工具执行前必须经过人工批准，拒绝后进入终止状态。"], inputs: [{ name: "decision", description: "推进状态或批准/拒绝工具请求" }], outputs: [{ name: "trace", description: "状态转移与运行事件" }], status: "implemented" },
    { id: "mcp", title: "MCP Protocol Lab", executionMode: "simulation", description: "演示 Host、Client、Server 和 Tools、Resources、Prompts 能力发现。", safetyNotes: ["仅浏览器本地模拟，不建立 JSON-RPC 连接或启动真实 MCP Server。"], inputs: [{ name: "discovery", description: "发现本地模拟 Server 能力" }], outputs: [{ name: "capabilities", description: "工具、资源和提示模板清单" }], status: "implemented" },
    { id: "multi-agent", title: "Multi-Agent Lab", executionMode: "simulation", description: "演示专业角色分工、独立发现和 Manager 综合。", safetyNotes: ["角色输出由确定性函数模拟，不执行并发模型调用。", "综合结果不替代证据核验或人工决策。"], inputs: [{ name: "topic", description: "多 Agent 协作主题" }], outputs: [{ name: "report", description: "角色发现与综合建议" }], status: "implemented" },
    { id: "evaluation", title: "Evaluation Lab", executionMode: "simulation", description: "使用固定数据集演示 Exact Match、通过率和失败案例。", safetyNotes: ["不调用模型评分器；固定答案仅用于教学，不代表真实模型能力。"], inputs: [{ name: "dataset", description: "内置评测案例" }], outputs: [{ name: "metrics", description: "通过数、准确率和逐案例结果" }], status: "implemented" }
  ],
  modules: moduleRows.map(([id, level, title, summary, prerequisites, objectives, labId]) => ({
    id,
    level,
    title,
    summary,
    prerequisites: [...prerequisites],
    objectives: [...objectives],
    ...(labId ? { labId } : {}),
  })),
};
