import type { MetadataRoute } from "next";
import { z } from "zod";

import { albums } from "@/content/gallery";
import { absoluteUrl } from "@/lib/url";
import siteConfig from "@/site.config";

export type Photo = {
  src: string;
  width: number;
  height: number;
  /** Describe what's in the photo for people who can't see it. */
  alt: string;
  caption?: string;
  location?: string;
  /** "2026-05-02" */
  takenAt?: string;
};

export type Album = {
  slug: string;
  title: string;
  description?: string;
  /** "2026" or "2026-05": shown on the album card. */
  date?: string;
  /** Defaults to the first photo. */
  cover?: Photo;
  photos: Photo[];
};

export const galleryConfig = z
  .object({ title: z.string().default("Gallery"), description: z.string().default("") })
  .parse((siteConfig as { gallery?: unknown }).gallery ?? {});

export function getAlbums() {
  return albums.filter((album) => album.photos.length > 0);
}

export function getAlbum(slug: string) {
  return getAlbums().find((album) => album.slug === slug) ?? null;
}

export function formatTakenAt(value?: string) {
  if (!value) return undefined;
  const date = new Date(`${value.length === 7 ? `${value}-01` : value}T00:00:00Z`);
  return new Intl.DateTimeFormat("en", {
    dateStyle: value.length === 7 ? undefined : "medium",
    ...(value.length === 7 && { month: "long", year: "numeric" }),
    timeZone: "UTC",
  }).format(date);
}

export async function gallerySitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    { url: absoluteUrl("/gallery"), changeFrequency: "monthly", priority: 0.6 },
    ...getAlbums().map((album) => ({
      url: absoluteUrl(`/gallery/${album.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.5,
      images: album.photos.map((photo) => absoluteUrl(photo.src)),
    })),
  ];
}
