# maintenance

Take the site offline gracefully, without breaking the things that must keep working.

- **Proper 503**: search engines see `503 Service Unavailable` with `Retry-After`, so rankings
  aren't hurt. The page is self-contained HTML (system fonts, the browser's own light/dark
  colors) because it can't depend on the app being healthy.
- **On demand** with `MAINTENANCE_MODE=on`, or **scheduled** with
  `NEXT_PUBLIC_MAINTENANCE_WINDOW=<start>/<end>`: the site goes down and comes back on its own,
  and the page says when it expects to be back.
- **Advance notice**: during the 72 hours before a scheduled window, visitors see a small,
  dismissible banner with the times in _their_ time zone.
- **Keep working on it**: open any URL with `?maintenance=<MAINTENANCE_BYPASS_TOKEN>` and that
  browser can browse normally for 12 hours (only a hash of the token is stored in the cookie).
- **Allow list**: payment webhooks, `/api/health` and the Sentry tunnel keep responding.

## Setup

1. Pick a bypass token: `openssl rand -hex 16` → `MAINTENANCE_BYPASS_TOKEN`.
2. To go down now: `MAINTENANCE_MODE=on`, then redeploy or restart. Turn it back off the same
   way.
3. To schedule: `NEXT_PUBLIC_MAINTENANCE_WINDOW=2026-10-01T02:00:00Z/2026-10-01T03:00:00Z` and
   deploy ahead of time; no second deploy is needed.

## Environment

| Variable                         | Required | Description                             |
| -------------------------------- | -------- | --------------------------------------- |
| `MAINTENANCE_MODE`               | no       | `on` / `off` (default `off`)            |
| `MAINTENANCE_BYPASS_TOKEN`       | no       | 16+ characters; enables the bypass link |
| `NEXT_PUBLIC_MAINTENANCE_WINDOW` | no       | `<start ISO>/<end ISO>`                 |

## Usage

Wording and the allow list: `site.config.ts → maintenance`.

## Customization

- Page design: `src/lib/maintenance/page.ts` (plain HTML string).
- Announcement lead time: `ANNOUNCE_MS` in `src/lib/maintenance/window.ts`.

## Removal

`pnpm site remove maintenance`.
