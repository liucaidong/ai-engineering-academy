# 教师教学指南索引

本目录包含 M01–M20 全部旗舰课程的教师指南和正式作业参考解答。指南用于备课、课堂组织、助教批改和学生复习；不替代课程原文和正式 Rubric。

## 完成状态

**M01–M20 共 20 份教师指南全部完成。** 覆盖 20 个模块、100 讲、100 项正式评分作业。每项参考解答均对应课程原题，并逐项列出原始 Rubric 标准和分值。

| 模块 | 主题 | 教学重点 |
|---|---|---|
| [M01](./M01-teaching-guide.md) · [实验工作簿](./M01-lab-workbook.md) | AI、机器学习与大语言模型 | 概念地图、训练泛化、LLM 生成、能力边界、系统设计 |
| [M02](./M02-teaching-guide.md) · [实验工作簿](./M02-lab-workbook.md) | Transformer 与 Attention | Q/K/V、手算 Attention、多头/Mask、位置机制、推理复杂度 |
| [M03](./M03-teaching-guide.md) · [实验工作簿](./M03-lab-workbook.md) | Token、Embedding 与 Context | Tokenizer、Embedding、Token Budget、Context Assembly |
| [M04](./M04-teaching-guide.md) · [实验工作簿](./M04-lab-workbook.md) | 预训练、模型架构、微调与对齐 | NLL/FLOPs、MLM/T5、MoE、SFT/LoRA/QLoRA、PPO/DPO/RLAIF、校准与模型发布 |
| [M05](./M05-teaching-guide.md) · [实验工作簿](./M05-lab-workbook.md) | 推理、解码与服务工程 | KV/PagedAttention、采样与约束解码、Continuous Batching/Chunked Prefill、量化/Speculative、Goodput/SLO |
| [M06](./M06-teaching-guide.md) · [实验工作簿](./M06-lab-workbook.md) | Prompt Engineering | Prompt manifest、Few-shot 覆盖、Grammar/Schema、BIPIA 红队、Judge 校准与回滚 |
| [M07](./M07-teaching-guide.md) · [实验工作簿](./M07-lab-workbook.md) | 结构化输出与 Tool Calling | 协议分层、Strict Schema、Deferred Discovery、Programmatic Calling、幂等与分层验收 |
| [M08](./M08-teaching-guide.md) · [实验工作簿](./M08-lab-workbook.md) | 检索增强生成 RAG | 双流水线、RAG/Long Context/Fine-tuning 选型、结构感知 Chunking、Hybrid/Corrective Retrieval、引用与分层评测 |
| [M09](./M09-teaching-guide.md) · [实验工作簿](./M09-lab-workbook.md) | 多模态 AI | 对比式对齐、动态视觉 Token、Latent Diffusion/NFE、流式 ASR、视频时序 Grounding 与隐私 |
| [M10](./M10-teaching-guide.md) · [实验工作簿](./M10-lab-workbook.md) | Agent 基础与 Runtime | 自主性包络、可验证 Agent Loop、Durable Replay、Capability Security、pass^k 与单位成功成本 |
| [M11](./M11-teaching-guide.md) · [实验工作簿](./M11-lab-workbook.md) | Planning、Memory 与状态 | 形式化计划 DAG、Memory Record 时间语义、证据保真检索、审批绑定与长期记忆评测 |
| [M12](./M12-teaching-guide.md) · [实验工作簿](./M12-lab-workbook.md) | MCP 协议与集成 | 2026-07-28 双时代协议、能力发现与缓存、Stateless Streamable HTTP、OAuth 加固、Extensions/Tasks 治理 |
| [M13](./M13-teaching-guide.md) · [实验工作簿](./M13-lab-workbook.md) | Skills 与可复用能力 | Agent Skills 开放格式、元数据校验、渐进披露、DAG 契约、供应链安全、触发与任务评测 |
| [M14](./M14-teaching-guide.md) · [实验工作簿](./M14-lab-workbook.md) | Multi-Agent 协作系统 | 拓扑与协调税、A2A Agent Card/Task/Artifact、CAS 共享状态、独立证据仲裁、成本/成功率评测 |
| [M15](./M15-teaching-guide.md) · [实验工作簿](./M15-lab-workbook.md) | AI 安全、权限与人工审批 | MITRE ATLAS/STRIDE、Taint/Egress、PDP/PEP、RBAC/ABAC、参数绑定审批、Risk-tiered HITL、红队与事件响应 |
| [M16](./M16-teaching-guide.md) · [实验工作簿](./M16-lab-workbook.md) | Workflow 与确定性编排 | Control/Decision Plane、Saga/Outbox、Retry Budget、Durable Approval/Trace、Replay/Versioning |
| [M17](./M17-teaching-guide.md) · [实验工作簿](./M17-lab-workbook.md) | Evaluation 与 Observability | Eval Harness、Paired/Bootstrap、LLM Judge 校准、OpenTelemetry GenAI Trace、Quality SLO/Error Budget |
| [M18](./M18-teaching-guide.md) · [实验工作簿](./M18-lab-workbook.md) | AI Platform 架构 | Desired State、Gateway 双层限流、Usage Ledger、Silo/Pool/Bridge、多租户上下文、公平调度与过载治理 |
| [M19](./M19-teaching-guide.md) · [实验工作簿](./M19-lab-workbook.md) | AI 产品工程化与交付 | Opportunity Solution Tree、Risk-tiered HITL、Cost per Successful Task、SRM/多重比较、Release Manifest/回滚/退役 |
| [M20](./M20-teaching-guide.md) · [实验工作簿](./M20-lab-workbook.md) | Capstone 综合项目 | Definition of Ready/Done、Architecture Fitness Functions、Vertical Slice/测试金字塔、Evidence Matrix、可复现答辩与供应链证据 |

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
