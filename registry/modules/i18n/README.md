# i18n

Multiple languages with [next-intl](https://next-intl.dev), **without** `/en/…` prefixes: every
page keeps one URL, and the language follows the visitor.

- **Locale resolution** per request: the visitor's saved choice (`NEXT_LOCALE` cookie) → their
  browser's `Accept-Language` (with proper quality weighting and `es-MX` → `es` fallback) → the
  default.
- **Switcher** in the site header (hidden with a single language); changing it re-renders the
  page in place.
- **`<html lang>`** follows the active language through the `html-lang` slot.
- **Typed messages**: `messages/en.json` is the source of truth, so a missing or misspelled key
  is a type error. ICU plurals and variables work out of the box.

## Trade-off

Because the language depends on the request, pages that read translations render per request
instead of at build time. For sites where SEO per language matters most (separate URLs per
language, `hreflang`), use next-intl's prefix routing instead.

## Setup

1. `site.config.ts → i18n`: `locales`, `defaultLocale`, `labels`.
2. Add `messages/<locale>.json` for each locale, with the same keys as `en.json`.

## Environment

No variables.

## Usage

```tsx
// Server component
import { getTranslations } from "next-intl/server";
const t = await getTranslations("Example");
<h1>{t("greeting", { name: user.name })}</h1>;

// Client component
import { useTranslations } from "next-intl";
const t = useTranslations("Example");
<p>{t("items", { count: 3 })}</p>;
```

Dates and numbers: `useFormatter()` / `getFormatter()` from next-intl.

## Customization

- Detection order: `src/i18n/request.ts`.
- Switcher UI: `src/components/i18n/locale-switcher.tsx`.

## Removal

`pnpm site remove i18n`, after replacing `t(…)` calls with text.
