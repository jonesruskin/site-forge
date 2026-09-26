import { ArrowLeftIcon, ArrowRightIcon, PencilIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TableOfContents } from "@/components/mdx/table-of-contents";
import { Prose } from "@/components/ui/prose";
import { docsConfig } from "@/lib/docs/config";
import { docHref, docs, docsPager } from "@/lib/docs/docs";
import { Mdx } from "@/lib/mdx/render";
import { createMetadata } from "@/lib/metadata";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo/json-ld";
import { renderOgImage } from "@/lib/seo/og-image";

export async function docMetadata(slug: string) {
  const doc = await docs.get(slug);
  if (!doc) return {};
  const href = docHref(doc);
  return createMetadata({
    title: doc.slug ? doc.data.title : docsConfig.title,
    description: doc.excerpt,
    path: href,
    image: false, // each docs route has its own opengraph-image
  });
}

/** Renders one docs page: article, edit link, previous/next and table of contents. */
export async function DocPage({ slug }: { slug: string }) {
  const doc = await docs.get(slug);
  if (!doc) notFound();
  const { previous, next } = await docsPager(docHref(doc));

  return (
    <div className="grid gap-10 py-10 xl:grid-cols-[1fr_13rem]">
      <article className="min-w-0">
        <JsonLd
          data={breadcrumbJsonLd([
            { name: docsConfig.title, path: "/docs" },
            ...(doc.slug ? [{ name: doc.data.title, path: docHref(doc) }] : []),
          ])}
        />
        <header className="mb-8 flex max-w-[68ch] flex-col gap-3">
          <h1 className="text-heading">{doc.data.title}</h1>
          {doc.data.description && (
            <p className="text-lead text-muted-foreground">{doc.data.description}</p>
          )}
        </header>
        <Prose>
          <Mdx source={doc.body} />
        </Prose>
        <footer className="mt-14 flex max-w-[68ch] flex-col gap-8 border-t pt-6">
          {docsConfig.editUrl && (
            <a
              href={`${docsConfig.editUrl}${doc.file}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-2 text-sm"
            >
              <PencilIcon aria-hidden className="size-3.5" /> Edit this page
            </a>
          )}
          {(previous || next) && (
            <nav aria-label="Previous and next pages" className="grid gap-4 sm:grid-cols-2">
              {previous ? (
                <Link
                  href={previous.href}
                  className="hover:bg-accent flex flex-col gap-1 rounded-lg border p-4 transition-colors"
                >
                  <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                    <ArrowLeftIcon aria-hidden className="size-3" /> Previous
                  </span>
                  <span className="font-medium">{previous.title}</span>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link
                  href={next.href}
                  className="hover:bg-accent flex flex-col items-end gap-1 rounded-lg border p-4 text-right transition-colors"
                >
                  <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                    Next <ArrowRightIcon aria-hidden className="size-3" />
                  </span>
                  <span className="font-medium">{next.title}</span>
                </Link>
              )}
            </nav>
          )}
        </footer>
      </article>
      <aside className="hidden xl:block">
        <TableOfContents headings={doc.headings} className="sticky top-24" />
      </aside>
    </div>
  );
}

export async function docOgImage(slug: string) {
  const doc = await docs.get(slug);
  return renderOgImage({
    eyebrow: docsConfig.title,
    title: doc?.data.title ?? docsConfig.title,
    description: doc?.excerpt,
  });
}
