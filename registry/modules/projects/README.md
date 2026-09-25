# projects

A portfolio of work, written in MDX.

- **`/projects`**: grid (featured projects span two columns) with a tag filter bar.
- **`/projects/tags/<tag>`**: a static page per tag, so filtered views are linkable and indexed.
- **`/projects/<slug>`**: year, role, client, stack and status; links to the live site, source
  and write-up; the story in MDX; a swipeable photo strip; previous/next navigation;
  `CreativeWork` JSON-LD and a generated Open Graph image.
- Projects appear in the sitemap.

## Setup

Add `content/projects/<slug>.mdx`:

```mdx
---
title: Field Notes
summary: One sentence that sells it.
year: 2026
role: Design & engineering
client: Acme # optional
stack: [Next.js, SQLite]
tags: [Product, Mobile]
status: shipped # shipped | maintained | in-progress | archived
links:
  live: https://…
  source: https://github.com/…
cover: { src: /images/field-notes/cover.jpg, alt: The app on a phone }
gallery:
  - { src: /images/field-notes/1.jpg, alt: Sketch mode }
featured: true
draft: false # drafts are hidden in production
---

The story…
```

## Environment

No variables.

## Usage

Page titles live in `site.config.ts → projects`. Show recent work on the home page with the
same data:

```tsx
import { ProjectGrid } from "@/components/sections/project-grid";
import { projects, toCard } from "@/lib/projects/projects";

<ProjectGrid title="Selected work" projects={(await projects.all()).slice(0, 4).map(toCard)} />;
```

## Customization

- Card layout: `src/components/sections/project-grid.tsx`.
- Detail layout: `src/app/(site)/projects/[slug]/page.tsx`.
- Remote images: add their hosts to `images.remotePatterns` in `next.config.ts`.

## Removal

`pnpm site remove projects`, then delete `content/projects`.
