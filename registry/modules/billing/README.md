# billing

Subscriptions with plans defined once in `site.config.ts` and used everywhere: the pricing
page, checkout, the billing settings tab, the dashboard widget and your own feature gates.

- `/pricing`: the `pricing-table` section with a CSS-only monthly/yearly toggle; each interval's
  button goes to its own checkout.
- `/billing/checkout?plan=pro&interval=month`: signed-out visitors sign up first and come
  straight back. First-time subscribers get the trial (`billing.trialDays`), and existing
  subscribers go to the portal instead.
- Webhooks keep a `subscription` table current (idempotent upserts); `/billing/portal` opens
  the provider's portal for card, plan and cancellation changes.
- **Entitlements**: `getPlan(userId)`, `hasPlan(userId, "pro")`, `getLimit(userId, "projects")`.
- **Works locally without Stripe**: the payments module's mock checkout completes the flow.

## Setup

1. Edit `billing.plans` in `site.config.ts` (names, prices, features, limits).
2. Development: sign up, visit `/pricing`, choose a plan, and pay on the test page.
3. Production: `STRIPE_SECRET_KEY=sk_live_… pnpm billing:sync` creates Stripe products and
   prices with lookup keys `<plan>_monthly` / `<plan>_yearly`. Then configure the webhook (see
   the payments module) and the customer portal in Stripe.

## Environment

None of its own; see the payments and auth modules.

## Usage

```ts
import { getLimit, hasPlan } from "@/lib/billing/entitlements";

if (!(await hasPlan(user.id, "pro", "enterprise"))) redirect("/pricing");
const maxProjects = await getLimit(user.id, "projects");
```

## Customization

- Plans: `site.config.ts` → `billing` (`currency`, `trialDays`, `plans[].lookupKeys` to reuse
  existing Stripe prices).
- Team billing: add `organizationId` to the subscription table and pass it in checkout metadata.
- Pricing page: `src/app/(site)/pricing/page.tsx` (combine with the faq module for questions).

## Removal

`pnpm site remove billing`. Cancel live subscriptions in Stripe first.
