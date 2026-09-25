# waitlist

A launch waitlist that grows itself.

- `<WaitlistForm />`: email (and optionally name), honeypot, rate limit, progressive enhancement.
- Each sign-up gets a **personal status page** (`/waitlist/<code>`) with their live position
  and a **referral link**. Every friend who joins through it moves them up: the queue is
  ordered by referrals, then sign-up time.
- A welcome email with position and link (idempotent).
- Signing up twice never reveals someone's position: the second attempt re-sends their link
  by email instead.
- **CSV export** for launch day: `GET /api/waitlist/export` with a bearer token.

## Setup

Nothing in development (the database module provides an embedded Postgres). Put the form on
your landing page:

```tsx
<HeroCentered
  title="Something new is coming"
  media={<WaitlistForm className="max-w-md mx-auto" />}
/>
```

## Environment

| Variable               | Required | Description                                        |
| ---------------------- | -------- | -------------------------------------------------- |
| `WAITLIST_ADMIN_TOKEN` | no       | Enables `GET /api/waitlist/export` (min 16 chars). |

```sh
curl -H "Authorization: Bearer $WAITLIST_ADMIN_TOKEN" https://your.site/api/waitlist/export -o waitlist.csv
```

## Customization

- Copy: `waitlist` block in `site.config.ts`.
- Ranking: `positionOf()` in `src/lib/waitlist/waitlist.ts`.
- Email: `src/emails/waitlist-welcome.tsx`.

## Removal

`pnpm site remove waitlist`. Drop the `waitlist_entry` table with a migration if you created one.
