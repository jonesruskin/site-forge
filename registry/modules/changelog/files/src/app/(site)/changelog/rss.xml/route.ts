import { changelog, changelogConfig, entryAnchor } from "@/lib/changelog/entries";
import { renderRss, rssResponse } from "@/lib/mdx/rss";
import { absoluteUrl } from "@/lib/url";
import siteConfig from "@/site.config";

export const dynamic = "force-static";

export async function GET() {
  const entries = await changelog.all();
  return rssResponse(
    renderRss({
      title: `${siteConfig.name} · ${changelogConfig.title}`,
      description: changelogConfig.description || siteConfig.description,
      link: absoluteUrl("/changelog"),
      feedUrl: absoluteUrl("/changelog/rss.xml"),
      language: siteConfig.locale,
      items: entries.map((entry) => ({
        title: entry.data.version ? `${entry.data.version}: ${entry.data.title}` : entry.data.title,
        link: absoluteUrl(`/changelog#${entryAnchor(entry)}`),
        date: entry.data.date,
        description: entry.excerpt,
        categories: entry.data.type,
      })),
    }),
  );
}
