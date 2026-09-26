import type { MetadataRoute } from "next";
import { z } from "zod";

import { defineCollection, type Entry } from "@/lib/mdx/collection";
import { absoluteUrl } from "@/lib/url";
import siteConfig from "@/site.config";

const image = z.object({ src: z.string().min(1), alt: z.string().default("") });

export const projectSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  year: z.coerce.number().int(),
  role: z.string().optional(),
  client: z.string().optional(),
  stack: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  status: z.enum(["shipped", "maintained", "in-progress", "archived"]).optional(),
  links: z
    .object({
      live: z.url().optional(),
      source: z.url().optional(),
      writeup: z.string().optional(),
    })
    .default({}),
  cover: image.optional(),
  /** A strip of screenshots or photos under the header. */
  gallery: z.array(image).default([]),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
});

export type Project = Entry<z.output<typeof projectSchema>>;

export const projects = defineCollection({
  directory: "projects",
  schema: projectSchema,
  sort: (a, b) =>
    Number(b.data.featured) - Number(a.data.featured) ||
    b.data.year - a.data.year ||
    a.data.title.localeCompare(b.data.title),
});

export const projectsConfig = z
  .object({ title: z.string().default("Projects"), description: z.string().default("") })
  .parse((siteConfig as { projects?: unknown }).projects ?? {});

/** URL-safe tag: "Open source" → "open-source". */
export function tagSlug(tag: string) {
  return tag
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-");
}

/** Every tag with its count, most used first. */
export async function projectTags() {
  const counts = new Map<string, { tag: string; slug: string; count: number }>();
  for (const project of await projects.all()) {
    for (const tag of project.data.tags) {
      const slug = tagSlug(tag);
      const current = counts.get(slug) ?? { tag, slug, count: 0 };
      current.count++;
      counts.set(slug, current);
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** Previous and next projects in grid order, wrapping around. */
export async function neighbours(slug: string) {
  const all = await projects.all();
  const index = all.findIndex((project) => project.slug === slug);
  if (index === -1 || all.length < 2) return { previous: null, next: null };
  // With two projects, "previous" and "next" would be the same one.
  if (all.length === 2) return { previous: null, next: all[1 - index]! };
  return {
    previous: all[(index - 1 + all.length) % all.length]!,
    next: all[(index + 1) % all.length]!,
  };
}

export function toCard(project: Project) {
  return {
    title: project.data.title,
    href: `/projects/${project.slug}`,
    summary: project.data.summary,
    image: project.data.cover,
    year: project.data.year,
    tags: project.data.tags,
    featured: project.data.featured,
  };
}

export async function projectsSitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    { url: absoluteUrl("/projects"), changeFrequency: "monthly", priority: 0.8 },
    ...(await projects.all()).map((project) => ({
      url: absoluteUrl(`/projects/${project.slug}`),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
