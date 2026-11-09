# M13 实验工作簿：Agent Skills 格式、加载、安全与评测

> 课程版本：0.40.9

> **证据等级：** E1 Static-reviewed（Skill 格式/路径审阅）+ E2 Simulated（合成 Skill 评测）+ E3 Local-tested（本地测试）；不证明跨 Host 真实执行或沙箱。 统一定义见[全课程证据等级](../CURRICULUM_EVIDENCE_LEVELS.md)。

> 五项实验对应 M13 五讲。示例只验证文件格式模型、路径、DAG 和指标计算；不调用真实 Agent Runtime，不执行 Skill 脚本，也不提供沙箱。

## 学习成果

完成本工作簿后，学习者应能够：
1. 区分 Agent Skills 开放格式、Host/Runtime 集成和任务效果；
2. 校验 name/description 等规范字段，并识别实验性字段与组织扩展元数据；
3. 设计 Progressive Disclosure 与 Context Budget；
4. 审计 Skill 指令、脚本、依赖、路径和外部资源；
5. 构建触发准确率、任务成功率、权限违规和回归评测体系。

## 规范基线

以 Agent Skills Specification 当前版本为准。核心格式要求：
- Skill 是一个目录，至少包含 SKILL.md。
- SKILL.md 使用 YAML frontmatter + Markdown 正文。
- name、description 必需；license、compatibility、metadata 可选。
- allowed-tools 是 experimental，支持依赖 Agent 实现。
- version 不是规范定义的顶层字段；组织可把版本放入自定义 metadata。
- Agent Skills 是开放格式，不保证不同 Runtime 具有完全一致的执行、权限和沙箱语义。Claude Code 的 `disable-model-invocation`、`user-invocable`、`context`、`argument-hint` 等是产品专属字段，不应误作可移植标准字段。
- 规范建议 SKILL.md 主文件少于 500 行、指令正文少于约 5,000 tokens；这是建议，不是硬性格式门槛。
- SLSA v1.2 是当前 Approved 版本；v1.0 已 Retired。
- NIST SP 800-218 v1.1 与 SP 800-218A 是已发布的 Final 文档；SP 800-218 Rev. 1（v1.2）目前仍是 Draft（2025-12-17 发布），不得称为最终版本。

## 环境与运行

Python 3.10+，从仓库根目录执行，无第三方依赖：

    python3 examples/m13/01_skill_metadata.py
    python3 examples/m13/02_progressive_disclosure.py
    python3 examples/m13/03_skill_dag.py
    python3 examples/m13/04_supply_chain.py
    python3 examples/m13/05_skill_evaluation.py
    python3 -m unittest discover -s examples/m13 -p 'test_examples.py'

---

## 实验一：Skill 元数据与格式边界

**对应课程：** 第一讲《Skill 概念、边界与能力契约》

### 任务

为代码审查 Skill 定义最小可移植包元数据，并区分规范字段与组织自定义字段。

### 操作

1. 运行 01_skill_metadata.py。
2. 测试 name 的长度、字符集、首尾连字符、连续连字符和目录名一致性。
3. 测试 description 的长度和任务触发信息。
4. 区分 license、compatibility、metadata 与 experimental allowed-tools；识别 Claude Code 产品专属字段。
5. 将版本号放入组织约定的 metadata.version，而不是声称它是标准顶层字段。

### 必须提交

- SKILL.md YAML frontmatter；
- 包目录名与 name 一致性测试；
- 正例、负例和字段类型错误；
- Package conformance / Runtime integration / Task effectiveness 三层验收矩阵；
- Skill、Tool、MCP、Workflow 的职责边界图。

### 常见错误

- 把所有平台的 Skill 实现当成完全相同的运行时；
- 将 version 当作规范定义的顶层字段；
- 将 allowed-tools 当作通用授权机制；
- 只写“帮助处理文件”而不写何时触发和不适用范围。

---

## 实验二：Progressive Disclosure 与上下文预算

**对应课程：** 第二讲《Skill 包结构、资源与元数据》

### 任务

设计一个可扩展的 Skill 目录，使启动阶段只暴露最少路由信息，详细资料按需读取。

### 操作

1. 运行 02_progressive_disclosure.py。
2. 比较所有内容一次性加载与三阶段加载的 token 估算。
3. 将 SKILL.md 主体、references 和 scripts 分开计量。
4. 按目标 Host 实际行为验证 discovery、activation 和 resource loading；不同 Runtime 可能采用不同触发/加载策略。
4. 计算 context budget、重复读取和按需加载比例。
5. 设计一个过度拆分的反例，比较读取往返与遗漏风险。

### 必须提交

- Skill 目录树；
- Discovery / Activation / Execution 加载图；
- 各阶段 token 预算表；
- references 相对路径和一层引用规则；
- 对主 SKILL.md 长度、引用粒度和重复读取的决策说明。

### 常见错误

- 所有 reference 在启动时加载；
- SKILL.md 过长，缺少可导航结构；
- 引用链多层嵌套，导致 Runtime 难以发现；
- 将 Progressive Disclosure 误认为权限隔离或沙箱。

---

## 实验三：Skill 组合 DAG 与版本兼容

**对应课程：** 第三讲《Skill 组合、路由与冲突处理》

### 任务

构建软件交付 Skill DAG，检查依赖环、缺失节点和上游/下游契约不匹配。

### 操作

1. 运行 03_skill_dag.py。
2. 建立需求分析、代码实现、测试、安全审查和发布说明节点。
3. 表达并行与串行依赖。
4. 检查循环、未知依赖和版本不兼容。
5. 为失败路径定义 retry、compensation、manual handoff。

### 必须提交

- DAG 与拓扑排序；
- 每个 Skill 的 input/output contract；
- Skill/Tool/schema 版本锁定矩阵；
- 冲突路由和澄清策略；
- 失败传播与补偿表。

### 常见错误

- 把并行节点误写为顺序依赖；
- 忽略输出 Schema 不兼容；
- 自动选择权限更高的 Skill；
- 对不可逆副作用盲目重试。

---

## 实验四：Skill 供应链与路径安全

**对应课程：** 第四讲《Skill 安全与供应链治理》

### 任务

对一个不可信 Skill 目录建立文件清单、摘要和路径边界检查。

### 操作

1. 运行 04_supply_chain.py。
2. 为目录文件生成 SHA-256 manifest。
3. 拒绝符号链接、路径穿越和包根目录外的文件引用。
4. 默认拒绝网络、写入和子进程权限。
5. 设计来源、commit、release、许可证、依赖锁和撤销记录。

### 必须提交

- 文件清单和哈希；
- 可信来源与版本追踪记录；
- 权限声明与 Runtime 强制策略；
- Prompt Injection、依赖投毒、路径逃逸和外传威胁模型；
- 禁用、撤销、调查和恢复步骤。

### 常见错误

- 仅审阅 SKILL.md，不检查 scripts/references；
- 以作者声明替代 Host 权限控制；
- 以文件哈希代替来源真实性；
- 将示例哈希清单误认为完整 SBOM 或 SLSA provenance。

---

## 实验五：触发、任务效果与回归评测

**对应课程：** 第五讲《Skill 测试、发布与目录治理》

### 任务

构建 Skill 触发与执行的离线评测集，分别衡量选择正确性与任务完成效果。

### 操作

1. 运行 05_skill_evaluation.py。
2. 构造正例、hard negative、模糊任务和相似 Skill 冲突样例。
3. 计算 trigger precision/recall、FPR、wrong-skill rate、activation miss rate 和 task success。
   - 二分类 FPR = FP / (FP + TN)。
   - 多 Skill wrong-skill rate = 选错 Skill 数 / 有目标 Skill 的样本数。
   - false activation rate = 无目标 Skill 却触发的数量 / 无目标 Skill 样本数。
4. 增加 tool violation、token overhead、latency 和人工介入指标。
5. 按 Runtime、模型版本、语言、任务类别和权限角色分层。

### 必须提交

- 评测数据集与标签定义；
- 指标公式和混淆矩阵；
- 基线版本与候选版本对照；
- 回归阈值、灰度策略和回滚条件；
- 明确说明 skills-ref validate 的验证边界。

### 常见错误

- 把格式验证通过当作 Skill 质量通过；
- 只看 task success，不测错误触发和权限违规；
- 测试集与 Skill 描述高度重复，造成评测泄漏；
- 用少量样例得出稳定泛化结论。

---

## 统一评分建议

| 维度 | 权重 | 达标证据 |
|---|---:|---|
| 格式与契约 | 20% | 规范字段、目录约束和三层 conformance |
| 上下文工程 | 20% | 渐进加载图、token 预算和引用策略 |
| 组合治理 | 20% | DAG、Schema 兼容、错误传播与补偿 |
| 安全供应链 | 20% | 哈希清单、路径边界、最小权限和撤销 |
| 评测与发布 | 20% | 触发/任务指标、回归门禁、灰度和回滚 |

所有脚本只运行合成输入。真实生产 Skill 必须在目标 Host 上进行触发、权限、沙箱、数据外传和任务行为验收。
