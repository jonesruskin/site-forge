# store

Sell digital products — or give them away for an email address — without a database.

- **Products are code**: `src/content/products.ts` (name, tagline, price, format, features,
  badge, image). Prices are defined inline, so there is nothing to set up in the Stripe
  dashboard.
- **`/store`** and **`/store/<slug>`**: grid and product pages with `Product` JSON-LD.
- **Checkout** through the payments module (Stripe, or the mock provider locally). After
  payment, `/store/thanks` verifies the order with the provider and offers the download
  immediately; the webhook emails the same link (idempotent across retries).
- **Free products** (`price: 0`) skip checkout: the link is emailed, which makes a simple,
  honest lead magnet.
- **Signed, expiring links**: `/store/download/<token>` carries product, order and expiry, signed
  with HMAC-SHA256. Files live in `private/downloads/`, never in `public/`, and are bundled with
  the route on serverless hosts. Products can also redirect to an external `url`.

## Setup

1. `STORE_DOWNLOAD_SECRET`: `openssl rand -base64 32`.
2. Payments: set up the payments module (Stripe keys + webhook).
3. Add products and put their files in `private/downloads/`.

## Environment

| Variable                | Required   | Description                                         |
| ----------------------- | ---------- | --------------------------------------------------- |
| `STORE_DOWNLOAD_SECRET` | production | Signs download links. Rotating it revokes old links |

## Usage

```ts
{
  slug: "icon-pack",
  name: "Icon Pack",
  tagline: "400 icons in SVG and Figma.",
  price: 29,
  currency: "usd",
  format: "ZIP · 12 MB",
  features: ["Commercial license", "Free updates"],
  file: "icon-pack.zip",
}
```

Link expiry: `site.config.ts → store.downloadExpiresInDays` (default 7).

## Customization

- Emails: `src/emails/store/purchase.tsx` (preview it at `/dev/emails`).
- Order records or license keys: handle `checkout.completed` in your own `payment-webhooks`
  contribution and store what you need.
- Large files (>50 MB): host them on storage and set `url` instead of `file`.

## Removal

`pnpm site remove store`, then delete `private/downloads`.
