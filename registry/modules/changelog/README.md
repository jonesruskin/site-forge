# changelog

A `/changelog` page of release notes written in MDX, plus `/changelog/rss.xml`.

- Entries are sorted by date, labelled with a version and change types (added, improved,
  fixed, removed, security), and linkable via stable anchors (`/changelog#v1-2-0`).
- The date column stays pinned while you scroll through long entries.

## Setup

Add `content/changelog/<yyyy-mm-dd>-<slug>.mdx`:

```mdx
---
title: Dark mode
date: 2026-03-14
version: 1.2.0
type: [added, improved]
---

What changed and why it matters.
```

## Environment

No variables.

## Customization

- Title and description: `changelog` block in `site.config.ts`.
- Change types and badge colors: `src/lib/changelog/entries.ts` and the page.

## Removal

`pnpm site remove changelog`.
