# sentry

Error monitoring with [Sentry](https://sentry.io) across every runtime.

- **Server**: `src/instrumentation.ts` starts Sentry and reports errors from server components,
  route handlers, server actions and the proxy (`onRequestError`).
- **Browser**: `src/instrumentation-client.ts` catches uncaught errors, traces navigations, and
  records a replay **only for sessions that hit an error**, with all text and media masked.
- **React boundaries**: errors that `error.tsx` / `global-error.tsx` catch are reported through
  the `error-reporters` slot (they never reach `window.onerror`).
- **Tunnelled** through `/monitoring` on your own domain: ad blockers don't drop events and the
  CSP needs no Sentry hosts.
- **Readable stack traces**: source maps upload during the build when `SENTRY_AUTH_TOKEN` is
  set, then are removed from the deployed files.
- **Off by default**: without `NEXT_PUBLIC_SENTRY_DSN` nothing initializes and nothing is sent.

## Setup

1. Create a Next.js project in Sentry and copy its DSN into `NEXT_PUBLIC_SENTRY_DSN`.
2. For source maps, add `SENTRY_AUTH_TOKEN`, `SENTRY_ORG` and `SENTRY_PROJECT` to your build
   environment (CI or Vercel).
3. Deploy, then trigger an error to check (e.g. a button that throws).

## Environment

| Variable                 | Required | Description                     |
| ------------------------ | -------- | ------------------------------- |
| `NEXT_PUBLIC_SENTRY_DSN` | no       | Enables Sentry                  |
| `SENTRY_AUTH_TOKEN`      | no       | Build-time: uploads source maps |
| `SENTRY_ORG`             | no       | Build-time: organization slug   |
| `SENTRY_PROJECT`         | no       | Build-time: project slug        |

## Usage

```ts
import * as Sentry from "@sentry/nextjs";

Sentry.captureException(error, { tags: { feature: "checkout" } });
Sentry.setUser({ id: user.id }); // ids only; avoid emails unless your policy allows it
```

## Customization

- Sampling, environment, PII: `src/lib/sentry/options.ts`.
- Replay and browser integrations: `src/instrumentation-client.ts`.

## Removal

`pnpm site remove sentry`.
