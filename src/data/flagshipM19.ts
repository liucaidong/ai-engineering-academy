import type { Course } from "../types/course";

/** M19 — AI product engineering, delivery, economics and continuous improvement. */
export const flagshipM19Lessons: Course["modules"][number]["lessons"] = [
{id:"m19-01-product-problem-discovery",title:"第一讲：AI 产品问题定义与价值验证",summary:"从用户任务和可测量价值出发，判断是否需要 AI。",learningObjectives:["将用户痛点转成可验证任务","比较 AI 与规则/传统软件方案","定义产品价值和非目标"],estimatedMinutes:70,content:[
{heading:"从用户任务而不是模型能力出发",body:"AI 产品应解决明确用户任务，不应为了使用模型而寻找场景。",markdown:"描述用户、触发情境、当前流程、痛点、失败成本和替代方案。将“做一个 Agent”改写为可验证目标，例如将工单分流时间降低，同时保持错误路由率不超过阈值。"},
{heading:"AI 适用性判断",body:"判断任务是否存在非结构化输入、模糊决策或生成价值，并评估错误成本。",markdown:"若规则可稳定覆盖、结果需绝对确定或错误代价极高，传统软件可能更合适。AI 适合处理语言、图像和模糊模式，但需容忍概率输出并增加验证。比较规则引擎、搜索、传统 ML、LLM 和 human-in-the-loop。"},
{heading:"价值假设与指标",body:"产品价值假设必须映射到用户结果和业务指标。",markdown:"北极星指标可结合任务完成率、节省时间、人工复核率、返工率和用户满意度。避免只使用模型调用量、token 数或回答长度作为价值指标。定义 baseline、目标值、测量窗口和数据来源。"},
{heading:"MVP 与非目标",body:"最小可行产品应验证最高风险假设，而不是堆叠功能。",markdown:"MVP 选择单一用户群、窄任务范围和可控数据源。列出非目标、人工兜底、禁用场景和退出条件。若模型质量未达门槛，产品应回退到人工或规则流程。"},
{heading:"复现练习：把 AI 产品想法转成可证伪的问题假设",body:"用用户任务、当前替代流程和可测量结果决定是否需要 AI。",markdown:"问题陈述模板：目标用户是谁、何时触发、当前如何完成、主要失败是什么、失败成本多少、谁承担风险。将“做一个合同 Agent”改写为“将采购合同关键条款审查时间降低 30%，同时保持关键条款漏检率低于预设阈值”。\n\n比较规则引擎、搜索、传统 ML、LLM 和人工流程；列出数据可得性、错误成本和非目标。提交一页问题章程、baseline 测量计划和可证伪假设。"}
,
{heading:"Opportunity Solution Tree 与假设驱动 Discovery",body:"将业务结果、用户机会、候选方案和关键假设连接起来，避免从预设功能倒推需求。",markdown:"Opportunity Solution Tree 从期望 outcome 展开到用户 opportunities，再到 solutions 和 assumption tests。先通过访谈、工单、行为日志识别机会，不要把用户提出的功能请求直接当作根因。每个方案至少拆分 desirability、feasibility、viability 和 responsible-AI 风险假设。\n\n为最高风险假设设计低成本实验：原型测试、人工 concierge、规则基线、数据可行性审查或小样本离线评测。记录证据、反证、样本偏差和决策阈值；持续 Discovery 是学习循环，不是一次性 PRD 阶段。"}],assessments:[{id:"m19-01-product-discovery",type:"design-review",prompt:"为企业合同审查助手提交产品问题陈述、AI 适用性对比、价值假设、baseline 指标和 MVP 非目标。",rubric:[{criterion:"问题定义",description:"用户、任务、情境和失败成本明确",points:3},{criterion:"技术选择",description:"比较 AI 与规则/搜索/人工方案",points:3},{criterion:"价值验证",description:"指标、baseline、目标和非目标可测量",points:4}]}],sources:[
{title:"NIST AI Risk Management Framework",url:"https://www.nist.gov/itl/ai-risk-management-framework",publisher:"NIST",note:"AI RMF 1.0 自愿框架；截至 2026-11-10 正在修订，不能把旧版当成强制法规"},
{title:"Google People + AI Guidebook",url:"https://pair.withgoogle.com/guidebook-v2/chapters",publisher:"Google PAIR",note:"PAIR Guidebook v2：User Needs、Data/Evaluation、Mental Models、Trust、Feedback/Control、Errors/Graceful Failure"},
{title:"Human-Centered AI",url:"https://hai.stanford.edu/ai-definitions/what-is-human-centered-ai",publisher:"Stanford HAI",note:"Stanford HAI 对 human-centered AI 的定义：以人的需求、价值和福祉为中心"},
{title:"Continuous Discovery Habits",url:"https://www.producttalk.org/getting-started-with-discovery/",publisher:"Product Talk",note:"Product Talk：Outcome → Opportunity → Solution → Assumption Test 的机会解决树与持续发现"}
]},
{id:"m19-02-ux-human-in-loop",title:"第二讲：AI UX、可控性与 Human-in-the-Loop",summary:"设计不确定性表达、用户纠错和人工复核体验。",learningObjectives:["设计可理解的 AI 反馈和不确定性表达","识别适合人工介入的节点","构建纠错、撤销和申诉路径"],estimatedMinutes:75,content:[
{heading:"AI 交互与传统表单的差异",body:"生成式界面具有不确定性，用户需要理解系统正在做什么、依据什么和能否撤销。",markdown:"显示处理状态、来源、工具动作、耗时和限制。不要把模型输出包装成系统事实；区分建议、草稿、已验证结果和已执行动作。"},
{heading:"不确定性与信任校准",body:"透明度应帮助用户校准信任，而不是用置信分数制造虚假精确。",markdown:"对事实回答提供来源和更新时间；证据不足时说明未知；对工具动作展示参数和影响。未经校准的模型自报 confidence 不应直接显示为概率。"},
{heading:"Human-in-the-Loop 设计",body:"人工介入应在风险、歧义或证据不足时触发，并提供可操作的审查上下文。",markdown:"审查包包含用户目标、关键证据、模型建议、待确认字段、风险、可选操作和拒绝后果。审批人应有能力修改、拒绝或请求更多证据，不能只提供无上下文的确认按钮。"},
{heading:"纠错、撤销与申诉",body:"用户纠正需要影响当前任务并进入可审计反馈闭环。",markdown:"提供撤销、编辑、重新生成、报告错误和申诉入口。对外部副作用明确撤销是否可行；无法撤销时提供补救流程。用户反馈不能未经同意自动变成长期记忆或训练数据。"},
{heading:"复现练习：设计可校准信任的 AI UX 与人工接管",body:"让用户区分建议、证据、草稿、已验证结果和已执行动作。",markdown:"为采购建议界面设计状态：draft、needs_evidence、awaiting_approval、executed、failed。每种状态展示来源、更新时间、关键参数、风险和可撤销性。审批包提供修改、拒绝和补充证据选项；不能只显示无上下文的确认按钮。\n\n构造证据不足、工具失败和高影响写入三种情境，说明何时澄清、何时人工接管。提交用户流程、状态文案、纠错/申诉路径和用户测试任务。"}
,
{heading:"Risk-tiered Autonomy、可逆性与接管设计",body:"人工监督应由影响、可逆性、证据质量和用户授权共同决定，而不是统一弹窗。",markdown:"将动作按风险分级：低风险可自动建议/草拟；中风险需用户确认参数；高风险写入、付款、外发或权限变更需强身份、动作绑定审批和独立策略校验；不可逆高影响动作可禁止自动执行。审批上下文必须绑定 actor、resource、operation、arguments digest、policy version、expiry 和 idempotency key；执行端还需原子消费 nonce/审批状态以防重放，不能仅靠字段相等判断一次性授权。\n\n可逆性设计包括预览、diff、撤销窗口、补偿事务和事后申诉。人工接管不是简单“human in the loop”标签：要定义触发条件、响应时限、证据包、责任人、拒绝后的安全状态和超时行为。"}],assessments:[{id:"m19-02-human-loop-ux",type:"design-review",prompt:"为 AI 采购建议产品设计用户流程，标出建议/事实/已执行状态、人工审批触发、纠错和撤销机制。",rubric:[{criterion:"信任校准",description:"来源、不确定性和执行状态表达清楚",points:3},{criterion:"人工介入",description:"审批上下文和修改/拒绝能力完整",points:4},{criterion:"用户控制",description:"提供纠错、撤销和申诉路径",points:3}]}],sources:[
{title:"Google People + AI Guidebook",url:"https://pair.withgoogle.com/guidebook-v2/chapters",publisher:"Google PAIR",note:"AI 交互与信任校准"},
{title:"Microsoft Human-AI Interaction Guidelines",url:"https://www.microsoft.com/en-us/haxtoolkit/ai-guidelines/",publisher:"Microsoft Research",note:"Microsoft HAX Toolkit 的 18 条证据驱动 AI UX 指南；源自 CHI 2019 研究"},
{title:"NIST AI RMF Playbook",url:"https://airc.nist.gov/airmf-resources/playbook/",publisher:"NIST",note:"NIST AI RMF Playbook 为自愿建议，不是 checklist；AI RMF 1.0 修订后将更新"},
{title:"Guidelines for Human-AI Interaction",url:"https://doi.org/10.1145/3290605.3300233",publisher:"ACM CHI 2019",note:"人机交互研究与用户纠错、信任校准原则"}
]},
{id:"m19-03-unit-economics",title:"第三讲：AI 产品成本模型与商业指标",summary:"计算单位经济性、推理成本和人工运营成本。",learningObjectives:["建立每任务成本模型","区分毛利、贡献利润和模型成本","设计价格与使用配额"],estimatedMinutes:75,content:[
{heading:"AI 产品的成本构成",body:"总成本包括模型 token、Embedding、检索、工具、存储、人工复核和支持。",markdown:"Cost/task = model input/output + embedding + vector/search + tools + storage + human review + support。所有金额统一币种并用 Decimal/定点数计算，禁止先转 binary float；价目需绑定模型、区域、计费单位、折扣、生效时间和版本。忽略人工复核会高估自动化收益。按任务类别和用户群分层测算。"},
{heading:"可复算的单位成本",body:"将 token 用量和供应商单价转换为单次任务成本。",markdown:"例：输入 12k token、输出 2k token；输入价 2/百万、输出价 8/百万，则模型费用=0.012×2+0.002×8=0.04。若每任务人工复核 30 秒、人工成本 24/小时，则人工成本 0.2；加上工具和存储后总成本高于模型费用本身。币种和价格需注明。"},
{heading:"毛利与贡献利润",body:"产品毛利需扣除直接推理和运营成本，贡献利润还需考虑可变获客/服务成本。",markdown:"Gross margin=(revenue−direct COGS)/revenue。若单任务收入 0.5、直接成本 0.24，毛利率 52%。不同客户的用量分布差异很大，不能只用平均 token 估算定价。"},
{heading:"定价、配额和成本护栏",body:"定价应与价值挂钩，同时设置滥用保护和成本上限。",markdown:"可采用 seat、任务量、token、功能等级或混合定价。设置月预算、每用户并发、输出长度和异常流量告警。高成本模型路由应与质量目标、客户套餐和数据合规约束一致。"},
{heading:"复现练习：复算单任务单位经济性与敏感性",body:"将模型、人工、工具和存储成本统一到每任务成本。",markdown:"示例：输入 12k token×2/百万=0.024；输出 2k token×8/百万=0.016；模型费用 0.04。人工复核 30 秒、24/小时，人工成本 0.2；若工具/存储另需 0.03，总直接成本为 0.27。若单任务收入 0.5，毛利=(0.5−0.27)/0.5=46%。\n\n改变人工复核率、输入长度和输出长度做敏感性分析。提交成本模型、币种/价目版本、毛利表和配额护栏。平均成本不能掩盖长尾高成本客户。"}
,
{heading:"Cost per Successful Task、边际成本与 Break-even",body:"商业单位经济性应按成功任务和客户分层核算，不能只计算单次模型调用价格。",markdown:"把失败重试、缓存命中、工具调用、Embedding、检索、存储、人工复核、支持和供应商最小消费计入成本。Cost per successful task = total attributable cost / independently verified successful tasks；分母必须是独立验证成功的任务，而不是调用数、尝试数或模型自报完成数；同时报告任务成功率、人工介入率和长尾 P95/P99 成本。\n\n区分固定成本、可变成本和阶梯成本，计算贡献毛利、盈亏平衡任务量和边际成本。对模型路由、输出上限、缓存、人工抽检率和客户套餐做敏感性分析。价格、币种、折扣、供应商价格版本与计费单位必须可追溯；低价模型不能以质量下降或更多人工返工为代价。"}],assessments:[{id:"m19-03-unit-economics",type:"code-task",prompt:"按课程假设价目（USD：输入 2 USD/百万 token、输出 8 USD/百万 token；人工成本 24 USD/小时），输入 12k、输出 2k、人工复核 30 秒，计算模型与人工两项的单任务直接成本；列出未计入的工具/存储等成本，再设计毛利和配额策略。该价目仅用于练习，不代表当前供应商报价。",rubric:[{criterion:"成本计算",description:"模型成本 0.04 USD、人工成本 0.20 USD，两项合计至少 0.24 USD；明确未计入工具/存储等成本",points:4},{criterion:"单位经济性",description:"正确解释收入、COGS 和毛利",points:3},{criterion:"护栏",description:"定义预算、配额和异常成本告警",points:3}]}],sources:[
{title:"Google Cloud Architecture Framework — Cost Optimization",url:"https://cloud.google.com/architecture/framework/cost-optimization",publisher:"Google Cloud",note:"成本优化框架"},
{title:"FinOps Framework",url:"https://www.finops.org/framework/",publisher:"FinOps Foundation",note:"云成本归因和单位经济性"},
{title:"OpenAI Pricing",url:"https://developers.openai.com/api/docs/pricing",publisher:"OpenAI",note:"模型 API 价格结构示例，实际使用需核验当前价格"},
{title:"AWS Well-Architected Cost Optimization Pillar",url:"https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html",publisher:"AWS",note:"成本归因、需求管理和成本优化"}
]},
{id:"m19-04-product-quality-analytics",title:"第四讲：产品质量分析、实验与增长",summary:"连接模型评测、用户行为和产品实验。",learningObjectives:["设计产品级质量指标树","设计 A/B 或分阶段实验","分析用户反馈和失败漏斗"],estimatedMinutes:75,content:[
{heading:"指标树",body:"产品指标应从用户价值分解到任务质量、体验和系统成本。",markdown:"North Star → task completion → evidence correctness → user correction → latency → cost/task。指标间可能存在 trade-off，例如更高拒答率可能降低错误但损害完成率。"},
{heading:"实验设计",body:"A/B 测试需要随机化单位、样本量、主要指标和安全护栏。",markdown:"按用户或组织随机化，避免同一用户跨组污染。预先定义 primary metric、guardrail、实验窗口和停止规则。对高风险 AI 行为先做离线评测和小流量 canary。"},
{heading:"用户反馈与失败漏斗",body:"反馈数据存在选择偏差，需结合自动指标和代表性抽样。",markdown:"分析任务发起、模型响应、用户编辑、重试、人工接管和最终完成漏斗。负反馈率只代表主动反馈者，不能代替总体质量。对失败样本分类并关联模型/Prompt/检索版本。"},
{heading:"增长与留存的因果边界",body:"使用量增长不必然意味着用户价值增长。",markdown:"监测留存、重复任务、用户节省时间和任务完成质量。避免用通知频率或自动生成内容数量刺激无价值使用。对增长实验同时设置安全、隐私和成本护栏。"},
{heading:"复现练习：为 AI 客服产品设计 A/B 实验",body:"把产品质量、用户体验和安全护栏纳入实验设计。",markdown:"随机化单位可选用户或组织，避免同一用户跨组污染。预先定义 primary metric（任务成功率或解决时间）、guardrails（错误升级率、隐私事件、P95 延迟、cost/task）、实验窗口和停止规则。对高风险功能先离线评测再小流量 canary。\n\n分析用户编辑、重试、人工接管和最终完成漏斗；注意主动反馈者存在选择偏差。提交实验方案、样本分层、失败漏斗和决策规则。"}
,
{heading:"实验统计治理：SRM、干扰、护栏与多指标",body:"产品 A/B 实验必须先验证随机化和数据质量，再解释 treatment effect。",markdown:"预先登记 hypothesis、randomization unit、eligibility、primary metric、guardrails、实验窗口和停止规则。检查 Sample Ratio Mismatch（SRM）：两臂分流可用 1 自由度 chi-square 检验并报告 p-value，但阈值应预先约定；同时检查曝光/分流日志缺失、跨组污染、重复用户和实验期间版本变化。SRM 是数据/随机化完整性警报，不是 treatment effect 检验。按用户或组织随机化，避免同一组织内用户互相影响。\n\n指标过多会产生多重比较和偶然显著；预先指定少量 primary metrics，其余标为诊断指标，并采用合适的多重检验/分层方法（例如在假设与依赖条件适用时使用 Benjamini–Hochberg 控制 FDR）；先定义与实验相关的指标，不能把校正后的显著性当成因果识别的充分条件。AI 功能同时观察任务成功、错误/拒答、人工接管、隐私/安全事件、延迟和 cost/task。高风险功能先离线评测，再 shadow/canary，不能仅凭短期点击率宣布成功。"}],assessments:[{id:"m19-04-product-experiment",type:"design-review",prompt:"为 AI 客服助手设计 A/B 实验，定义随机化单位、primary metric、guardrail、样本偏差和失败漏斗分析。",rubric:[{criterion:"指标树",description:"连接用户价值、任务质量、体验和成本",points:3},{criterion:"实验方法",description:"随机化、主要指标和停止规则清楚",points:3},{criterion:"风险护栏",description:"包含安全、隐私和成本 guardrail",points:4}]}],sources:[
{title:"Trustworthy Online Controlled Experiments",url:"https://www.cambridge.org/core/books/trustworthy-online-controlled-experiments/D97B26382EB0EB2DC2019A7A7B518F59",publisher:"Ron Kohavi et al.",note:"Kohavi、Tang、Xu，Cambridge University Press 2020；含 A/A、SRM、随机化单位、干扰和实验可信度"},
{title:"Microsoft Human-AI Interaction Guidelines",url:"https://www.microsoft.com/en-us/haxtoolkit/ai-guidelines/",publisher:"Microsoft Research",note:"AI 产品体验与用户控制"},
{title:"NIST AI RMF",url:"https://www.nist.gov/itl/ai-risk-management-framework",publisher:"NIST",note:"产品风险持续监测"},
{title:"Treatment Effect Assessment at Scale",url:"https://www.microsoft.com/en-us/research/articles/treatment-effect-assessment-at-scale-accounting-for-correlated-metrics-and-metric-relevance-in-modern-experimentation/",publisher:"Microsoft Research",note:"Microsoft ExP 2026：指标相关性、FDR 和实验相关指标筛选；BH 控制 FDR 不保证所有因果假设正确"}
]},
{id:"m19-05-delivery-lifecycle",title:"第五讲：产品交付、运营与持续改进",summary:"将模型、Prompt、数据和流程纳入产品发布生命周期。",learningObjectives:["建立 AI 产品发布和回滚流程","设计用户支持、事故响应和供应商治理","建立持续评测和产品退役机制"],estimatedMinutes:80,content:[
{heading:"版本化交付物",body:"模型、Prompt、工具 schema、检索索引、数据集和前端体验共同决定产品行为。",markdown:"发布清单记录代码 commit、不可变容器镜像 digest、runtime config、模型/provider version、Prompt、tool/API schema、index/embedding snapshot、evaluation dataset/report digest、policy、feature flags 和环境配置。只记录应用代码版本不足以复现行为。只记录应用代码版本不足以复现行为。"},
{heading:"灰度、监控与回滚",body:"上线采用 canary、分群放量和质量护栏，异常时回滚完整行为组合。",markdown:"回滚不仅恢复代码，也要恢复兼容模型、Prompt、索引和工具 schema。监控 task success、引用支持率、人工接管、P95、成本和安全事件。"},
{heading:"运营支持与事故响应",body:"AI 产品需要处理错误报告、数据删除、模型供应商故障和用户申诉。",markdown:"建立支持分级、事故 owner、用户通知、数据导出/删除、供应商沟通和根因分析。记录外部依赖故障时的降级行为，不能把供应商错误归咎于用户。"},
{heading:"持续改进与退役",body:"产品生命周期包括能力扩展、模型替换、功能降级和安全退役。",markdown:"根据真实失败样本更新评测集和产品策略。模型或供应商弃用前评估迁移差异；退役时处理用户数据、索引、凭证和审计保留。明确服务终止时间和用户迁移路径。"},
{heading:"复现练习：构建 AI 产品完整发布与退役清单",body:"将模型、Prompt、工具、索引、策略和支持流程绑定为一个发布单元。",markdown:"发布清单记录代码 commit、容器镜像 digest、runtime config、model/provider version、Prompt、tool/API schema、index/embedding snapshot、evaluation dataset/report digest、policy、feature flags 和环境配置。Canary 监控任务成功、引用支持率、人工接管、P95、成本和安全事件；回滚需恢复兼容的完整行为组合。\n\n退役时处理用户通知、数据导出/删除、索引、凭证、审计保留和供应商迁移。提交发布门禁、事故 owner、回滚演练和退役计划。"}
,
{heading:"AI Product Release Manifest、兼容性与退役",body:"AI 产品的可复现发布单元必须绑定所有影响行为的资产，并定义回滚兼容性。",markdown:"Release manifest 应记录代码、模型/provider、Prompt、tool schema、retrieval/index snapshot、embedding version、dataset/evaluator、policy、feature flag、price table 和环境配置。发布前检查资产兼容矩阵、数据迁移、供应商变更、隐私评估和回归集。\n\nCanary 以任务质量、人工接管、P95/P99、成本和安全事件作为分批放量门槛。回滚不只是回退应用代码，还需恢复兼容的模型、Prompt、索引、工具契约和策略版本。退役流程包含用户通知、数据导出/删除、凭证吊销、索引处置、审计保留和供应商迁移；记录 owner、时间表和未迁移风险。"}],assessments:[{id:"m19-05-product-release",type:"design-review",prompt:"为 RAG 客服产品制定版本化发布包、canary、质量回滚、事故支持、数据删除和模型供应商迁移计划。",rubric:[{criterion:"发布资产",description:"模型、Prompt、工具、索引和策略版本齐全",points:3},{criterion:"运营可靠性",description:"定义监控、canary、回滚和事故 owner",points:4},{criterion:"生命周期",description:"覆盖删除、迁移和退役",points:3}]}],sources:[
{title:"Google SRE Workbook",url:"https://sre.google/workbook/table-of-contents/",publisher:"Google",note:"发布、SLO 和事故管理"},
{title:"FinOps Framework",url:"https://www.finops.org/framework/",publisher:"FinOps Foundation",note:"持续成本治理"},
{title:"NIST AI RMF Playbook",url:"https://airc.nist.gov/airmf-resources/playbook/",publisher:"NIST",note:"持续监控和治理"},
{title:"DORA Continuous Delivery",url:"https://dora.dev/capabilities/continuous-delivery/",publisher:"DORA",note:"可部署状态、低风险发布和持续反馈"}
]}
];
