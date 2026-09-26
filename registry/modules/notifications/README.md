# notifications

An in-app inbox.

- `notify(userId, { title, body?, href?, type? })` from any server code (actions, webhooks,
  cron jobs).
- A **bell in the app top bar** with an unread badge and the latest items; opening one marks it
  read and follows its link.
- `/notifications` for the full list with "mark all read".
- New accounts get a welcome notification (through the auth-events slot).

## Setup

None.

## Environment

No variables.

## Usage

```ts
import { notify } from "@/lib/notifications/notify";

await notify(user.id, {
  type: "billing",
  title: "Your invoice is ready",
  href: "/settings/billing",
});
```

## Customization

- Presentation: `src/components/notifications/notification-list.tsx` (icons per `type`).
- Email digests: query unread notifications on a schedule and send with the email module.
- Real-time: call `router.refresh()` on an interval, or add a server-sent events route.

## Removal

`pnpm site remove notifications`.
