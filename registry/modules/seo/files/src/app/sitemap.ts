import type { MetadataRoute } from "next";

import { sitemapSources } from "@/generated/sitemap";
import { absoluteUrl, isExternal } from "@/lib/url";
import siteConfig from "@/site.config";

/** Static pages from the navigation plus entries contributed by content modules. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { header, footer, legal } = siteConfig.nav;
  const paths = new Set<string>(["/"]);
  for (const link of [...header, ...footer.flatMap((group) => group.links), ...legal]) {
    if (!isExternal(link.href) && !link.href.includes("#")) paths.add(link.href);
  }

  const pages: MetadataRoute.Sitemap = [...paths].map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));

  const contributed = (await Promise.all(sitemapSources.map((source) => source()))).flat();
  const seen = new Set(pages.map((page) => page.url));
  return [...pages, ...contributed.filter((entry) => !seen.has(entry.url) && seen.add(entry.url))];
}
