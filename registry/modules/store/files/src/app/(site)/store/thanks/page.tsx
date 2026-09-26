import { CheckCircle2Icon, ClockIcon, DownloadIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { payments } from "@/lib/payments";
import { downloadPath } from "@/lib/store/delivery";
import { getProduct, storeConfig } from "@/lib/store/products";

export const metadata: Metadata = { title: "Thank you", robots: { index: false } };

type Props = { searchParams: Promise<{ session?: string }> };

/** Landing page after checkout: verifies payment with the provider, then offers the download right away. */
export default async function ThanksPage({ searchParams }: Props) {
  const { session } = await searchParams;
  const checkout = session ? await payments.getCheckout(session) : null;
  const product =
    checkout?.metadata.kind === "store" ? getProduct(checkout.metadata.product ?? "") : null;

  if (!checkout || !product) {
    return (
      <main
        id="main"
        className="container-page flex min-h-[60dvh] flex-col items-start justify-center gap-4 py-24"
      >
        <h1 className="text-heading">We couldn&apos;t find that order</h1>
        <p className="text-muted-foreground max-w-prose">
          If you completed a payment, the download link is on its way to your inbox.
        </p>
        <Button asChild variant="outline">
          <Link href="/store">Back to the {storeConfig.title.toLowerCase()}</Link>
        </Button>
      </main>
    );
  }

  if (!checkout.paid) {
    return (
      <main
        id="main"
        className="container-page flex min-h-[60dvh] flex-col items-start justify-center gap-4 py-24"
      >
        <ClockIcon aria-hidden className="text-muted-foreground size-8" />
        <h1 className="text-heading">Your payment is processing</h1>
        <p className="text-muted-foreground max-w-prose">
          Some payment methods take a moment to confirm. We&apos;ll email your download link as soon
          as it does.
        </p>
      </main>
    );
  }

  return (
    <main
      id="main"
      className="container-page flex min-h-[60dvh] flex-col items-start justify-center gap-5 py-24"
    >
      <CheckCircle2Icon aria-hidden className="text-success size-8" />
      <h1 className="text-heading">Thank you!</h1>
      <p className="text-muted-foreground max-w-prose">
        {product.name} is yours.
        {checkout.customerEmail && ` We also emailed the link to ${checkout.customerEmail}.`} It
        works for {storeConfig.downloadExpiresInDays} days.
      </p>
      <Button asChild size="lg">
        <a href={downloadPath(product, checkout.id)}>
          <DownloadIcon aria-hidden />
          Download {product.name}
        </a>
      </Button>
    </main>
  );
}
