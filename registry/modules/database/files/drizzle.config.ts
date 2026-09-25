import { defineConfig } from "drizzle-kit";

const url = process.env.DATABASE_URL;

/**
 * With DATABASE_URL: your real Postgres. Without it: the embedded PGlite
 * database used by `pnpm dev` (see scripts/dev-db.mjs).
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/*.ts",
  out: "./drizzle",
  ...(url
    ? { dbCredentials: { url } }
    : { driver: "pglite", dbCredentials: { url: "./.site/dev/pglite" } }),
  strict: true,
  verbose: false,
});
