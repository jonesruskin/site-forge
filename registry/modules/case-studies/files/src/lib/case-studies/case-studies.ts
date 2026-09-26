import type { MetadataRoute } from "next";
import { z } from "zod";

import { dateField, defineCollection, type Entry } from "@/lib/mdx/collection";
import { absoluteUrl } from "@/lib/url";
import siteConfig from "@/site.config";

export const caseStudySchema = z.object({
  title: z.string().min(1),
  client: z.string().min(1),
  summary: z.string().min(1),
  date: dateField,
  industry: z.string().optional(),
  services: z.array(z.string()).default([]),
  results: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
});

export type CaseStudy = Entry<z.output<typeof caseStudySchema>>;

export const caseStudies = defineCollection({
  directory: "case-studies",
  schema: caseStudySchema,
  sort: (a, b) =>
    Number(b.data.featured) - Number(a.data.featured) || b.data.date.localeCompare(a.data.date),
});

export const caseStudiesConfig = z
  .object({ title: z.string().default("Case studies"), description: z.string().default("") })
  .parse((siteConfig as { caseStudies?: unknown }).caseStudies ?? {});

export async function caseStudiesSitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    { url: absoluteUrl("/case-studies"), changeFrequency: "monthly", priority: 0.7 },
    ...(await caseStudies.all()).map((study) => ({
      url: absoluteUrl(`/case-studies/${study.slug}`),
      lastModified: study.data.date,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
