import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("persists bookmarks and filters the module navigation", async ({ page }) => {
  await page.getByRole("button", { name: "☆ 收藏模块" }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "★ 已收藏" })).toBeVisible();
  await page.getByRole("button", { name: /只看收藏/ }).click();
  await expect(page.getByRole("button", { name: /M01/ })).toBeVisible();
  await expect(page.getByText("没有匹配的课程模块。")).toHaveCount(0);
});

test("recommends the next module only after prerequisites are complete", async ({ page }) => {
  await expect(page.locator(".recommendation-card")).toContainText("M01");
  await page.getByRole("button", { name: "标记本模块为已完成" }).click();
  await expect(page.locator(".recommendation-card")).toContainText("M02");
});

test("searches the curriculum and opens the matching module", async ({ page }) => {
  await page.getByRole("searchbox", { name: "搜索课程模块" }).fill("MCP");
  await page.getByRole("button", { name: /M12.*MCP 协议与集成/ }).click();
  await expect(page.getByRole("heading", { name: "MCP 协议与集成" })).toBeVisible();

  await page.getByRole("searchbox", { name: "搜索课程模块" }).fill("MinHash");
  await expect(page.getByRole("button", { name: /M04.*预训练、微调与对齐/ })).toBeVisible();
});

test("renders the expanded M04 first lesson and its objective comparison table", async ({
  page,
}) => {
  await page.getByRole("button", { name: /M04.*预训练、微调与对齐/ }).click();
  await expect(page.getByRole("heading", { name: "第一讲：预训练目标与数据工程" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /预训练目标比较：Causal LM、MLM 与 Span Corruption/ }),
  ).toBeVisible();
  await expect(page.locator(".lesson-section")).toHaveCount(6);
  await expect(page.getByRole("table").first()).toBeVisible();
});

test("renders the expanded M05 KV cache lesson", async ({ page }) => {
  await page.getByRole("button", { name: /M05.*推理、解码与部署/ }).click();
  await expect(
    page.getByRole("heading", { name: "第一讲：Prefill、Decode 与 KV Cache" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Paged KV Cache：块分配、碎片与前缀复用" }),
  ).toBeVisible();
  await expect(page.locator(".lesson-section")).toHaveCount(6);
});

test("renders the expanded M06 prompt contract lesson", async ({ page }) => {
  await page.getByRole("button", { name: /M06.*Prompt Engineering/ }).click();
  await expect(page.getByRole("heading", { name: "第一讲：指令结构与任务规格" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Prompt 契约的版本化与可观测性" })).toBeVisible();
  await expect(page.locator(".lesson-section")).toHaveCount(6);
});

test("renders the expanded M07 tool calling protocol lesson", async ({ page }) => {
  await page.getByRole("button", { name: /M07.*结构化输出与 Tool Calling/ }).click();
  await page.getByRole("button", { name: "课程内容" }).click();
  await expect(
    page.getByRole("heading", { name: "第一讲：Tool Calling 协议与控制流" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "协议层次：Function Calling、MCP Tools 与 JSON-RPC" }),
  ).toBeVisible();
  await expect(page.locator(".lesson-section")).toHaveCount(6);
});

test("renders the expanded M08 RAG production and evaluation lesson", async ({ page }) => {
  await page.getByRole("button", { name: /M08.*检索增强生成 RAG/ }).click();
  await page.getByRole("button", { name: "课程内容" }).click();
  await expect(
    page.getByRole("heading", { name: "第一讲：RAG 系统边界与端到端数据流" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "RAG、Long Context 与 Fine-tuning 的边界" }),
  ).toBeVisible();
  await expect(page.locator(".lesson-section")).toHaveCount(6);
});

test("renders the expanded M09 multimodal alignment lesson", async ({ page }) => {
  await page.getByRole("button", { name: /M09.*多模态 AI/ }).click();
  await page.getByRole("button", { name: "课程内容" }).click();
  await expect(page.getByRole("heading", { name: "第一讲：多模态架构与表示对齐" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "跨模态对齐目标：Contrastive、Sigmoid 与生成式监督" }),
  ).toBeVisible();
  await expect(page.locator(".lesson-section")).toHaveCount(6);
});

test("renders the expanded M10 Agent runtime autonomy lesson", async ({ page }) => {
  await page.getByRole("button", { name: /M10.*Agent 基础与 Runtime/ }).click();
  await page.getByRole("button", { name: "课程内容" }).click();
  await expect(
    page.getByRole("heading", { name: "第一讲：Agent 基本模型与自主性边界" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Agent Runtime：把自主决策约束在可审计执行包络内" }),
  ).toBeVisible();
  await expect(page.locator(".lesson-section")).toHaveCount(6);
});

test("renders the expanded M11 formal planning and memory lesson", async ({ page }) => {
  await page.getByRole("button", { name: /M11.*Planning、Memory 与状态/ }).click();
  await page.getByRole("button", { name: "课程内容" }).click();
  await expect(page.getByRole("heading", { name: "第一讲：任务分解与计划表示" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "从自然语言计划到可验证的形式化问题" }),
  ).toBeVisible();
  await expect(page.locator(".lesson-section")).toHaveCount(6);
});

test("renders the current M12 MCP stateless protocol lesson", async ({ page }) => {
  await page.getByRole("button", { name: /M12.*MCP 协议与集成/ }).click();
  await page.getByRole("button", { name: "课程内容" }).click();
  await expect(
    page.getByRole("heading", { name: "第一讲：MCP 架构、角色与协议边界" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "MCP 双时代协议模型：Handshake 与 Stateless Request Envelope",
    }),
  ).toBeVisible();
  await expect(page.locator(".lesson-section")).toHaveCount(6);
});

test("renders the expanded M13 Agent Skills specification lesson", async ({ page }) => {
  await page.getByRole("button", { name: /M13.*Skills 与可复用能力/ }).click();
  await page.getByRole("button", { name: "课程内容" }).click();
  await expect(
    page.getByRole("heading", { name: "第一讲：Skill 概念、边界与能力契约" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "开放 Agent Skills 格式与 Runtime 契约分离" }),
  ).toBeVisible();
  await expect(page.locator(".lesson-section")).toHaveCount(6);
});

test("renders the expanded M14 multi-agent topology and cost lesson", async ({ page }) => {
  await page.getByRole("button", { name: /M14.*Multi-Agent/ }).click();
  await page.getByRole("button", { name: "课程内容" }).click();
  await expect(
    page.getByRole("heading", { name: "第一讲：Multi-Agent 协作模型与适用边界" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Topology Decision Matrix 与协调税模型" }),
  ).toBeVisible();
  await expect(page.locator(".lesson-section")).toHaveCount(6);
});

test("renders the expanded M15 Agentic threat modeling lesson", async ({ page }) => {
  await page.getByRole("button", { name: /M15.*安全、权限与人工审批/ }).click();
  await page.getByRole("button", { name: "课程内容" }).click();
  await expect(
    page.getByRole("heading", { name: "第一讲：AI 系统威胁建模与风险分类" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "MITRE ATLAS 攻击链与 AI Agent 威胁映射" }),
  ).toBeVisible();
  await expect(page.locator(".lesson-section")).toHaveCount(6);
});

test("renders the expanded M16 durable workflow lesson", async ({ page }) => {
  await page.getByRole("button", { name: /M16.*Workflow 与编排/ }).click();
  await page.getByRole("button", { name: "课程内容" }).click();
  await expect(
    page.getByRole("heading", { name: "第一讲：Workflow 与 Agent 的边界" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Workflow Control Plane 与 Agent Decision Plane" }),
  ).toBeVisible();
  await expect(page.locator(".lesson-section")).toHaveCount(6);
});

test("renders the expanded M17 evaluation harness lesson", async ({ page }) => {
  await page.getByRole("button", { name: /M17.*Evaluation 与 Observability/ }).click();
  await page.getByRole("button", { name: "课程内容" }).click();
  await expect(
    page.getByRole("heading", { name: "第一讲：AI Evaluation 体系与指标设计" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Eval Harness 对象模型、Outcome Grading 与回归套件" }),
  ).toBeVisible();
  await expect(page.locator(".lesson-section")).toHaveCount(6);
});

test("renders the expanded M18 platform architecture lesson", async ({ page }) => {
  await page.getByRole("button", { name: /M18.*AI 平台架构/ }).click();
  await page.getByRole("button", { name: "课程内容" }).click();
  await expect(page.getByRole("heading", { name: "第一讲：AI 平台边界与分层架构" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Desired State Reconciliation、配置快照与平面隔离" }),
  ).toBeVisible();
  await expect(page.locator(".lesson-section")).toHaveCount(6);
});

test("renders the expanded M19 product discovery and economics lesson", async ({ page }) => {
  await page.getByRole("button", { name: /M19.*应用工程化与交付/ }).click();
  await page.getByRole("button", { name: "课程内容" }).click();
  await expect(
    page.getByRole("heading", { name: "第一讲：AI 产品问题定义与价值验证" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Opportunity Solution Tree 与假设驱动 Discovery" }),
  ).toBeVisible();
  await expect(page.locator(".lesson-section")).toHaveCount(6);
});

test("renders the expanded M20 Capstone requirements and evidence lesson", async ({ page }) => {
  await page.getByRole("button", { name: /M20.*Capstone 综合项目/ }).click();
  await page.getByRole("button", { name: "课程内容" }).click();
  await expect(
    page.getByRole("heading", { name: "第一讲：Capstone 立项——需求、范围与验收" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Definition of Ready/Done、需求追踪与治理节奏" }),
  ).toBeVisible();
  await expect(page.locator(".lesson-section")).toHaveCount(6);
});

test("loads only the selected module lesson payload", async ({ page }) => {
  await page.reload();
  await expect(page.getByRole("heading", { name: /第一讲：人工智能到底是什么/ })).toBeVisible();

  const loadedModuleAssets = async () =>
    page.evaluate(() =>
      performance
        .getEntriesByType("resource")
        .map((entry) => entry.name)
        .filter((name) => /flagshipM\d{2}/.test(name)),
    );

  await expect
    .poll(async () => (await loadedModuleAssets()).some((name) => /flagshipM01/.test(name)))
    .toBe(true);
  expect((await loadedModuleAssets()).some((name) => /flagshipM02/.test(name))).toBe(false);
  expect((await loadedModuleAssets()).some((name) => /flagshipM20/.test(name))).toBe(false);

  await page.getByRole("button", { name: /M05.*推理、解码与部署/ }).click();
  await expect(
    page.getByRole("heading", { name: /第一讲：Prefill、Decode 与 KV Cache/ }),
  ).toBeVisible();
  await expect
    .poll(async () => (await loadedModuleAssets()).some((name) => /flagshipM05/.test(name)))
    .toBe(true);
  expect((await loadedModuleAssets()).some((name) => /flagshipM20/.test(name))).toBe(false);
});

test("persists module completion after reload", async ({ page }) => {
  await page.getByRole("button", { name: "标记本模块为已完成" }).click();
  await expect(page.getByRole("progressbar", { name: "课程模块完成进度" })).toHaveAttribute(
    "aria-valuenow",
    "5",
  );
  await page.reload();
  await expect(page.getByRole("button", { name: /已标记完成/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("persists assessment draft and rubric self-review", async ({ page }) => {
  const response = page.getByLabel("你的回答 / 設計說明");
  await response.fill("模型、应用和运行时必须分层，工具执行必须经过权限校验。");
  const criterion = page.getByRole("checkbox", { name: /概念准确性/ });
  await criterion.check();
  await page.reload();
  await expect(page.getByLabel("你的回答 / 設計說明")).toHaveValue(
    "模型、应用和运行时必须分层，工具执行必须经过权限校验。",
  );
  await expect(page.getByRole("checkbox", { name: /概念准确性/ })).toBeChecked();
});

test("runs the Transformer attention lab and toggles causal masking", async ({ page }) => {
  await page.getByRole("button", { name: /M02.*Transformer 与 Attention/ }).click();
  await expect(page.getByRole("heading", { name: "Transformer Attention Lab" })).toBeVisible();
  await page.getByRole("checkbox", { name: /启用因果 Mask/ }).check();
  await expect(page.getByRole("table", { name: "Softmax Weights" })).toBeVisible();
});

test("runs the Tokenizer teaching lab", async ({ page }) => {
  await page.getByRole("button", { name: /M03.*Token、Embedding 与 Context/ }).click();
  await expect(page.getByRole("heading", { name: "Tokenizer Lab" })).toBeVisible();
  await page.getByLabel("输入文本").fill("the model is learning");
  await expect(page.locator(".token-list .token").first()).toBeVisible();
});

test("runs the RAG teaching lab with a query", async ({ page }) => {
  await page.getByRole("button", { name: /M08.*检索增强生成 RAG/ }).click();
  await expect(page.getByRole("heading", { name: "RAG Pipeline Lab" })).toBeVisible();
  await page.getByLabel("检索查询").fill("retrieval evaluation");
  await expect(page.locator(".rag-results article")).toHaveCount(3);
});

test("has no automated WCAG A/AA violations on the lesson view", async ({ page }) => {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("runs the Tool Calling lab and enforces local permission policy", async ({ page }) => {
  await page.getByRole("button", { name: /M07.*结构化输出与 Tool Calling/ }).click();
  await expect(page.getByRole("heading", { name: "Tool Calling Lab" })).toBeVisible();
  await page.getByRole("button", { name: "提交工具调用" }).click();
  await expect(page.locator(".lab-json")).toContainText('"ok": true');
  await page.getByRole("checkbox", { name: /Runtime 策略允许/ }).uncheck();
  await page.getByRole("button", { name: "提交工具调用" }).click();
  await expect(page.locator(".lab-json")).toContainText("permission_denied");
});

test("requires explicit approval in the Agent Runtime lab", async ({ page }) => {
  await page.getByRole("button", { name: /M10.*Agent 基础与 Runtime/ }).click();
  await expect(page.getByRole("heading", { name: "Agent Runtime Lab" })).toBeVisible();
  await page.getByRole("button", { name: "启动 Agent" }).click();
  await page.getByRole("button", { name: "推进下一步" }).click();
  await page.getByRole("button", { name: "推进下一步" }).click();
  await expect(page.getByText("Approval · 等待人工批准", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "拒绝并终止" }).click();
  await expect(page.getByText(/已阻止/)).toBeVisible();
});

test("discovers local MCP capabilities without a network connection", async ({ page }) => {
  await page.getByRole("button", { name: /M12.*MCP 协议与集成/ }).click();
  await expect(page.getByRole("heading", { name: "MCP Protocol Lab" })).toBeVisible();
  await page.getByRole("button", { name: "发现 Server 能力" }).click();
  await expect(page.getByText("search_course", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "调用 search_course Tool" }).click();
  await expect(page.locator(".result-block pre")).toContainText('"ok": true');
});

test("runs a deterministic Multi-Agent synthesis", async ({ page }) => {
  await page.getByRole("button", { name: /M14.*Multi-Agent 系统/ }).click();
  await expect(page.getByRole("heading", { name: "Multi-Agent Orchestration Lab" })).toBeVisible();
  await page.getByRole("button", { name: "运行三个专业 Agent" }).click();
  await expect(page.locator(".multi-agent-findings article")).toHaveCount(4);
});

test("runs the local Evaluation dataset and reports failures", async ({ page }) => {
  await page.getByRole("button", { name: /M17.*Evaluation 与 Observability/ }).click();
  await expect(page.getByRole("heading", { name: "AI Evaluation Lab" })).toBeVisible();
  await page.getByRole("button", { name: "运行评测集" }).click();
  await expect(page.getByText("3/4", { exact: true })).toBeVisible();
  await expect(page.getByText("75%", { exact: true })).toBeVisible();
  await expect(page.getByText(/E03 · FAIL/)).toBeVisible();
});

test("has no automated WCAG A/AA violations in the Transformer lab", async ({ page }) => {
  await page.getByRole("button", { name: /M02.*Transformer 与 Attention/ }).click();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("supports the keyboard skip link", async ({ page }) => {
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "跳至主要內容" })).toBeFocused();
});

test("keeps the layout within a narrow mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
});

test("validates and resets browser-local course authoring drafts", async ({ page }) => {
  await page.getByRole("button", { name: "课程编辑" }).click();
  await expect(page.getByRole("heading", { name: "课程内容编辑器" })).toBeVisible();
  const editor = page.getByLabel("课程 JSON（最大 2 MiB UTF-8）");
  await editor.fill("{");
  await expect(page.getByRole("alert")).toContainText("修复以下问题后才能导出");
  await expect(page.getByRole("button", { name: "导出已校验 JSON" })).toBeDisabled();
  await page.getByRole("button", { name: "恢复仓库课程" }).click();
  await expect(page.getByText("Schema 校验通过")).toBeVisible();
  await expect(page.getByRole("button", { name: "导出已校验 JSON" })).toBeEnabled();
});

test("persists course authoring drafts locally across reloads", async ({ page }) => {
  await page.getByRole("button", { name: "课程编辑" }).click();
  const editor = page.getByLabel("课程 JSON（最大 2 MiB UTF-8）");
  const course = JSON.parse(await editor.inputValue());
  course.modules = [course.modules[0]];
  course.modules[0].lessons = [course.modules[0].lessons[0]];
  course.modules[0].lessons[0].content = course.modules[0].lessons[0].content.slice(0, 3);
  course.title = "AI Engineering Academy Draft";
  await editor.fill(JSON.stringify(course, null, 2));
  await expect(page.getByText("Schema 校验通过")).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "课程编辑" }).click();
  await expect(page.getByRole("heading", { name: "课程内容编辑器" })).toBeVisible({
    timeout: 15000,
  });
  await expect(page.getByLabel("课程 JSON（最大 2 MiB UTF-8）")).toHaveValue(
    /AI Engineering Academy Draft/,
    { timeout: 15000 },
  );
});

test("reports and retries a failed full-course authoring load", async ({ page }) => {
  await page.route("**/src/data/flagshipM20.ts*", (route) => route.abort());
  await page.getByRole("button", { name: "课程编辑" }).click();
  await expect(page.getByRole("alert")).toContainText("完整课程数据加载失败");
  await page.unroute("**/src/data/flagshipM20.ts*");
  await page.getByRole("button", { name: "重试加载" }).click();
  await expect(page.getByRole("heading", { name: "课程内容编辑器" })).toBeVisible({
    timeout: 15000,
  });
});

test("keeps the course authoring view accessible", async ({ page }) => {
  await page.getByRole("button", { name: "课程编辑" }).click();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("imports a valid course file and downloads a validated export", async ({ page }) => {
  await page.getByRole("button", { name: "课程编辑" }).click();
  const editor = page.getByLabel("课程 JSON（最大 2 MiB UTF-8）");
  const validJson = await editor.inputValue();
  await page.getByLabel("导入课程 JSON 文件").setInputFiles({
    name: "academy-course.json",
    mimeType: "application/json",
    buffer: Buffer.from(validJson, "utf-8"),
  });
  await expect(page.getByText("Schema 校验通过")).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出已校验 JSON" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("course-export.json");
});

test("keeps the lesson layout within a 320px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 780 });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
});

test("keeps the course authoring workspace within a 320px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 780 });
  await page.getByRole("button", { name: "课程编辑" }).click();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
});
