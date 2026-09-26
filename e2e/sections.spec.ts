import { expect, test } from "@playwright/test";

test.describe("zero-JS interactions", () => {
  test.use({ javaScriptEnabled: false });

  test("pricing interval toggle works without JavaScript", async ({ page }) => {
    await page.goto("/sections");
    const table = page.locator("#pricing-table");
    await expect(table.getByText("$19", { exact: true })).toBeVisible();
    await table.getByText("Yearly").click();
    await expect(table.getByText("$190", { exact: true })).toBeVisible();
    await expect(table.getByText("$19", { exact: true })).toBeHidden();
  });

  test("FAQ answers open without JavaScript, one at a time", async ({ page }) => {
    await page.goto("/sections");
    const faq = page.locator("#faq");
    await faq.getByText("Do patients need an account to book?").click();
    await expect(faq.getByText("They choose a time")).toBeVisible();
    await faq.getByText("Where is data stored?").click();
    await expect(faq.getByText("In the EU or US region")).toBeVisible();
    await expect(faq.getByText("They choose a time")).toBeHidden();
  });
});

test("mobile navigation opens and closes from the keyboard", async ({ page, isMobile }) => {
  test.skip(!isMobile, "menu is only shown on small screens");
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Menu" }).first();
  await menu.focus();
  await page.keyboard.press("Enter");
  const nav = page.getByRole("navigation", { name: "Menu" });
  await expect(nav).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(nav).toBeHidden();
});

test("skip link moves focus to the main content", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard flow");
  await page.goto("/sections");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});

test("dashboard shell marks the current page", async ({ page }) => {
  await page.goto("/demo/dashboard");
  await expect(
    page.locator('[aria-current="page"]').filter({ hasText: "Overview" }).first(),
  ).toBeAttached();
});
