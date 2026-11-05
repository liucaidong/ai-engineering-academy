# 教师教学指南索引

本目录包含 M01–M20 全部旗舰课程的教师指南和正式作业参考解答。指南用于备课、课堂组织、助教批改和学生复习；不替代课程原文和正式 Rubric。

## 完成状态

**M01–M20 共 20 份教师指南全部完成。** 覆盖 20 个模块、100 讲、100 项正式评分作业。每项参考解答均对应课程原题，并逐项列出原始 Rubric 标准和分值。

| 模块 | 主题 | 教学重点 |
|---|---|---|
| [M01](./M01-teaching-guide.md) | AI、机器学习与大语言模型 | 概念地图、训练泛化、LLM 生成、能力边界、系统设计 |
| [M02](./M02-teaching-guide.md) | Transformer 与 Attention | Q/K/V、手算 Attention、多头/Mask、位置机制、推理复杂度 |
| [M03](./M03-teaching-guide.md) | Token、Embedding 与 Context | Tokenizer、Embedding、Token Budget、Context Assembly |
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

1. 模块教学定位、先修知识与课前准备；
2. 五讲教学路径和关键机制；
3. 学习检查点、教师提示和课后复习；
4. 五项正式作业的参考解答与推理过程；
5. 与原始 Rubric 逐项对齐的评分说明；
6. 常见错误、纠正重点和批改要求。

## 使用约定

- 参考解答是可复核的示范路径，不是唯一可接受答案。
- 数值结果必须连同单位、假设、边界和中间步骤一起评分。
- 设计方案必须区分已实现、已测试、模拟和未验证。
- 安全、权限和外部副作用不能用 Prompt 声明替代服务端强制控制。
- 教师指南是教学文档，不代表新增运行时、真实外部集成或生产验收。
