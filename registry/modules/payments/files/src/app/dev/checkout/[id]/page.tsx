import { CreditCardIcon } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isMockPayments } from "@/lib/payments";
import { readMockState } from "@/lib/payments/mock";
import { cancelMockCheckout, completeMockCheckout } from "@/lib/payments/mock-actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Test checkout", robots: { index: false } };

/** Stand-in for a hosted checkout page while no payment provider is configured. */
export default async function MockCheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isMockPayments) notFound();
  const checkout = (await readMockState()).checkouts[(await params).id];
  if (!checkout) notFound();
  const display = checkout.input.inlinePrice ?? checkout.input.display;
  const amount = display
    ? new Intl.NumberFormat(undefined, { style: "currency", currency: display.currency }).format(
        display.amount * (checkout.input.quantity ?? 1),
      )
    : null;

  return (
    <main id="main" className="bg-muted/40 flex min-h-dvh items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Badge variant="warning" className="mb-2">
            Test mode · no real payment
          </Badge>
          <CardTitle className="text-xl">
            {display?.name ?? checkout.input.price ?? "Checkout"}
          </CardTitle>
          <CardDescription>
            {checkout.mode === "subscription" ? "Subscription" : "One-time payment"}
            {checkout.input.trialDays ? ` · ${checkout.input.trialDays}-day free trial` : ""}
            {checkout.customerEmail ? ` · ${checkout.customerEmail}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {amount && <p className="font-display text-4xl font-semibold tracking-tight">{amount}</p>}
          <p className="text-muted-foreground flex items-center gap-2 text-sm">
            <CreditCardIcon aria-hidden className="size-4" /> Set STRIPE_SECRET_KEY to use real
            Stripe Checkout.
          </p>
        </CardContent>
        {checkout.status === "open" ? (
          <CardFooter className="flex-col gap-2">
            <form action={completeMockCheckout} className="w-full">
              <input type="hidden" name="checkoutId" value={checkout.id} />
              <Button type="submit" className="w-full" size="lg">
                Pay (test)
              </Button>
            </form>
            <form action={cancelMockCheckout} className="w-full">
              <input type="hidden" name="checkoutId" value={checkout.id} />
              <Button type="submit" variant="ghost" className="w-full">
                Cancel and go back
              </Button>
            </form>
          </CardFooter>
        ) : (
          <CardFooter>
            <p className="text-muted-foreground text-sm">This checkout is {checkout.status}.</p>
          </CardFooter>
        )}
      </Card>
    </main>
  );
}
