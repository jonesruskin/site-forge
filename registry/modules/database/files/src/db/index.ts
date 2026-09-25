import "server-only";

import { mkdirSync } from "node:fs";
import path from "node:path";

import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzlePostgres, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { databaseEnv } from "@/env/database";
import * as schema from "@/generated/db-schema";

export type Database = PostgresJsDatabase<typeof schema>;

/** Where the embedded development database lives (git-ignored). */
export const PGLITE_DIR = path.join(process.cwd(), ".site", "dev", "pglite");

function createDatabase(): Database {
  const url = databaseEnv.DATABASE_URL;
  if (url) {
    // prepare: false keeps transaction poolers (Neon, Supabase, PgBouncer) happy.
    const client = postgres(url, {
      prepare: false,
      max: Number(process.env.DATABASE_POOL_SIZE ?? 10),
    });
    return drizzlePostgres(client, { schema, casing: "snake_case" });
  }
  if (process.env.NODE_ENV === "production" && !process.env.SKIP_ENV_VALIDATION) {
    throw new Error("DATABASE_URL is required in production.");
  }
  // Same query API, different driver: an in-process Postgres for zero-setup development.
  mkdirSync(PGLITE_DIR, { recursive: true });
  return drizzlePglite(new PGlite(PGLITE_DIR), {
    schema,
    casing: "snake_case",
  }) as unknown as Database;
}

const globalForDb = globalThis as unknown as { __db?: Database };

function instance() {
  // One connection per process, reused across hot reloads in development.
  globalForDb.__db ??= createDatabase();
  return globalForDb.__db;
}

/**
 * The database client. It connects on first use, not on import, so builds and
 * pages that never query don't open connections.
 */
export const db = new Proxy({} as Database, {
  get(_target, property) {
    const target = instance();
    const value = Reflect.get(target, property, target);
    return typeof value === "function" ? value.bind(target) : value;
  },
});

export { schema };
