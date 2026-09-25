/**
 * Promotes an existing user to admin.
 *   pnpm admin:grant you@example.com
 * Uses DATABASE_URL, or the embedded development database when unset.
 */
import path from "node:path";

import { PGlite } from "@electric-sql/pglite";
import { eq } from "drizzle-orm";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { user } from "../src/db/schema/auth";

async function main() {
  const email = process.argv[2]?.toLowerCase();
  if (!email) {
    console.error("Usage: pnpm admin:grant <email>");
    process.exit(1);
  }
  const url = process.env.DATABASE_URL;
  const promote = async (db: ReturnType<typeof drizzlePglite> | ReturnType<typeof drizzlePostgres>) => {
    await db.update(user).set({ role: "admin" }).where(eq(user.email, email));
    const [row] = await db.select({ role: user.role }).from(user).where(eq(user.email, email));
    return row?.role === "admin";
  };

  let ok: boolean;
  if (url) {
    const client = postgres(url, { prepare: false, max: 1 });
    ok = await promote(drizzlePostgres(client)).finally(() => client.end());
  } else {
    const client = new PGlite(path.join(process.cwd(), ".site", "dev", "pglite"));
    ok = await promote(drizzlePglite(client)).finally(() => client.close());
  }

  if (ok) console.log(`✓ ${email} is now an admin.`);
  else {
    console.error(`No user with email ${email}. Sign up first, then run this again.`);
    process.exitCode = 1;
  }
}

void main();
