import Link from "next/link";

import { BlogList } from "@/components/sections/blog-list";
import { PageHeader } from "@/components/sections/page-header";
import { Pagination } from "@/components/ui/pagination";
import { allTags, postHref, type Post } from "@/lib/blog/posts";
import siteConfig from "@/site.config";

type PostIndexProps = {
  title: string;
  description?: string;
  posts: Post[];
  page?: number;
  pageCount?: number;
  activeTag?: string;
};

/** Shared layout for the blog index, paginated pages and tag pages. */
export async function PostIndex({
  title,
  description,
  posts,
  page = 1,
  pageCount = 1,
  activeTag,
}: PostIndexProps) {
  const tags = await allTags();
  return (
    <>
      <PageHeader title={title} description={description}>
        {tags.length > 0 && (
          <nav aria-label="Tags">
            <ul className="flex flex-wrap gap-2">
              <li>
                <Link
                  href="/blog"
                  aria-current={!activeTag ? "page" : undefined}
                  className="text-muted-foreground hover:text-foreground aria-[current=page]:bg-foreground aria-[current=page]:text-background rounded-full border px-3 py-1 text-xs transition-colors"
                >
                  All
                </Link>
              </li>
              {tags.map((tag) => (
                <li key={tag.slug}>
                  <Link
                    href={`/blog/tags/${tag.slug}`}
                    aria-current={activeTag === tag.slug ? "page" : undefined}
                    className="text-muted-foreground hover:text-foreground aria-[current=page]:bg-foreground aria-[current=page]:text-background rounded-full border px-3 py-1 text-xs transition-colors"
                  >
                    {tag.name} <span className="opacity-60">{tag.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </PageHeader>
      <BlogList
        className="pt-0 sm:pt-0"
        headingLevel="h2"
        locale={siteConfig.locale}
        posts={posts.map((post) => ({
          title: post.data.title,
          href: postHref(post),
          date: post.data.date,
          excerpt: post.excerpt,
          readingTime: `${post.readingMinutes} min read`,
          tags: post.data.tags,
          image: post.data.image
            ? { src: post.data.image, alt: post.data.imageAlt ?? "" }
            : undefined,
        }))}
        empty={<p className="text-muted-foreground">No posts yet.</p>}
        footer={
          <Pagination
            page={page}
            pageCount={pageCount}
            href={(p) => (p === 1 ? "/blog" : `/blog/page/${p}`)}
          />
        }
      />
    </>
  );
}
