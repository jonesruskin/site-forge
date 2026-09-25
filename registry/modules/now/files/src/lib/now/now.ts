import type { MetadataRoute } from "next";
import { z } from "zod";

import { dateField, defineCollection } from "@/lib/mdx/collection";
import { absoluteUrl } from "@/lib/url";
import siteConfig from "@/site.config";

/** content/now/<yyyy-mm-dd>.mdx, newest first. */
export const nowEntries = defineCollection({
  directory: "now",
  schema: z.object({
    date: dateField,
    location: z.string().optional(),
    draft: z.boolean().default(false),
  }),
  sort: (a, b) => b.data.date.localeCompare(a.data.date),
});

export const nowConfig = z
  .object({
    title: z.string().default("Now"),
    description: z.string().default(""),
    /** After this many days the page says it may be out of date. 0 turns the note off. */
    staleAfterDays: z.number().int().nonnegative().default(120),
  })
  .parse((siteConfig as { now?: unknown }).now ?? {});

export function formatNowDate(iso: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(iso),
  );
}

export function daysSince(iso: string, now = Date.now()) {
  return Math.floor((now - new Date(iso).getTime()) / 86_400_000);
}

export async function nowSitemap(): Promise<MetadataRoute.Sitemap> {
  const [latest, ...older] = await nowEntries.all();
  return [
    {
      url: absoluteUrl("/now"),
      lastModified: latest?.data.date,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...older.map((entry) => ({
      url: absoluteUrl(`/now/${entry.slug}`),
      lastModified: entry.data.date,
      priority: 0.3,
    })),
  ];
}
