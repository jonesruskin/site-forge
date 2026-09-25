import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { billingCustomer } from "@/db/schema/billing";
import { payments } from "@/lib/payments";

/** Returns the user's provider customer id, creating the customer on first use. */
export async function ensureCustomer(user: { id: string; email: string; name: string }) {
  const existing = await db.query.billingCustomer.findFirst({
    where: eq(billingCustomer.userId, user.id),
  });
  if (existing) return existing.customerId;
  const { id } = await payments.createCustomer({
    email: user.email,
    name: user.name,
    metadata: { userId: user.id },
  });
  await db
    .insert(billingCustomer)
    .values({ userId: user.id, customerId: id })
    .onConflictDoNothing();
  const row = await db.query.billingCustomer.findFirst({
    where: eq(billingCustomer.userId, user.id),
  });
  return row?.customerId ?? id;
}

export async function getCustomerId(userId: string) {
  return (
    (await db.query.billingCustomer.findFirst({ where: eq(billingCustomer.userId, userId) }))
      ?.customerId ?? null
  );
}
