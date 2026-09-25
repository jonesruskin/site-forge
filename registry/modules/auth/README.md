# auth

Authentication with [Better Auth](https://better-auth.com), stored in your Postgres through
Drizzle.

- **Email + password** with email verification (on by default), password reset that signs out
  other devices, and account linking.
- **Magic links** ("email me a sign-in link") next to the password form.
- **Google and GitHub**: buttons appear automatically once credentials are set.
- **Server actions everywhere**: every form works without JavaScript, is rate limited per IP,
  never reveals whether an address has an account, and only redirects to same-site paths.
- **Protected routes**: `src/proxy.ts` bounces signed-out visitors away from
  `auth.protectedPaths` before rendering, and pages verify with `requireSession()`.
- **Zero-setup development**: the embedded database stores users, and verification, reset
  and magic-link emails land in `/dev/outbox`.

## Setup

1. Development: nothing. Visit `/sign-up`.
2. Production: set `BETTER_AUTH_SECRET` (`openssl rand -base64 32`) and run your migrations
   (`pnpm db:generate && pnpm db:migrate`).
3. OAuth (optional): create apps and set the client ID/secret pairs. Redirect URIs:
   - Google: `https://your.site/api/auth/callback/google`
   - GitHub: `https://your.site/api/auth/callback/github`

## Environment

| Variable                                    | Required   | Description                                                                              |
| ------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------- |
| `BETTER_AUTH_SECRET`                        | production | Signs sessions and tokens (32+ chars).                                                   |
| `BETTER_AUTH_URL`                           | no         | Public URL for callbacks. Defaults to the site URL (production) or request origin (dev). |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | no         | Enables Google sign-in.                                                                  |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | no         | Enables GitHub sign-in.                                                                  |

## Usage

```tsx
// Any server component or action
import { getSession, requireSession } from "@/lib/auth/session";

const session = await requireSession("/dashboard/reports"); // redirects to /sign-in?next=… when signed out
session.user.email;
```

```tsx
// Account menu (used by the dashboard)
<UserMenu user={session.user} links={[{ label: "Settings", href: "/settings" }]} />
```

Other modules extend auth through slots: `teams` adds the organization plugin and `admin`
adds the admin plugin, and both keep fully typed APIs (`auth.api.*`).

## Customization

- Behaviour: `auth` block in `site.config.ts` (`afterSignIn`, `protectedPaths`,
  `requireEmailVerification`, `magicLink`).
- Providers and session policy: `src/lib/auth/auth.ts`.
- Screens: `src/app/(auth)/*` (built on the `auth-card` section; pass `aside` for split-screen).
- Emails: `src/emails/auth/*`.

## Removal

`pnpm site remove auth` after removing modules that require it (dashboard, billing, teams,
admin …). Drop the `user`, `session`, `account` and `verification` tables with a migration.
