"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { dispatchPaymentEvent } from "./dispatch";
import { isMockPayments } from "./index";
import { newMockId, readMockState, writeMockState } from "./mock";
import type { Subscription } from "./types";

function assertMock() {
  if (!isMockPayments)
    throw new Error("Mock payments are disabled when a real provider is configured.");
}

function addInterval(date: Date, interval: "month" | "year") {
  const next = new Date(date);
  if (interval === "year") next.setFullYear(next.getFullYear() + 1);
  else next.setMonth(next.getMonth() + 1);
  return next;
}

/** "Pays" a mock checkout and delivers the same events a real provider would. */
export async function completeMockCheckout(formData: FormData) {
  assertMock();
  const checkoutId = z.string().parse(formData.get("checkoutId"));
  const state = await readMockState();
  const checkout = state.checkouts[checkoutId];
  if (!checkout || checkout.status !== "open") redirect("/");

  const customerId = checkout.customerId ?? newMockId("mock_cus");
  state.customers[customerId] ??= { email: checkout.customerEmail ?? "customer@example.com" };
  checkout.customerId = customerId;
  checkout.status = "complete";
  checkout.paid = true;

  let subscription: Subscription | undefined;
  if (checkout.mode === "subscription") {
    const interval = /year|annual/i.test(checkout.input.price) ? "year" : "month";
    const trialDays = checkout.input.trialDays ?? 0;
    const trialEnd = trialDays ? new Date(Date.now() + trialDays * 86_400_000) : null;
    subscription = {
      id: newMockId("mock_sub"),
      customerId,
      status: trialEnd ? "trialing" : "active",
      price: checkout.input.price,
      interval,
      currentPeriodEnd: trialEnd ?? addInterval(new Date(), interval),
      cancelAtPeriodEnd: false,
      trialEnd,
      metadata: checkout.metadata,
    };
    state.subscriptions[subscription.id] = subscription;
    checkout.subscriptionId = subscription.id;
  }
  await writeMockState(state);

  const { input: _input, createdAt: _createdAt, ...publicCheckout } = checkout;
  await dispatchPaymentEvent({
    type: "checkout.completed",
    id: newMockId("mock_evt"),
    checkout: publicCheckout,
  });
  if (subscription)
    await dispatchPaymentEvent({
      type: "subscription.updated",
      id: newMockId("mock_evt"),
      subscription,
    });

  redirect(checkout.input.successUrl.replace("{CHECKOUT_SESSION_ID}", checkoutId));
}

export async function cancelMockCheckout(formData: FormData) {
  assertMock();
  const checkoutId = z.string().parse(formData.get("checkoutId"));
  const state = await readMockState();
  const checkout = state.checkouts[checkoutId];
  if (!checkout) redirect("/");
  checkout.status = "expired";
  await writeMockState(state);
  redirect(checkout.input.cancelUrl);
}

/** Portal actions: cancel at period end, resume, or cancel immediately. */
export async function updateMockSubscription(formData: FormData) {
  assertMock();
  const { subscriptionId, action, returnTo } = z
    .object({
      subscriptionId: z.string(),
      action: z.enum(["cancel", "resume", "cancel-now"]),
      returnTo: z.string(),
    })
    .parse(Object.fromEntries(formData));
  const state = await readMockState();
  const subscription = state.subscriptions[subscriptionId];
  if (!subscription) redirect(returnTo);

  if (action === "cancel-now") {
    subscription.status = "canceled";
    subscription.cancelAtPeriodEnd = false;
  } else {
    subscription.cancelAtPeriodEnd = action === "cancel";
  }
  await writeMockState(state);
  await dispatchPaymentEvent(
    action === "cancel-now"
      ? { type: "subscription.deleted", id: newMockId("mock_evt"), subscription }
      : { type: "subscription.updated", id: newMockId("mock_evt"), subscription },
  );
  redirect(
    `/dev/billing-portal?customer=${encodeURIComponent(subscription.customerId)}&return=${encodeURIComponent(returnTo)}`,
  );
}
