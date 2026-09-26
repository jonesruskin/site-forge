# faq

One source of truth for frequently asked questions.

- `content/faq.json`: questions with answers, categories and tags, validated at build time.
- `/faq`: every category as a zero-JS accordion (the `faq` section) plus `FAQPage` JSON-LD,
  which search engines can show as rich results.
- `getFaqs({ tag: "pricing" })` to reuse a subset anywhere, e.g. under the pricing table.

## Setup

Edit `content/faq.json`:

```json
[
  {
    "category": "Billing",
    "question": "Can I cancel any time?",
    "answer": "Yes. …",
    "tags": ["pricing"]
  }
]
```

## Environment

No variables.

## Customization

- Title and description: `faq` block in `site.config.ts`.
- Rich answers: switch `answer` to MDX by installing the `mdx` module and rendering with `<Mdx>`.

## Removal

`pnpm site remove faq`.
