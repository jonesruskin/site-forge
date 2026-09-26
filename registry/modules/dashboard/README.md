# dashboard

The signed-in area of a SaaS: everything under `src/app/(app)/` gets the app shell (sidebar,
top bar, mobile drawer) and requires a session.

- Sidebar from `site.config.ts`: `nav.dashboard` (the app), `nav.settings`, and `nav.admin`
  (admins only). Icons are lucide names mapped in `src/lib/dashboard/icons.tsx`.
- `/dashboard` overview renders **widgets** contributed by other modules (billing → current
  plan, teams → team card, notifications → latest items). With none installed it shows where
  to start building.
- **Top bar slot** for modules (team switcher, notification bell) next to the account menu.

## Setup

None. Sign up at `/sign-up` in development and you land on `/dashboard`.

## Environment

No variables.

## Customization

- Add pages: `src/app/(app)/reports/page.tsx` → `/reports`, then a nav entry:
  `nav.dashboard: [{ label: "Reports", href: "/reports", icon: "bar-chart-3" }]`.
  Add its path to `auth.protectedPaths` for the early redirect.
- Contribute a widget from your own module: export a server component taking `{ userId }` and
  list it under the `dashboard-widgets` slot.
- Shell look: the `dashboard-shell` section.

## Removal

`pnpm site remove dashboard` (settings, billing UI, teams and admin depend on it).
