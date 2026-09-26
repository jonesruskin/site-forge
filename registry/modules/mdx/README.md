# mdx

The content engine behind blog, docs, changelog, legal pages, case studies and projects. You own
the code: a ~100-line loader, no build plugin, no `next.config` changes.

- `defineCollection({ directory, schema })` reads `content/<directory>/**/*.mdx`, validates
  frontmatter with Zod (the build fails with file path and issue), hides `draft: true` entries
  in production, and computes slug, excerpt, reading time and headings.
- `<Mdx source={entry.body} />` renders on the server with GFM, heading anchors and code
  highlighting (no MDX runtime is sent to the browser).
- **Token-themed code**: Shiki emits CSS variables that `CodeBlock` maps to your theme tokens.
  A neutral theme gets monochrome code, and an accented theme gets colorful code, with no
  extra CSS.
- `<TableOfContents headings={entry.headings} />`, `<Callout type="warning">`, copy buttons
  on code blocks, and `renderRss()` for feeds.

## Setup

None. Content modules (blog, docs …) define their own collections.

## Environment

No variables.

## Usage

```ts
import { z } from "zod";
import { dateField, defineCollection } from "@/lib/mdx/collection";

export const notes = defineCollection({
  directory: "notes",
  schema: z.object({ title: z.string(), date: dateField, draft: z.boolean().default(false) }),
  sort: (a, b) => b.data.date.localeCompare(a.data.date),
});

const all = await notes.all();
const note = await notes.get("my-first-note");
```

```tsx
<Prose>
  <Mdx source={note.body} components={{ Chart }} scope={{ site: siteConfig }} />
</Prose>
```

## Customization

- Element mapping and shortcodes: `src/components/mdx/mdx-components.tsx`.
- Plugins: `src/lib/mdx/render.tsx` (add remark/rehype plugins there).
- Code colors: `tokenColors` in `src/components/mdx/code-block.tsx`.

## Removal

`pnpm site remove mdx` after removing the content modules that require it. Delete `/content`
if you no longer need it.
