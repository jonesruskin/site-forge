# feature-flags

Ship code dark, roll it out gradually, and switch it off without a deploy — no third-party
service.

- **Declared in `site.config.ts`**, so flag names are type-checked:

  ```ts
  flags: {
    newDashboard: { description: "Redesigned dashboard", default: false, rollout: 10, allow: ["*@acme.com"] },
  },
  ```

- **Evaluation** (first match wins): your browser's override → `FLAG_OVERRIDES` env →
  allow list (user ids, emails, `*@domain`) → percentage rollout → default.
- **Sticky rollouts**: users are bucketed by id; anonymous visitors by a random first-party
  `site_vid` cookie set in the proxy. Each flag buckets independently.
- **`/dev/flags`** lists every flag, its value for you **and why** ("rollout bucket",
  "allow list" …), with Auto / On / Off overrides per browser. A small pill in the corner
  reminds you while overrides are active.

## Setup

None.

## Environment

| Variable         | Required | Description                                                         |
| ---------------- | -------- | ------------------------------------------------------------------- |
| `FLAG_OVERRIDES` | no       | Kill switch / force-on for everyone, e.g. `newCheckout=off,beta=on` |

## Usage

```tsx
import { Feature } from "@/components/flags/feature";
import { isEnabled } from "@/lib/flags";

// Server components, actions and route handlers:
if (await isEnabled("newDashboard", user)) redirect("/dashboard/v2");

// Or declaratively:
<Feature flag="newDashboard" user={user} fallback={<Classic />}>
  <Redesign />
</Feature>;
```

Pass the signed-in user (`{ id, email }`) when you have one; without it the anonymous visitor
id is used. `getFlags(user)` returns every flag as a plain object for client components.

Flags read cookies, so pages that check them render per request. Keep checks out of pages you
want statically generated, or check the flag in a client component with values from
`getFlags()`.

## Customization

- `/dev/flags` on staging: set `features.flagsDevTools: true` (never on production: anyone
  could turn flags on for themselves).
- Remote control: replace `flagDefinitions` in `src/lib/flags/config.ts` with values fetched
  from your database or an edge config; `evaluateFlag()` stays the same.

## Removal

`pnpm site remove feature-flags`, after removing `isEnabled`/`<Feature>` calls.
