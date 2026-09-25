# payments

The payment layer that billing and the store build on.

- **Provider interface** (`src/lib/payments/types.ts`): customers, checkout, customer portal,
  webhook parsing into normalized events (`checkout.completed`, `subscription.updated`,
  `subscription.deleted`, `invoice.payment_failed`). Billing and store code never touch the
  Stripe SDK, so Lemon Squeezy, Paddle or Razorpay means one adapter file.
- **Stripe adapter**: prices are referenced by **lookup key** (e.g. `pro_monthly`), so the same
  config works in test and live mode.
- **Mock provider for development**: without `STRIPE_SECRET_KEY`, checkouts open a local test
  page (`/dev/checkout/<id>`). "Pay (test)" fires the same events a real webhook would, and
  `/dev/billing-portal` can cancel, resume or end subscriptions. The full billing lifecycle
  works before you've created a Stripe account.
- `POST /api/payments/webhook` verifies signatures and runs every handler contributed through
  the `payment-webhooks` slot.

## Setup

1. Development: nothing.
2. Production: create a Stripe account, set `STRIPE_SECRET_KEY`, and add a webhook endpoint at
   `https://your.site/api/payments/webhook` listening to `checkout.session.completed`,
   `checkout.session.async_payment_succeeded`, `customer.subscription.created`,
   `customer.subscription.updated`, `customer.subscription.deleted` and
   `invoice.payment_failed`. Set its signing secret as `STRIPE_WEBHOOK_SECRET`.
3. Local testing against real Stripe: `stripe listen --forward-to localhost:3000/api/payments/webhook`.

## Environment

| Variable                | Required   | Description                                       |
| ----------------------- | ---------- | ------------------------------------------------- |
| `STRIPE_SECRET_KEY`     | production | Secret key. Unset in development → mock provider. |
| `STRIPE_WEBHOOK_SECRET` | production | Webhook signing secret (`whsec_…`).               |

## Customization

- Add a provider: implement `PaymentProvider` in `src/lib/payments/<name>.ts` and select it in
  `src/lib/payments/index.ts`.
- Handle events in your own code: export `async (event: PaymentEvent) => {}` and contribute it
  to the `payment-webhooks` slot (or call `dispatchPaymentEvent` yourself).

## Removal

`pnpm site remove payments` after removing billing and store.
