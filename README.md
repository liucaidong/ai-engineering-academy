# AI Engineering Academy

面向 AI 工程学习者的系统化课程与交互实验平台。项目目标不是把概念做成静态百科，而是构建一条从大模型原理、AI 应用开发、Agent 系统，到平台工程与综合项目的可验证学习路径。

> 当前阶段：项目基线与课程/架构参考文档建立中。本文档集是规划基线，不代表所有实验功能已经实现。

## 项目定位

AI Engineering Academy 将以工程能力为主线，覆盖：

1. AI 基础认知与大模型工作原理
2. Transformer、Token、Embedding、Context、训练与推理
3. Prompt、结构化输出、Tool Calling、RAG、多模态应用
4. Agent Runtime、Planning、Memory、MCP、Skills、Multi-Agent
5. 权限、安全、Workflow、Evaluation、Observability
6. AI 应用工程化、平台架构、部署与综合项目

原始参考课件 [llm-courseware](https://shibaby.github.io/llm-courseware) 是轻量、离线、单页交互式科普课件。本项目将吸收其直观表达和交互教学方式，但保持独立的产品定位与工程架构，不直接把原项目改造成全栈系统。

## 文档导航

- [产品需求与学习目标](docs/PRODUCT.md)
- [课程体系与模块地图](docs/CURRICULUM.md)
- [技术架构基线](docs/ARCHITECTURE.md)
- [实施路线图](docs/ROADMAP.md)
- [原始课件参考审计](docs/REFERENCE_AUDIT.md)
- [架构决策记录](docs/adr/0001-independent-platform.md)
- [工程治理约定](docs/ENGINEERING_GOVERNANCE.md)

## 设计原则

- **先正确，再交互**：知识准确性和边界条件优先于视觉效果。
- **可观察、可验证**：学习者应能看到输入、处理过程、输出和评估依据。
- **模拟与真实严格区分**：演示模拟、浏览器本地计算、后端真实执行必须明确标识。
- **安全默认拒绝**：工具、文件、网络、代码执行均采用最小权限和显式授权。
- **渐进式复杂度**：先建立概念模型，再进入工程实现，避免一开始引入不必要的基础设施。
- **独立演进**：与 Integrated STEM & Virtual Laboratory Platform 保持知识和实验接口上的可集成性，但不在初期形成强耦合。

## 当前范围

第一阶段聚焦文档基线、课程模型、内容规范和前端技术验证。后端模型网关、Agent Runtime、持久化学习进度、真实代码沙箱等能力须经过独立设计与安全评审后再实施。

## 贡献与变更

课程内容、架构和实验行为均应通过可审查的变更进行演进。初期暂不配置自动触发的 GitHub Actions 工作流，以避免在方案和目录频繁调整期间消耗 CI 额度；后续在测试命令稳定后再引入按需或受控触发的质量门禁。
