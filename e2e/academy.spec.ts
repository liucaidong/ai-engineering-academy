import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("searches the curriculum and opens the matching module", async ({ page }) => {
  await page.getByRole("searchbox", { name: "搜索课程模块" }).fill("MCP");
  await page.getByRole("button", { name: /M12.*MCP 协议与集成/ }).click();
  await expect(page.getByRole("heading", { name: "MCP 协议与集成" })).toBeVisible();
});

test("persists module completion after reload", async ({ page }) => {
  await page.getByRole("button", { name: "标记本模块为已完成" }).click();
  await expect(page.getByRole("progressbar", { name: "课程模块完成进度" })).toHaveAttribute("aria-valuenow", "5");
  await page.reload();
  await expect(page.getByRole("button", { name: /已标记完成/ })).toHaveAttribute("aria-pressed", "true");
});

test("persists assessment draft and rubric self-review", async ({ page }) => {
  const response = page.getByLabel("你的回答 / 設計說明");
  await response.fill("模型、应用和运行时必须分层，工具执行必须经过权限校验。");
  const criterion = page.getByRole("checkbox", { name: /层次区分/ });
  await criterion.check();
  await page.reload();
  await expect(page.getByLabel("你的回答 / 設計說明")).toHaveValue("模型、应用和运行时必须分层，工具执行必须经过权限校验。");
  await expect(page.getByRole("checkbox", { name: /层次区分/ })).toBeChecked();
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
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
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
  await expect(page.getByText(/等待人工批准/)).toBeVisible();
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
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);
});

test("supports the keyboard skip link", async ({ page }) => {
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "跳至主要內容" })).toBeFocused();
});

test("keeps the layout within a narrow mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
});
