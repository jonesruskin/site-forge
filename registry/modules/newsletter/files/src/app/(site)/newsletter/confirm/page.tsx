import { CheckCircle2Icon, XCircleIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { newsletterConfig } from "@/lib/newsletter/config";
import { subscribe } from "@/lib/newsletter/providers";
import { verifyConfirmToken } from "@/lib/newsletter/token";

export const metadata: Metadata = { title: newsletterConfig.title, robots: { index: false } };

/** Landing page for the confirmation link. Subscribing here is idempotent. */
export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;
  const verified = verifyConfirmToken(token);
  let ok = false;
  if (verified) {
    try {
      await subscribe({ email: verified.email });
      ok = true;
    } catch (error) {
      console.error("[newsletter] confirm failed", error);
    }
  }

  return (
    <section className="container-page flex min-h-[60dvh] flex-col items-center justify-center gap-4 py-24 text-center">
      {ok ? (
        <CheckCircle2Icon aria-hidden className="text-success size-10" />
      ) : (
        <XCircleIcon aria-hidden className="text-destructive size-10" />
      )}
      <h1 className="text-heading">
        {ok ? newsletterConfig.confirmedMessage : "This link is invalid or has expired."}
      </h1>
      {!ok && (
        <p className="text-muted-foreground">
          <Link href="/newsletter" className="text-foreground underline underline-offset-4">
            Subscribe again
          </Link>{" "}
          to get a fresh link.
        </p>
      )}
    </section>
  );
}
