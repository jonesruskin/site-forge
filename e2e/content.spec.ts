import { expect, test } from "@playwright/test";

test("docs search finds pages from the keyboard", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard shortcut");
  await page.goto("/docs");
  await page.keyboard.press("ControlOrMeta+k");
  const input = page.getByRole("combobox", { name: "Search documentation" });
  await expect(input).toBeFocused();
  await input.fill("sidebar");
  await expect(page.getByRole("option").first()).toContainText("Organizing the sidebar");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/docs\/guides\/organizing$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Organizing the sidebar");
});

test("blog post renders MDX, code and navigation", async ({ page }) => {
  await page.goto("/blog");
  await page.getByRole("link", { name: "Writing posts" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Writing posts");
  await expect(page.locator("[data-code-block]").first()).toBeVisible();
  await expect(page.locator('script[type="application/ld+json"]').first()).toBeAttached();
});

test("feeds and sitemap include content", async ({ request }) => {
  const rss = await request.get("/blog/rss.xml");
  expect(rss.headers()["content-type"]).toContain("application/rss+xml");
  expect(await rss.text()).toContain("<title>Writing posts</title>");
  expect(await (await request.get("/changelog/rss.xml")).text()).toContain("First release");
  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const path of ["/blog/welcome", "/docs/guides/organizing", "/case-studies/example"])
    expect(sitemap).toContain(path);
});

test("legal templates are filled from site.config", async ({ page }) => {
  await page.goto("/legal/privacy");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Privacy policy");
  await expect(page.getByRole("main")).toContainText("Playground");
  await expect(page.getByRole("link", { name: "hello@example.com" }).first()).toBeVisible();
});
