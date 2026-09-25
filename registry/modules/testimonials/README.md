# testimonials

A single, typed source for testimonials so the same quotes can appear on the home page,
pricing page and a dedicated `/testimonials` wall.

## Setup

Edit `content/testimonials.json`:

```json
[
  {
    "quote": "…",
    "name": "Ada Lovelace",
    "role": "CTO, Analytical",
    "avatar": "/people/ada.jpg",
    "featured": true,
    "tags": ["pricing"]
  }
]
```

The file is validated at build time; a typo fails the build with a clear message.

## Environment

No variables.

## Usage

```tsx
import { Testimonials } from "@/components/sections/testimonials";
import { getTestimonials } from "@/lib/testimonials";

<Testimonials
  title="Loved by teams"
  testimonials={await getTestimonials({ tag: "pricing", limit: 3 })}
/>;
```

## Customization

- Fields: `testimonialSchema` in `src/lib/testimonials.ts`.
- Page title and description: `testimonials` block in `site.config.ts`.

## Removal

`pnpm site remove testimonials`.
