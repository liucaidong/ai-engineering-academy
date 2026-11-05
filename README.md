# AI Engineering Academy

面向 AI 工程学习者的系统化课程与交互实验平台。项目目标不是把概念做成静态百科，而是构建一条从大模型原理、AI 应用开发、Agent 系统，到平台工程与综合项目的可验证学习路径。

> 当前阶段：课程平台基础工程已建立。课程教材、实验能力和后端服务将按路线图逐步实现。

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
npm run build
```

## 工程原则

- 知识准确性优先于视觉效果；
- 模拟、浏览器本地执行、服务端沙箱和真实服务调用严格区分；
- 工具、文件、网络和代码执行采用最小权限；
- 先交付可验证的前端 MVP，再按实际需求引入后端；
- CI 自动触发暂缓，避免项目早期消耗 GitHub Actions 额度。
