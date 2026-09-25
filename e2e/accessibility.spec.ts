import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { randomIp, signUpVerified } from "./helpers";

const publicPages = [
  "/",
  "/sections",
  "/contact",
  "/lab",
  "/demo/dashboard",
  "/demo/auth",
  "/pricing",
  "/blog",
  "/docs",
  "/changelog",
  "/faq",
  "/waitlist",
  "/sign-in",
  "/sign-up",
  "/dev/flags",
  "/projects",
  "/projects/field-notes",
  "/about",
  "/resume",
  "/links",
  "/gallery/coastlines",
  "/now",
  "/store",
  "/store/field-guide",
];

const appPages = [
  "/dashboard",
  "/settings",
  "/settings/security",
  "/settings/api-keys",
  "/settings/billing",
  "/settings/team",
  "/files",
  "/notifications",
];

async function seriousViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  return results.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map(
      (v) =>
        `${page.url()} ${v.id}: ${v.nodes
          .map((n) => n.target.join(" "))
          .slice(0, 3)
          .join(", ")}`,
    );
}

for (const colorScheme of ["light", "dark"] as const) {
  for (const path of publicPages) {
    test(`${path} has no serious accessibility violations (${colorScheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto(path);
      expect(await seriousViolations(page)).toEqual([]);
    });
  }

  test(`signed-in app pages have no serious accessibility violations (${colorScheme})`, async ({
    page,
    context,
  }) => {
    test.slow();
    await context.setExtraHTTPHeaders({ "x-forwarded-for": randomIp() });
    await page.emulateMedia({ colorScheme });
    await signUpVerified(page, { name: "Axe Tester", onboarding: "stay" });
    const violations = await seriousViolations(page);
    await page.getByRole("button", { name: "Skip for now" }).click();
    await page.waitForURL(/\/dashboard/);
    for (const path of appPages) {
      await page.goto(path);
      violations.push(...(await seriousViolations(page)));
    }
    expect(violations).toEqual([]);
  });
}
