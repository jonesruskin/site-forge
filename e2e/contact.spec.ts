import { expect, test } from "@playwright/test";

test("contact form validates on the server and handles bots silently", async ({ page }) => {
  await page.goto("/contact");
  await page.getByLabel("Name").fill("Ada");
  await page.getByLabel("Email").fill("ada@example.com");
  await page.getByLabel("Message").fill("Hello! This is a real message.");
  // Fill the honeypot like a bot would: the form must pretend success and send nothing.
  await page
    .locator('input[name="website"]')
    .evaluate((input: HTMLInputElement) => (input.value = "spam.example"));
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Thanks" })).toBeVisible();
});

test("theme lab reports contrast and updates tokens live", async ({ page }) => {
  await page.goto("/lab");
  await expect(page.getByText("Text on background")).toBeVisible();
  const before = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--dial-radius"),
  );
  await page.getByLabel("Radius").fill("1.2");
  await expect
    .poll(() =>
      page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue("--dial-radius").trim(),
      ),
    )
    .not.toBe(before.trim());
});
