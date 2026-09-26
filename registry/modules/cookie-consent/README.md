# cookie-consent

A consent banner that treats "no" as a first-class answer.

- **Accept all** and **Reject all** have equal weight; optional categories start off;
  **Customize** reveals per-category switches.
- Choices persist for 180 days in the `site_consent` cookie and can be changed from any link to
  `#cookie-settings` (one is added to the footer's legal links).
- **Zero coupling**: other modules never import this one. They read the cookie or listen for
  the event:

  | Contract | Value                                                             |
  | -------- | ----------------------------------------------------------------- |
  | Cookie   | `site_consent={"v":1,"analytics":bool,"marketing":bool,"at":iso}` |
  | Event    | `window` `site:consent` (`CustomEvent<Consent>`)                  |
  | Reopen   | link to `#cookie-settings` or dispatch `site:consent:open`        |

  The analytics module follows this contract when installed alongside.

## Setup

Nothing. The banner is mounted through the body-end slot.

## Environment

No variables.

## Customization

- Copy and categories: `cookieConsent` in `site.config.ts` (remove a category label to hide it).
- Client components: `useConsent()` from `@/components/consent/use-consent`.
- Server components: `await hasConsent("analytics")` from `@/lib/consent/server`.
- Position and look: `src/components/consent/cookie-banner.tsx`.

## Removal

`pnpm site remove cookie-consent`. Analytics then loads without waiting for consent. Only do
this if your audience and tracking setup don't require consent.
