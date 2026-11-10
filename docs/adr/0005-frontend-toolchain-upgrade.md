# ADR-0005：前端构建与运行时校验工具链升级

- 状态：Accepted（本机验证）
- 日期：2026-11-10
- 范围：前端构建、测试与课程数据校验

## 背景

原基线为 Vite 6、@vitejs/plugin-react 4、Vitest 3、Zod 3。当前项目运行在 Node.js 26.13.0，官方维护版本与项目依赖升级窗口已经形成。Vite 8 采用 Rolldown 作为统一 bundler；Vitest 5 支持 Vite 8；Zod 4 有正式迁移指南。

## 决策

升级并锁定以下依赖：

- Vite 8.3.6；
- @vitejs/plugin-react 6.2.1；
- Vitest 5.1.0；
- Zod 4.6.7；
- TypeScript 保持 5.9.3；
- React 保持 19.x。

不在本次升级中更换 React、Playwright、Biome 或 API 生成器。

## 迁移注意事项

1. Vite 8 将构建底层切换到 Rolldown。现有 `build.rollupOptions.output.manualChunks` 配置在本项目中仍能正常构建并保持 React/vendor/validation 与课程模块 chunk 分离。
2. Vitest 5 默认行为和测试隔离语义有变化；本项目没有使用嵌套 `vi.mock`、`sequential` 等受影响模式，73 项单元测试通过。
3. Zod 4 对错误 issue 文案和部分 API 有变化。课程 schema 的严格对象校验仍然有效；回归测试改为验证未知字段名，而不是绑定 Zod 3 的英文错误文案。
4. 构建 chunk 体积发生变化：Zod 4 的 validation chunk 需要后续做 bundle 分析，不能仅以版本升级推断性能改善。

## TypeScript 7 暂缓

TypeScript 7.0.2 实测会在现有项目触发 CSS side-effect import 声明错误；同时 openapi-typescript 7.13.0 的 peer dependency 声明仍限定 TypeScript `^5.x`。因此 TypeScript 7 暂不进入稳定基线，等待 API 类型生成工具声明兼容并完成编辑器、构建和 clean-room 安装验证后再评估。

## 验证

- `pnpm check`：通过；
- `pnpm test`：16 files / 73 tests passed；
- `pnpm build`：通过；
- `pnpm test:e2e`：42 tests passed；
- `pnpm acceptance:local`：前端、M04–M20 Python 示例、Ruff、后端 pytest 全部通过；
- `pnpm security:audit`：npm 生产依赖与 Python 3.12 环境均未发现已知漏洞；pip-audit 跳过未发布到 PyPI 的项目自身包。

## 后果

- 获得当前 Vite/Rolldown 和 Vitest 主版本；
- 课程数据校验迁移到 Zod 4；
- TypeScript 仍保留稳定的 5.9 工具链，避免与 OpenAPI 生成器形成不受支持的组合；
- 后续任何主版本升级仍需独立 ADR 或修订本 ADR，并执行完整本地验收。
