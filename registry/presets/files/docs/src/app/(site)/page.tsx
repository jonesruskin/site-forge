import { BookOpenIcon } from "lucide-react";
import Link from "next/link";

import { CtaBand } from "@/components/sections/cta-band";
import { FeatureGrid } from "@/components/sections/feature-grid";
import { HeroCentered } from "@/components/sections/hero-centered";
import { changelog, entryAnchor } from "@/lib/changelog/entries";
import { docsNav } from "@/lib/docs/docs";
import siteConfig from "@/site.config";

/*
 * Docs home: a way in for newcomers, a map for everyone else, and what changed
 * recently. Sections come from the folders in content/docs.
 */
export default async function HomePage() {
  const [nav, entries] = await Promise.all([docsNav(), changelog.all()]);
  const groups = nav.filter((group) => group.items.length > 0);
  const firstPage = groups[0]?.items[0]?.href ?? "/docs";

  return (
    <>
      <HeroCentered
        badge="Documentation"
        title={siteConfig.name}
        description={siteConfig.description}
        actions={[
          { label: "Get started", href: firstPage },
          { label: "Changelog", href: "/changelog", variant: "outline" },
        ]}
        note={
          <>
            Press <kbd className="bg-muted rounded border px-1.5 font-mono text-xs">/</kbd> on any
            docs page to search.
          </>
        }
      />
      {groups.length > 0 && (
        <FeatureGrid
          title="Browse the docs"
          variant="cards"
          features={groups.map((group) => ({
            icon: <BookOpenIcon />,
            title: group.title ?? "Overview",
            description: group.items
              .slice(0, 4)
              .map((item) => item.title)
              .join(" · "),
            href: group.items[0]!.href,
            linkLabel: "Open",
          }))}
        />
      )}
      {entries.length > 0 && (
        <section aria-labelledby="recent-changes" className="container-page pb-16">
          <h2 id="recent-changes" className="text-heading mb-6">
            Recent changes
          </h2>
          <ul className="divide-y rounded-xl border">
            {entries.slice(0, 3).map((entry) => (
              <li key={entry.slug}>
                <Link
                  href={`/changelog#${entryAnchor(entry)}`}
                  className="hover:bg-accent flex flex-wrap items-baseline gap-x-4 gap-y-1 px-4 py-3 transition-colors"
                >
                  {entry.data.version && (
                    <span className="font-mono text-sm">v{entry.data.version}</span>
                  )}
                  <span className="font-medium">{entry.data.title}</span>
                  <time
                    dateTime={entry.data.date}
                    className="text-muted-foreground ml-auto text-sm"
                  >
                    {new Intl.DateTimeFormat(siteConfig.locale, {
                      dateStyle: "medium",
                      timeZone: "UTC",
                    }).format(new Date(entry.data.date))}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <CtaBand
        title="Can't find what you need?"
        description="Open an issue or ask a question; the docs get better with every one."
        actions={[{ label: "Start reading", href: firstPage }]}
      />
    </>
  );
}
