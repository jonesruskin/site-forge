# Theming: an identity in ten minutes

Every site-forge project has exactly one file that decides how it looks:
`src/styles/theme.css`. Components never contain colors, fonts or shadows; they read
semantic tokens (`bg-background`, `text-muted-foreground`, `rounded-lg`, `shadow-md`,
`text-display` …). The theme file works at two levels.

```
dials (10 numbers)  ──derive──▶  semantic tokens (colors, type, elevation, motion)  ──▶  Tailwind utilities
```

## 1. Turn the dials (2 minutes)

| Dial                      | Range      | What it does                                                                                     |
| ------------------------- | ---------- | ------------------------------------------------------------------------------------------------ |
| `--dial-hue`              | 0–360      | The hue every surface and accent leans toward.                                                   |
| `--dial-tint`             | 0–0.04     | How much the neutrals pick up the hue. `0` is pure gray; `0.02` is a warm or cool paper.         |
| `--dial-accent`           | 0–0.3      | Chroma of the primary color. `0` is monochrome ink; `0.18` is a confident brand color.           |
| `--dial-accent-hue`       | 0–360      | Primary hue if it should differ from the surface hue (complementary accents).                    |
| `--dial-accent-lightness` | 0.2–0.7    | Inky primary (`0.2`) … bright primary (`0.65`). Dark mode mirrors it automatically.              |
| `--dial-radius`           | 0–1.5rem   | Every `rounded-*` utility is a multiple of this.                                                 |
| `--dial-density`          | 0.85–1.2   | Scales **every** spacing utility (padding, gaps, heights). Compact dashboards vs airy editorial. |
| `--dial-shadow`           | 0–2.5      | Multiplies shadow opacity. `0` is flat; `2` is dramatic, layered cards.                          |
| `--dial-motion`           | 0–2        | Multiplies transition durations. Forced to near-zero for `prefers-reduced-motion`.               |
| `--dial-type-scale`       | 0.85–1.25  | Scales display and heading sizes.                                                                |
| `--dial-measure`          | e.g. 72rem | Max content width (`container-page`, `max-w-measure`).                                           |

The fastest way to find values is the **theme lab**: with the `theme-lab` module installed, run
`pnpm dev` and open `/lab`. Drag the dials, watch real components update, then press
**Copy theme.css**. The lab is excluded from production builds.

Or start from an example with the CLI:

```sh
pnpm site theme editorial   # or: neutral, playful, terminal
```

## 2. Pick typefaces (3 minutes)

Fonts are loaded by `next/font` in `src/lib/fonts.ts`, which exposes CSS variables. The theme
maps them to three roles:

```css
--typeface-body: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
--typeface-display: var(--font-fraunces), Georgia, serif;
--typeface-mono: var(--font-jetbrains-mono), ui-monospace, monospace;
```

```ts
// src/lib/fonts.ts
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";

const body = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const display = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const fontVariables = [body.variable, display.variable, mono.variable].join(" ");
```

Display type has its own role tokens (`--type-display-weight`, `--type-display-tracking`,
`--type-heading-*`, `--type-eyebrow-transform` …). A serif at weight 400 with tighter tracking
gives an editorial look; a grotesk at 700 in uppercase gives a poster look.

## 3. Override single tokens (5 minutes)

Dials derive a coherent palette, but any token can be set directly. Add overrides **below**
the derived values in `:root` (light) and `.dark`:

```css
:root {
  --primary: oklch(0.62 0.19 35); /* exact brand orange */
  --primary-foreground: oklch(0.99 0 0);
  --border: oklch(0.2 0 0); /* hard black borders for a brutalist look */
}
```

Available semantic tokens: `background foreground card card-foreground popover
popover-foreground muted muted-foreground accent accent-foreground primary
primary-foreground secondary secondary-foreground border input ring destructive
destructive-foreground success success-foreground warning warning-foreground`, plus
`--elevation-{xs,sm,md,lg}`, `--motion-{fast,base,slow}`, `--motion-ease`, `--type-*`.

## 4. Imagery

Sections take images as props (`next/image` sources) and never ship stock art. A consistent
treatment goes a long way: pick one aspect ratio for all cards, and one of photos,
illustrations or abstract gradients. Don't mix them.

## Recipes

| Look       | Dials                                                                                     |
| ---------- | ----------------------------------------------------------------------------------------- |
| Quiet SaaS | `hue 250, tint 0.008, accent 0.16, accent-lightness 0.5, radius 0.5rem`                   |
| Editorial  | `hue 60, tint 0.012, accent 0, radius 0, density 1.1, type-scale 1.15` + serif display    |
| Playful    | `hue 330, tint 0.02, accent 0.22, accent-lightness 0.62, radius 1.25rem, shadow 1.6`      |
| Terminal   | `hue 145, tint 0.02, accent 0.18, accent-lightness 0.7, radius 0, motion 0.2` + mono body |
| Luxury     | `hue 80, tint 0.01, accent 0.06, accent-lightness 0.3, radius 0, density 1.2, motion 1.6` |

## Rules that keep sites restylable

- No color, font or shadow literals in components. `scripts/validate-registry.ts` enforces this
  for the registry. Keep the same rule in your site.
- Don't add `dark:` color overrides. Tokens already switch; `dark:` is only for show/hide.
- New colors become tokens: add `--brand-2` to `theme.css`, map it in `globals.css` under
  `@theme inline` as `--color-brand-2: var(--brand-2)`, then use `bg-brand-2`.
