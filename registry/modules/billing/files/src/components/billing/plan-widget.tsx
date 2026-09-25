import { CreditCardIcon } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getActiveSubscription, getPlan } from "@/lib/billing/entitlements";

/** Dashboard card: current plan and a link to manage it. */
export async function PlanWidget({ userId }: { userId: string }) {
  const [plan, active] = await Promise.all([getPlan(userId), getActiveSubscription(userId)]);
  return (
    <Card>
      <CardHeader>
        <CardDescription className="flex items-center gap-2">
          <CreditCardIcon aria-hidden className="size-4" /> Plan
        </CardDescription>
        <CardTitle className="flex items-center gap-2 text-2xl">
          {plan?.name ?? "No plan"}
          {active?.status === "trialing" && <Badge variant="secondary">Trial</Badge>}
          {active?.status === "past_due" && <Badge variant="warning">Payment due</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Link
          href={active ? "/settings/billing" : "/pricing"}
          className="text-sm font-medium underline-offset-4 hover:underline"
        >
          {active ? "Manage billing" : "Upgrade"}
        </Link>
      </CardContent>
    </Card>
  );
}
