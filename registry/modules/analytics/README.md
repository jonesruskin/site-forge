# analytics

Privacy-respecting analytics with one API, whichever provider you pick.

- **Providers**: [Plausible](https://plausible.io), [PostHog](https://posthog.com),
  [Google Analytics 4](https://analytics.google.com) or [Umami](https://umami.is), chosen by
  which env var is set. No SDK is bundled: each provider's own script loads after the page is
  interactive.
- **Consent-aware**: with the cookie-consent module installed, cookie-setting providers
  (PostHog, GA) wait for "analytics" consent and start the moment it's given; cookieless ones
  (Plausible, Umami) run straight away. Change the policy with
  `site.config.ts → analytics.consent`: `"cookieless-exempt"` (default), `"required"`, `"always"`.
- **`track(event, props)`**: custom events for any provider. Calls made before the script is
  ready are queued; without a provider they're logged to the console in development, so you
  can wire events before choosing a tool.
- **CSP**: only the configured provider's hosts are allowed, and only when its variable is set.
- Page views, including client-side navigations, are recorded automatically.

## Setup

Set one of:

| Provider  | Variable                                                              |
| --------- | --------------------------------------------------------------------- |
| Plausible | `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=example.com`                            |
| PostHog   | `NEXT_PUBLIC_POSTHOG_KEY=phc_…` (+ `NEXT_PUBLIC_POSTHOG_HOST` for EU) |
| GA4       | `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-…`                                   |
| Umami     | `NEXT_PUBLIC_UMAMI_WEBSITE_ID=…`                                      |

These are build-time variables: redeploy after changing them.

## Environment

| Variable                        | Required | Description                             |
| ------------------------------- | -------- | --------------------------------------- |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`  | no       | Enables Plausible                       |
| `NEXT_PUBLIC_PLAUSIBLE_SRC`     | no       | Self-hosted Plausible script URL        |
| `NEXT_PUBLIC_POSTHOG_KEY`       | no       | Enables PostHog                         |
| `NEXT_PUBLIC_POSTHOG_HOST`      | no       | `https://eu.i.posthog.com` for EU cloud |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | no       | Enables GA4                             |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID`  | no       | Enables Umami                           |
| `NEXT_PUBLIC_UMAMI_SRC`         | no       | Self-hosted Umami script URL            |

## Usage

```tsx
"use client";
import { track } from "@/lib/analytics/track";

<Button onClick={() => track("cta_click", { location: "hero" })}>Start</Button>;
```

## Customization

- Another provider: add an entry in `src/lib/analytics/providers.ts` (script + `track`).
- Server-side events: call your provider's HTTP API from a server action.

## Removal

`pnpm site remove analytics`, then delete remaining `track()` calls.
