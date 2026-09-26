# about

An about page and a résumé that stays in sync everywhere it appears.

- **`/about`**: your bio in MDX (`content/about/index.mdx`), an optional portrait, and the
  résumé below it. Emits `Person` JSON-LD.
- **`/resume`**: a standalone, print-ready page. "Print or save as PDF" produces a clean
  document on A4 or Letter — navigation disappears, sizes switch to points, and dark mode flips
  to light for paper.
- **`/resume.json`**: the same data as [JSON Resume](https://jsonresume.org), so job boards,
  themes and tools can import it.

## Setup

1. Write your bio in `content/about/index.mdx`.
2. Replace the example data in `src/content/resume.ts` (typed: your editor autocompletes the
   fields).
3. Optional portrait: `site.config.ts → about.portrait` (e.g. `/images/portrait.jpg`) and
   `portraitAlt`.

Name, email, website and social profiles come from `site.config.ts` (`author`, `socials`).

## Environment

No variables.

## Usage

Dates are `"2024"`, `"2024-03"` or `"2024-03-15"`; leave `end` out for a current role.

```ts
work: [
  {
    organization: "Acme",
    position: "Staff engineer",
    start: "2023-02",
    highlights: ["Cut build times by 70%"],
  },
],
```

## Customization

- Sections and order: `src/components/about/resume-sections.tsx` (shared by both pages).
- More pages like `/about/uses`: add `content/about/uses.mdx` and a route that renders
  `aboutPages.get("uses")`.

## Removal

`pnpm site remove about`, then delete `content/about` and `src/content/resume.ts`.
