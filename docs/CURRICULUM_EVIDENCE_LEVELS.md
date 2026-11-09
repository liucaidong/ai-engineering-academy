# 全课程统一证据等级与 M01–M20 证据边界

> 适用范围：M01–M20 的实验工作簿、教师指南、示例代码、评测记录和 Capstone。审计基准：2026-11-10。

## 1. 统一证据等级

| 等级 | 标签 | 最低证据要求 | 明确不能推断 |
|---|---|---|---|
| E0 | Designed | 设计、伪代码、假设、测试计划或架构图 | 不证明实现、执行或结果 |
| E1 | Static-reviewed | 可复核的静态审阅、Schema、类型/格式/静态分析结果、来源审查 | 不证明运行时行为、外部集成或实际阻断 |
| E2 | Simulated/Mock | 合成数据、Mock Provider、确定性模拟、离线回放、理论预算模型 | 不证明真实外部服务、真实用户数据、目标环境或生产行为 |
| E3 | Local-tested | 明确版本在本机重复执行，测试命令、输入、输出、环境和结果可复现 | 不证明目标环境、真实供应商 Sandbox、硬件性能或生产表现 |
| E4 | Target-env-tested | 目标环境或真实供应商/硬件 Sandbox 中的集成测试，保留脱敏请求/trace、环境和版本 | 不证明长期生产表现、真实流量分布或未来版本 |
| E5 | Production-observed | 明确时间窗口的生产流量、SLO/指标、事件/工单和运营审查证据 | 不证明未来版本、其他区域/租户或不同流量分布 |

**判定规则：** 同一项目可以同时有多个等级，必须逐项标记，不得用最高等级覆盖低等级组件。例如真实 Provider 的一次成功调用不能把 Mock 数据集、未测试的工具权限或未部署的持久化组件一并升级为 E4。测试报告必须注明测试对象、版本、环境、命令/步骤、输入、预期、实际结果、时间、失败项和限制。

## 2. 全课程统一标注规则

1. **Mock 不等于 Sandbox。** Mock 只验证调用方在预设响应下的逻辑；Sandbox 才是供应商/目标系统提供的真实隔离环境。
2. **模拟不等于实测。** 排队模型、Token/显存预算、成本模型、合成 benchmark 和确定性 Agent 轨迹均为 E2；其代码单元测试通过只能把计算实现本身标为 E3，不能把模型假设升级为真实服务性能证据。
3. **静态检查不等于运行测试。** Schema、类型、格式、静态扫描和代码审阅通常是 E1；真实本地执行测试才可标 E3。
4. **本地 E2E 不等于目标环境。** Playwright、本地 API、进程内锁、内存账本和本地数据库测试最多支持其实际覆盖范围内的 E3。
5. **E4/E5 必须有环境与运营证据。** 未连接真实 provider、硬件、远程 MCP/A2A Server、Temporal/AWS/Azure 或生产流量时，必须写 `not tested`，不得从本地示例推断。
6. **证据与结论一一对应。** 不能把来源可访问（HTTP 200）当作 claim 已证明，也不能把 benchmark 分数当作业务成功或安全合规。

## 3. M01–M20 当前课程资产证据矩阵

“当前资产等级”指本课程仓库内已提供的教学材料/示例/本地测试实际支持的等级，不代表学生尚未完成的外部项目，也不表示每个模块都完成了 E4/E5。

| 模块 | 当前资产等级 | 当前证据类型 | 不得宣称 |
|---|---|---|---|
| M01 | E1 | 来源审阅、概念模型、系统设计与假设标记 | 真实模型训练或外部 API 测试 |
| M02 | E2 + E3 | 固定矩阵 Attention Lab、确定性计算、前端单元测试 | 真实权重、GPU kernel 或 GPU 性能 benchmark |
| M03 | E2 + E3 | 玩具 BPE/token budget 模拟、上下文预算和本地测试 | 厂商真实 Token 计量或当前模型上下文 SLA |
| M04 | E2 + E3 | 合成训练/对齐数字、参数/FLOPs 计算、Python 单元测试 | 真实预训练、微调、GPU 训练或模型发布验证 |
| M05 | E2 + E3 | KV Cache/排队/容量理论模型、Speculative Decoding 轨迹、Python 测试 | vLLM/TensorRT-LLM/DeepSpeed 实际吞吐或 GPU 显存实测 |
| M06 | E2 + E3 | 虚构 Prompt/Schema/攻击样本、Mock Provider、结构化输出本地测试 | 真实供应商 strict-schema 支持或外部攻击阻断 |
| M07 | E2 + E3 | Mock 工具、幂等/重放/授权轨迹、契约和本地测试 | 真实支付/生产写操作、真实 Provider 工具调用或 Sandbox 验收 |
| M08 | E2 + E3 | 合成语料、离线 RAG/检索评测、Chunking/RRF 计算和本地测试 | 企业真实语料 ACL、生产向量库或真实用户检索质量 |
| M09 | E2 + E3 | 多模态 Token/延迟/PCM/patch 预算模型、公式单元测试 | 真实多模态模型推理、GPU 视频/音频性能或供应商 SLA |
| M10 | E2 + E3 | 进程内 Agent Runtime、模拟 crash/retry/unknown outcome、Python 测试 | 真实 Temporal Worker、外部副作用或远程持久化平台验收 |
| M11 | E2 + E3 | 合成记忆、过期/纠正/tombstone、冲突仲裁和本地测试 | 真实用户长期记忆、生产持久化/删除合规 |
| M12 | E2 + E3 | 合成 MCP 消息、版本/TTL/OAuth 边界案例、协议/schema 本地测试 | 真实远程 MCP Server、OAuth Provider 或跨组织互操作验收 |
| M13 | E1 + E2 + E3 | Skill frontmatter/路径/DAG 静态验证、合成任务评测和本地测试 | 跨 Host 的真实 Agent Skills 执行、脚本沙箱或生产权限隔离 |
| M14 | E2 + E3 | 确定性 Multi-Agent 拓扑/成本/状态模拟、Python 测试 | 真实远程 Agent、A2A 网络互操作或真实 LLM 协作质量 |
| M15 | E1 + E2 + E3 | 威胁模型/策略静态审阅、合成红队与事件轨迹、本地测试 | 授权外部渗透测试、真实攻击阻断或生产合规认证 |
| M16 | E2 + E3 | 内存状态、进程内锁、Workflow history/replay 模拟和本地测试 | 数据库原子事务、Temporal/AWS/Azure 实际部署或消息队列耐久性 |
| M17 | E2 + E3 | 合成 benchmark/telemetry、统计指标和本地评测 harness 测试 | 真实模型 Judge 质量、生产 OpenTelemetry Collector 或真实流量 SLO |
| M18 | E2 + E3 | 内存 usage ledger、策略/capacity/fallback 模拟和本地测试 | 真实供应商账单、持久化计量、多租户生产隔离或云集群可用性 |
| M19 | E2 + E3 | 假设价格/成本/毛利/盈亏平衡模型、计算单元测试 | 真实客户支付意愿、供应商报价、生产成本或真实收入 |
| M20 | E0–E5（按 Capstone 实际证据逐项评定） | Gate 0–4 需求、架构、垂直切片、安全评测、交付答辩；Gate 2 至少要求一条冻结版本 E3 本地端到端旅程 | 不得用总分抵消安全硬门槛；不得把 E3 说成 E4/E5；不得把答辩 Demo 说成生产批准 |

## 4. 当前课程仓库的证据结论

- M01–M20 的教学资产主要覆盖 E1–E3；M01 主要是 E1，M19 的业务输入是 E2 假设，M20 规定 Capstone 的 E3 最低门槛。
- 本地 `pnpm acceptance:local` 通过证明仓库当前版本的 lint/typecheck/schema/unit/build/E2E/Python/backend 指定测试在本机通过；它不证明真实供应商、外部 Sandbox、硬件、目标部署或生产流量。
- 当前没有证据支持把 M01–M20 整体标为 E4 或 E5；任何需要真实外部服务的练习应在没有对应凭据/环境/运行记录时标注 `not tested`。
- PostgreSQL RLS 专项测试因缺少专用环境变量而 skipped；不得标为 E3 已通过，更不得标为 E4/E5。
- M20 Gate 2 的 E3 是 Capstone 本地端到端要求，不代表课程仓库已经完成某个真实商业 Capstone 项目的端到端验收。

## 5. 教师评分与学生提交模板

每条证据至少包含：

```yaml
evidence_id: EV-<module>-<sequence>
level: E0 | E1 | E2 | E3 | E4 | E5
claim: <what this evidence supports>
subject: <code / model / provider / workflow / policy>
version: <commit / package / model / schema / prompt / index version>
environment: <local / mock / sandbox / target / production>
method: <command, steps, test case or observation window>
input_fixture: <synthetic / anonymized / real with lawful basis>
expected: <acceptance condition>
actual: <observed result>
observed_at: <ISO-8601 timestamp>
limitations: <what this evidence does not prove>
artifact_ref: <log / report / trace / screenshot / test result>
```

教师不得因学生提供了截图或 Demo 就自动提高证据等级；必须检查版本、环境、输入、可复现步骤和限制说明。
