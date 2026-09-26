import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/lib/auth/auth";
import { billingConfig } from "@/lib/billing/config";
import { ensureCustomer } from "@/lib/billing/customer";
import { getActiveSubscription, hadSubscription } from "@/lib/billing/entitlements";
import {
  findPlan,
  isCustom,
  isFree,
  lookupKey,
  priceFor,
  type Interval,
} from "@/lib/billing/plans";
import { payments } from "@/lib/payments";

export const dynamic = "force-dynamic";

/**
 * GET /billing/checkout?plan=pro&interval=month
 * Signed out → sign up first (and come back here). Signed in → provider checkout.
 * Linked with plain <a> tags only: never prefetch this route.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const plan = findPlan(searchParams.get("plan"));
  const interval: Interval = searchParams.get("interval") === "year" ? "year" : "month";
  const back = (path: string) => NextResponse.redirect(new URL(path, request.url), 303);

  if (!plan) return back("/pricing");
  if (isCustom(plan)) return back(plan.contactHref ?? "/contact");

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    const returnTo = `/billing/checkout?plan=${plan.id}&interval=${interval}`;
    return back(`/sign-up?next=${encodeURIComponent(returnTo)}`);
  }
  if (isFree(plan)) return back("/dashboard");
  if (await getActiveSubscription(session.user.id)) return back("/billing/portal");

  const amount = priceFor(plan, interval);
  const customerId = await ensureCustomer(session.user);
  const firstTime = !(await hadSubscription(session.user.id));
  const checkout = await payments.createCheckout({
    mode: "subscription",
    price: lookupKey(plan, interval),
    customerId,
    successUrl: new URL("/settings/billing?checkout=success", request.url).toString(),
    cancelUrl: new URL("/pricing", request.url).toString(),
    metadata: { userId: session.user.id, planId: plan.id },
    trialDays: firstTime && billingConfig.trialDays ? billingConfig.trialDays : undefined,
    allowPromotionCodes: true,
    display:
      amount === null
        ? undefined
        : {
            name: `${plan.name} · ${interval === "year" ? "yearly" : "monthly"}`,
            amount,
            currency: billingConfig.currency,
          },
  });
  return NextResponse.redirect(new URL(checkout.url, request.url), 303);
}
