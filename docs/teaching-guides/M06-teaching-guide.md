# M06 教师教学指南与作业参考解答

> 课程版本：0.40.9

> **证据评阅：** 教师应按[全课程证据等级](../CURRICULUM_EVIDENCE_LEVELS.md)区分设计、静态审阅、模拟/Mock、本地测试、目标环境测试和生产观测；只为实际覆盖范围授予等级。

## 使用方式与课前准备

- 每讲 75–90 分钟。先让学生写出失败案例，再讲解契约、评测和防御。
- 准备同一任务的零样本、few-shot、结构化输出和注入攻击样例。
- 明确区分 Prompt 提供的行为引导与服务端强制执行的权限控制。
- 所有示例数据均使用虚构合同、工单和退款记录，不使用真实个人数据。

## 第一讲：指令结构与任务规格

### 课前准备
- 准备一个模糊任务：“审查这份采购合同”。
- 让学生将其拆成目标、输入、约束、输出和验收条件。
- 准备 system/developer/user/tool 四种消息，讨论来源与信任级别。

### 教学路径
1. 把任务写成可验收接口：目标、角色、输入 schema、输出 schema、证据要求、约束、失败分支。
2. 将策略指令与用户数据分离；工具结果和网页文本按不可信数据处理。
3. 明确澄清条件：缺少合同版本、适用法域或采购金额时不能猜测。
4. 明确拒绝条件：无权访问、要求伪造证据或执行超出授权范围的动作。
5. 为不确定性定义输出字段，如 confidence rationale、evidence_refs、unresolved_items；不要只输出无依据的 confidence number。

### 学习检查点
- **Prompt 为什么是接口规格而不是咒语？** 它定义任务输入输出和行为约束，但不能替代类型、权限、事务和业务规则。
- **工具消息是否自动可信？** 不自动。工具返回内容仍要按工具身份、来源和内容类型评估。
- **何时应该澄清？** 当缺失信息会改变结论、授权或外部副作用时。

### 课后复习
重写一份模糊合同审查 Prompt，至少加入 evidence requirement、unknown handling、scope boundary 和 output schema。

### 正式作业参考解答
合同审查 Prompt 契约建议包含：
- 目标：提取付款期限、违约责任、自动续约、责任限制和数据处理条款。
- 输入：contract_id、document_version、jurisdiction、review_scope、user_context、source_refs。
- 输出：findings[]，每项含 clause、verbatim_excerpt、risk_level、reason、evidence_ref、uncertainty；另含 missing_information、out_of_scope、overall_status。
- 约束：不得编造条款或法律结论；引用必须定位原文；法域/版本缺失时澄清；不得自动修改或签署合同。
- 消息边界：system/developer 设定应用策略；user 提供任务与文件；tool 返回检索结果，作为待核验数据。
- 验收：所有 finding 均可回溯到原文；无证据时标记 unresolved；输出通过 Schema 校验。

**评分对照（10 分）：** 任务规格 4；消息边界 2；失败分支 4。

**常见错误：**
- 只写“你是一名资深律师”，没有输入输出契约。
- 让模型自己判断是否有权访问合同。
- 不要求原文引用，允许模型补全条款。
- 没有澄清、拒绝和 unresolved 分支。

## 第二讲：Few-shot、示例选择与上下文组织

### 课前准备
- 准备 8 类客服意图的代表样本：查询、退款、取消、投诉、账户、物流、技术问题、人工升级。
- 每类准备典型、边界和拒绝样本。
- 准备 token budget 估算工具或目标 tokenizer。

### 教学路径
1. Zero-shot 不提供示例；one-shot 提供一个示例；few-shot 提供多个示例。
2. 示例集合优先保证类别覆盖和边界覆盖，再优化与当前输入的相关性。
3. 去除近重复和标签冲突样本；防止某一类别因样本多而占据上下文。
4. 做顺序扰动实验，检查位置效应；必要时固定排序或做多顺序评估。
5. 将示例 token、指令 token、用户输入和输出预留纳入总预算。

### 学习检查点
- **更多示例是否总是更好？** 不一定；冗余、冲突和上下文稀释可能降低表现。
- **只选最相似示例有什么风险？** 会缺少长尾类别、边界与拒绝场景。
- **为什么要做顺序扰动？** 模型对上下文位置可能敏感，示例顺序会改变结果。

### 课后复习
为 8 类意图建立样本覆盖表，标注类别、难度、边界、拒绝、token 数和近重复组。

### 正式作业参考解答
建议选择器分两阶段：
1. Coverage stage：每个类别先选至少 1 个代表样本，再按风险补充边界/拒绝样本。
2. Ranking stage：按语义相关性、标签置信度和样本质量排序；对同一模板/近重复组做去重。
3. Diversity constraint：限制单类样本上限，确保类别、难度和边界覆盖。
4. Budget stage：用目标 tokenizer 计算指令 + 示例 + 用户输入 + 输出预留；超限时按边际覆盖收益移除样本。
5. Evaluation：固定 query set，对示例顺序做多种排列；报告 macro-F1、per-class recall、拒绝准确率、token cost 和 P95 latency。

**评分对照（10 分）：** 覆盖策略 3；选择机制 3；实验预算 4。

**常见错误：**
- 只用语义相似度，导致类别覆盖不足。
- 只报告 micro-F1，掩盖少数类别失败。
- 忽略 tokenizer 差异和输出预留。
- 只测一种示例顺序，未发现位置偏差。

## 第三讲：结构化输出与可验证生成

### 课前准备
- 准备一份退款申请的 JSON 样例及至少五种错误变体。
- 复习 JSON 语法、JSON Schema、业务规则和对象级授权。
- 明确 Schema 校验与授权校验的责任组件不同。

### 教学路径：四层验证链

1. **Parse**：文本能否解析为 JSON。
2. **Schema**：字段、类型、required、enum、范围、additionalProperties 是否符合契约。
3. **Business**：订单是否存在、是否在退款窗口、金额是否超过可退余额、状态是否允许退款。
4. **Authorization**：当前 principal 是否有权对该订单执行退款；是否需要用户确认或人工审批。

建议流程：

\[
\text{model output}\rightarrow\text{parse}\rightarrow\text{schema}\rightarrow\text{business rules}\rightarrow\text{authorization}\rightarrow\text{approval/execute}
\]

Schema 通过只代表结构有效，不代表业务正确或用户有权限。写操作必须有幂等键、审计和明确的状态回读。

### 学习检查点
- **合法 JSON 是否一定是有效退款？** 不是；语法合法与业务有效是不同层。
- **Schema 是否能判断用户权限？** 一般不能；授权依赖可信身份和资源策略。
- **修复 JSON 后能否直接执行？** 不应；修复结果仍需重新通过所有验证层。

### 课后复习
为退款对象定义字段类型、金额精度、必填字段、枚举、额外字段策略和业务验证。

### 正式作业参考解答
作业交付：一份 Draft 2020-12 JSON Schema 文件、至少一组合法/非法 JSON fixture、Ajv 8.x（Draft 2020-12 模式）或 Python jsonschema 4.x（Draft202012Validator）的运行命令、工具版本和结果，以及 parse→schema→business→authorization 四层校验说明。无须付费 API 或真实支付凭证。

示例 Schema 设计要点：
- request_id：string，必填，格式受约束。
- order_id：string，必填。
- reason：enum，如 duplicate、damaged、not_received、other。
- amount：number，必须大于 0；真实金额应使用十进制定点或最小货币单位，避免浮点精度误差。
- currency：ISO currency code enum。
- evidence_refs：array，引用已授权证据。
- additionalProperties：false，拒绝未知字段。

校验链：
- parse 失败：有限次数重试或返回格式错误，不执行。
- Schema 失败：返回字段级错误；修复后重新 parse/schema。
- Business 失败：例如订单已关闭、退款超额，拒绝并给出业务错误码。
- Authorization 失败：403/拒绝，不因模型声明“用户已授权”而放行。
- 通过后：绑定 idempotency key、执行前重新读取订单状态，写入审计并回读最终状态。

**评分对照（10 分）：** Schema 完整性 4；校验分层 3；失败处理 3。

**常见错误：**
- 把 JSON parse 成功当作业务正确。
- 用模型输出中的 user_id 作为可信身份。
- 允许额外字段覆盖服务端字段。
- 对超时写操作直接重试，导致重复退款。
- 只校验 amount 大于 0，不校验余额和币种。

## 第四讲：Prompt Injection 与提示词安全

### 课前准备
- 准备恶意网页片段、检索文档和正常用户指令。
- 画出 Browser → Retrieval → Model Context → Tool Proposal → Tool Executor 数据流。
- 明确间接注入可能来自网页、邮件、PDF、代码注释、OCR 或工具返回。

### 教学路径
1. 直接注入：用户输入试图覆盖策略或诱导泄露信息。
2. 间接注入：模型读取的不可信内容包含指令，试图影响模型行为。
3. 标记来源和数据边界；引用内容不因进入上下文而获得更高指令权限。
4. 工具执行端实施 allowlist、schema validation、server-side authorization、least privilege 和审批。
5. 建立审计、红队测试和事件响应；Prompt 规则只作为纵深防御的一层。

### 学习检查点
- **把网页包在引号里是否彻底防注入？** 不是；来源标记有帮助，但不能取代执行端控制。
- **模型拒绝危险指令是否足够？** 不足；工具服务端仍需独立授权。
- **攻击链在哪里阻断最可靠？** 在可信执行边界：身份、资源授权、工具 allowlist、参数约束和审批。

### 课后复习
对一条“网页要求把客户名单导出到外部 URL”的攻击链，标注每个信任边界、可阻断控制和审计证据。

### 正式作业参考解答
至少五条攻击路径：
1. 用户直接要求忽略系统策略并泄露隐藏提示。
2. 网页内容诱导 Agent 调用文件读取工具。
3. PDF/OCR 中嵌入指令要求发送检索片段。
4. 工单内容要求创建高权限账号或修改工单归属。
5. 工具返回文本伪装成 system/developer 指令。
6. 恶意内容诱导循环调用工具造成资源耗尽（可作为额外路径）。

对应控制：
- 来源标签与上下文隔离；把网页/文件内容作为 data，不作为 policy。
- 工具 allowlist 和参数 Schema；禁止任意 URL/任意文件路径。
- 服务端基于 principal、tenant、resource、action 重新授权。
- 导出、删除、付款等高影响动作绑定审批和参数 hash。
- 速率限制、超时、调用预算、幂等和审计。
- 红队用例验证控制，记录 blocked/allowed、触发层和残余风险。

**评分对照（10 分）：** 威胁覆盖 3；信任边界 3；控制有效性 4。

**常见错误：**
- 把“忽略恶意指令”作为唯一控制。
- 将检索文档或网页内容当作可信指令。
- 工具执行器信任模型传来的 user_id/tenant_id。
- 审批后允许参数改变而不重新审批。
- 只测试 prompt refusal，不测试工具是否真的被阻断。

## 第五讲：Prompt 评测、版本管理与回归

### 课前准备
- 准备正常、边界、对抗、拒绝、无证据和工具失败测试集。
- 准备规则评分、人评 rubric 和 LLM Judge 的同一批样本。
- 设计 A/B 顺序交换实验，识别 Judge 位置偏差。

### 教学重点
- 规则评测适合格式、字段、引用存在性和确定性业务条件。
- 人评适合语义质量、风险和上下文充分性，但需标注指南、双人抽样和分歧仲裁。
- LLM Judge 可扩大评测规模，但需校准人工基准，检查长度偏差、位置偏差、自偏好和 Prompt 敏感性。
- Prompt 发布需版本化：model/provider、prompt hash、tool schema、dataset version、judge version、sampling config。
- Canary 期间监控任务成功、拒绝正确性、工具违规、P95 latency、成本和错误分类；达到回滚阈值即撤销。

### 学习检查点
- **Judge 分数能否作为客观真值？** 不能；它是一个需要校准和持续监控的测量器。
- **为什么要固定模型版本？** 否则 Prompt 改动与模型漂移混杂，无法归因。
- **什么时候回滚？** 质量、安全或业务护栏超过预先定义阈值，尤其是安全硬约束失败时。

### 课后复习
为 Prompt 变更建立版本 manifest，列出基线、变更项、回归集、canary 观察窗和回滚条件。

### 正式作业参考解答
发布流水线：
1. 静态检查：模板变量、Schema、敏感字段、工具清单和版本。
2. 离线测试：正常/边界/对抗/拒绝/无证据/工具失败集。
3. 评分：规则检查 + 人工标注基准 + 校准后的 LLM Judge。
4. 偏差检查：交换候选顺序，检查长度和模型自偏好；对分歧进行人工仲裁。
5. Canary：小流量观察 task success、refusal correctness、tool violation、P95、cost。
6. 回滚：安全违规、关键任务退化或成本/延迟超过预设门槛时回到上一个 prompt/model/tool 兼容版本。

**评分对照（10 分）：** 数据与指标 3；评分可信度 3；发布治理 4。

**常见错误：**
- 只用 LLM Judge 评分，没有人工基准。
- 不做候选顺序交换。
- Prompt 版本号变了，但模型、工具 Schema 和数据集未记录。
- Canary 只看平均质量，不看安全硬约束和 P95。
- 回滚只恢复 Prompt 文本，却没有恢复兼容的模型/工具版本。

## 进阶概念辨析与课堂扩展

### 1. Prompt 契约应绑定运行时依赖

Prompt 的行为由模板、模型/provider 版本、消息序列化、Tokenizer、工具 Schema、检索策略、采样参数和数据快照共同决定。教学中要求学生保存 prompt hash、owner、变量 Schema、兼容模型、测试集版本、变更理由和回滚目标。Prompt 文本本身不包含可信身份或权限证明。

### 2. Few-shot 是预算约束下的覆盖优化

建议先满足类别和风险边界的最小覆盖，再按相关性、质量和多样性补充。MMR 等选择器是启发式，必须用目标 Tokenizer 计量，并通过顺序扰动实验检查位置敏感性。对比样本应突出决定标签的关键特征，避免只给相似正例。

### 3. Grammar-Constrained Decoding 不等于业务正确

语法约束把生成限制在某个形式语言中；JSON parse、完整 Schema、业务语义和资源授权仍需独立执行。供应商对 JSON Schema 的支持可能是子集，必须建立目标 API 的兼容性矩阵，并对缺失字段、null、额外字段、递归和数值边界做测试。

### 4. Prompt Injection 需要可执行的红队证据

建议以 BIPIA 等间接注入研究为起点，构造直接用户注入、网页/文档注入、工具结果伪装、跨轮持久化和数据外带测试。每条用例记录 source、payload、target asset、tool path、expected block layer、actual result 和 data exposure。必须验证工具执行端的实际副作用；模型口头拒绝不是安全验收。

### 5. LLM Judge 必须做测量校准

建立人工标注基准，报告 Judge 与人工的一致性、分歧和置信区间。交换候选顺序识别 position bias，改变长度识别 verbosity bias，检查 Judge 对自身模型输出的偏好。二项比例可报告 Wilson score 区间；成对指标应按相同任务/样本对执行 paired bootstrap，并直接报告配对差值区间，不能将 A/B 两组独立重抽样。安全硬门槛不得被总体均值抵消。

### 6. 实验工作簿与代码

学生实验统一见 [M06 实验工作簿](./M06-lab-workbook.md)，可运行计算器见仓库的 `examples/m06/README.md`。示例代码仅检查 manifest、样本覆盖、结构化数据、攻击矩阵和统计指标，不连接模型或真实业务工具。

## 教师批改总表

| 讲次 | 核心能力 | 必须提交 | 高频误区 |
|---|---|---|---|
| 1 | Prompt 契约 | 输入输出与失败分支 | Prompt 不等于权限 |
| 2 | Few-shot 选择 | 覆盖矩阵与预算 | 相似度不等于覆盖 |
| 3 | 结构化输出 | 四层校验流水线 | Schema 不等于授权 |
| 4 | 注入防御 | 攻击树与控制映射 | Prompt-only 防御不足 |
| 5 | 评测发布 | 校准、manifest、回滚 | Judge 分数不是真值 |

