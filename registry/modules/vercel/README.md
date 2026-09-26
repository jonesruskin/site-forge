# vercel

Deploy to [Vercel](https://vercel.com) with confidence.

- **Fails fast on missing configuration**: the build first runs `env:check`, which validates
  every module's environment variables exactly as production will, and names what's missing
  and what it's for — instead of a cryptic runtime error after deploy.
- Quiet pull requests: Vercel's deployment comments are turned off (the preview link still
  shows in the checks).
- Everything else (framework, output, caching) is Vercel's Next.js default.

## Setup

1. Push to GitHub, then import the repository at <https://vercel.com/new>.
2. Add the variables from `.env.example` under _Settings → Environment Variables_
   (or `vercel env add NAME`). Set `NEXT_PUBLIC_SITE_URL` to your production domain.
3. Deploy. If the build stops at `env:check`, add what it lists and redeploy.

With a database: run migrations before the new code serves traffic, e.g. from CI with
`DATABASE_URL=… pnpm db:migrate`, or change `buildCommand` to
`npm run env:check && npm run db:migrate && npm run build`.

Stripe and other webhooks: point them at your production domain, e.g.
`https://example.com/api/payments/webhook`.

## Environment

No variables of its own.

## Usage

`vercel` for a preview from your machine, `vercel --prod` to promote.

## Customization

Regions, crons and headers go in `vercel.json`
([reference](https://vercel.com/docs/project-configuration)). Scheduled jobs: add
`"crons": [{ "path": "/api/cron/…", "schedule": "0 3 * * *" }]` and protect the route with
`CRON_SECRET`.

## Removal

`pnpm site remove vercel`.
