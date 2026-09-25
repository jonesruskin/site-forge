// Visual QA helper.
//   node scripts/screenshot.mjs <url> <out.png> [light|dark] [width] [extra.css]
// Scrolls through the page first so lazy images load. Set CHROMIUM_PATH to use a
// preinstalled browser.
import { readFile } from "node:fs/promises";

import { chromium } from "@playwright/test";

const [url, out, mode = "light", width = "1280", css] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({
  viewport: { width: Number(width), height: 900 },
  colorScheme: mode === "dark" ? "dark" : "light",
});
await page.goto(url, { waitUntil: "networkidle" });
if (css) await page.addStyleTag({ content: await readFile(css, "utf8") });
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 600) {
    window.scrollTo(0, y);
    await new Promise((resolve) => setTimeout(resolve, 60));
  }
  window.scrollTo(0, 0);
});
await page.waitForLoadState("networkidle");
await page.screenshot({ path: out, fullPage: true });
await browser.close();
