import type { Album } from "@/lib/gallery/gallery";

/**
 * Your albums. Width and height are the image's pixel size (they reserve space
 * so nothing jumps while photos load). The sample images are placeholders.
 */
export const albums: Album[] = [
  {
    slug: "coastlines",
    title: "Coastlines",
    description: "Placeholder album. Replace these with your own photos.",
    date: "2026-05",
    photos: [
      {
        src: "/gallery/dunes.svg",
        width: 1200,
        height: 800,
        alt: "Wind-shaped dunes at dusk",
        caption: "Dunes",
        location: "Somewhere windy",
        takenAt: "2026-05-02",
      },
      {
        src: "/gallery/tidepool.svg",
        width: 800,
        height: 1100,
        alt: "Ripples across a tide pool",
        caption: "Tide pool",
      },
      {
        src: "/gallery/basalt.svg",
        width: 1000,
        height: 1000,
        alt: "Layers of dark basalt",
        caption: "Basalt",
        location: "North shore",
      },
      {
        src: "/gallery/estuary.svg",
        width: 1200,
        height: 900,
        alt: "An estuary meeting the sea",
        caption: "Estuary",
      },
      {
        src: "/gallery/kelp.svg",
        width: 900,
        height: 1200,
        alt: "Kelp swaying in shallow water",
        caption: "Kelp forest",
        takenAt: "2026-05-04",
      },
      {
        src: "/gallery/fog.svg",
        width: 1200,
        height: 700,
        alt: "Fog rolling over a headland",
        caption: "Morning fog",
      },
    ],
  },
];
