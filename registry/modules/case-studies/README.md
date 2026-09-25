# case-studies

Customer stories for agencies, consultancies and B2B products.

- `/case-studies`: a grid (featured stories span two columns) built on the `project-grid`
  section.
- `/case-studies/<slug>`: header with client, industry and services; headline results as
  stats; MDX body; OG image and JSON-LD.

## Setup

Replace `content/case-studies/example.mdx`:

```mdx
---
title: Halving onboarding time for Harbor
client: Harbor
summary: One line on the outcome.
date: 2026-02-10
industry: Healthcare
services: [Research, Product design]
results:
  - { value: "2×", label: "faster onboarding" }
image: /work/harbor.jpg
featured: true
---
```

## Environment

No variables.

## Customization

- Title and description: `caseStudies` block in `site.config.ts`.
- Fields: `caseStudySchema` in `src/lib/case-studies/case-studies.ts`.
- The header nav link is labelled "Work"; rename it in `site.config.ts`.

## Removal

`pnpm site remove case-studies`.
