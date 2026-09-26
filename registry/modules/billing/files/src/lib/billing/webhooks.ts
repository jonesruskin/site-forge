import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { billingCustomer, subscription } from "@/db/schema/billing";
import { PaymentFailedEmail } from "@/emails/payment-failed";
import { sendEmail } from "@/lib/email/send";
import type { PaymentEvent, Subscription } from "@/lib/payments";
import { absoluteUrl } from "@/lib/url";

import { planFromLookupKey } from "./plans";

async function userIdFor(sub: Subscription) {
  if (sub.metadata.userId) return sub.metadata.userId;
  const customer = await db.query.billingCustomer.findFirst({
    where: eq(billingCustomer.customerId, sub.customerId),
  });
  return customer?.userId ?? null;
}

async function upsert(sub: Subscription) {
  const userId = await userIdFor(sub);
  if (!userId) {
    console.warn(`[billing] subscription ${sub.id} has no known user; skipping`);
    return;
  }
  const match = planFromLookupKey(sub.price);
  const values = {
    id: sub.id,
    userId,
    customerId: sub.customerId,
    planId: match?.plan.id ?? "unknown",
    price: sub.price,
    interval: sub.interval,
    status: sub.status,
    currentPeriodEnd: sub.currentPeriodEnd,
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    trialEnd: sub.trialEnd,
  };
  await db
    .insert(subscription)
    .values(values)
    .onConflictDoUpdate({ target: subscription.id, set: values });
}

/** Keeps the subscription table in sync. Idempotent: safe for retried deliveries. */
export async function billingWebhookHandler(event: PaymentEvent) {
  switch (event.type) {
    case "checkout.completed": {
      const { customerId, metadata, mode } = event.checkout;
      if (mode === "subscription" && customerId && metadata.userId) {
        await db
          .insert(billingCustomer)
          .values({ userId: metadata.userId, customerId })
          .onConflictDoNothing();
      }
      return;
    }
    case "subscription.updated":
      await upsert(event.subscription);
      return;
    case "subscription.deleted":
      await upsert({ ...event.subscription, status: "canceled" });
      return;
    case "invoice.payment_failed": {
      const customer = await db.query.billingCustomer.findFirst({
        where: eq(billingCustomer.customerId, event.customerId),
      });
      const owner =
        customer && (await db.query.user.findFirst({ where: eq(user.id, customer.userId) }));
      if (!owner) return;
      await sendEmail({
        to: owner.email,
        subject: "Action needed: update your payment method",
        react: PaymentFailedEmail({ portalUrl: absoluteUrl("/billing/portal") }),
        idempotencyKey: `payment-failed:${event.id}`,
      });
      return;
    }
  }
}
