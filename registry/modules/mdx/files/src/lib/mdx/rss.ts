type RssItem = {
  title: string;
  /** Absolute URL. */
  link: string;
  /** ISO date. */
  date: string;
  description?: string;
  categories?: string[];
};

type RssChannel = {
  title: string;
  description: string;
  /** Absolute URL of the site section. */
  link: string;
  /** Absolute URL of the feed itself. */
  feedUrl: string;
  language?: string;
  items: RssItem[];
};

function escape(value: string) {
  return value.replace(
    /[<>&'"]/g,
    (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char]!,
  );
}

/** RSS 2.0 feed XML. Serve it from a route handler with Content-Type application/rss+xml. */
export function renderRss(channel: RssChannel) {
  const items = channel.items
    .map(
      (item) => `    <item>
      <title>${escape(item.title)}</title>
      <link>${escape(item.link)}</link>
      <guid isPermaLink="true">${escape(item.link)}</guid>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>${item.description ? `\n      <description>${escape(item.description)}</description>` : ""}${(item.categories ?? []).map((c) => `\n      <category>${escape(c)}</category>`).join("")}
    </item>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(channel.title)}</title>
    <link>${escape(channel.link)}</link>
    <description>${escape(channel.description)}</description>
    <language>${escape(channel.language ?? "en")}</language>
    <atom:link href="${escape(channel.feedUrl)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}

export function rssResponse(xml: string) {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
