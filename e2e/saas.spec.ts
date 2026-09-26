import { expect, test } from "@playwright/test";

import { randomIp, signUpVerified } from "./helpers";

test.beforeEach(async ({ context }) => {
  await context.setExtraHTTPHeaders({ "x-forwarded-for": randomIp() });
});

test("protected pages redirect to sign-in and come back afterwards", async ({ page }) => {
  await page.goto("/settings/security");
  await expect(page).toHaveURL(/\/sign-in\?next=%2Fsettings%2Fsecurity/);
});

test("sign up → verify email → dashboard → profile → sign out → sign in", async ({ page }) => {
  const { email, password } = await signUpVerified(page);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Welcome back, Ada");

  await page.goto("/settings");
  await expect(page.getByText("Verified")).toBeVisible();
  await page.getByLabel("Name").fill("Ada King");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByText("Profile saved.")).toBeVisible();

  await page.goto("/settings/security");
  await expect(page.getByText("This device")).toBeVisible();

  await page.getByRole("button", { name: /Account menu/ }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/$/);

  await page.goto("/sign-in?next=/settings");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/settings$/);
  await expect(page.getByLabel("Name")).toHaveValue("Ada King");
});

test("magic link signs in without a password", async ({ page, context }) => {
  const { email } = await signUpVerified(page, "Grace Hopper");
  await context.clearCookies();
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Sign in with an email link instead" }).click();
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Email me a sign-in link" }).click();
  await expect(page.getByText(/Check .* for a sign-in link/)).toBeVisible();

  const { linkFromOutbox } = await import("./helpers");
  const link = await linkFromOutbox(page, /Your sign-in link/, email, /magic-link/);
  await page.goto(link);
  await expect(page).toHaveURL(/\/dashboard/);
});

test("open redirects are refused", async ({ page }) => {
  await signUpVerified(page);
  await page.goto("/sign-in?next=//evil.example.com");
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("billing: pricing → checkout (mock) → trial → portal cancel", async ({ page }) => {
  await signUpVerified(page, "Billie Holiday");
  await page.goto("/pricing");
  await page
    .getByRole("link", { name: /Start 14-day trial/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/dev\/checkout\//);
  await expect(page.getByText("Test mode")).toBeVisible();
  await page.getByRole("button", { name: "Pay (test)" }).click();

  await expect(page).toHaveURL(/\/settings\/billing\?checkout=success/);
  await expect(page.getByText("Current plan")).toBeVisible();
  await expect(
    page
      .getByRole("heading", { name: /Pro/ })
      .or(page.getByText("Pro", { exact: true }))
      .first(),
  ).toBeVisible();
  await expect(page.getByText("Trial", { exact: true })).toBeVisible();

  await page.goto("/dashboard");
  await expect(page.getByText("Manage billing")).toBeVisible();

  await page.goto("/settings/billing");
  await page.getByRole("link", { name: "Manage billing" }).click();
  await expect(page).toHaveURL(/\/dev\/billing-portal/);
  await page.getByRole("button", { name: "Cancel at period end" }).click();
  await expect(page.getByText("Cancels at period end")).toBeVisible();
  await page.getByRole("link", { name: /Return to the site/ }).click();
  await expect(page.getByText(/Access ends/)).toBeVisible();
});

test("checkout sends signed-out visitors through sign-up first", async ({ page }) => {
  await page.goto("/billing/checkout?plan=pro&interval=year");
  await expect(page).toHaveURL(
    /\/sign-up\?next=%2Fbilling%2Fcheckout%3Fplan%3Dpro%26interval%3Dyear/,
  );
});
