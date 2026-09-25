import type { Metadata } from "next";
import Link from "next/link";

import { SiteShell } from "@/components/site/site-shell";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <SiteShell>
      <section className="container-page flex min-h-[60dvh] flex-col items-start justify-center py-24">
        <p className="text-eyebrow text-muted-foreground">404</p>
        <h1 className="mt-3 text-heading">This page could not be found.</h1>
        <p className="mt-4 max-w-prose text-muted-foreground">
          The link may be broken, or the page may have moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Go home
        </Link>
      </section>
    </SiteShell>
  );
}
