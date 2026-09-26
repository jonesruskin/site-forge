import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isMockPayments } from "@/lib/payments";
import { readMockState } from "@/lib/payments/mock";
import { updateMockSubscription } from "@/lib/payments/mock-actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Test billing portal", robots: { index: false } };

type Props = { searchParams: Promise<{ customer?: string; return?: string }> };

/** Stand-in for a hosted customer portal: cancel, resume or end subscriptions. */
export default async function MockPortalPage({ searchParams }: Props) {
  if (!isMockPayments) notFound();
  const { customer = "", return: rawReturn = "/" } = await searchParams;
  const returnTo = rawReturn.startsWith("/") && !rawReturn.startsWith("//") ? rawReturn : "/";
  const state = await readMockState();
  const subscriptions = Object.values(state.subscriptions).filter((s) => s.customerId === customer);
  const format = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

  return (
    <main id="main" className="bg-muted/40 flex min-h-dvh items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <Badge variant="warning" className="mb-2">
            Test mode
          </Badge>
          <CardTitle className="text-xl">Billing portal</CardTitle>
          <CardDescription>{state.customers[customer]?.email ?? customer}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {subscriptions.length === 0 && (
            <p className="text-muted-foreground text-sm">No subscriptions.</p>
          )}
          {subscriptions.map((sub) => (
            <div key={sub.id} className="flex flex-col gap-3 rounded-lg border p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{sub.price}</span>
                <Badge
                  variant={
                    sub.status === "canceled"
                      ? "destructive"
                      : sub.cancelAtPeriodEnd
                        ? "warning"
                        : "success"
                  }
                >
                  {sub.cancelAtPeriodEnd && sub.status !== "canceled"
                    ? "Cancels at period end"
                    : sub.status}
                </Badge>
              </div>
              {sub.currentPeriodEnd && sub.status !== "canceled" && (
                <p className="text-muted-foreground text-sm">
                  Current period ends {format.format(sub.currentPeriodEnd)}
                </p>
              )}
              {sub.status !== "canceled" && (
                <div className="flex flex-wrap gap-2">
                  {(sub.cancelAtPeriodEnd
                    ? ["resume", "cancel-now"]
                    : ["cancel", "cancel-now"]
                  ).map((action) => (
                    <form key={action} action={updateMockSubscription}>
                      <input type="hidden" name="subscriptionId" value={sub.id} />
                      <input type="hidden" name="action" value={action} />
                      <input type="hidden" name="returnTo" value={returnTo} />
                      <Button
                        type="submit"
                        size="sm"
                        variant={action === "cancel-now" ? "destructive" : "outline"}
                      >
                        {action === "cancel"
                          ? "Cancel at period end"
                          : action === "resume"
                            ? "Resume"
                            : "Cancel now"}
                      </Button>
                    </form>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link href={returnTo} className="text-muted-foreground hover:text-foreground text-sm">
            ← Return to the site
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
