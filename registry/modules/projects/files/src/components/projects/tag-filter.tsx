import Link from "next/link";

import { cn } from "@/lib/utils";

type Tag = { tag: string; slug: string; count: number };

/** Tag links as a filter bar; each tag has its own static page. */
export function TagFilter({ tags, active }: { tags: Tag[]; active?: string }) {
  if (tags.length === 0) return null;
  const item = (selected: boolean) =>
    cn(
      "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-sm transition-colors",
      selected
        ? "bg-foreground text-background border-foreground"
        : "hover:bg-accent text-muted-foreground",
    );
  return (
    <nav aria-label="Filter projects by tag" className="container-page -mt-2 mb-10">
      <ul className="flex flex-wrap gap-2">
        <li>
          <Link
            href="/projects"
            className={item(!active)}
            aria-current={!active ? "page" : undefined}
          >
            All
          </Link>
        </li>
        {tags.map(({ tag, slug, count }) => (
          <li key={slug}>
            <Link
              href={`/projects/tags/${slug}`}
              className={item(active === slug)}
              aria-current={active === slug ? "page" : undefined}
            >
              {tag}
              <span className="text-xs opacity-60">{count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
