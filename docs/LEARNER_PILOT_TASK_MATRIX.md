# M01–M20 首轮学习者试测任务矩阵

> 状态：任务抽样方案已定义；参与者尚未招募，任何 P01–P08 均为匿名占位编号，不代表真实参与者或已完成测试。
> 目的：把《学习者试测执行手册》的模块级抽样要求落实到具体 Lesson/Assessment ID，确保 M01–M20 均有明确观察任务。

## 1. 使用规则

- 首轮招募 8 人：A 组 2 人、B 组 3 人、C 组 3 人。P01–P08 仅为排程占位符，实际执行时重新生成匿名 ID。
- 所有人完成相同的入门诊断，以及 M01–M03 的代表性讲次/作业，用于比较基础路径的可达性；这不是完整模块验收。
- M04–M19 按下表分层分配，每个模块至少有一位参与者完成指定正式作业。未实际执行的任务不得标记为已覆盖。
- M20 由至少两位 B/C 组参与者完成 Gate 0–4；矩阵安排 P04（B）与 P06（C）作为占位组合。
- 若参与者经验与任务难度明显不匹配，可在不改变 Assessment ID 的前提下调整人员，但必须记录调整原因，确保 M04–M19 每个模块最终至少有一条有效观察记录。
- 所有任务按试测手册记录 active time、blocked time、求助、环境、执行模式、证据等级、完成状态和摩擦代码。参与者可以失败或退出，不得为完成覆盖指标而代做。

## 2. 所有人共同任务

| 顺序 | 模块 | Lesson ID | Assessment ID | 观察重点 |
|---:|---|---|---|---|
| 1 | 入门诊断 | — | `docs/LEARNER_ENTRY_DIAGNOSTIC.md` | 题意理解、领域诊断、补救建议可读性 |
| 2 | M01 | `m01-05-from-model-to-engineered-system` | `m01-05-ai-system-blueprint` | 能否把模型能力映射到端到端系统与风险边界 |
| 3 | M02 | `m02-01-from-sequences-to-attention` | `m02-01-attention-by-hand` | 数学符号、矩阵计算和中间步骤是否可独立复现 |
| 4 | M03 | `m03-05-tokenizer-lab-and-integrated-practice` | `m03-05-integrated-context-audit` | token 预算、上下文分项和超限调整是否可复核 |

共同任务应记录每个参与者实际完成的 lesson 内容和作业步骤。若参与者只完成其中一部分，必须记录部分覆盖，不得按模块通过统计。

## 3. M04–M19 分层任务分配

| 模块 | 占位参与者 | Lesson ID | Assessment ID | 经验组 | 主要观察点 |
|---|---|---|---|---|---|
| M04 | P01 | `m04-03-sft-and-lora` | `m04-03-lora-plan` | A | 训练数据、SFT/LoRA 术语、参数估算与方案边界 |
| M05 | P01 | `m05-01-prefill-decode-kv` | `m05-01-kv-capacity` | A | KV Cache 公式、单位换算和假设可见性 |
| M06 | P02 | `m06-03-structured-output` | `m06-03-schema-contract` | A | JSON Schema 约束、错误路径与可验证输出 |
| M07 | P02 | `m07-02-json-schema-validation` | `m07-02-tool-schema` | A | 工具参数契约、校验与失败反馈 |
| M08 | P03 | `m08-04-hybrid-reranking` | `m08-04-hybrid-search` | B | RRF 计算、候选预算和检索评测指标 |
| M09 | P03 | `m09-02-vision-transformers` | `m09-02-vit-calc` | B | 张量形状、patch/token 计算与推导步骤 |
| M10 | P04 | `m10-02-agent-loop` | `m10-02-agent-loop` | B | 伪代码、状态更新、重复动作与终止条件 |
| M11 | P04 | `m11-03-retrieval-and-consolidation` | `m11-03-memory-retrieval` | B | 记忆字段、检索排序、冲突和 stale 评测指标 |
| M12 | P05 | `m12-05-mcp-integration-operations` | `m12-05-mcp-acceptance` | B | 协议兼容矩阵、错误/取消测试和真实互操作边界 |
| M13 | P06 | `m13-02-skill-packaging` | `m13-02-skill-package` | C | Skill 包结构、规范字段与组织扩展、路径安全 |
| M14 | P07 | `m14-02-task-routing-protocol` | `m14-02-agent-protocol` | C | Task/Result JSON 契约、路由和重派安全 |
| M15 | P07 | `m15-05-security-testing-incident` | `m15-05-security-acceptance` | C | 红队场景、量化门槛、证据保全和事故闭环 |
| M16 | P08 | `m16-03-retries-timeouts-compensation` | `m16-03-resilience-policy` | C | Full Jitter、总 deadline、支付幂等和人工补偿 |
| M17 | P04 | `m17-02-dataset-benchmark` | `m17-02-benchmark-design` | B | 标准误、数据切分、防污染和盲测 |
| M18 | P05 | `m18-04-tenant-security-control` | `m18-04-tenant-control` | B | 多租户隔离、凭证代理和 fail-closed |
| M19 | P06 | `m19-03-unit-economics` | `m19-03-unit-economics` | C | 单位成本、课程假设价目与成本范围 |

该矩阵是覆盖计划，不是预测的通过名单。若参与者无法完成某任务，应记录阻塞和证据，不能用另一个参与者的结果推断其已通过。

## 4. M20 Capstone Gate 0–4

| Gate | 讲次 | Assessment ID | 交付证据 | 主要观察点 |
|---|---|---|---|---|
| 0 | `m20-01-capstone-problem-charter` | `m20-01-project-charter` | 项目章程、范围/非目标、验收指标、风险与依赖清单 | 能否把开放问题收敛成可测量范围 |
| 1 | `m20-02-capstone-architecture` | `m20-02-architecture-pack` | 架构图、数据流、时序、选型表、至少三份 ADR | 能否说明架构取舍和可信边界 |
| 2 | `m20-03-capstone-implementation` | `m20-03-implementation-review` | 代码/commit、README、复现命令、正常/失败/拒绝测试与日志 | 能否实现可复现的最小垂直切片，并区分 mock/真实服务 |
| 3 | `m20-04-capstone-evaluation-security` | `m20-04-acceptance-pack` | benchmark、威胁模型、安全测试、trace/metrics、SLO、成本与回滚方案 | 能否将风险映射到测试、证据和发布门槛 |
| 4 | `m20-05-capstone-demo-defense` | `m20-05-capstone-defense` | 冻结版本、演示脚本、证据索引、状态清单和答辩 | 能否诚实区分实现、审阅、测试、未测试与阻塞 |

P04 与 P06 是建议的 Gate 0–4 占位参与者。两人都必须完成完整 Gate 序列，且每个 Gate 单独记录耗时和证据；若仅完成桌面演练或 mock 路径，报告中必须标注相应证据等级，不能宣称真实生产验证。

## 5. 覆盖核对表

实际试测前由负责人填写：

| 覆盖项 | 计划 | 实际参与者/证据引用 | 状态 |
|---|---|---|---|
| 入门诊断 | 全部参与者 | 待填写 | 未开始 |
| M01–M03 基础路径 | 全部参与者 | 待填写 | 未开始 |
| M04–M19 模块抽样 | 每模块至少 1 条有效观察 | 待填写 | 未开始 |
| M20 Gate 0–4 | 至少 2 位 B/C 参与者完整演练 | 待填写 | 未开始 |
| 时间日志与摩擦记录 | 每项执行任务 | 待填写 | 未开始 |
| P0/P1 问题复测 | 所有识别出的阻断项 | 待填写 | 未开始 |

## 6. 试测结束判定

只有在满足《LEARNER_PILOT_RUNBOOK.md》第 9 节的参与者数量、任务覆盖、Capstone 和 P0/P1 处置要求后，才可宣布首轮形成性试测结束。覆盖率不等于通过率；未完成、未测、blocked 和失败必须保留为不同状态。
