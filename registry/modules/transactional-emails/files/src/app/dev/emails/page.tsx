import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { emailTemplates } from "@/generated/email-templates";
import { outboxEnabled } from "@/lib/email/send";
import { templateName, templateTitle } from "@/lib/transactional/templates";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Email templates", robots: { index: false } };

/** Every installed email template rendered with its PreviewProps. Development only. */
export default function EmailGalleryPage() {
  if (!outboxEnabled) notFound();
  return (
    <main id="main" className="container-page py-12">
      <p className="text-eyebrow text-muted-foreground">Development</p>
      <h1 className="text-heading mt-2">Email templates</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Rendered with each template&apos;s <code className="font-mono">PreviewProps</code>. Colors
        come from <code className="font-mono">src/emails/theme.ts</code>.
      </p>
      <ul className="mt-8 grid gap-6 lg:grid-cols-2">
        {emailTemplates.map((template) => (
          <li key={templateName(template)} className="flex flex-col gap-2">
            <h2 className="text-sm font-medium">{templateTitle(template)}</h2>
            <iframe
              title={`Preview: ${templateTitle(template)}`}
              src={`/dev/emails/${templateName(template)}`}
              sandbox=""
              loading="lazy"
              className="bg-card h-[32rem] w-full rounded-lg border"
            />
          </li>
        ))}
      </ul>
    </main>
  );
}
