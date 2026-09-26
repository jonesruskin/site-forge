# blog

A complete MDX blog.

- `/blog` with static pagination (`/blog/page/2` …) and tag filters (`/blog/tags/<tag>`).
- Post pages with reading time, table of contents, previous/next links, cover images.
- Per-post Open Graph images generated from the title, plus `BlogPosting` and breadcrumb JSON-LD.
- `/blog/rss.xml` feed (latest 50) and sitemap entries for posts and tags.
- Drafts (`draft: true`) are visible in development and hidden in production.

## Setup

Write posts as `content/blog/<slug>.mdx`:

```mdx
---
title: Hello world
date: 2026-02-01
description: Optional one-liner for lists, feeds and search results.
tags: [news]
image: /blog/hello.jpg
---

Your post in Markdown + components.
```

Delete the example post `content/blog/welcome.mdx`.

## Environment

No variables.

## Customization

- Title, description and page size: the `blog` block in `site.config.ts`.
- Frontmatter fields: `postSchema` in `src/lib/blog/posts.ts` (add `series`, `canonical` …).
- List layout: `src/components/blog/post-index.tsx` (uses the `blog-list` section; switch to
  `layout="list"` for a denser index).
- Post layout: `src/app/(site)/blog/[slug]/page.tsx`.

## Removal

`pnpm site remove blog`. Removes routes, lib files and the nav entry. Your `content/blog`
posts are kept if you edited them.
