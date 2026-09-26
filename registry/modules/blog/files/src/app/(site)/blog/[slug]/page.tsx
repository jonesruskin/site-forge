import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TableOfContents } from "@/components/mdx/table-of-contents";
import { Prose } from "@/components/ui/prose";
import { blogConfig } from "@/lib/blog/config";
import { adjacentPosts, postHref, posts, tagSlug } from "@/lib/blog/posts";
import { Mdx } from "@/lib/mdx/render";
import { createMetadata } from "@/lib/metadata";
import { articleJsonLd, breadcrumbJsonLd, JsonLd } from "@/lib/seo/json-ld";
import siteConfig from "@/site.config";

export const generateStaticParams = posts.params;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const post = await posts.get((await params).slug);
  if (!post) return {};
  return createMetadata({
    title: post.data.title,
    description: post.excerpt,
    path: postHref(post),
    type: "article",
    publishedTime: post.data.date,
    modifiedTime: post.data.updated,
    authors: [post.data.author ?? siteConfig.author.name],
    image: post.data.image ?? false,
  });
}

const dateFormat = new Intl.DateTimeFormat(siteConfig.locale, {
  dateStyle: "long",
  timeZone: "UTC",
});

export default async function PostPage({ params }: Props) {
  const post = await posts.get((await params).slug);
  if (!post) notFound();
  const { newer, older } = await adjacentPosts(post.slug);

  return (
    <article className="container-page py-12 sm:py-16">
      <JsonLd
        data={[
          articleJsonLd({
            title: post.data.title,
            description: post.excerpt,
            path: postHref(post),
            publishedAt: post.data.date,
            updatedAt: post.data.updated,
            image: post.data.image,
            authors: post.data.author ? [post.data.author] : undefined,
          }),
          breadcrumbJsonLd([
            { name: blogConfig.title, path: "/blog" },
            { name: post.data.title, path: postHref(post) },
          ]),
        ]}
      />
      <Link
        href="/blog"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeftIcon aria-hidden className="size-3.5" /> {blogConfig.title}
      </Link>
      <header className="mt-8 flex max-w-3xl flex-col gap-4">
        <p className="text-muted-foreground flex flex-wrap items-center gap-x-2 text-sm">
          <time dateTime={post.data.date}>{dateFormat.format(new Date(post.data.date))}</time>
          <span aria-hidden>·</span>
          <span>{post.readingMinutes} min read</span>
          {post.data.author && (
            <>
              <span aria-hidden>·</span>
              <span>{post.data.author}</span>
            </>
          )}
        </p>
        <h1 className="text-display">{post.data.title}</h1>
        {post.data.description && (
          <p className="text-lead text-muted-foreground">{post.data.description}</p>
        )}
        {post.data.tags.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {post.data.tags.map((tag) => (
              <li key={tag}>
                <Link
                  href={`/blog/tags/${tagSlug(tag)}`}
                  className="bg-muted hover:bg-accent rounded-sm px-2 py-0.5 text-xs transition-colors"
                >
                  {tag}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </header>
      {post.data.image && (
        <div className="bg-muted relative mt-10 aspect-[2/1] overflow-hidden rounded-xl border">
          <Image
            src={post.data.image}
            alt={post.data.imageAlt ?? ""}
            fill
            priority
            sizes="(min-width: 1280px) 1152px, 100vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="mt-12 grid gap-12 xl:grid-cols-[1fr_14rem]">
        <Prose>
          <Mdx source={post.body} />
        </Prose>
        <aside className="hidden xl:block">
          <TableOfContents headings={post.headings} className="sticky top-24" />
        </aside>
      </div>
      {(newer || older) && (
        <nav aria-label="More posts" className="mt-16 grid gap-4 border-t pt-8 sm:grid-cols-2">
          {older ? (
            <Link
              href={postHref(older)}
              className="group flex flex-col gap-1 rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                <ArrowLeftIcon aria-hidden className="size-3" /> Older
              </span>
              <span className="font-medium">{older.data.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {newer && (
            <Link
              href={postHref(newer)}
              className="group flex flex-col items-end gap-1 rounded-lg border p-4 text-right transition-colors hover:bg-accent"
            >
              <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                Newer <ArrowRightIcon aria-hidden className="size-3" />
              </span>
              <span className="font-medium">{newer.data.title}</span>
            </Link>
          )}
        </nav>
      )}
    </article>
  );
}
