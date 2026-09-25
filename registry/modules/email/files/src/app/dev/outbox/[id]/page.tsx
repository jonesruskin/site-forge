import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { readOutboxMessage } from "@/lib/email/outbox";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Outbox", robots: { index: false } };

export default async function OutboxMessagePage({ params }: { params: Promise<{ id: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { id } = await params;
  const message = await readOutboxMessage(id);
  if (!message) notFound();

  return (
    <main className="container-page py-12">
      <Link href="/dev/outbox" className="text-muted-foreground hover:text-foreground text-sm">
        ← Outbox
      </Link>
      <h1 className="text-heading mt-4">{message.subject}</h1>
      <dl className="text-muted-foreground mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt>From</dt>
        <dd className="text-foreground">{message.from}</dd>
        <dt>To</dt>
        <dd className="text-foreground">{message.to.join(", ")}</dd>
        {message.replyTo && (
          <>
            <dt>Reply-To</dt>
            <dd className="text-foreground">{message.replyTo}</dd>
          </>
        )}
      </dl>
      <iframe
        title={`Email: ${message.subject}`}
        srcDoc={message.html}
        sandbox=""
        className="mt-8 h-[70dvh] w-full rounded-lg border bg-card"
      />
      <details className="mt-6">
        <summary className="text-muted-foreground cursor-pointer text-sm">
          Plain-text version
        </summary>
        <pre className="bg-muted mt-3 overflow-x-auto rounded-lg p-4 font-mono text-xs whitespace-pre-wrap">
          {message.text}
        </pre>
      </details>
    </main>
  );
}
