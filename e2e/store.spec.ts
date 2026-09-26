import { expect, test } from "@playwright/test";

import { linkFromOutbox, randomIp, uniqueEmail } from "./helpers";

test.beforeEach(async ({ context }) => {
  await context.setExtraHTTPHeaders({ "x-forwarded-for": randomIp() });
});

test("paid product: checkout → thank-you download → emailed link", async ({ page }) => {
  const email = uniqueEmail("buyer");
  await page.goto("/store");
  await page.getByRole("link", { name: "The Field Guide" }).click();
  await expect(page.getByText("Test mode: no real payment is taken.")).toBeVisible();
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Buy for $19" }).click();

  await expect(page).toHaveURL(/\/dev\/checkout\//);
  await expect(page.getByText("$19.00")).toBeVisible();
  await page.getByRole("button", { name: "Pay (test)" }).click();

  await expect(page).toHaveURL(/\/store\/thanks\?session=/);
  const download = page.getByRole("link", { name: "Download The Field Guide" });
  await expect(download).toBeVisible();
  const file = await page.request.get((await download.getAttribute("href"))!);
  expect(file.status()).toBe(200);
  expect(file.headers()["content-disposition"]).toContain('attachment; filename="field-guide.md"');
  expect(await file.text()).toContain("# The Field Guide");

  const emailed = await linkFromOutbox(
    page,
    /Thanks for buying The Field Guide/,
    email,
    /\/store\/download\//,
  );
  expect((await page.request.get(emailed)).status()).toBe(200);

  // A tampered token is rejected.
  const tampered = emailed.replace(/.$/, (char) => (char === "A" ? "B" : "A"));
  expect((await page.request.get(tampered)).status()).toBe(404);
});

test("free product: download link by email, no checkout", async ({ page }) => {
  const email = uniqueEmail("reader");
  await page.goto("/store/starter-kit");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Email me the download" }).click();
  await expect(page.getByText(`We sent the download link to ${email}`)).toBeVisible();
  const link = await linkFromOutbox(page, /Your copy of Starter Kit/, email, /\/store\/download\//);
  const file = await page.request.get(link);
  expect(await file.text()).toContain("Starter Kit");
});
