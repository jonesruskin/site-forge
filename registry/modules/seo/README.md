# seo

Everything search engines and social networks need, with no configuration:

- **`/sitemap.xml`**: the home page, every internal link in the header/footer/legal nav, plus
  entries contributed by content modules (blog posts, docs pages, projects …) through the
  `sitemap` slot.
- **`/robots.txt`**: allows crawling only on the production deployment (`VERCEL_ENV=production`,
  or `NODE_ENV=production` off Vercel). Preview deployments are never indexed. Always blocks
  `/api/`, `/dev/`, `/dashboard`, `/admin`, `/settings`.
- **Open Graph images**: a default card generated from `site.config.ts`, and `renderOgImage()`
  for per-page cards (content modules use it).
- **JSON-LD**: `<JsonLd data={…} />` plus builders for Organization, WebSite, Person,
  BlogPosting, BreadcrumbList, FAQPage, Product and SoftwareApplication. Organization + WebSite
  are rendered on every page automatically.

## Setup

None. Make sure `url` in `site.config.ts` (or `NEXT_PUBLIC_SITE_URL`) is your production URL.

## Environment

No variables of its own. Reads `VERCEL_ENV` when deployed on Vercel.

## Customization

- Social card design: `src/lib/seo/og-image.tsx`; colors in `src/lib/seo/og-theme.ts`
  (the renderer can't read CSS variables). Use a static image instead by setting `seo.ogImage`.
- Crawl rules: `DISALLOW` in `src/app/robots.ts`.
- Add sitemap entries from your own code: export a function returning `MetadataRoute.Sitemap`
  and list it in a module manifest's `contributes.slots` (`"slot": "sitemap"`), or add it to
  `src/app/sitemap.ts` directly.

## Removal

`pnpm site remove seo`. Content modules that render JSON-LD or OG images require it.
