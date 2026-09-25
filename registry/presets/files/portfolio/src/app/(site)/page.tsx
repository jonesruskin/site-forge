import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import { BlogList } from "@/components/sections/blog-list";
import { CtaBand } from "@/components/sections/cta-band";
import { HeroCentered } from "@/components/sections/hero-centered";
import { ProjectGrid } from "@/components/sections/project-grid";
import { resume } from "@/content/resume";
import { postHref, posts } from "@/lib/blog/posts";
import { formatNowDate, nowEntries } from "@/lib/now/now";
import { projects, toCard } from "@/lib/projects/projects";
import siteConfig from "@/site.config";

/*
 * Portfolio home: who you are, your best work, what you're doing now, and a way
 * to reach you. Work comes from content/projects, writing from content/blog,
 * the "now" line from content/now, your headline from src/content/resume.ts.
 */
export default async function HomePage() {
  const [work, writing, [now]] = await Promise.all([projects.all(), posts.all(), nowEntries.all()]);

  return (
    <>
      <HeroCentered
        badge={resume.label}
        title={`Hi, I'm ${siteConfig.author.name}.`}
        description={siteConfig.description}
        actions={[
          { label: "See my work", href: "/projects" },
          { label: "About me", href: "/about", variant: "outline" },
        ]}
      />
      {now && (
        <aside aria-label="What I'm doing now" className="container-page -mt-8 mb-8">
          <Link
            href="/now"
            className="group hover:bg-accent mx-auto flex max-w-2xl items-start gap-4 rounded-xl border p-4 text-sm transition-colors"
          >
            <span className="text-eyebrow text-muted-foreground shrink-0 pt-0.5">Now</span>
            <span className="grid flex-1 gap-1">
              <span className="line-clamp-2">{now.excerpt}</span>
              <span className="text-muted-foreground text-xs">
                Updated {formatNowDate(now.data.date)}
              </span>
            </span>
            <ArrowRightIcon
              aria-hidden
              className="text-muted-foreground mt-0.5 size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </aside>
      )}
      <ProjectGrid
        eyebrow="Selected work"
        title="Things I've made"
        headingLevel="h3"
        projects={work.slice(0, 4).map(toCard)}
        empty={<p className="text-muted-foreground">Add projects in content/projects.</p>}
      />
      {writing.length > 0 && (
        <BlogList
          eyebrow="Writing"
          title="Recent notes"
          layout="list"
          locale={siteConfig.locale}
          tone="muted"
          posts={writing.slice(0, 3).map((post) => ({
            title: post.data.title,
            href: postHref(post),
            date: post.data.date,
            excerpt: post.excerpt,
            readingTime: `${post.readingMinutes} min read`,
          }))}
        />
      )}
      <CtaBand
        title="Let's make something together"
        description="Open to new projects and conversations."
        actions={[
          { label: "Get in touch", href: "/contact" },
          { label: "Résumé", href: "/resume", variant: "outline" },
        ]}
      />
    </>
  );
}
