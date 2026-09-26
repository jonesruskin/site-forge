import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/url";

import { docHref, docs } from "./docs";

export async function docsSitemap(): Promise<MetadataRoute.Sitemap> {
  return (await docs.all()).map((doc) => ({
    url: absoluteUrl(docHref(doc)),
    changeFrequency: "weekly",
    priority: doc.slug ? 0.6 : 0.8,
  }));
}
