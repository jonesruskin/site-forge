# docs

Documentation that lives next to your code, written in MDX.

- **Structure from folders**: top-level files first, then one sidebar group per folder (one
  level deep: `content/docs/<group>/<page>.mdx`);
  `order` sorts pages. A folder's `index.mdx` names the group.
- **Search**: ⌘K / Ctrl+K / `/` opens a dialog backed by MiniSearch. The index is a static
  JSON file built with the site and downloaded only when search is first opened, so pages ship
  no search code until needed. Full keyboard support (combobox + listbox semantics).
- Table of contents, previous/next, "Edit this page" links, per-page OG images, breadcrumb
  JSON-LD and sitemap entries.

## Setup

Replace the example pages in `content/docs`. Set `docs.editUrl` in `site.config.ts` to enable
edit links, e.g. `https://github.com/you/repo/edit/main/`.

## Environment

No variables.

## Customization

- Frontmatter: `docSchema` in `src/lib/docs/docs.ts` (`title`, `description`, `order`,
  `sidebarTitle`, `draft`).
- Layout: `src/app/(site)/docs/layout.tsx` (sidebar) and `[[...slug]]/page.tsx` (page).
- Search ranking: field boosts in `src/components/docs/docs-search.tsx`.

## Removal

`pnpm site remove docs`.
