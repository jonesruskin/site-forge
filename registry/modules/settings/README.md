# settings

Account settings under `/settings` inside the app shell.

- **Profile**: name and avatar URL.
- **Email**: change with confirmation sent to the new address; verified badge.
- **Security**: change password (optionally signing out other devices), list active sessions
  with browser/OS/IP, revoke one or all others. The password form is hidden for OAuth-only
  accounts.
- **Account**: delete permanently (password confirmation in a dialog).
- Tabs come from `nav.settings` in `site.config.ts`, so modules add their own: billing
  ("Billing"), teams ("Team"), api ("API keys"), notifications ("Notifications").

## Setup

None.

## Environment

No variables.

## Customization

- Add a tab: create `src/app/(app)/settings/<name>/page.tsx` and add
  `{ label, href: "/settings/<name>" }` to `nav.settings`.
- Actions live in `src/lib/settings/actions.ts`. Each re-checks the session and returns
  field errors for the forms.

## Removal

`pnpm site remove settings`.
