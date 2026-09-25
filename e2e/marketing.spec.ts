import { expect, test } from "@playwright/test";

const unique = () => `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`;
const randomIp = () =>
  `10.${Array.from({ length: 3 }, () => Math.floor(Math.random() * 255)).join(".")}`;

// Forms are rate limited per client IP; give each test its own "visitor" so
// repeated runs against one server don't trip the (correct) limits.
test.beforeEach(async ({ context }) => {
  await context.setExtraHTTPHeaders({ "x-forwarded-for": randomIp() });
});

test("newsletter double opt-in: confirmation email link subscribes", async ({ page }) => {
  const email = unique();
  await page.goto("/newsletter");
  await page.getByLabel("Email address").fill(email);
  await page.getByRole("button", { name: "Subscribe" }).click();
  await expect(page.getByRole("status")).toContainText("Check your inbox");

  await page.goto("/dev/outbox");
  await page
    .getByRole("link", { name: /Confirm your subscription/ })
    .filter({ hasText: email })
    .first()
    .click();
  const html = await page.locator("iframe").getAttribute("srcdoc");
  const link = /href="([^"]*\/newsletter\/confirm\?token=[^"]+)"/
    .exec(html ?? "")?.[1]
    ?.replace(/&amp;/g, "&");
  expect(link).toBeTruthy();
  await page.goto(new URL(link!).pathname + new URL(link!).search);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("subscribed");
});

test("newsletter rejects forged confirmation links", async ({ page }) => {
  await page.goto("/newsletter/confirm?token=forged.token");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("invalid or has expired");
});

test("waitlist: join, see position, referral credits the referrer", async ({ page, browser }) => {
  await page.goto("/waitlist");
  await page.getByLabel("Email address").fill(unique());
  await page.getByRole("button", { name: "Join the waitlist" }).click();
  await expect(page).toHaveURL(/\/waitlist\/[a-z0-9]+\?welcome=1$/);
  await expect(page.getByText(/^#\d+$/)).toBeVisible();
  const referral = await page.getByLabel("Your referral link").inputValue();
  const statusUrl = page.url();

  const friendContext = await browser.newContext({
    extraHTTPHeaders: { "x-forwarded-for": randomIp() },
  });
  const friend = await friendContext.newPage();
  await friend.goto(new URL(referral).pathname + new URL(referral).search);
  await friend.getByLabel("Email address").fill(unique());
  await friend.getByRole("button", { name: "Join the waitlist" }).click();
  await expect(friend).toHaveURL(/\/waitlist\/[a-z0-9]+/);
  await friendContext.close();

  await page.goto(statusUrl);
  await expect(page.getByText("1 friend invited")).toBeVisible();
});

test("waitlist export requires the admin token", async ({ request }) => {
  expect((await request.get("/api/waitlist/export")).status()).toBe(401);
  const ok = await request.get("/api/waitlist/export", {
    headers: { Authorization: "Bearer e2e-admin-token-1234567890" },
  });
  expect(ok.status()).toBe(200);
  expect(await ok.text()).toContain("position,email");
});

test.describe("cookie consent", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("rejecting is as easy as accepting, and choices can be reopened", async ({ page }) => {
    await page.goto("/");
    const banner = page.getByRole("region", { name: "Cookies" });
    await expect(banner).toBeVisible();
    await banner.getByRole("button", { name: "Reject all" }).click();
    await expect(banner).toBeHidden();
    const cookie = (await page.context().cookies()).find((c) => c.name === "site_consent");
    expect(decodeURIComponent(cookie!.value)).toContain('"analytics":false');

    await page.goto("/#cookie-settings");
    await expect(banner).toBeVisible();
    await expect(banner.getByRole("switch").first()).toBeVisible();
  });
});
