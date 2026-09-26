import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { Section } from "@/components/sections/kit/section";
import { SectionHeader } from "@/components/sections/kit/section-header";
import type { SectionImage, SectionTone } from "@/components/sections/kit/types";
import { cn } from "@/lib/utils";

export type BlogListPost = {
  title: string;
  href: string;
  excerpt?: string;
  /** ISO date. */
  date: string;
  readingTime?: string;
  tags?: string[];
  image?: SectionImage;
  author?: string;
};

export type BlogListProps = {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  posts: BlogListPost[];
  /** grid: cards with images · list: compact rows */
  layout?: "grid" | "list";
  locale?: string;
  /** Rendered when there are no posts. */
  empty?: ReactNode;
  /** Heading level for post titles (h2 on an index page, h3 inside a section). */
  headingLevel?: "h2" | "h3";
  footer?: ReactNode;
  tone?: SectionTone;
  className?: string;
};

function formatDate(date: string, locale?: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(
    new Date(date),
  );
}

export function BlogList({
  eyebrow,
  title,
  description,
  posts,
  layout = "grid",
  locale,
  empty,
  headingLevel = "h3",
  footer,
  tone,
  className,
}: BlogListProps) {
  const Heading = headingLevel;
  return (
    <Section tone={tone} className={className}>
      <SectionHeader eyebrow={eyebrow} title={title} description={description} className="mb-12" />
      {posts.length === 0 && empty}
      {layout === "grid" ? (
        <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.href}>
              <article className="group relative flex h-full flex-col gap-4">
                {post.image && (
                  <div className="bg-muted relative aspect-[16/10] overflow-hidden rounded-xl border">
                    <Image
                      src={post.image.src}
                      alt={post.image.alt}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform group-hover:scale-[1.02]"
                    />
                  </div>
                )}
                <p className="text-muted-foreground flex flex-wrap items-center gap-x-2 text-xs">
                  <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
                  {post.readingTime && <span aria-hidden>·</span>}
                  {post.readingTime && <span>{post.readingTime}</span>}
                </p>
                <Heading className="text-lg leading-snug font-semibold text-balance">
                  <Link href={post.href} className="after:absolute after:inset-0">
                    {post.title}
                  </Link>
                </Heading>
                {post.excerpt && (
                  <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
                    {post.excerpt}
                  </p>
                )}
                {post.tags && post.tags.length > 0 && (
                  <ul className="mt-auto flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <li
                        key={tag}
                        className="bg-muted text-muted-foreground rounded-sm px-2 py-0.5 text-xs"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="divide-y border-y">
          {posts.map((post) => (
            <li key={post.href}>
              <article className="group relative grid gap-2 py-6 sm:grid-cols-[10rem_1fr] sm:gap-8">
                <time
                  dateTime={post.date}
                  className="text-muted-foreground pt-0.5 text-sm tabular-nums"
                >
                  {formatDate(post.date, locale)}
                </time>
                <div className="flex flex-col gap-2">
                  <Heading className={cn("font-semibold text-balance group-hover:underline")}>
                    <Link href={post.href} className="after:absolute after:inset-0">
                      {post.title}
                    </Link>
                  </Heading>
                  {post.excerpt && (
                    <p className="text-muted-foreground text-sm leading-relaxed">{post.excerpt}</p>
                  )}
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
      {footer && <div className="mt-12">{footer}</div>}
    </Section>
  );
}
