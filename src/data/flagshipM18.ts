import type { Course } from "../types/course";

/** M18 — AI platform architecture, model gateway, tenancy and control planes. */
export const flagshipM18Lessons: Course["modules"][number]["lessons"] = [
{id:"m18-01-platform-boundaries",title:"第一讲：AI 平台边界与分层架构",summary:"区分控制平面、数据平面和产品应用责任。",learningObjectives:["定义 AI 平台的核心能力边界","比较控制平面与数据平面","设计租户、项目和环境层级"],estimatedMinutes:75,content:[
{heading:"平台与单个 AI 应用",body:"AI 平台提供共享治理、模型接入、配额、观测和安全能力，不等同于某个 Agent 产品。",markdown:"平台可包含 model registry/gateway、credential broker、policy engine、quota/billing、evaluation、observability、dataset/index services 和 developer interface。业务应用仍拥有领域流程、用户体验和业务规则。"},
{heading:"控制平面与数据平面",body:"控制平面管理配置和策略，数据平面处理线上推理请求。",markdown:"Control Plane 管理模型目录、路由策略、租户配额、密钥引用、策略版本和发布；Data Plane 负责鉴权、限流、模型路由、请求转换、流式返回和计量。两者故障域应隔离，配置发布要有版本和回滚。"},
{heading:"多租户层级",body:"组织、租户、项目、环境和工作负载之间需要明确资源归属。",markdown:"定义 tenant_id、project_id、environment、principal 和 workload identity。配额、密钥、数据索引、日志和账单按租户归属。不能仅靠客户端传入 tenant_id；必须从可信身份上下文派生并验证。"},
{heading:"平台 API 与契约",body:"平台接口需要稳定版本、错误语义和资源生命周期。",markdown:"定义模型请求、路由配置、评测任务、密钥引用和计量事件 schema。明确幂等、分页、限流、超时和弃用政策。平台不应暴露原始 provider secret 给浏览器客户端。"},
{heading:"复现练习：绘制多租户 AI 平台控制/数据平面边界",body:"从请求路径和配置生命周期区分共享平台与业务应用责任。",markdown:"控制平面管理模型目录、路由策略、租户配额、密钥引用、策略版本和发布；数据平面负责鉴权、限流、模型路由、请求转换、流式返回和计量。tenant_id 必须从可信身份上下文派生，不能信任客户端任意传入。业务应用仍负责领域流程和业务规则。\\n\\n提交组件图、身份流、配置发布/回滚序列和租户资源归属表。"}
],assessments:[{id:"m18-01-platform-architecture",type:"design-review",prompt:"绘制多租户 AI 平台控制平面/数据平面架构，标出身份、模型网关、配额、密钥、观测和应用责任边界。",rubric:[{criterion:"平面划分",description:"控制与数据平面职责清晰",points:3},{criterion:"租户边界",description:"身份派生和资源隔离明确",points:4},{criterion:"契约治理",description:"接口版本、幂等、限流和密钥保护完整",points:3}]}],sources:[
{title:"Google Cloud Architecture Framework",url:"https://cloud.google.com/architecture/framework",publisher:"Google Cloud",note:"平台可靠性、安全和运营"},
{title:"Kubernetes Multi-tenancy",url:"https://kubernetes.io/docs/concepts/security/multi-tenancy/",publisher:"Kubernetes",note:"多租户隔离模型"},
{title:"NIST SP 800-207: Zero Trust Architecture",url:"https://csrc.nist.gov/pubs/sp/800/207/final",publisher:"NIST",note:"身份与资源持续授权"}
]},
{id:"m18-02-model-gateway-routing",title:"第二讲：Model Gateway、路由与供应商抽象",summary:"设计统一模型接口、能力声明、路由和供应商故障隔离。",learningObjectives:["定义模型路由策略和能力矩阵","比较统一 API 与供应商原生能力","设计 fallback 和版本治理"],estimatedMinutes:80,content:[
{heading:"Gateway 的职责",body:"Model Gateway 统一鉴权、路由、配额、计量和观测，但不应抹平模型能力差异。",markdown:"请求路径：身份验证 → policy/quota → model selection → provider adapter → response normalization → metering/trace。适配器需保留 provider-specific 参数和错误语义，避免错误地宣称所有模型支持同一能力。"},
{heading:"模型能力目录",body:"路由决策应依据上下文长度、模态、工具调用、区域、延迟和合规要求。",markdown:"模型目录记录 provider、model_id/version、modalities、context limit、tool support、structured output、region、data policy、price、rate limit 和 availability。能力数据需有更新时间和验证来源。"},
{heading:"路由与 fallback",body:"Fallback 可能改变质量、隐私区域、工具行为和输出契约。",markdown:"路由可按任务、租户策略、成本和健康状态选择模型。Fallback 前检查能力兼容、数据驻留、输出 schema 和质量门槛；不能静默切换到未经评估的模型。"},
{heading:"供应商抽象的边界",body:"统一接口减少耦合，但过度抽象会丢失重要模型特性。",markdown:"将通用字段与扩展字段分层；对 token usage、finish reason、refusal、tool call 和 multimodal payload 做显式映射。版本升级需要 contract tests 和差异报告。"},
{heading:"复现练习：为三家模型供应商设计能力路由矩阵",body:"通过能力目录和兼容检查避免错误 fallback。",markdown:"能力目录记录 provider、model_id/version、modalities、context limit、tool support、structured output、region、data policy、price、rate limit 和更新时间。路由按任务、租户策略、区域、延迟和健康状态选择。Fallback 前检查工具行为、Schema、数据驻留和质量门槛；不能静默切换到未经评估的模型。\\n\\n提交模型能力矩阵、路由规则、fallback 拒绝条件和 contract test。"}
],assessments:[{id:"m18-02-model-gateway",type:"design-review",prompt:"设计支持三家模型供应商的 Gateway，给出 capability registry、路由规则、fallback 兼容检查和计量字段。",rubric:[{criterion:"能力目录",description:"记录模型能力、限制、区域和价格",points:3},{criterion:"路由策略",description:"按任务/策略/健康状态路由",points:3},{criterion:"Fallback",description:"检查能力、隐私、质量和 schema 兼容",points:4}]}],sources:[
{title:"LiteLLM Documentation",url:"https://docs.litellm.ai/",publisher:"LiteLLM",note:"统一模型网关和供应商适配"},
{title:"OpenAI API Reference",url:"https://platform.openai.com/docs/api-reference",publisher:"OpenAI",note:"模型 API 请求/响应契约"},
{title:"Anthropic API Documentation",url:"https://docs.anthropic.com/en/api/overview",publisher:"Anthropic",note:"供应商原生接口差异"}
]},
{id:"m18-03-quotas-billing-metering",title:"第三讲：配额、限流、计量与成本归因",summary:"建立租户配额、token 计量和成本控制。",learningObjectives:["比较 token bucket 与 leaky bucket","设计租户/模型/用户多维配额","计算请求成本和成本归因"],estimatedMinutes:75,content:[
{heading:"限流算法",body:"Token Bucket 允许短时突发，Leaky Bucket 平滑请求速率。",markdown:"Token Bucket 以速率 r 补充容量 B，当前 token 数不足时拒绝或排队。若 B=100、r=10/s，空桶开始 5 秒最多补充 50 token。应分别限制请求数、输入 token、输出 token 和并发。"},
{heading:"多维配额",body:"配额需按租户、项目、用户、模型和时间窗口组合。",markdown:"配额维度包括 RPM、TPM、并发、每日预算、模型专属限制和风险等级。配额检查需原子执行，避免并发请求同时通过导致超额。"},
{heading:"成本模型",body:"成本不仅是 token 单价，还包括缓存、工具、向量库、存储和重试。",markdown:"cost=request_input_tokens×price_in + output_tokens×price_out + tool/storage/embedding cost。例：输入 10k token、输出 2k token，输入单价 2/百万、输出 8/百万，则模型费用=0.02+0.016=0.036（币种单位依价目表）。价格必须带生效时间和供应商版本。"},
{heading:"计量准确性与争议",body:"计量应记录供应商 usage、内部估算和计费规则版本。",markdown:"记录 request_id、tenant、model、input/output/cached tokens、provider usage、retry、price version 和 currency。内部 tokenizer 估算不一定等于供应商账单；对账时保留差异。"},
{heading:"复现练习：核算 Token Bucket 与请求成本",body:"将限流和成本计量放入租户配额模型。",markdown:"Token Bucket 容量 B=100、补充速率 r=10/s，空桶开始 5 秒补充 50 token；分别设置 RPM、TPM、并发和日预算。模型费用示例：输入 10k token、单价 2/百万，费用 0.02；输出 2k token、单价 8/百万，费用 0.016；合计 0.036（货币单位由价目表决定）。\\n\\n提交多维配额表、原子扣减策略和 provider usage 对账字段。内部 Tokenizer 估算不得冒充供应商账单。"}
],assessments:[{id:"m18-03-quota-cost",type:"code-task",prompt:"设计租户 RPM/TPM/并发/日预算策略，并计算 10k 输入、2k 输出在给定单价下的费用，说明重试与缓存如何计量。",rubric:[{criterion:"配额",description:"覆盖多维限制和原子并发控制",points:3},{criterion:"成本计算",description:"正确算出 0.036 并标注价目版本",points:3},{criterion:"计量对账",description:"区分估算、供应商 usage 和其他资源费用",points:4}]}],sources:[
{title:"Google Cloud Architecture Framework — Cost Optimization",url:"https://cloud.google.com/architecture/framework/cost-optimization",publisher:"Google Cloud",note:"成本管理"},
{title:"Stripe Rate Limits",url:"https://stripe.com/docs/rate-limits",publisher:"Stripe",note:"速率限制实践"},
{title:"OpenTelemetry GenAI Semantic Conventions",url:"https://opentelemetry.io/docs/specs/semconv/gen-ai/",publisher:"OpenTelemetry",note:"Token usage 观测字段"}
]},
{id:"m18-04-tenant-security-control",title:"第四讲：多租户安全、密钥与策略控制",summary:"建立身份隔离、凭证代理和策略执行边界。",learningObjectives:["设计租户数据隔离","建立短期凭证和 secret broker","定义策略发布与审计"],estimatedMinutes:80,content:[
{heading:"租户隔离层次",body:"隔离覆盖数据库、对象存储、向量索引、缓存、日志、队列和模型请求。",markdown:"逻辑隔离通过 tenant key 和访问策略实现；强隔离可采用独立数据库/schema、索引或部署单元。选择取决于合规、风险和成本。所有查询都需服务端注入租户条件。"},
{heading:"密钥与凭证代理",body:"模型供应商密钥应留在服务端，由 broker 按租户策略选择并注入。",markdown:"使用 secret manager、短期凭证、轮换、最小 scope 和审计。客户端只获得引用或代理能力，不接触原始密钥。密钥泄露时支持撤销和影响范围追踪。"},
{heading:"Policy Engine",body:"策略引擎统一执行模型、工具、数据和区域限制。",markdown:"策略输入包含 principal、tenant、resource、action、model、data_classification、region 和 risk_level。策略决策应可解释、版本化并 fail closed。策略服务不可用时，高风险操作默认拒绝。"},
{heading:"控制面变更治理",body:"配额、路由、密钥和策略变更需要审批、版本和回滚。",markdown:"配置变更记录 actor、diff、reason、approval、effective_at 和 version。先在测试租户验证，再灰度发布；保留旧版本回滚。控制平面权限与数据平面调用权限分离。"},
{heading:"复现练习：设计租户隔离与 Secret Broker",body:"把数据、缓存、密钥和策略执行绑定到可信租户身份。",markdown:"隔离范围覆盖数据库、对象存储、向量索引、缓存、日志和队列。Secret Broker 通过短期凭证、最小 scope、轮换和审计向服务端注入密钥；客户端只持有引用，不接触原始 provider secret。Policy Engine 根据 principal、tenant、resource、action、model、data classification 和 region 决策，策略不可用时高风险操作 fail closed。\\n\\n提交隔离矩阵、凭证生命周期和策略决策表。"}
],assessments:[{id:"m18-04-tenant-control",type:"design-review",prompt:"为企业 AI 平台设计多租户隔离、secret broker 和 policy engine，说明策略不可用时的 fail-closed 行为。",rubric:[{criterion:"隔离设计",description:"覆盖数据、索引、缓存、日志和队列",points:3},{criterion:"凭证治理",description:"短期、最小权限、轮换和撤销",points:3},{criterion:"策略控制",description:"策略输入、版本、审计和故障默认拒绝",points:4}]}],sources:[
{title:"Kubernetes Multi-tenancy",url:"https://kubernetes.io/docs/concepts/security/multi-tenancy/",publisher:"Kubernetes",note:"租户隔离策略"},
{title:"NIST SP 800-57 Part 1",url:"https://csrc.nist.gov/pubs/sp/800/57/pt1/r5/final",publisher:"NIST",note:"密钥管理"},
{title:"Open Policy Agent Documentation",url:"https://www.openpolicyagent.org/docs/latest/",publisher:"Open Policy Agent",note:"策略即代码"}
]},
{id:"m18-05-platform-reliability",title:"第五讲：平台可靠性、弹性与架构验收",summary:"设计容量、队列、熔断、灾备和平台 SLO。",learningObjectives:["识别平台关键故障域","设计弹性与灾备策略","定义平台级 SLI/SLO 和验收"],estimatedMinutes:85,content:[
{heading:"故障域与依赖图",body:"平台依赖模型供应商、数据库、队列、对象存储、策略和身份服务。",markdown:"绘制依赖图，识别单点、共享故障域和级联路径。控制平面故障不应立即中断已建立的数据平面请求；关键策略需缓存有期限的已签名快照。"},
{heading:"队列、弹性和隔离",body:"队列和并发控制可吸收突发，但必须有界并支持背压。",markdown:"按租户和任务类型设置队列上限、最大等待时间、优先级和公平调度。依赖故障时熔断并限制重试；对非关键任务降级，对高风险任务 fail closed。"},
{heading:"灾备与恢复目标",body:"RTO/RPO 定义服务恢复时间和可接受数据丢失窗口。",markdown:"RTO 是恢复服务的目标时间；RPO 是可接受的数据恢复点。控制平面配置、计量事件和审计日志需要不同备份策略。定期演练恢复、密钥轮换和区域故障。"},
{heading:"平台 SLO 与架构验收",body:"平台质量需同时覆盖可用性、延迟、隔离、成本和策略正确性。",markdown:"SLI 可包括 gateway availability、P95 latency、quota enforcement accuracy、tenant isolation violation、metering discrepancy 和 model routing success。架构验收要提供容量测试、故障演练、权限审计和成本报告；未执行的验证应明确标记。"},
{heading:"复现练习：进行一次 Model Gateway 故障域与 SLO 评审",body:"把容量、队列、熔断、灾备和策略正确性纳入平台验收。",markdown:"绘制模型供应商、数据库、队列、对象存储、身份和策略服务依赖图。定义队列上限、最大等待、租户公平性、熔断和重试限制；RTO 表示恢复服务目标时间，RPO 表示可接受数据恢复点。分别制定配置、计量和审计数据的备份策略。\\n\\n平台 SLI 包括 gateway availability、P95 latency、quota enforcement accuracy、tenant isolation violation、metering discrepancy 和 routing success。提交故障演练、RTO/RPO、告警 owner 和回滚清单；未执行项标记 not tested。"}
],assessments:[{id:"m18-05-platform-slo",type:"design-review",prompt:"为多租户 Model Gateway 制定故障域图、队列/熔断策略、RTO/RPO 和平台 SLO 验收表。",rubric:[{criterion:"故障分析",description:"识别关键依赖和级联路径",points:3},{criterion:"弹性灾备",description:"定义背压、熔断、RTO/RPO 和演练",points:3},{criterion:"SLO",description:"覆盖可用性、延迟、隔离、计量和路由",points:4}]}],sources:[
{title:"Google SRE Book",url:"https://sre.google/sre-book/table-of-contents/",publisher:"Google",note:"可靠性工程"},
{title:"AWS Well-Architected Framework",url:"https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html",publisher:"Amazon Web Services",note:"弹性、安全和成本架构"},
{title:"Google Cloud Architecture Framework",url:"https://cloud.google.com/architecture/framework",publisher:"Google Cloud",note:"平台架构验收参考"}
]}
];
