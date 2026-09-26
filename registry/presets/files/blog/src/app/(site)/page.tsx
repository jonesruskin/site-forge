import Link from "next/link";

import { NewsletterForm } from "@/components/newsletter/newsletter-form";
import { BlogList } from "@/components/sections/blog-list";
import { NewsletterBand } from "@/components/sections/newsletter-band";
import { postHref, posts, type Post } from "@/lib/blog/posts";
import siteConfig from "@/site.config";

/*
 * Blog home: the newest post up top, the rest as a list, and a way to follow
 * along. Posts live in content/blog; the RSS feed is at /blog/rss.xml.
 */
const toItem = (post: Post) => ({
  title: post.data.title,
  href: postHref(post),
  date: post.data.date,
  excerpt: post.excerpt,
  readingTime: `${post.readingMinutes} min read`,
  tags: post.data.tags,
  image: post.data.image ? { src: post.data.image, alt: post.data.imageAlt ?? "" } : undefined,
});

export default async function HomePage() {
  const all = await posts.all();
  const [latest, ...rest] = all;

  return (
    <>
      <header className="container-page pt-16 pb-4 sm:pt-24">
        <h1 className="text-display max-w-3xl">{siteConfig.name}</h1>
        <p className="text-lead text-muted-foreground mt-4 max-w-2xl">{siteConfig.description}</p>
      </header>
      {latest ? (
        <>
          <BlogList
            eyebrow="Latest"
            headingLevel="h2"
            layout="grid"
            locale={siteConfig.locale}
            posts={[toItem(latest)]}
          />
          {rest.length > 0 && (
            <BlogList
              className="pt-0 sm:pt-0"
              title="More writing"
              layout="list"
              locale={siteConfig.locale}
              posts={rest.slice(0, 8).map(toItem)}
              footer={
                all.length > 9 ? (
                  <Link
                    href="/blog"
                    className="text-sm font-medium underline-offset-4 hover:underline"
                  >
                    All posts →
                  </Link>
                ) : undefined
              }
            />
          )}
        </>
      ) : (
        <p className="container-page text-muted-foreground py-16">The first post is on its way.</p>
      )}
      <NewsletterBand
        tone="muted"
        title="New posts by email"
        description="One email when something new is published. Unsubscribe any time."
        form={<NewsletterForm />}
        note={
          <>
            Prefer feeds? Subscribe to the{" "}
            <a href="/blog/rss.xml" className="underline underline-offset-4">
              RSS feed
            </a>
            .
          </>
        }
      />
    </>
  );
}
