// Runs before `pnpm dev`. When no DATABASE_URL is configured, pushes the Drizzle
// schema into the embedded PGlite database so every table exists with zero setup.
// With DATABASE_URL set it does nothing: real databases are changed through
// migrations (`pnpm db:generate && pnpm db:migrate`), never automatically.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

function envFromFiles() {
  for (const file of [".env.local", ".env.development.local", ".env.development", ".env"]) {
    if (!existsSync(file)) continue;
    const match = readFileSync(file, "utf8").match(/^\s*DATABASE_URL\s*=\s*(.+)\s*$/m);
    if (match && match[1].replace(/^["']|["']$/g, "").trim()) return true;
  }
  return false;
}

if (process.env.DATABASE_URL || envFromFiles()) process.exit(0);

console.log("[db] DATABASE_URL not set: syncing schema into embedded PGlite (.site/dev/pglite)");
const result = spawnSync("drizzle-kit", ["push", "--force"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});
if (result.status !== 0) {
  console.warn("[db] schema push failed; continuing. Run `pnpm db:push` to see details.");
}
