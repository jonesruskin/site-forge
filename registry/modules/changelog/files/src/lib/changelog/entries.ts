import { z } from "zod";

import { dateField, defineCollection, type Entry } from "@/lib/mdx/collection";
import siteConfig from "@/site.config";

export const changeTypes = ["added", "improved", "fixed", "removed", "security"] as const;

export const changelogSchema = z.object({
  title: z.string().min(1),
  date: dateField,
  version: z.string().optional(),
  type: z.array(z.enum(changeTypes)).default([]),
  draft: z.boolean().default(false),
});

export type ChangelogEntry = Entry<z.output<typeof changelogSchema>>;

export const changelog = defineCollection({
  directory: "changelog",
  schema: changelogSchema,
  sort: (a, b) => b.data.date.localeCompare(a.data.date),
});

/** Stable anchor for an entry: the version when present, else the slug. */
export function entryAnchor(entry: ChangelogEntry) {
  return entry.data.version ? `v${entry.data.version.replace(/\./g, "-")}` : entry.slug;
}

export const changelogConfig = z
  .object({ title: z.string().default("Changelog"), description: z.string().default("") })
  .parse((siteConfig as { changelog?: unknown }).changelog ?? {});
