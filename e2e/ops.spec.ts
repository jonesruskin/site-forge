import { expect, test } from "@playwright/test";

test("i18n: the switcher changes the language without changing the URL", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  const switcher = page.getByRole("combobox", { name: "Change language" });
  test.skip(!(await switcher.isVisible()), "switcher lives in the collapsed mobile header");
  await switcher.selectOption("es");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByRole("combobox", { name: "Cambiar idioma" })).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole("combobox", { name: "Cambiar idioma" }).selectOption("en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("i18n: the browser's preferred language is used on a first visit", async ({ browser }) => {
  const context = await browser.newContext({
    locale: "es-MX",
    storageState: "e2e/consent-state.json",
  });
  const page = await context.newPage();
  await page.goto("/about");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await context.close();
});

test("health endpoint answers for load balancers", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);
  expect((await response.json()).status).toBe("ok");
  expect(response.headers()["cache-control"]).toBe("no-store");
});

test("security headers: CSP stays strict when optional providers are unset", async ({
  request,
}) => {
  const csp = (await request.get("/")).headers()["content-security-policy"] ?? "";
  expect(csp).toContain("default-src 'self'");
  expect(csp).not.toContain("$");
  expect(csp).not.toContain("googletagmanager");
  expect(csp).not.toContain("posthog");
});
