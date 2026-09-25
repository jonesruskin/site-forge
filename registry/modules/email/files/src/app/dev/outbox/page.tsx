import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { listOutbox } from "@/lib/email/outbox";
import { outboxEnabled } from "@/lib/email/send";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Outbox", robots: { index: false } };

/** Every email sent in development without RESEND_API_KEY. Not available in production. */
export default async function OutboxPage() {
  if (!outboxEnabled) notFound();
  const messages = await listOutbox();

  return (
    <main className="container-page py-12">
      <p className="text-eyebrow text-muted-foreground">Development</p>
      <h1 className="text-heading mt-2">Outbox</h1>
      <p className="text-muted-foreground mt-2 max-w-prose text-sm">
        Emails are stored here while <code className="font-mono">RESEND_API_KEY</code> is unset.
        Files live in <code className="font-mono">.site/dev/outbox</code>.
      </p>
      {messages.length === 0 ? (
        <p className="text-muted-foreground mt-10 rounded-lg border border-dashed p-8 text-center text-sm">
          No emails yet. Trigger a flow that sends one (contact form, sign-up …).
        </p>
      ) : (
        <ul className="mt-8 divide-y rounded-lg border">
          {messages.map((message) => (
            <li key={message.id}>
              <Link
                href={`/dev/outbox/${message.id}`}
                className="hover:bg-accent flex flex-col gap-1 px-4 py-3 transition-colors sm:flex-row sm:items-center sm:gap-4"
              >
                <span className="font-medium">{message.subject}</span>
                <span className="text-muted-foreground text-sm sm:ml-auto">
                  {message.to.join(", ")}
                </span>
                <time
                  dateTime={message.createdAt}
                  className="text-muted-foreground font-mono text-xs"
                >
                  {new Date(message.createdAt).toLocaleString()}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
