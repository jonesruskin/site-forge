import { blogConfig } from "@/lib/blog/config";
import { postHref, posts } from "@/lib/blog/posts";
import { renderRss, rssResponse } from "@/lib/mdx/rss";
import { absoluteUrl } from "@/lib/url";
import siteConfig from "@/site.config";

export const dynamic = "force-static";

export async function GET() {
  const all = await posts.all();
  return rssResponse(
    renderRss({
      title: `${siteConfig.name} · ${blogConfig.title}`,
      description: blogConfig.description || siteConfig.description,
      link: absoluteUrl("/blog"),
      feedUrl: absoluteUrl("/blog/rss.xml"),
      language: siteConfig.locale,
      items: all.slice(0, 50).map((post) => ({
        title: post.data.title,
        link: absoluteUrl(postHref(post)),
        date: post.data.date,
        description: post.excerpt,
        categories: post.data.tags,
      })),
    }),
  );
}
