# gallery

Photo albums that feel good on a phone.

- **`/gallery`**: album cards (skipped automatically when there's only one album).
- **`/gallery/<album>`**: masonry columns that keep each photo's shape, with captions.
- **Lightbox** built on the native `<dialog>`: focus is trapped and restored for free,
  <kbd>←</kbd>/<kbd>→</kbd>/<kbd>Home</kbd>/<kbd>End</kbd> navigate, <kbd>Esc</kbd> closes,
  swipes work on touch screens, neighbours are preloaded, and the URL updates to `#photo-3` so
  any single photo can be shared.
- Optimized, lazy-loaded images through `next/image`, `ImageGallery` JSON-LD, and image entries in
  the sitemap.

## Setup

1. Put photos in `public/gallery/<album>/` (or on an image CDN).
2. List them in `src/content/gallery.ts`, with pixel `width` and `height` and a real `alt`
   description:

   ```ts
   {
     slug: "iceland-2026",
     title: "Iceland",
     date: "2026-03",
     photos: [
       { src: "/gallery/iceland/01.jpg", width: 3000, height: 2000, alt: "…", caption: "Vík", takenAt: "2026-03-14" },
     ],
   }
   ```

3. Delete the sample SVGs in `public/gallery/`.

Tip: `sips -g pixelWidth -g pixelHeight *.jpg` (macOS) or `identify *.jpg` (ImageMagick) prints
sizes.

## Environment

No variables.

## Usage

Page titles: `site.config.ts → gallery`. Remote images need their host in
`images.remotePatterns` in `next.config.ts`.

## Customization

- Column count: `columns-*` classes in `src/components/gallery/photo-grid.tsx`.
- Lightbox chrome (counter, caption, buttons): same file.

## Removal

`pnpm site remove gallery`, then delete your photos from `public/gallery/`.
