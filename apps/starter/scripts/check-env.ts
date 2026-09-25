/**
 * Validates environment variables exactly as a production build would.
 * Run before deploying: `pnpm env:check` (reads .env files like Next.js does).
 */
async function main() {
  for (const file of [".env.production.local", ".env.local", ".env.production", ".env"]) {
    try {
      // Earlier files win: loadEnvFile never overrides variables that are already set.
      process.loadEnvFile(file);
    } catch {
      // Missing files are fine; variables may come from the shell or the host.
    }
  }
  Object.assign(process.env, { NODE_ENV: "production" });
  delete process.env.SKIP_ENV_VALIDATION;

  try {
    await import("../src/env");
  } catch {
    console.error("\n✖ Fix the variables above (see .env.example for what each one does).");
    process.exit(1);
  }
  console.log("✔ Environment is ready for production.");
}

void main();
