import { CheckCircle2Icon } from "lucide-react";
import type { Metadata } from "next";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { requireSession } from "@/lib/auth/session";
import { billingConfig } from "@/lib/billing/config";
import { getActiveSubscription, getPlan } from "@/lib/billing/entitlements";
import { priceFor } from "@/lib/billing/plans";
import siteConfig from "@/site.config";

export const metadata: Metadata = { title: "Billing", robots: { index: false } };

const statusLabel: Record<
  string,
  { label: string; variant: "success" | "warning" | "destructive" | "secondary" }
> = {
  active: { label: "Active", variant: "success" },
  trialing: { label: "Trial", variant: "secondary" },
  past_due: { label: "Payment due", variant: "warning" },
};

export default async function BillingSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { user } = await requireSession("/settings/billing");
  const [plan, active, { checkout }] = await Promise.all([
    getPlan(user.id),
    getActiveSubscription(user.id),
    searchParams,
  ]);
  const date = new Intl.DateTimeFormat(siteConfig.locale, { dateStyle: "long" });
  const money = new Intl.NumberFormat(siteConfig.locale, {
    style: "currency",
    currency: billingConfig.currency,
  });
  const interval = active?.interval === "year" ? "year" : "month";
  const amount = plan ? priceFor(plan, interval) : null;
  const status = active ? statusLabel[active.status] : undefined;

  return (
    <div className="flex flex-col gap-6">
      {checkout === "success" && (
        <Alert variant="success">
          <CheckCircle2Icon aria-hidden />
          <AlertDescription className="text-foreground">
            Thanks! Your subscription is being activated.
          </AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardDescription>Current plan</CardDescription>
          <CardTitle className="flex items-center gap-2 text-2xl">
            {plan?.name ?? "No plan"}
            {status && <Badge variant={status.variant}>{status.label}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground flex flex-col gap-1 text-sm">
          {active && amount !== null && (
            <p>
              {money.format(amount)} / {interval}
            </p>
          )}
          {active?.trialEnd && active.status === "trialing" && (
            <p>Trial ends {date.format(active.trialEnd)}.</p>
          )}
          {active?.currentPeriodEnd && (
            <p>
              {active.cancelAtPeriodEnd ? "Access ends" : "Renews"}{" "}
              {date.format(active.currentPeriodEnd)}.
            </p>
          )}
          {!active && <p>You&apos;re on the free plan.</p>}
        </CardContent>
        <CardFooter className="gap-2">
          {active ? (
            <Button asChild>
              <a href="/billing/portal">Manage billing</a>
            </Button>
          ) : (
            <Button asChild>
              <a href="/pricing">See plans</a>
            </Button>
          )}
        </CardFooter>
      </Card>
      {plan && Object.keys(plan.limits).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Plan limits</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              {Object.entries(plan.limits).map(([key, value]) => (
                <div key={key} className="flex justify-between gap-4 rounded-md border px-3 py-2">
                  <dt className="text-muted-foreground capitalize">{key}</dt>
                  <dd className="font-medium tabular-nums">{value.toLocaleString()}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
