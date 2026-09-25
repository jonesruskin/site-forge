import { LinkIcon, RssIcon } from "lucide-react";

import { PageHeader } from "@/components/sections/page-header";
import { Badge } from "@/components/ui/badge";
import { Prose } from "@/components/ui/prose";
import { changelog, changelogConfig, entryAnchor } from "@/lib/changelog/entries";
import { Mdx } from "@/lib/mdx/render";
import { createMetadata } from "@/lib/metadata";
import siteConfig from "@/site.config";

export const metadata = createMetadata({
  title: changelogConfig.title,
  description: changelogConfig.description,
  path: "/changelog",
});

const typeVariant = {
  added: "success",
  improved: "secondary",
  fixed: "outline",
  removed: "warning",
  security: "destructive",
} as const;

const dateFormat = new Intl.DateTimeFormat(siteConfig.locale, {
  dateStyle: "long",
  timeZone: "UTC",
});

export default async function ChangelogPage() {
  const entries = await changelog.all();
  return (
    <>
      <PageHeader title={changelogConfig.title} description={changelogConfig.description}>
        <a
          href="/changelog/rss.xml"
          className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-2 text-sm"
        >
          <RssIcon aria-hidden className="size-4" /> RSS feed
        </a>
      </PageHeader>
      <div className="container-page pb-24">
        <ol className="flex flex-col">
          {entries.map((entry) => {
            const anchor = entryAnchor(entry);
            return (
              <li
                key={entry.slug}
                id={anchor}
                className="grid scroll-mt-24 gap-4 border-t py-10 md:grid-cols-[12rem_1fr] md:gap-10"
              >
                <div className="flex flex-col gap-2 md:sticky md:top-24 md:self-start">
                  <time dateTime={entry.data.date} className="text-muted-foreground text-sm">
                    {dateFormat.format(new Date(entry.data.date))}
                  </time>
                  {entry.data.version && (
                    <span className="font-mono text-sm">v{entry.data.version}</span>
                  )}
                </div>
                <article className="flex min-w-0 flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {entry.data.type.map((type) => (
                      <Badge key={type} variant={typeVariant[type]} className="capitalize">
                        {type}
                      </Badge>
                    ))}
                  </div>
                  <h2 className="group flex items-center gap-2 text-2xl font-semibold tracking-tight">
                    {entry.data.title}
                    <a
                      href={`#${anchor}`}
                      className="text-muted-foreground opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
                    >
                      <LinkIcon aria-hidden className="size-4" />
                      <span className="sr-only">Link to {entry.data.title}</span>
                    </a>
                  </h2>
                  <Prose>
                    <Mdx source={entry.body} />
                  </Prose>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
}
