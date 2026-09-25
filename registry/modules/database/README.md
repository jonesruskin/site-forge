# database

[Drizzle ORM](https://orm.drizzle.team) on Postgres. Works with Neon, Supabase, RDS, Railway or
any Postgres.

- **Zero-setup development**: without `DATABASE_URL`, the app uses an embedded Postgres
  ([PGlite](https://pglite.dev)) stored in `.site/dev/pglite`, and `pnpm dev` syncs the schema
  into it first (`pnpm db:dev` runs that step alone). Clone, install, `pnpm dev`, and sign-ups,
  waitlists and dashboards work.
- **Production**: set `DATABASE_URL`. The client disables prepared statements so transaction
  poolers (Neon pooled URLs, Supabase's pooler, PgBouncer) work.
- Every module's tables live in `src/db/schema/<module>.ts` and are collected into
  `src/generated/db-schema.ts`, so `db.query.*` is fully typed.

## Setup

1. Development: nothing.
2. Production: create a database (e.g. on [Neon](https://neon.tech)) and set `DATABASE_URL`.
3. Create and apply migrations:

   ```sh
   pnpm db:generate   # writes SQL to /drizzle; commit it
   DATABASE_URL=… pnpm db:migrate
   ```

   Run `db:migrate` in your deploy pipeline before the new code goes live.

## Environment

| Variable       | Required   | Description                                                         |
| -------------- | ---------- | ------------------------------------------------------------------- |
| `DATABASE_URL` | production | Postgres connection string. Unset in development → embedded PGlite. |

Optional: `DATABASE_POOL_SIZE` (default 10). Use 1–5 on serverless.

## Usage

```ts
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

const user = await db.query.user.findFirst({ where: eq(schema.user.email, email) });
```

Add your own tables in `src/db/schema/app.ts` (relative imports only; name columns explicitly,
e.g. `createdAt: timestamp("created_at")`) and run `pnpm site sync` to include them in the
generated schema index.

## Customization

- Scripts: `db:generate`, `db:migrate`, `db:push` (prototype against a dev database),
  `db:studio` (browse data).
- Reset the local database: stop the dev server and delete `.site/dev/pglite`.

## Removal

`pnpm site remove database` after removing modules that store data (auth, billing, waitlist …).
