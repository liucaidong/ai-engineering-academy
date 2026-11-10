import { expect, test } from "@playwright/test";

const userId = "user-100";
const tenantA = "11111111-1111-4111-8111-111111111111";
const tenantB = "22222222-2222-4222-8222-222222222222";

const tenants = [
  {
    tenant_id: tenantA,
    name: "个人学习空间",
    tenant_type: "personal",
    roles: ["learner"],
  },
  {
    tenant_id: tenantB,
    name: "工程学院",
    tenant_type: "organization",
    roles: ["learner", "instructor"],
  },
];

async function mockAuthenticatedSession(page: import("@playwright/test").Page) {
  await page.route("**/auth/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "Cache-Control": "no-store" },
      body: JSON.stringify({ user_id: userId, expires_at: "2026-11-10T12:00:00Z" }),
    }),
  );
  await page.route("**/tenants/me", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(tenants) }),
  );
}

test("revalidates a remembered tenant and persists only an authorized selection", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("ai-engineering-academy:tenant-preference:v1", "unauthorized-tenant"),
  );
  await mockAuthenticatedSession(page);
  await page.goto("/");

  const tenantPicker = page.getByRole("combobox", { name: "当前租户" });
  await expect(tenantPicker).toBeVisible();
  await expect(tenantPicker).toHaveValue("");
  await expect(page.getByText("已登录")).toBeVisible();
  await expect(page.getByText("unauthorized-tenant")).toHaveCount(0);

  await tenantPicker.selectOption(tenantB);
  await expect(tenantPicker).toHaveValue(tenantB);
  await expect
    .poll(() =>
      page.evaluate(
        (key) => localStorage.getItem(key),
        "ai-engineering-academy:tenant-preference:v1",
      ),
    )
    .toBe(tenantB);
});

test("shows a login link when the server reports an expired or missing session", async ({
  page,
}) => {
  await page.route("**/auth/me", (route) =>
    route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ detail: "Authentication required" }),
    }),
  );
  await page.goto("/");

  const loginLink = page.getByRole("link", { name: "登录" });
  await expect(loginLink).toBeVisible();
  await expect(loginLink).toHaveAttribute("href", "/auth/login");
});

test("keeps session identity but disables tenant selection when tenant discovery is unavailable", async ({
  page,
}) => {
  await page.route("**/auth/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ user_id: userId, expires_at: "2026-11-10T12:00:00Z" }),
    }),
  );
  await page.route("**/tenants/me", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ detail: "Tenant discovery is disabled" }),
    }),
  );
  await page.goto("/");

  await expect(page.getByText("已登录")).toBeVisible();
  await expect(page.getByText("租户服务不可用")).toBeVisible();
  await expect(page.getByRole("combobox", { name: "当前租户" })).toHaveCount(0);
});

test("logs out through the CSRF-protected server endpoint", async ({ page }) => {
  await mockAuthenticatedSession(page);
  await page.route("**/auth/csrf", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ csrf_token: "csrf-test-token" }),
    }),
  );
  await page.route("**/auth/logout", (route) => {
    expect(route.request().method()).toBe("POST");
    expect(route.request().headers()["x-csrf-token"]).toBe("csrf-test-token");
    return route.fulfill({ status: 204 });
  });
  await page.goto("/");
  await expect(page.getByRole("combobox", { name: "当前租户" })).toBeVisible();
  await page.getByRole("button", { name: "退出" }).click();
  await expect(page.getByRole("link", { name: "登录" })).toBeVisible();
});
