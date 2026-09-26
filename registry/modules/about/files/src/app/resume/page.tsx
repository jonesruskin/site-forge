import Link from "next/link";

import { PrintButton } from "@/components/about/print-button";
import { ResumeSections } from "@/components/about/resume-sections";
import { resume } from "@/content/resume";
import { createMetadata } from "@/lib/metadata";
import siteConfig from "@/site.config";

export const metadata = createMetadata({
  title: `${siteConfig.author.name} — Résumé`,
  description: resume.summary ?? resume.label,
  path: "/resume",
});

/** A standalone page sized for paper: A4 and Letter both fit on one or two pages. */
export default function ResumePage() {
  const contact = [
    resume.location,
    siteConfig.author.email,
    (siteConfig.author.url ?? siteConfig.url).replace(/^https?:\/\//, ""),
  ].filter(Boolean);

  return (
    <main id="main" className="bg-background min-h-dvh">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 pt-8 print:hidden">
        <Link
          href="/about"
          className="text-muted-foreground text-sm underline-offset-4 hover:underline"
        >
          ← {siteConfig.name}
        </Link>
        <div className="flex items-center gap-3">
          <a
            href="/resume.json"
            className="text-muted-foreground text-sm underline-offset-4 hover:underline"
          >
            JSON
          </a>
          <PrintButton targetId="resume" />
        </div>
      </div>
      <article
        id="resume"
        className="bg-background text-foreground mx-auto max-w-3xl px-6 py-12 print:max-w-none print:px-0 print:py-0 print:text-[10.5pt]"
      >
        <header className="mb-10 print:mb-5">
          <h1 className="text-display print:text-[24pt]">{siteConfig.author.name}</h1>
          <p className="text-lead text-muted-foreground mt-2 print:mt-1 print:text-[12pt]">
            {resume.label}
          </p>
          <p className="text-muted-foreground mt-3 flex flex-wrap gap-x-3 text-sm print:mt-1">
            {contact.map((item, index) => (
              <span key={item}>
                {index > 0 && (
                  <span aria-hidden className="mr-3">
                    ·
                  </span>
                )}
                {item}
              </span>
            ))}
          </p>
          {resume.summary && <p className="mt-6 max-w-prose print:mt-3">{resume.summary}</p>}
        </header>
        <ResumeSections resume={resume} />
      </article>
    </main>
  );
}
