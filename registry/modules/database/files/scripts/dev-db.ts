/**
 * Runs before `pnpm dev`. Without DATABASE_URL it syncs the Drizzle schema into
 * the embedded PGlite database (.site/dev/pglite), so every table exists with
 * zero setup. With DATABASE_URL set it does nothing: real databases change only
 * through migrations (`pnpm db:generate && pnpm db:migrate`).
 *
 * Uses drizzle-kit's programmatic push and closes PGlite explicitly so every
 * change is flushed to disk before the dev server opens the same directory.
 */
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { PGlite } from "@electric-sql/pglite";
import { pushSchema } from "drizzle-kit/api";
import { drizzle } from "drizzle-orm/pglite";

import * as schema from "../src/generated/db-schema";

function databaseUrlConfigured() {
  if (process.env.DATABASE_URL) return true;
  for (const file of [".env.local", ".env.development.local", ".env.development", ".env"]) {
    if (!existsSync(file)) continue;
    const match = /^\s*DATABASE_URL\s*=\s*(.+)\s*$/m.exec(readFileSync(file, "utf8"));
    if (match?.[1] && match[1].replace(/^["']|["']$/g, "").trim()) return true;
  }
  return false;
}

async function main() {
  if (databaseUrlConfigured()) return;
  const dir = path.join(process.cwd(), ".site", "dev", "pglite");
  mkdirSync(dir, { recursive: true });
  const client = new PGlite(dir);
  try {
    const db = drizzle(client, { schema });
    const { apply, statementsToExecute, warnings } = await pushSchema(schema, db as never);
    if (statementsToExecute.length === 0) {
      console.log("[db] embedded database is up to date");
      return;
    }
    for (const warning of warnings) console.warn(`[db] ${warning}`);
    await apply();
    console.log(
      `[db] applied ${statementsToExecute.length} change(s) to the embedded database (.site/dev/pglite)`,
    );
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.warn(
    "[db] could not sync the embedded database:",
    error instanceof Error ? error.message : error,
  );
});
