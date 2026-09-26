import { expect, type Page } from "@playwright/test";

export const uniqueEmail = (prefix = "e2e") =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`;

export const randomIp = () =>
  `10.${Array.from({ length: 3 }, () => Math.floor(Math.random() * 255)).join(".")}`;

/** Opens the newest outbox email matching `subject` and returns the first link matching `pattern`. */
export async function linkFromOutbox(
  page: Page,
  subject: RegExp,
  recipient: string,
  pattern: RegExp,
) {
  await page.goto("/dev/outbox");
  await page
    .getByRole("link")
    .filter({ hasText: subject })
    .filter({ hasText: recipient })
    .first()
    .click();
  const html = (await page.locator("iframe").getAttribute("srcdoc")) ?? "";
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]!.replace(/&amp;/g, "&"));
  const link = hrefs.find((href) => pattern.test(href));
  expect(link, `no link matching ${pattern} in "${subject}" email`).toBeTruthy();
  const url = new URL(link!);
  return `${url.pathname}${url.search}`;
}

type SignUpOptions = {
  name?: string;
  email?: string;
  /** New accounts are sent to the onboarding questionnaire; "skip" (default) dismisses it. */
  onboarding?: "skip" | "stay";
};

/** Signs up a fresh user, verifies the email through the outbox, and lands on the dashboard. */
export async function signUpVerified(page: Page, nameOrOptions: string | SignUpOptions = {}) {
  const options = typeof nameOrOptions === "string" ? { name: nameOrOptions } : nameOrOptions;
  const { name = "Ada Lovelace", email = uniqueEmail("user"), onboarding = "skip" } = options;
  const password = "correct-horse-battery";
  await page.goto("/sign-up");
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/verify-email/);
  const verify = await linkFromOutbox(page, /Verify your email/, email, /verify-email/);
  await page.goto(verify);
  await expect(page).toHaveURL(/\/(dashboard|onboarding)/);
  if (
    page.url().includes("/onboarding") ||
    (await page.waitForURL(/\/onboarding/, { timeout: 3_000 }).then(
      () => true,
      () => false,
    ))
  ) {
    if (onboarding === "skip") {
      await page.getByRole("button", { name: "Skip for now" }).click();
      await expect(page).toHaveURL(/\/dashboard/);
    }
  }
  return { email, password };
}

/** Signs in, or signs up and verifies when the account doesn't exist yet (for fixed emails). */
export async function signInOrUp(page: Page, email: string, name: string) {
  const password = "correct-horse-battery";
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  const signedIn = await page.waitForURL(/\/dashboard/, { timeout: 5_000 }).then(
    () => true,
    () => false,
  );
  if (!signedIn) await signUpVerified(page, { name, email });
}
