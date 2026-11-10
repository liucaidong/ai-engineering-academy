# Git 仓库全面治理报告 — 2026-11-10

## 1. 仓库身份与治理范围

- 项目：AI Engineering Academy
- 仓库：`https://github.com/liucaidong/ai-engineering-academy`（公开仓库，owner `liucaidong`）
- 本地路径：`/Users/geeker/ai-projects/ai-engineering-academy`
- 治理主分支：`develop`
- 治理日期：2026-11-10
- 本次仅治理该仓库；未读取环境变量或密钥值。

## 2. 分支与默认分支治理

治理前：本地分支 `main`、`develop` 两条；远程分支 `origin/main`、`origin/develop` 两条。GitHub 默认分支为 `main`。

差异审计结果：

- `main` 的 HEAD 为 `80bf7ab5f06bd9ff5802e43e814ed507479ee352`。
- `develop` 在治理前的 HEAD 为 `6d1cdce457fe7310a102b3277c8e382c19d6355c`。
- `main` 是 `develop` 的祖先；`main` 独有提交数为 0，`develop` 比 `main` 多 21 个提交。
- 两分支树差异涉及 84 个文件（2,454 insertions / 1,269 deletions）；这些变更均已在 `develop`。
- 未发现需要从 `main` 单独恢复的提交或文件。

执行结果：

1. 先创建并验证治理前完整 Git Bundle。
2. 将 GitHub 默认分支切换为 `develop`。
3. 删除本地 `main` 和远程 `origin/main`。
4. 执行 `git fetch --prune origin`，并将本地 `origin/HEAD` 指向 `origin/develop`。
5. 最终本地分支 1 条（`develop`），远程分支 1 条（`develop`）。

没有删除 `develop` 历史中的任何提交。`main` 的原 HEAD 仍可从 `develop` 的祖先历史中访问。

## 3. Git 隐藏对象与历史审计

| 项目 | 治理前发现 | 处理结果 |
|---|---:|---|
| Stash | 0 | 无待恢复内容 |
| Worktree | 1 | 仅主工作目录，工作区干净 |
| Tags | 0 | 无 Tag 需要迁移或删除 |
| refs/original | 0 | 无 |
| refs/replace | 0 | 无 |
| refs/notes | 0 | 无 |
| GitHub PR refs | 0 | 远程未发现 `refs/pull/*` |
| Reflog | 有历史记录 | 审计后保留，不做过期清理 |

`git fsck --full` 首轮发现 1 个 dangling blob：

- Object：`e3de8a6342eb83dd24a4439f4b8867388a4274c0`
- 类型：blob
- 大小：10,173 bytes
- 内容：`docs/ASSESSMENT_STATIC_AUDIT.md` 的一个较早版本。
- 该版本不是当前文档的精确副本；当前文档已有后续审查与整改内容，因此没有覆盖当前版本。

为避免丢失历史证据，将该对象保留在本地归档引用 `refs/archive/assessment-static-audit-pre-refinement`，并导出为独立 Markdown 文件。治理后 `git fsck --full` 与 `git fsck --full --no-reflogs --unreachable` 均无输出，即未发现 dangling/unreachable 对象。

未发现不可达 commit、tree 或 tag。没有执行 `git gc --prune=now`，也没有过期或清空 reflog：对象库仅 0 prune-packable / 0 garbage，强制 GC 没有实际收益，保留历史更安全。

## 4. Git 特殊机制与本地资源

- `.gitignore` 已覆盖 Node 依赖、构建目录、测试报告、环境文件、日志、Python bytecode/cache、egg-info 和 TypeScript build metadata。
- `.git/info/exclude` 仅存在 Git 默认注释模板；未配置额外本地排除规则。
- `.git/info/attributes` 不存在。
- 未发现 `assume-unchanged` 或 `skip-worktree` index 标记。
- Sparse Checkout 未启用。
- 未配置 Git alternates。
- 无 Git submodule。
- Git LFS 已安装，但 `git lfs ls-files` 无跟踪对象。
- 仓库内未发现 `.patch`、`.diff`、`.bundle`、本地备份文件或 IDE Local History 目录。
- 环境文件审计仅发现被跟踪的 `backend/.env.example`；未发现实际 `.env` 文件。未读取或输出任何密钥值。

清理的可重建产物与缓存：`dist/`、`test-results/`、`playwright-report/`（若存在）、`coverage/`（若存在）、根及 backend 的 Ruff/Pytest cache、Python `__pycache__`、`tsconfig.tsbuildinfo`、`backend/*.egg-info`。

保留的本地依赖：`node_modules/`（约 295 MB）与 `backend/.venv/`（约 97 MB）。这两者是当前开发环境依赖，不作为垃圾删除。环境模板 `backend/.env.example` 保留。

## 5. GitHub 资源审计

治理前后均通过 GitHub API 检查以下资源：

| 资源 | 数量/状态 |
|---|---:|
| Pull Requests（所有状态） | 0 |
| Actions Workflows | 0 |
| Workflow Runs | 0 |
| Actions Artifacts | 0 |
| Actions Caches | 0 |
| Releases | 0 |
| Tags | 0 |
| Deployments | 0 |
| GitHub Pages | 未启用 |
| Environments | 0 |
| Webhooks | 0 |
| Actions Variables | 0 |
| Actions Secrets | 0 |
| Forks | 0 |

治理前 `main`、`develop` 均无 Branch Protection；无 Repository Rulesets。治理后为 `develop` 建立最小保护：

- `enforce_admins = true`
- 禁止 force push
- 禁止删除 `develop`
- 不要求 PR Review、不要求 Status Checks、不限制直接 push

该规则保护唯一主开发分支，同时保留项目当前直接向 `develop` 提交和推送的工作方式。

**CI/CD 状态说明：** 仓库当前没有 GitHub Actions Workflow 或 Workflow Run，也没有部署、Pages 或 Environment 配置。因此不能报告 CI/CD 正常运行；本轮未创建或触发 Actions，后续若恢复 CI/CD，需要单独设计并验证 Workflow。

## 6. 本机完整性验证

本轮在分支清理和产物清理后执行 `pnpm acceptance:local` 与 `pnpm security:audit`，结果：

- Biome lint / format：通过。
- TypeScript typecheck：通过。
- OpenAPI：3.1.0，12 paths，契约无漂移。
- Vitest：73 passed。
- Playwright：42 passed。
- M04–M20 Python 示例：88 passed。
- Ruff format / lint（含 Bandit S 规则）：67 files 通过。
- Backend pytest：131 passed / 1 skipped。
- 唯一 skipped：需要专用 PostgreSQL 环境的 RLS 集成测试；不计入通过数。
- Vite production build：通过；生成的 `dist/` 随后再次清理。
- npm production dependencies：未发现已知漏洞。
- Python 3.12 environment dependencies：未发现已知漏洞；未发布到 PyPI 的项目自身包由 pip-audit 跳过。
- `git diff --check`：通过。

未运行 GitHub Actions。

## 7. 备份与归档

治理前备份目录（仓库外）：

`/Users/geeker/ai-projects/_repo-governance-archive/ai-engineering-academy-2026-11-10`

其中包含：

- `repository-all-refs.bundle`：治理前所有 refs 的完整 Bundle，`git bundle verify` 已通过；包含当时的 `main`、`develop`、远程跟踪 refs 与 dangling blob 归档 ref。
- `assessment-static-audit-pre-refinement.md`：10,173-byte 历史 blob 的独立导出。

治理前 Bundle SHA-256：`5f4254616548d8607266b7915286fad09e3e3bed1f6f1b08003b0bef1b9fd89a`。

## 8. 最终状态与限制

- 唯一开发分支：`develop`。
- GitHub 默认分支：`develop`。
- 本地和远程分支：各 1 条。
- Stash：0。
- 额外 Worktree：0（仅主工作目录）。
- 未处理有效代码：未发现。
- 未处理不可达 Git 对象：0；历史 blob 已显式归档。
- 未处理旧分支：0。
- 工作区：干净。
- 本地 `develop` 与 `origin/develop`：同步。
- CI/CD：未配置，不能宣称运行正常。
- PostgreSQL RLS 真实集成验证：因专用数据库环境缺失而跳过，仍是待完成项。

本次未删除依赖目录、环境模板、数据库或运行时数据；未清理 reflog；未执行强制 Git GC。以上保留均为有意决策。