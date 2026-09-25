import "server-only";

import Stripe from "stripe";

import { paymentsEnv } from "@/env/payments";

import type { Checkout, PaymentEvent, PaymentProvider, Subscription } from "./types";

let client: Stripe | null = null;
function stripe() {
  client ??= new Stripe(paymentsEnv.STRIPE_SECRET_KEY!, {
    appInfo: { name: "site-forge" },
    maxNetworkRetries: 2,
  });
  return client;
}

const priceCache = new Map<string, { id: string; at: number }>();

/** Resolves a lookup key (or a raw price_… id) to a price id, cached for 10 minutes. */
async function resolvePrice(reference: string) {
  if (reference.startsWith("price_")) return reference;
  const cached = priceCache.get(reference);
  if (cached && Date.now() - cached.at < 600_000) return cached.id;
  const { data } = await stripe().prices.list({ lookup_keys: [reference], active: true, limit: 1 });
  const price = data[0];
  if (!price)
    throw new Error(
      `No active Stripe price with lookup key "${reference}". Run \`pnpm billing:sync\` or create it in Stripe.`,
    );
  priceCache.set(reference, { id: price.id, at: Date.now() });
  return price.id;
}

function toCheckout(session: Stripe.Checkout.Session): Checkout {
  return {
    id: session.id,
    status:
      session.status === "complete"
        ? "complete"
        : session.status === "expired"
          ? "expired"
          : "open",
    paid: session.payment_status === "paid" || session.payment_status === "no_payment_required",
    mode: session.mode === "subscription" ? "subscription" : "payment",
    customerId: typeof session.customer === "string" ? session.customer : session.customer?.id,
    customerEmail: session.customer_details?.email ?? session.customer_email ?? undefined,
    subscriptionId:
      typeof session.subscription === "string" ? session.subscription : session.subscription?.id,
    amountTotal: session.amount_total ?? undefined,
    currency: session.currency ?? undefined,
    metadata: (session.metadata ?? {}) as Record<string, string>,
  };
}

const KNOWN_STATUSES = [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "unpaid",
  "incomplete",
  "paused",
] as const;

function toStatus(status: string): Subscription["status"] {
  if (status === "incomplete_expired") return "canceled";
  return (KNOWN_STATUSES as readonly string[]).includes(status)
    ? (status as Subscription["status"])
    : "incomplete";
}

function toSubscription(sub: Stripe.Subscription): Subscription {
  const item = sub.items.data[0];
  const price = item?.price;
  return {
    id: sub.id,
    customerId: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
    status: toStatus(sub.status),
    price: price?.lookup_key ?? price?.id ?? "",
    interval:
      price?.recurring?.interval === "year"
        ? "year"
        : price?.recurring?.interval === "month"
          ? "month"
          : null,
    currentPeriodEnd: item?.current_period_end ? new Date(item.current_period_end * 1000) : null,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
    metadata: (sub.metadata ?? {}) as Record<string, string>,
  };
}

export const stripeProvider: PaymentProvider = {
  id: "stripe",

  async createCustomer({ email, name, metadata }) {
    const customer = await stripe().customers.create({ email, name, metadata });
    return { id: customer.id };
  },

  async createCheckout(input) {
    const price = await resolvePrice(input.price);
    const session = await stripe().checkout.sessions.create({
      mode: input.mode,
      line_items: [{ price, quantity: input.quantity ?? 1 }],
      customer: input.customerId,
      customer_email: input.customerId ? undefined : input.customerEmail,
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata: input.metadata,
      allow_promotion_codes: input.allowPromotionCodes,
      ...(input.mode === "subscription" && {
        subscription_data: {
          metadata: input.metadata,
          ...(input.trialDays && { trial_period_days: input.trialDays }),
        },
      }),
      ...(input.mode === "payment" && {
        invoice_creation: { enabled: true },
        payment_intent_data: { metadata: input.metadata },
      }),
    });
    if (!session.url) throw new Error("Stripe did not return a checkout URL.");
    return { id: session.id, url: session.url };
  },

  async createPortal({ customerId, returnUrl }) {
    const session = await stripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return { url: session.url };
  },

  async getCheckout(id) {
    try {
      return toCheckout(await stripe().checkout.sessions.retrieve(id));
    } catch {
      return null;
    }
  },

  async parseWebhook(request) {
    const signature = request.headers.get("stripe-signature");
    if (!signature || !paymentsEnv.STRIPE_WEBHOOK_SECRET)
      throw new Error("Missing Stripe signature or webhook secret.");
    const event = await stripe().webhooks.constructEventAsync(
      await request.text(),
      signature,
      paymentsEnv.STRIPE_WEBHOOK_SECRET,
    );

    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        return {
          type: "checkout.completed",
          id: event.id,
          checkout: toCheckout(event.data.object),
        } satisfies PaymentEvent;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        return {
          type: "subscription.updated",
          id: event.id,
          subscription: toSubscription(event.data.object),
        } satisfies PaymentEvent;
      case "customer.subscription.deleted":
        return {
          type: "subscription.deleted",
          id: event.id,
          subscription: toSubscription(event.data.object),
        } satisfies PaymentEvent;
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const subscription = invoice.parent?.subscription_details?.subscription;
        return {
          type: "invoice.payment_failed",
          id: event.id,
          customerId:
            typeof invoice.customer === "string" ? invoice.customer : (invoice.customer?.id ?? ""),
          subscriptionId: typeof subscription === "string" ? subscription : subscription?.id,
        } satisfies PaymentEvent;
      }
      default:
        return null;
    }
  },
};
