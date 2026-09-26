# contact

A `/contact` page with a form that emails you every message.

- Works **without JavaScript** (server action + `useActionState`); with JS it adds a pending
  state, focus management and inline errors.
- **Spam protection in layers**: hidden honeypot field → minimum fill time → per-IP rate limit
  (5 per 10 minutes) → optional invisible [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/).
  Suspected bots get a fake success so they learn nothing.
- The notification email has `Reply-To` set to the sender, so you answer from your inbox.

## Setup

Set `CONTACT_TO_EMAIL`. In development, messages go to the email outbox (`/dev/outbox`).

## Environment

| Variable                         | Required   | Description                                                               |
| -------------------------------- | ---------- | ------------------------------------------------------------------------- |
| `CONTACT_TO_EMAIL`               | production | Inbox receiving submissions. Dev fallback: `author.email` in site.config. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | no         | Turnstile site key (both keys enable the challenge).                      |
| `TURNSTILE_SECRET_KEY`           | no         | Turnstile secret key.                                                     |

Requires the `email` and `rate-limit` modules (installed automatically).

## Customization

- Page copy: `contact` block in `site.config.ts` (`title`, `description`, `successMessage`, `subjectPrefix`).
- Fields: edit `src/lib/contact/schema.ts` (validation shared by client and server), then the
  form in `src/components/contact/contact-form.tsx` and the email in `src/emails/contact-notification.tsx`.
- Use the form elsewhere: `<ContactForm />` works in any page or inside the `contact-section` section.
- Store submissions too: add a database insert in `src/lib/contact/actions.tsx`.

## Removal

`pnpm site remove contact`. Removes the page, components, email template, the footer link and
the `contact` block in `site.config.ts`.
