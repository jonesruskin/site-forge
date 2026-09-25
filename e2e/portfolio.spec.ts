import { expect, test } from "@playwright/test";

test("projects: grid, tag pages and detail with neighbours", async ({ page }) => {
  await page.goto("/projects");
  await expect(page.getByRole("heading", { level: 1, name: "Projects" })).toBeVisible();
  await page
    .getByRole("navigation", { name: "Filter projects by tag" })
    .getByRole("link", { name: /Open source/ })
    .click();
  await expect(page).toHaveURL(/\/projects\/tags\/open-source$/);
  await expect(page.getByRole("link", { name: "Tide Tables" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Field Notes" })).toHaveCount(0);

  await page.goto("/projects/field-notes");
  await expect(page.getByRole("heading", { level: 1, name: "Field Notes" })).toBeVisible();
  await expect(page.getByText("Design & engineering")).toBeVisible();
  await expect(page.getByRole("link", { name: /Visit site/ })).toHaveAttribute(
    "href",
    "https://example.com",
  );
  await page
    .getByRole("navigation", { name: "More projects" })
    .getByRole("link", { name: /Tide Tables/ })
    .click();
  await expect(page).toHaveURL(/\/projects\/tide-tables$/);
});

test("about: bio, résumé and a JSON Resume export", async ({ page, request }) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { name: "Résumé" })).toBeVisible();
  await expect(page.getByText("Principal product engineer")).toBeVisible();
  await page.getByRole("link", { name: /Printable version/ }).click();
  await expect(page.getByRole("button", { name: "Print or save as PDF" })).toBeVisible();

  const json = await (await request.get("/resume.json")).json();
  expect(json.basics.label).toBe("Product designer & engineer");
  expect(json.work[0].name).toBe("Example Studio");
  expect(json.meta.version).toBe("v1.0.0");
});

test("links: link-in-bio with QR code and vCard", async ({ page, request }) => {
  await page.goto("/links");
  await expect(page.getByRole("link", { name: "Latest project" })).toBeVisible();
  await page.getByRole("button", { name: "QR code" }).click();
  await expect(page.getByRole("img", { name: /QR code for/ })).toBeVisible();

  const vcard = await request.get("/links/vcard");
  expect(vcard.headers()["content-type"]).toContain("text/vcard");
  expect(await vcard.text()).toMatch(/^BEGIN:VCARD\r\nVERSION:3\.0\r\nFN:/);
  const qr = await request.get("/links/qr.svg");
  expect(qr.headers()["content-type"]).toContain("image/svg+xml");
  expect(await qr.text()).toContain('<path fill="currentColor"');
});

test("gallery: lightbox with keyboard navigation and shareable photo links", async ({ page }) => {
  await page.goto("/gallery");
  await expect(page).toHaveURL(/\/gallery\/coastlines$/);
  await page.getByRole("button", { name: /Open photo 1 of 6/ }).click();
  const viewer = page.getByRole("dialog", { name: "Coastlines photo viewer" });
  await expect(viewer.getByText("1 / 6")).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(viewer.getByText("2 / 6")).toBeVisible();
  await expect(page).toHaveURL(/#photo-2$/);
  await page.keyboard.press("Escape");
  await expect(viewer).toBeHidden();

  await page.goto("/gallery/coastlines#photo-3");
  await expect(page.getByRole("dialog").getByText("3 / 6")).toBeVisible();
  await expect(page.getByRole("dialog").getByText("Basalt")).toBeVisible();
});

test("now: latest entry with an archive", async ({ page }) => {
  await page.goto("/now");
  await expect(page.getByText(/Updated September 1, 2026/)).toBeVisible();
  await page.getByRole("link", { name: /May 10, 2026/ }).click();
  await expect(page).toHaveURL(/\/now\/2026-05-10$/);
  await expect(page.getByRole("heading", { level: 1, name: "May 10, 2026" })).toBeVisible();
});
