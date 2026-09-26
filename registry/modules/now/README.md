# now

A [now page](https://nownownow.com/about): what you're focused on at the moment.

- **`/now`** shows the newest entry with "Updated September 1, 2026 (24 days ago)" and where you
  were. It re-renders daily so that line stays true.
- When the newest entry is older than `staleAfterDays` (default 120), the page says so plainly
  instead of pretending.
- Older entries become an archive (`/now/<date>`), so the page doubles as a light journal.

## Setup

Add `content/now/<yyyy-mm-dd>.mdx` whenever things change:

```mdx
---
date: 2026-09-01
location: Lisbon
---

- Working on …
- Reading …
```

Delete the two example entries.

## Environment

No variables.

## Usage

Titles and the staleness threshold: `site.config.ts → now`. The module adds "Now" to the footer;
many people also link it from their about page.

## Customization

Layout: `src/app/(site)/now/page.tsx`.

## Removal

`pnpm site remove now`, then delete `content/now`.
