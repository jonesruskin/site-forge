import "server-only";

import { and, desc, eq, inArray } from "drizzle-orm";
import { cache } from "react";

import { db } from "@/db";
import { subscription, type SubscriptionRow } from "@/db/schema/billing";

import type { Plan } from "./config";
import { findPlan, freePlan } from "./plans";

/** Statuses that grant access. past_due keeps access while the provider retries payment. */
export const ACTIVE_STATUSES = ["trialing", "active", "past_due"] as const;

export const getActiveSubscription = cache(
  async (userId: string): Promise<SubscriptionRow | null> => {
    const [row] = await db
      .select()
      .from(subscription)
      .where(
        and(eq(subscription.userId, userId), inArray(subscription.status, [...ACTIVE_STATUSES])),
      )
      .orderBy(desc(subscription.updatedAt))
      .limit(1);
    return row ?? null;
  },
);

/** The user's current plan: their active subscription's plan, else the free plan. */
export async function getPlan(userId: string): Promise<Plan | null> {
  const active = await getActiveSubscription(userId);
  return (active && findPlan(active.planId)) || freePlan;
}

/** Numeric limit for a key (e.g. "projects"); Infinity when the plan doesn't set one. */
export async function getLimit(userId: string, key: string) {
  const plan = await getPlan(userId);
  return plan?.limits[key] ?? Number.POSITIVE_INFINITY;
}

/** True when the user is on one of `planIds`. */
export async function hasPlan(userId: string, ...planIds: string[]) {
  const plan = await getPlan(userId);
  return plan ? planIds.includes(plan.id) : false;
}

/** True when the user has had any subscription before (no second free trial). */
export async function hadSubscription(userId: string) {
  const [row] = await db
    .select({ id: subscription.id })
    .from(subscription)
    .where(eq(subscription.userId, userId))
    .limit(1);
  return Boolean(row);
}
