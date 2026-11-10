# Assessment Type 分类规范与 M01–M20 迁移记录

> 状态：第一轮人工语义复核完成；分类仅用于课程内容治理，不触发不同的运行时权限、自动评分或提交流程。
> 覆盖：M01–M20 全部 100 项正式作业，重点复核原标记为 `code-task` 的 21 项。

## 1. 分类定义

| Type | 使用条件 | 典型交付物 | 不应误用为 |
|---|---|---|---|
| `knowledge-check` | 检查概念理解、短答、公式推导、手算或对既有材料的解释；不要求独立实现机器可执行工件 | 推导步骤、计算过程、概念解释、简短图示 | 需要架构决策、完整计划或实现的任务 |
| `code-task` | 必须提交可运行代码，或可由标准工具机器验证的工件，并提供运行/验证证据 | 源码、脚本、可验证 JSON Schema、测试 fixture、执行结果 | 伪代码、目录树草图、设计方案、单纯数值计算 |
| `design-review` | 评价系统设计、方案、架构、协议/数据契约、威胁模型、实验计划、指标体系或工程决策 | 架构图、设计说明、Schema 方案、决策记录、测试计划、benchmark 方案 | 只需解释单个概念或完成短计算的检查题 |
| `reflection` | 要求学习者对自己的学习过程、决策、失败和改进进行反思 | 结构化复盘、反思日志、个人改进计划 | 通用的“其他任务”兜底类别 |

分类依据是**实际要求提交并验证的产出**，不是任务中是否出现“代码”“JSON”“计算”“设计”等词。混合任务按主要可评分交付物分类；若要求提交并运行机器可验证工件，则归 `code-task`，若仅设计该工件则归 `design-review`。

## 2. 运行时边界

当前 `AssessmentWorkspace` 对所有 type 使用同一套文本草稿与 Rubric 自评界面，不按 type 分流，也不执行代码或 JSON Schema。type 是编辑治理元数据，不代表平台已经提供附件上传、沙箱执行、自动评分或正式教师提交能力。学习者正式工件仍按教师/课程约定另行提交。

因此，本次分类修订不改变学习者 UI、作业 ID、Rubric 维度、分值、课程顺序或模块结构。

## 3. 原 21 项 `code-task` 的人工复核与最终分类

| Assessment ID | 最终 Type | 判定依据 |
|---|---|---|
| `m02-01-attention-by-hand` | `knowledge-check` | 手算注意力矩阵并解释轴语义；无可执行工件 |
| `m03-02-embedding-calculation` | `knowledge-check` | 参数/存储计算与数据流解释；无可执行工件 |
| `m04-03-lora-plan` | `design-review` | SFT 数据与 LoRA 训练方案、参数推导和验证计划 |
| `m05-01-kv-capacity` | `knowledge-check` | KV 容量公式计算与单位换算 |
| `m05-04-quantization-plan` | `design-review` | 量化方案与质量/性能评估计划 |
| `m06-02-fewshot-design` | `design-review` | 示例选择器策略、覆盖和实验设计 |
| `m06-03-schema-contract` | `code-task` | 提交 Draft 2020-12 JSON Schema、合法/非法 fixture，并实际运行 validator |
| `m07-02-tool-schema` | `code-task` | 提交 Draft 2020-12 工具 Schema、正负 fixture，并执行契约测试 |
| `m08-02-chunking-design` | `design-review` | chunk 估算与解析/元数据策略设计 |
| `m08-04-hybrid-search` | `design-review` | RRF 手算与检索/重排评测方案 |
| `m09-02-vit-calc` | `knowledge-check` | patch 数、序列长度和注意力矩阵规模计算 |
| `m09-04-audio-engineering` | `design-review` | PCM 计算与流式 ASR 架构/隐私方案 |
| `m10-02-agent-loop` | `design-review` | 伪代码表达受限 Agent 控制流，不要求可运行实现 |
| `m11-03-memory-retrieval` | `design-review` | 混合检索、冲突处理和 stale memory 评测设计 |
| `m13-02-skill-package` | `design-review` | Skill 目录树、元数据和访问边界设计 |
| `m14-02-agent-protocol` | `design-review` | 内部 Task/Result JSON 契约与路由策略设计 |
| `m16-03-resilience-policy` | `design-review` | 重试、熔断、隔离参数和恢复策略设计 |
| `m17-02-benchmark-design` | `design-review` | benchmark 数据结构、统计计算和防污染计划 |
| `m18-03-quota-cost` | `design-review` | 多维配额策略与成本计量设计/计算 |
| `m19-03-unit-economics` | `design-review` | 单位成本、毛利和配额护栏分析 |
| `m20-03-implementation-review` | `code-task` | 必须实现可复现垂直切片并提供代码、测试和日志证据 |

其中 18 项从原 `code-task` 迁移为 `knowledge-check` 或 `design-review`；3 项保留 `code-task`，并将机器可验证工件和运行证据写入题面。迁移不改变评分总分。

## 4. 全课程分类分布

| Type | 数量 |
|---|---:|
| `design-review` | 84 |
| `knowledge-check` | 13 |
| `code-task` | 3 |
| `reflection` | 0 |
| **合计** | **100** |

当前没有 `reflection` 是现状记录，不代表必须为了覆盖类型而新增反思作业。

## 5. 后续治理规则

1. 新增作业时先写清主要交付物、验证方式和证据等级，再选择 type。
2. 仅有伪代码、JSON 示例、Schema 草图或设计说明，不自动归为 `code-task`。
3. `code-task` 必须在题面说明可运行/可验证工件、执行环境或 validator、输入 fixture 和证据提交要求。
4. 如果某项作业同时包含计算与设计，按主要 Rubric 权重和最终交付物判定；必要时在 prompt 中拆分子交付物，但不为类型统计而拆题。
5. 变更 type 必须同步审查教师指南和课程数据，并确认 `AssessmentWorkspace` 不会被误认为支持该类型的执行能力。
6. 任何自动评分或沙箱执行能力均需单独立项；不得从 `type` 字段推断该能力存在。

## 6. 验收边界

本文件记录了 100 项现有分类结构的定义和原 21 项 `code-task` 的逐项人工复核。它证明的是分类语义一致性整改，不证明作业已经由真实学习者完成，也不证明 100 项作业都可独立完成。真实可完成性仍需按 `LEARNER_PILOT_TASK_MATRIX.md` 执行学习者试测。
