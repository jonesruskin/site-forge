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
    // Consent already given, so the banner doesn't cover the UI under test.
    storageState: "e2e/consent-state.json",
    launchOptions: { executablePath: process.env.CHROMIUM_PATH || undefined },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    // Push the schema into the embedded database, then serve the production build.
    command: `pnpm --filter playground db:dev && pnpm --filter playground exec next start -p ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    env: {
      SKIP_ENV_VALIDATION: "1",
      EMAIL_OUTBOX: "1",
      NEWSLETTER_SECRET: "e2e-only-secret-that-is-long-enough-to-pass",
      WAITLIST_ADMIN_TOKEN: "e2e-admin-token-1234567890",
      BETTER_AUTH_SECRET: "e2e-only-better-auth-secret-0123456789abcdef",
      BETTER_AUTH_URL: `http://localhost:${port}`,
    },
    timeout: 60_000,
  },
});
