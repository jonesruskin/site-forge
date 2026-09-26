# api

A public REST API foundation: keys people create themselves, and one helper that makes every
endpoint authenticated, validated and rate limited the same way.

- **API keys** at `/settings/api-keys`: name, scopes (from `site.config.ts → api.scopes`) and an
  expiry. The key is shown once with a copy button and a ready-to-run `curl`; only its SHA-256
  hash is stored. Last-used time is tracked (at most one write a minute per key).
- **`apiRoute(options, handler)`** wraps a route handler with:
  - authentication by `Authorization: Bearer <key>`, or the signed-in session for first-party
    calls from your own frontend (writes must be same-origin),
  - scope checks, Zod validation of query and JSON body,
  - per-key rate limits with standard `RateLimit-*` / `Retry-After` headers,
  - errors as [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457) `application/problem+json`.
- **`GET /api/v1/me`** as a working example.

## Setup

None. Keys work against the embedded development database straight away.

## Environment

No variables of its own (uses auth, database and rate-limit).

## Usage

```ts
// src/app/api/v1/projects/[id]/route.ts
import { z } from "zod";

import { ApiError, apiRoute } from "@/lib/api/route";

export const PATCH = apiRoute(
  { scope: "write", body: z.object({ name: z.string().min(1).max(100) }) },
  async ({ principal, params, body }) => {
    const project = await renameProject(principal.userId, params.id, body.name);
    if (!project) throw new ApiError(404, "No such project.");
    return { data: project };
  },
);
```

Options: `auth` (`"required"` default, `"optional"`, `"none"`), `scope`, `query`, `body`,
`rateLimit` (`{ limit, window }` or `false`). Return data for a 200 JSON response or any
`Response`. Throw `ApiError(status, message)` for a problem response.

## Customization

- Scopes, key prefix and the default limit: `site.config.ts → api`. A distinctive `keyPrefix`
  (e.g. `acme`) makes leaked keys easy to find with secret scanners.
- Team-owned keys: add an `organization_id` column to `src/db/schema/api.ts` and check it in
  your handlers.
- CORS for browser clients on other origins: return a `Response` with the headers you need and
  export an `OPTIONS` handler.

## Removal

`pnpm site remove api`. Existing keys stop working; drop the `api_key` table in a migration.
