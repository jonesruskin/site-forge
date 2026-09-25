import { expect, test, type Page } from "@playwright/test";

import { linkFromOutbox, randomIp, signInOrUp, signUpVerified, uniqueEmail } from "./helpers";

test.beforeEach(async ({ context }) => {
  await context.setExtraHTTPHeaders({ "x-forwarded-for": randomIp() });
});

async function createApiKey(page: Page, name: string, scopes: string[] = ["read"]) {
  await page.goto("/settings/api-keys");
  await page.getByLabel("Name").fill(name);
  for (const scope of ["read", "write"]) {
    const box = page.getByRole("checkbox", { name: new RegExp(`^${scope}`) });
    if (((await box.getAttribute("data-state")) === "checked") !== scopes.includes(scope))
      await box.click();
  }
  await page.getByRole("button", { name: "Create key" }).click();
  const field = page.getByLabel("New API key");
  await expect(field).toBeVisible();
  return field.inputValue();
}

test("onboarding: keyboard questionnaire, then a checklist that tracks real progress", async ({
  page,
}) => {
  await signUpVerified(page, { name: "Katherine Johnson", onboarding: "stay" });
  await expect(page).toHaveURL(/\/onboarding/);
  await expect(page.getByRole("heading", { name: "What best describes you?" })).toBeVisible();

  // Number keys pick an option; single choice advances by itself.
  await page.keyboard.press("2");
  await expect(page.getByRole("heading", { name: "How many people will use it?" })).toBeVisible();
  await page.getByText("Just me").click();
  await expect(
    page.getByRole("heading", { name: "What do you want to get done first?" }),
  ).toBeVisible();
  await page.getByRole("textbox").fill("Launch the beta");
  await page.getByRole("button", { name: "Finish" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  const checklist = page
    .getByText("Finish setting up")
    .locator("xpath=ancestor::*[@data-slot='card'][1]");
  await expect(checklist).toBeVisible();
  await expect(checklist.getByText(/Tell us about yourself\s*\(done\)/)).toBeAttached();
  await expect(checklist.getByRole("link", { name: /Create an API key/ })).toBeVisible();

  await createApiKey(page, "Checklist key");
  await page.goto("/dashboard");
  await expect(checklist.getByText(/Create an API key\s*\(done\)/)).toBeAttached();

  await checklist.getByRole("button", { name: "Hide" }).click();
  await expect(page.getByText("Finish setting up")).toHaveCount(0);
});

test("notifications: new accounts get a welcome in the bell", async ({ page }) => {
  await signUpVerified(page, "Hedy Lamarr");
  const bell = page.getByRole("button", { name: /Notifications, 1 unread/ });
  await expect(bell).toBeVisible();
  await bell.click();
  await expect(page.getByText(/Welcome to/).first()).toBeVisible();
  await page.goto("/notifications");
  await page.getByRole("button", { name: /Mark all (as )?read/i }).click();
  await expect(page.getByRole("button", { name: "Notifications", exact: true })).toBeVisible();
});

test("api: keys authenticate, respect scopes, and stop working when revoked", async ({
  page,
  playwright,
}) => {
  const { email } = await signUpVerified(page, "Alan Turing");
  const key = await createApiKey(page, "CI deploys", ["write"]);
  expect(key).toMatch(/^sk_[A-Za-z0-9]{40}$/);
  await expect(page.getByText(/curl -H "Authorization: Bearer sk_/)).toBeVisible();

  const api = await playwright.request.newContext({ baseURL: page.url() });
  const noAuth = await api.get("/api/v1/me");
  expect(noAuth.status()).toBe(401);
  expect(noAuth.headers()["content-type"]).toContain("application/problem+json");

  const wrongScope = await api.get("/api/v1/me", { headers: { Authorization: `Bearer ${key}` } });
  expect(wrongScope.status()).toBe(403);

  const readKey = await createApiKey(page, "Read only", ["read"]);
  const ok = await api.get("/api/v1/me", { headers: { Authorization: `Bearer ${readKey}` } });
  expect(ok.status()).toBe(200);
  expect(ok.headers()["ratelimit-remaining"]).toBeTruthy();
  expect((await ok.json()).data.email).toBe(email);

  // First-party calls from the signed-in browser use the session.
  const session = await page.request.get("/api/v1/me");
  expect((await session.json()).auth.type).toBe("session");

  await page.goto("/settings/api-keys");
  await expect(page.getByRole("cell", { name: "Read only", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Revoke Read only" }).click();
  await expect(page.getByRole("cell", { name: "Read only", exact: true })).toHaveCount(0);
  const revoked = await api.get("/api/v1/me", { headers: { Authorization: `Bearer ${readKey}` } });
  expect(revoked.status()).toBe(401);
  await api.dispose();
});

test("teams: create a team, invite by email, accept as the invitee", async ({ page, browser }) => {
  await signUpVerified(page, "Margaret Hamilton");
  await page.getByRole("button", { name: /Personal/ }).click();
  await page.getByRole("menuitem", { name: "Create team" }).click();
  await page.getByLabel("Team name").fill("Apollo Guidance");
  await page.getByRole("button", { name: "Create team" }).click();
  await expect(page.getByRole("button", { name: /Apollo Guidance/ })).toBeVisible();

  const invitee = uniqueEmail("invitee");
  await page.goto("/settings/team");
  await page.getByLabel("Email").fill(invitee);
  await page.getByRole("button", { name: "Send invite" }).click();
  await expect(page.getByText(invitee, { exact: true })).toBeVisible();

  const context = await browser.newContext({ storageState: "e2e/consent-state.json" });
  await context.setExtraHTTPHeaders({ "x-forwarded-for": randomIp() });
  const other = await context.newPage();
  await signUpVerified(other, { name: "Don Eyles", email: invitee });
  const link = await linkFromOutbox(other, /invited you to Apollo Guidance/, invitee, /\/invite\//);
  await other.goto(link);
  await expect(other.getByText("Join Apollo Guidance")).toBeVisible();
  await other.getByRole("button", { name: "Accept" }).click();
  await expect(other).toHaveURL(/\/settings\/team$/);
  await expect(other.getByText("Margaret Hamilton")).toBeVisible();
  await context.close();
});

test("admin: ADMIN_EMAILS bootstraps access; others get a 404", async ({ page }, testInfo) => {
  await signUpVerified(page, "Not An Admin");
  const denied = await page.goto("/admin");
  expect(denied?.status()).toBe(404);

  await page.context().clearCookies();
  await signInOrUp(page, `admin-${testInfo.project.name}@example.com`, "Ada Admin");
  await page.goto("/admin/users");
  await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
  await page.getByLabel("Search users").fill("Not An Admin");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByRole("cell", { name: /Not An Admin/ }).first()).toBeVisible();
});

test("feature flags: per-browser overrides with the reason shown", async ({ page }) => {
  await page.goto("/dev/flags");
  const row = page.getByRole("listitem").filter({ hasText: "newDashboard" });
  await expect(row.getByText(/via (default|rollout bucket)/)).toBeVisible();
  await row.getByRole("button", { name: "on", exact: true }).click();
  await expect(row.getByText("via your override")).toBeVisible();
  await expect(row.getByText("On", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "1 flag override" })).toBeVisible();
  await row.getByRole("button", { name: "Auto" }).click();
  await expect(row.getByText(/via (default|rollout bucket)/)).toBeVisible();
});

test("uploads: files go to storage with progress and download privately", async ({
  page,
  playwright,
}) => {
  await signUpVerified(page, "Frances Allen");
  await page.goto("/files");
  await page.locator("input[type=file]").setInputFiles({
    name: "field-notes.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("Moon dust is surprisingly abrasive."),
  });
  await expect(page.getByLabel("Uploaded")).toBeVisible();
  const open = page.getByRole("link", { name: "Open field-notes.txt" });
  await expect(open).toBeVisible();

  const href = (await open.getAttribute("href"))!;
  const mine = await page.request.get(href);
  expect(await mine.text()).toBe("Moon dust is surprisingly abrasive.");
  expect(mine.headers()["x-content-type-options"]).toBe("nosniff");

  const stranger = await playwright.request.newContext({ baseURL: page.url() });
  expect((await stranger.get(href)).status()).toBe(401);
  await stranger.dispose();

  await page.locator("input[type=file]").setInputFiles({
    name: "script.html",
    mimeType: "text/html",
    buffer: Buffer.from("<script>alert(1)</script>"),
  });
  await expect(page.getByRole("alert").filter({ hasText: /isn't allowed/ })).toBeVisible();

  await page.getByRole("button", { name: "Delete field-notes.txt" }).click();
  await expect(open).toHaveCount(0);
});

test("email templates gallery renders every installed template", async ({ page }) => {
  await page.goto("/dev/emails");
  await expect(page.getByRole("heading", { name: "Email templates" })).toBeVisible();
  expect(await page.locator("iframe").count()).toBeGreaterThanOrEqual(8);
});
