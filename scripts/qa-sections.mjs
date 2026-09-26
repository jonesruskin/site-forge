// Screenshots every demo block on the playground /sections page, optionally under
// another registry theme, for visual QA.
//   node scripts/qa-sections.mjs <baseUrl> <outDir> [light|dark] [theme]
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";

import { chromium } from "@playwright/test";

const [base, outDir, mode = "light", theme] = process.argv.slice(2);
await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({
  viewport: { width: 1280, height: 900 },
  colorScheme: mode === "dark" ? "dark" : "light",
});
await page.goto(`${base}/sections`, { waitUntil: "networkidle" });
if (theme) {
  const css = await readFile(
    path.join(import.meta.dirname, `../registry/themes/${theme}/theme.css`),
    "utf8",
  );
  await page.addStyleTag({ content: css });
}
const ids = await page.$$eval("main section[id]", (nodes) => nodes.map((n) => n.id));
for (const id of ids) {
  const el = page.locator(`#${id}`);
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  await el.screenshot({ path: path.join(outDir, `${theme ?? "neutral"}-${mode}-${id}.png`) });
}
console.log(`captured ${ids.length} sections`);
await browser.close();
