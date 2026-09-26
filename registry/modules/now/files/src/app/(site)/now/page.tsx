import Link from "next/link";

import { PageHeader } from "@/components/sections/page-header";
import { Prose } from "@/components/ui/prose";
import { Mdx } from "@/lib/mdx/render";
import { createMetadata } from "@/lib/metadata";
import { daysSince, formatNowDate, nowConfig, nowEntries } from "@/lib/now/now";

// Re-rendered daily so "updated N days ago" and the staleness note stay true.
export const revalidate = 86400;

export const metadata = createMetadata({
  title: nowConfig.title,
  description: nowConfig.description,
  path: "/now",
});

function ago(days: number) {
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 60) return `${days} days ago`;
  return `${Math.round(days / 30)} months ago`;
}

export default async function NowPage() {
  const [latest, ...older] = await nowEntries.all();
  if (!latest) {
    return (
      <>
        <PageHeader title={nowConfig.title} description={nowConfig.description} />
        <p className="container-page text-muted-foreground pb-24">Nothing here yet.</p>
      </>
    );
  }
  const age = daysSince(latest.data.date);
  const stale = nowConfig.staleAfterDays > 0 && age > nowConfig.staleAfterDays;

  return (
    <>
      <PageHeader title={nowConfig.title} description={nowConfig.description}>
        <p className="text-muted-foreground text-sm">
          Updated <time dateTime={latest.data.date}>{formatNowDate(latest.data.date)}</time> (
          {ago(age)}){latest.data.location && ` · ${latest.data.location}`}
        </p>
      </PageHeader>
      <div className="container-page pb-16">
        {stale && (
          <p className="bg-muted text-muted-foreground mb-8 max-w-prose rounded-lg px-4 py-3 text-sm">
            This hasn&apos;t been updated in a while, so some of it is probably out of date.
          </p>
        )}
        <Prose>
          <Mdx source={latest.body} />
        </Prose>
      </div>
      {older.length > 0 && (
        <section aria-labelledby="now-archive" className="container-page border-t py-12">
          <h2 id="now-archive" className="text-eyebrow text-muted-foreground mb-4">
            Previously
          </h2>
          <ul className="grid gap-2">
            {older.map((entry) => (
              <li key={entry.slug}>
                <Link
                  href={`/now/${entry.slug}`}
                  className="group flex flex-wrap items-baseline gap-x-3"
                >
                  <time
                    dateTime={entry.data.date}
                    className="font-medium underline-offset-4 group-hover:underline"
                  >
                    {formatNowDate(entry.data.date)}
                  </time>
                  <span className="text-muted-foreground truncate text-sm">
                    {entry.data.location && `${entry.data.location} · `}
                    {entry.excerpt}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
