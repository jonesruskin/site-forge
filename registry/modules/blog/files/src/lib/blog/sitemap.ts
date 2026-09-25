import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/url";

import { allTags, postHref, posts } from "./posts";

export async function blogSitemap(): Promise<MetadataRoute.Sitemap> {
  const [all, tags] = await Promise.all([posts.all(), allTags()]);
  return [
    { url: absoluteUrl("/blog"), changeFrequency: "weekly", priority: 0.8 },
    ...all.map((post) => ({
      url: absoluteUrl(postHref(post)),
      lastModified: post.data.updated ?? post.data.date,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...tags.map((tag) => ({
      url: absoluteUrl(`/blog/tags/${tag.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.4,
    })),
  ];
}
