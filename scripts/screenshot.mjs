// Usage: node scripts/screenshot.mjs <url> <out.png> [dark] [width]
import { chromium } from "@playwright/test";

const [url, out, mode = "light", width = "1280"] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
const page = await browser.newPage({
  viewport: { width: Number(width), height: 900 },
  colorScheme: mode === "dark" ? "dark" : "light",
});
await page.goto(url, { waitUntil: "networkidle" });
await page.screenshot({ path: out, fullPage: true });
await browser.close();
