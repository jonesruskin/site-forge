# email

Transactional email with [Resend](https://resend.com) and [React Email](https://react.email).

- `sendEmail({ to, subject, react })` renders a React Email template and sends it.
- **Local outbox**: without `RESEND_API_KEY` (development only) emails are rendered to
  `.site/dev/outbox/` and listed at **`/dev/outbox`**, including a plain-text view. Every flow
  (contact form, magic links, invites, receipts) can be exercised with zero setup.
- A shared `EmailLayout` plus `EmailHeading`, `EmailText`, `EmailButton`, `EmailCode` and
  `EmailDivider` keep every template consistent.

## Setup

1. Create an API key at https://resend.com/api-keys.
2. Verify your sending domain at https://resend.com/domains.
3. Set `RESEND_API_KEY` and `EMAIL_FROM` (e.g. `Acme <hello@acme.com>`).

## Environment

| Variable         | Required   | Description                                                                       |
| ---------------- | ---------- | --------------------------------------------------------------------------------- |
| `RESEND_API_KEY` | production | Resend API key. Missing in development → local outbox.                            |
| `EMAIL_FROM`     | production | Default sender on a verified domain. Dev default: `Site <onboarding@resend.dev>`. |
| `EMAIL_OUTBOX`   | no         | `1` = capture mode: never deliver, write to the outbox (previews, staging, CI).   |

## Usage

```tsx
import { sendEmail } from "@/lib/email/send";
import { WelcomeEmail } from "@/emails/welcome";

await sendEmail({
  to: user.email,
  subject: "Welcome aboard",
  react: <WelcomeEmail name={user.name} />,
  idempotencyKey: `welcome:${user.id}`, // safe to retry
});
```

Write templates in `src/emails/`, composed from `@/emails/components/email-layout`. Add a
static `PreviewProps` to a template if you also use the React Email preview CLI.

## Customization

- **Brand**: email clients can't read CSS variables, so `src/emails/theme.ts` holds literal
  colors, radius and fonts. Mirror your `theme.css` there.
- **Another provider**: replace the Resend branch in `src/lib/email/send.ts`. The function
  signature is all other modules depend on.

## Removal

`pnpm site remove email` (remove modules that require it first). The outbox folder
`.site/dev/outbox` is git-ignored and can be deleted.
