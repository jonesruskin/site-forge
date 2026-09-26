import { z } from "zod";

import { dateField, defineCollection, type Entry } from "@/lib/mdx/collection";

import { blogConfig } from "./config";

export const postSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  date: dateField,
  updated: dateField.optional(),
  tags: z.array(z.string()).default([]),
  /** Path in /public or absolute URL; used as cover and social image. */
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  author: z.string().optional(),
  draft: z.boolean().default(false),
});

export type Post = Entry<z.output<typeof postSchema>>;

export const posts = defineCollection({
  directory: "blog",
  schema: postSchema,
  sort: (a, b) => b.data.date.localeCompare(a.data.date),
});

export function tagSlug(tag: string) {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function allTags() {
  const counts = new Map<string, { name: string; count: number }>();
  for (const post of await posts.all()) {
    for (const tag of post.data.tags) {
      const slug = tagSlug(tag);
      counts.set(slug, { name: tag, count: (counts.get(slug)?.count ?? 0) + 1 });
    }
  }
  return [...counts.entries()]
    .map(([slug, value]) => ({ slug, ...value }))
    .sort((a, b) => b.count - a.count);
}

export async function postsPage(page: number) {
  const all = await posts.all();
  const pageCount = Math.max(1, Math.ceil(all.length / blogConfig.postsPerPage));
  const start = (page - 1) * blogConfig.postsPerPage;
  return { posts: all.slice(start, start + blogConfig.postsPerPage), page, pageCount };
}

/** The previous (older) and next (newer) posts around `slug`. */
export async function adjacentPosts(slug: string) {
  const all = await posts.all();
  const index = all.findIndex((post) => post.slug === slug);
  return {
    newer: index > 0 ? all[index - 1] : undefined,
    older: index >= 0 ? all[index + 1] : undefined,
  };
}

export function postHref(post: Post) {
  return `/blog/${post.slug}`;
}
