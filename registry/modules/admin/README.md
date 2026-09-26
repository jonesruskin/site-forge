# admin

An admin area inside the app shell, on Better Auth's admin plugin.

- `/admin`: user totals, weekly sign-ups, verification and active sessions, plus a 14-day
  sign-up chart.
- `/admin/users`: search, pagination, role changes, ban/unban, sign out everywhere, and
  **"View as"** impersonation with a banner in the top bar to stop.
- Non-admins get a 404, so the area's existence isn't revealed. The admin nav group only shows
  for admins.

## Setup

Make yourself an admin (after signing up):

```sh
pnpm admin:grant you@example.com      # local or DATABASE_URL database
# or set ADMIN_EMAILS=you@example.com: promoted the first time you open /admin
```

## Environment

| Variable       | Required | Description                                                        |
| -------------- | -------- | ------------------------------------------------------------------ |
| `ADMIN_EMAILS` | no       | Comma-separated emails promoted to admin on first visit to /admin. |

## Customization

- Add admin pages under `src/app/(app)/admin/` and list them in `nav.admin`. Guard each page
  with `await requireAdmin()`.
- Plugin options (roles, impersonation duration): `src/lib/admin/auth-plugin.ts`.

## Removal

`pnpm site remove admin`. The `role`/`banned` columns stay on the user table (owned by auth).
