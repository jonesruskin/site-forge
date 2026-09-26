import "server-only";

import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Checkout, CreateCheckoutInput, PaymentProvider, Subscription } from "./types";

/**
 * A local stand-in for Stripe so checkout, webhooks and the customer portal can
 * be exercised with zero keys. State lives in .site/dev/payments.json.
 */

type MockCheckout = Checkout & { input: CreateCheckoutInput; createdAt: string };
type MockState = {
  customers: Record<string, { email: string; name?: string }>;
  checkouts: Record<string, MockCheckout>;
  subscriptions: Record<string, Subscription>;
};

const FILE = path.join(process.cwd(), ".site", "dev", "payments.json");
const id = (prefix: string) => `${prefix}_${randomBytes(9).toString("base64url")}`;

export async function readMockState(): Promise<MockState> {
  try {
    const state = JSON.parse(await readFile(FILE, "utf8")) as MockState;
    for (const sub of Object.values(state.subscriptions)) {
      sub.currentPeriodEnd = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : null;
      sub.trialEnd = sub.trialEnd ? new Date(sub.trialEnd) : null;
    }
    return state;
  } catch {
    return { customers: {}, checkouts: {}, subscriptions: {} };
  }
}

export async function writeMockState(state: MockState) {
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify(state, null, 2));
}

export function newMockId(prefix: string) {
  return id(prefix);
}

export const mockProvider: PaymentProvider = {
  id: "mock",

  async createCustomer({ email, name }) {
    const state = await readMockState();
    const customerId = id("mock_cus");
    state.customers[customerId] = { email, name };
    await writeMockState(state);
    return { id: customerId };
  },

  async createCheckout(input) {
    const state = await readMockState();
    const display = input.inlinePrice ?? input.display;
    const checkoutId = id("mock_cs");
    state.checkouts[checkoutId] = {
      id: checkoutId,
      status: "open",
      paid: false,
      mode: input.mode,
      customerId: input.customerId,
      customerEmail:
        input.customerEmail ??
        (input.customerId ? state.customers[input.customerId]?.email : undefined),
      amountTotal: display ? Math.round(display.amount * 100) * (input.quantity ?? 1) : undefined,
      currency: display?.currency,
      metadata: input.metadata ?? {},
      input,
      createdAt: new Date().toISOString(),
    };
    await writeMockState(state);
    return { id: checkoutId, url: `/dev/checkout/${checkoutId}` };
  },

  async createPortal({ customerId, returnUrl }) {
    // The mock portal only returns to same-site paths (no open redirects).
    const { pathname, search } = new URL(returnUrl, "http://localhost");
    return {
      url: `/dev/billing-portal?customer=${encodeURIComponent(customerId)}&return=${encodeURIComponent(pathname + search)}`,
    };
  },

  async getCheckout(checkoutId) {
    const checkout = (await readMockState()).checkouts[checkoutId];
    if (!checkout) return null;
    const { input: _input, createdAt: _createdAt, ...rest } = checkout;
    return rest;
  },

  async parseWebhook() {
    // The mock provider dispatches events directly from /dev/checkout and /dev/billing-portal.
    return null;
  },
};
