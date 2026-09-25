import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PLAYGROUND_PORT ?? 3300);

/**
 * End-to-end tests against the production build of the playground
 * (`pnpm playground:sync && pnpm --filter playground build` first).
 */
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "retain-on-failure",
    launchOptions: { executablePath: process.env.CHROMIUM_PATH || undefined },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `pnpm --filter playground exec next start -p ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    env: { SKIP_ENV_VALIDATION: "1" },
    timeout: 60_000,
  },
});
