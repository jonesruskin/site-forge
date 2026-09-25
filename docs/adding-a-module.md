# Adding a module

A module is a folder in `registry/modules/<name>/`:

```
registry/modules/reviews/
├─ module.json      manifest (validated against registry/schema/module.schema.json)
├─ README.md        What it does · Setup · Environment · Usage · Customization · Removal
└─ files/           mirrors the project: files/src/lib/reviews/… → src/lib/reviews/…
```

## 1. Start from a small module

Copy `registry/modules/contact` or `registry/modules/faq`, rename, and edit `module.json`:

```json
{
  "$schema": "../../schema/module.schema.json",
  "name": "reviews",
  "version": "1.0.0",
  "title": "Product reviews",
  "description": "Star ratings and written reviews on product pages, moderated in the admin.",
  "category": "commerce",
  "requires": ["auth", "database"],
  "ui": ["button", "textarea", "field"],
  "files": [
    "src/db/schema/reviews.ts",
    "src/lib/reviews/reviews.ts",
    "src/components/reviews/review-form.tsx"
  ],
  "dbSchema": ["src/db/schema/reviews.ts"],
  "dependencies": {},
  "env": [],
  "contributes": {
    "slots": [
      { "slot": "sitemap", "import": "reviewsSitemap", "from": "src/lib/reviews/reviews.ts" }
    ],
    "siteConfig": { "reviews": { "moderation": true } }
  },
  "routes": [],
  "postInstall": ["Render <ReviewForm productId={…} /> on a product page."]
}
```

## 2. Follow the rules

- **Imports**: only the starter, your own files, modules in `requires`, and the `ui`/`sections`
  you list. Need something optional? Use or create a **slot** instead.
- **Config**: read your block from `site.config.ts` with a Zod schema and defaults
  (`(siteConfig as { reviews?: unknown }).reviews ?? {}`), so a missing block still works.
- **Env vars**: list them in `module.json#env` _and_ in `src/env/<name>.ts` exporting
  `<camelName>Env`. `required: true` means required in production; development must work
  without them (fall back to a local stand-in).
- **DB schema**: relative imports only, explicit snake_case column names.
- **Tokens only**: semantic Tailwind utilities, no palette colors, no hex values, no `dark:`
  color overrides, no font names.
- **Accessibility**: labelled controls, focus states, keyboard support.
- **No TODOs, no fake data** in module code (content modules may ship one example entry).
- Don't re-declare starter dependencies.
- Bump `version` whenever files change: it's how projects learn about updates.

## 3. Validate, generate, test

```sh
pnpm validate          # manifest, imports, env, tokens, README
pnpm playground:sync   # regenerate the playground with every module
pnpm install
cd apps/playground && pnpm typecheck && pnpm lint && SKIP_ENV_VALIDATION=1 pnpm build
pnpm test:e2e          # add a spec in e2e/ for your module's main flow
```

If a preset should include it, add it to `registry/presets/<preset>.json` and run
`pnpm build:preset <preset>`.

## Slots you can use

| Slot                                                 | Owner                | Contribution                                                   |
| ---------------------------------------------------- | -------------------- | -------------------------------------------------------------- |
| `providers`                                          | starter              | Client provider wrapping the app                               |
| `body-end`                                           | starter              | Component at the end of `<body>` (banners, scripts)            |
| `header-actions`                                     | starter              | Component in the site header                                   |
| `next-plugins`                                       | starter              | `(config) => config` wrapper for `next.config`                 |
| `proxy`                                              | starter              | `(request, response) => Response \| undefined` request handler |
| `html-lang`                                          | starter              | Resolver for `<html lang>`                                     |
| `error-reporters`                                    | starter              | Called with errors caught by React error boundaries            |
| `sitemap`                                            | seo                  | `() => Promise<MetadataRoute.Sitemap>`                         |
| `auth-plugins`, `auth-client-plugins`, `auth-events` | auth                 | Better Auth plugins; `user.created`/`user.verified` handlers   |
| `dashboard-widgets`, `dashboard-topbar`              | dashboard            | Server components receiving `{ userId }`                       |
| `payment-webhooks`                                   | payments             | `(event: PaymentEvent) => Promise<void>` (idempotent)          |
| `email-templates`                                    | transactional-emails | React Email components with `PreviewProps` for `/dev/emails`   |
| `onboarding-tasks`                                   | onboarding           | `{ id, title, href, done(userId) }` checklist items            |

Define your own with `"slots": { "<name>": { file, export, type, typeImports, description } }`.
