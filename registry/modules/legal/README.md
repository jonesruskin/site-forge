# legal

Privacy policy, terms of service and cookie policy at `/legal/privacy`, `/legal/terms` and
`/legal/cookies`, linked from the footer.

The pages are MDX templates in `content/legal` that pull your company name, contact email,
address and jurisdiction from `site.config.ts`, so they read correctly on day one.

> These templates are a starting point, not legal advice. Have them reviewed for your
> business and jurisdiction, and edit them freely: they are your files.

## Setup

Fill the `legal` block in `site.config.ts`:

```ts
legal: {
  companyName: "Acme Ltd",
  contactEmail: "privacy@acme.com",
  jurisdiction: "England and Wales",
  address: "1 Example Street, London",
},
```

Empty values fall back to the site name and author email.

## Environment

No variables.

## Customization

- Edit the text in `content/legal/*.mdx`. Values are available as `{legal.companyName}`,
  `{legal.contactEmail}`, `{legal.jurisdiction}`, `{legal.address}`, `{legal.siteName}` and
  `{legal.url}`.
- Add a page (for example an imprint or DPA): add `content/legal/imprint.mdx` and a footer
  link in `site.config.ts` under `nav.legal`.

## Removal

`pnpm site remove legal`.
