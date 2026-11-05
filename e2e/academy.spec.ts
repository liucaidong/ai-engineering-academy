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
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
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
