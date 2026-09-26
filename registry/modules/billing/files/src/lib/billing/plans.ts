import type { PricingPlan } from "@/components/sections/pricing-table";

import { billingConfig, type Plan } from "./config";

export type Interval = "month" | "year";

export const plans = billingConfig.plans;

export function findPlan(id: string | null | undefined) {
  return plans.find((plan) => plan.id === id);
}

export function isFree(plan: Plan) {
  return plan.price.monthly === 0 && !plan.price.yearly;
}

export function isCustom(plan: Plan) {
  return plan.price.monthly === null;
}

/** The plan everyone has without a subscription (first free plan), if any. */
export const freePlan = plans.find(isFree) ?? null;

export function lookupKey(plan: Plan, interval: Interval) {
  return interval === "year"
    ? (plan.lookupKeys.yearly ?? `${plan.id}_yearly`)
    : (plan.lookupKeys.monthly ?? `${plan.id}_monthly`);
}

/** Reverse lookup from a provider price reference to a plan and interval. */
export function planFromLookupKey(key: string): { plan: Plan; interval: Interval } | null {
  for (const plan of plans) {
    if (lookupKey(plan, "month") === key) return { plan, interval: "month" };
    if (lookupKey(plan, "year") === key) return { plan, interval: "year" };
  }
  return null;
}

export function priceFor(plan: Plan, interval: Interval) {
  return interval === "year" ? (plan.price.yearly ?? null) : plan.price.monthly;
}

/** Plans shaped for the pricing-table section, with CTAs wired to checkout. */
export function pricingPlans(): PricingPlan[] {
  return plans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    description: plan.description,
    price: { monthly: plan.price.monthly, yearly: plan.price.yearly },
    currency: billingConfig.currency.toUpperCase(),
    customPriceLabel: "Custom",
    features: plan.features,
    highlighted: plan.highlighted,
    badge: plan.badge,
    cta: isCustom(plan)
      ? { label: plan.ctaLabel ?? "Contact us", href: plan.contactHref ?? "/contact" }
      : isFree(plan)
        ? { label: plan.ctaLabel ?? "Get started", href: "/sign-up" }
        : {
            label:
              plan.ctaLabel ??
              (billingConfig.trialDays
                ? `Start ${billingConfig.trialDays}-day trial`
                : `Choose ${plan.name}`),
            href: {
              monthly: `/billing/checkout?plan=${plan.id}&interval=month`,
              yearly: `/billing/checkout?plan=${plan.id}&interval=year`,
            },
          },
  }));
}
