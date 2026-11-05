# 教师教学指南索引

本目录存放旗舰课程配套教师指南与正式作业参考解答，供教师备课、助教批改和学生复习使用；不替代课程内讲义、作业要求或正式评分 Rubric。

## 完成状态

**M04–M20 共 17 份教师指南已完成。** M01–M03 保留原有旗舰课程内容，本轮不改写其既有教材。

| 模块 | 主题 | 教学与作业参考重点 |
|---|---|---|
| [M04](./M04-teaching-guide.md) | 预训练、模型架构、微调与对齐 | NLL/FLOPs、MoE、SFT/LoRA、PPO/DPO、模型发布 |
| [M05](./M05-teaching-guide.md) | 推理、解码与服务工程 | KV Cache、采样、Continuous Batching、量化、容量工程 |
| [M06](./M06-teaching-guide.md) | Prompt Engineering | Prompt 契约、Few-shot、结构化输出、注入防御、评测发布 |
| [M07](./M07-teaching-guide.md) | 结构化输出与 Tool Calling | 协议状态机、Schema/授权、路由、幂等事务、工具评测 |
| [M08](./M08-teaching-guide.md) | 检索增强生成 RAG | 双流水线、Chunking、Embedding/ANN、RRF/Reranking、ACL/评测 |
| [M09](./M09-teaching-guide.md) | 多模态 AI | 融合对齐、ViT、Diffusion、ASR/TTS、时间同步与隐私 |
| [M10](./M10-teaching-guide.md) | Agent 基础与 Runtime | 自主性边界、Plan/Act/Observe、状态恢复、隔离与可靠性 |
| [M11](./M11-teaching-guide.md) | Planning、Memory 与状态 | 任务 DAG、记忆生命周期、检索巩固、HITL、综合评测 |
| [M12](./M12-teaching-guide.md) | MCP 协议与集成 | 角色/JSON-RPC、能力发现、Transport、安全、互操作 |
| [M13](./M13-teaching-guide.md) | Skills 与可复用能力 | 能力契约、包结构、组合 DAG、供应链、Registry |
| [M14](./M14-teaching-guide.md) | Multi-Agent 协作系统 | 拓扑选择、消息协议、共享状态、证据仲裁、单位成功成本 |
| [M15](./M15-teaching-guide.md) | AI 安全、权限与人工审批 | STRIDE、注入/隐私、RBAC/ABAC、人工监督、红队响应 |
| [M16](./M16-teaching-guide.md) | Workflow 与确定性编排 | 边界、事件/Saga、重试熔断、审批审计、回放治理 |
| [M17](./M17-teaching-guide.md) | Evaluation 与 Observability | 指标体系、统计可信度、Judge 校准、Trace、线上 SLO |
| [M18](./M18-teaching-guide.md) | AI Platform 架构 | 控制/数据平面、Gateway、配额计量、租户隔离、可靠性 |
| [M19](./M19-teaching-guide.md) | AI 产品工程化与交付 | 问题验证、AI UX/HITL、单位经济性、实验、发布运营 |
| [M20](./M20-teaching-guide.md) | Capstone 综合项目 | 章程、架构 ADR、垂直切片、验收安全、答辩交付 |

## 每份指南的固定结构

1. 先修知识、课前准备与教学目标；
2. 五讲逐讲教学路径和核心机制；
3. 学习检查点与教师提示；
4. 课后复习和可检查证据；
5. 五项正式作业的参考解答与推理过程；
6. 与原始 Rubric 逐项对齐的评分说明；
7. 常见错误、纠正重点和教师批改总表。

## 教学使用约定

- 参考解答解释一种严谨、可复核的解题路径，不是唯一标准答案。
- 数值结果应连同单位、假设、边界和不确定性一起评分。
- 设计方案必须区分已实现、已测试、模拟和未验证。
- 对安全、权限和外部副作用，不能用 Prompt 声明替代服务端强制控制。
- 本目录只提供教材与教师材料，不代表新增运行时、真实外部集成或生产环境验收。
