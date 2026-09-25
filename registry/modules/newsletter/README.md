# newsletter

Email signup with proper double opt-in and a pluggable provider.

- `<NewsletterForm />`: email + button, progressive enhancement, honeypot, rate limit.
- **Double opt-in without a database**: the confirmation email contains an HMAC-signed,
  48-hour link (`/newsletter/confirm?token=…`). Only confirmed addresses reach your provider.
- **Providers**: Resend (contacts + segments), Buttondown, Kit (ConvertKit v4). In
  development the provider defaults to `log` and confirmation emails land in `/dev/outbox`.
- `/newsletter`: a standalone signup page (linked from the footer).

## Setup

1. Pick a provider and set `NEWSLETTER_PROVIDER` plus its keys.
2. Set `NEWSLETTER_SECRET` (`openssl rand -base64 32`).
3. Place the form anywhere:

   ```tsx
   <NewsletterBand title="Get updates" form={<NewsletterForm />} note="No spam." />
   ```

## Environment

| Variable              | Required   | Description                                             |
| --------------------- | ---------- | ------------------------------------------------------- |
| `NEWSLETTER_PROVIDER` | production | `resend`, `buttondown` or `kit` (`log` in development). |
| `NEWSLETTER_SECRET`   | production | Signs confirmation links (32+ chars).                   |
| `RESEND_SEGMENT_ID`   | no         | Resend segment for new contacts.                        |
| `BUTTONDOWN_API_KEY`  | buttondown | API key.                                                |
| `KIT_API_KEY`         | kit        | v4 API key.                                             |
| `KIT_FORM_ID`         | no         | Kit form to add subscribers to.                         |

## Customization

- Copy and messages: `newsletter` block in `site.config.ts`. Set `doubleOptIn: false` if your
  provider runs its own confirmation flow (Buttondown and Kit can).
- Add a provider: one function in `src/lib/newsletter/providers.ts`.
- Confirmation email: `src/emails/newsletter-confirm.tsx`.

## Removal

`pnpm site remove newsletter`.
