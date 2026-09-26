# transactional-emails

The emails every product needs on day one, plus a dev tool for designing them.

- **Welcome email** after a user verifies their address (auth-events slot, idempotent).
- **`/dev/emails` gallery**: every template installed by any module (auth, contact,
  newsletter, waitlist, teams, billing …) rendered side by side with sample data from its
  `PreviewProps`. Tweak `src/emails/theme.ts` or a template and refresh.

## Setup

None. Available in development (and with `EMAIL_OUTBOX=1`).

## Environment

No variables of its own.

## Usage

Add your own template to the gallery: give it `PreviewProps` and contribute it to the
`email-templates` slot in a module manifest, or add it to `src/generated/email-templates.ts`
through your own module.

## Customization

- Welcome copy: `src/emails/welcome.tsx`.
- Send more lifecycle emails (trial ending, inactivity nudges) from auth events, payment
  webhooks or a scheduled job, reusing `EmailLayout`.

## Removal

`pnpm site remove transactional-emails`.
