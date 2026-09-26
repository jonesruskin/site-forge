# site-forge

**Ship a new website in minutes, and own every line of it.**

site-forge is a registry of production-ready website modules and a CLI that copies exactly the
ones a site needs into a fresh repository. No framework to upgrade, no package to fight: the
code lands in your repo, like [shadcn/ui](https://ui.shadcn.com) but for whole features — auth,
billing, teams, a blog, a store, a gallery, analytics, maintenance mode.

```sh
npx @site-forge/create-site my-site --preset saas
cd my-site && pnpm dev
```

That's a SaaS with sign-up, a dashboard, Stripe billing, teams, an admin panel, API keys and
onboarding — running locally **without a single API key** (embedded Postgres, an email outbox,
a mock checkout). Add the keys when you deploy.

## Presets

| Preset          | For                                                                                           |
| --------------- | --------------------------------------------------------------------------------------------- |
| `saas`          | Subscription products: auth, dashboard, billing, teams, admin, API, onboarding, notifications |
| `landing`       | One page that explains, convinces and converts                                                |
| `portfolio`     | Makers: projects, about + printable résumé, now page, gallery, link-in-bio                    |
| `blog`          | Writing-first: tags, RSS, OG images, newsletter                                               |
| `agency`        | Studios: services, case studies, process, contact                                             |
| `docs`          | Product documentation with search and a changelog                                             |
| `waitlist`      | Pre-launch sign-ups with referral positions                                                   |
| `digital-store` | Sell guides and templates: Stripe checkout, signed download links                             |

Or start bare and pick à la carte: `npx @site-forge/create-site my-site` asks what you need.
Everything available is in the [catalog](docs/catalog.md): 43 modules, 28 sections, 29 UI
primitives, 4 themes.

## Grow it later

```sh
pnpm site add newsletter section:faq     # add features, sections, primitives
pnpm site diff                           # what changed upstream, what you changed
pnpm site update                         # take updates; your edited files are kept
pnpm site remove waitlist                # clean removal, works offline
pnpm site doctor                         # env vars, secrets in git, stale files, updates
pnpm site theme editorial                # or: pnpm site theme --hue 250 --radius 1rem
```

## What makes it different

- **Yours from the first commit.** Files are copied, hashed and tracked, so the CLI can update a
  project you've customized for months without touching your edits.
- **Works before you configure anything.** Every service has a local stand-in, and production
  refuses to start without what it needs (`pnpm env:check` tells you exactly what's missing).
- **Unbranded by design.** Every visual decision flows from a handful of theme dials (hue,
  radius, density, motion, type scale). Components use semantic tokens only, so a site gets its
  own identity in minutes: see [theming](docs/theming.md), or drag the dials live in `/lab`.
- **Modules that know each other, without depending on each other.** Integrations go through
  generated _slots_: billing adds a checklist task to onboarding, the store adds its email to the
  template gallery, Sentry receives errors from React boundaries — and removing any of them
  leaves a working project.
- **Proven, not promised.** CI generates every preset into an empty directory and requires it to
  install, typecheck, lint and build; a playground with all 43 modules runs ~180 Playwright
  tests, including axe accessibility checks in light and dark mode.
- **Ready for AI pair programming.** Generated sites include `AGENTS.md`/`CLAUDE.md` with their
  conventions, and every module's README travels with the code in `.site/modules/`.

## Stack

Next.js 16 (App Router) · TypeScript (strict) · Tailwind CSS 4 with OKLCH tokens · Radix
primitives · Zod + t3-env · Drizzle ORM + Postgres (PGlite locally) · Better Auth · Resend +
React Email · Stripe behind a provider adapter · MDX · Vitest · Playwright.

## Documentation

- [Catalog](docs/catalog.md): every preset, module, section, primitive and theme
- [CLI reference](docs/cli.md)
- [Architecture](docs/architecture.md): registry, resolution, slots, the project manifest
- [Theming](docs/theming.md): an identity in ten minutes
- [Adding a module](docs/adding-a-module.md)
- [Cloud workflow](docs/cloud.md): no local machine required, secrets, releasing

## Working on site-forge

```sh
pnpm install
pnpm validate              # registry rules
pnpm check                 # typecheck, lint, unit tests
pnpm playground:sync       # generate apps/playground with every module
pnpm install && pnpm --filter playground dev
pnpm test:e2e              # Playwright against the playground build
pnpm build:preset saas     # generate + build a preset like a user would
```

Conventions for contributors (human or AI) are in [CLAUDE.md](CLAUDE.md).

## License

[MIT](LICENSE)
