# AI Engineering Academy

面向 AI 工程学习者的系统化课程与交互实验平台。项目目标不是把概念做成静态百科，而是构建一条从大模型原理、AI 应用开发、Agent 系统，到平台工程与综合项目的可验证学习路径。

> 当前阶段：课程平台基础工程与 M01–M20 教材基线已建立。运行验收、更多实验和后端服务将按路线图推进。

## 项目定位

AI Engineering Academy 将以工程能力为主线，覆盖 AI 基础认知、大模型核心技术、AI 应用工程、Agent 系统工程、AI 平台与基础设施，以及综合工程实践。

原始参考课件 [llm-courseware](https://shibaby.github.io/llm-courseware) 是轻量、离线、单页交互式科普课件。本项目吸收其直观表达和交互教学方式，但保持独立的产品定位与工程架构。

## 文档导航

- [产品需求](docs/PRODUCT.md)
- [课程体系](docs/CURRICULUM.md)
- [技术架构](docs/ARCHITECTURE.md)
- [实施路线图](docs/ROADMAP.md)
- [参考课件审计](docs/REFERENCE_AUDIT.md)
- [工程治理](docs/ENGINEERING_GOVERNANCE.md)
- [课程内容契约](docs/COURSE_CONTENT_CONTRACT.md)
- [课程内容编写与迁移规范](docs/CONTENT_AUTHORING.md)
- [工程验收清单](docs/ACCEPTANCE.md)
- [ADR-0001：独立平台决策](docs/adr/0001-independent-platform.md)

## 技术栈

- React + TypeScript + Vite
- Zod 课程数据运行时校验
- Vitest 单元测试
- 浏览器本地交互实验

## 本地开发

```bash
npm install
npm run dev
npm test
npm run validate:course
npm run build
npx playwright install chromium
npm run test:e2e
```

## 当前已实现能力

- 20 个课程模块导航、全文搜索、先修依赖和课程 Schema 校验；
- M01–M20 均具备章节化教材、参考来源和 Rubric 测评；
- 模块完成状态、收藏、测评草稿和 Rubric 自评保存在当前浏览器的 localStorage；\n- 根据先修模块完成情况推荐下一学习模块；
- Tokenizer：玩具 BPE 词表演示；
- Transformer：固定小矩阵的 scaled dot-product attention 与因果 Mask；
- RAG：文本切分、确定性教学向量、Top-K 检索和教学重排；
- Tool Calling、Agent Runtime、MCP、Multi-Agent 和 Evaluation 五个本地教学模拟实验；
- 所有八个实验均标注执行模式和安全边界；其中 Tool Calling、Agent、MCP、Multi-Agent 和 Evaluation 是确定性教学模拟，不连接真实模型或外部服务。

上述实验均为教学级实现，不代表真实模型推理、生产向量检索或服务端沙箱。浏览器本地进度不等同于账户级云端同步。

## 工程原则

- 知识准确性优先于视觉效果；
- 模拟、浏览器本地执行、服务端沙箱和真实服务调用严格区分；
- 工具、文件、网络和代码执行采用最小权限；
- 先交付可验证的前端 MVP，再按实际需求引入后端；
- CI 自动触发暂缓，避免项目早期消耗 GitHub Actions 额度。
