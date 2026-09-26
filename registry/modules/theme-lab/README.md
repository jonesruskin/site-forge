# theme-lab

A development tool at **`/lab`** for giving a site its identity in minutes.

- Drag the ten theme dials (hue, tint, accent, radius, density, shadow, motion, type scale,
  measure …) and watch typography, controls, cards, alerts, an inverted band and every token
  swatch update live.
- **Live contrast check**: WCAG ratios for text, muted text, primary buttons and borders turn
  red when a combination drops below AA.
- **Surprise me** rolls a coherent random theme for inspiration.
- **Save to theme.css** writes the dials into `src/styles/theme.css` (development only), or
  **Copy dials** to paste them anywhere.

## Setup

None. Run `pnpm dev` and open `/lab`.

## Environment

No variables.

## Customization

- Ranges and labels: `src/lib/theme-lab/dials.ts`.
- What the preview shows: `src/components/theme-lab/preview.tsx`. Add your own components to
  see them react to the dials.
- To expose the lab on a deployed preview, set `features.themeLab: true` in `site.config.ts`
  (saving stays disabled outside development).

## Removal

`pnpm site remove theme-lab`. Nothing else depends on it.
