/**
 * Creates (or updates) Stripe products and prices from billing.plans in
 * site.config.ts, using lookup keys so code never hardcodes price ids.
 *
 *   STRIPE_SECRET_KEY=sk_test_… pnpm billing:sync
 *
 * Safe to re-run: existing prices with the same amount are reused; a changed
 * amount creates a new price and moves the lookup key to it.
 */
import Stripe from "stripe";

import { billingConfig } from "../src/lib/billing/config";
import { isCustom, isFree, lookupKey, priceFor, type Interval } from "../src/lib/billing/plans";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("Set STRIPE_SECRET_KEY first (test mode keys start with sk_test_).");
  process.exit(1);
}
const stripe = new Stripe(key);
const currency = billingConfig.currency.toLowerCase();

async function main() {
  for (const plan of billingConfig.plans) {
    if (isFree(plan) || isCustom(plan)) continue;

    const found = await stripe.products.search({ query: `metadata['planId']:'${plan.id}'` });
    const product =
      found.data[0] ??
      (await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: { planId: plan.id },
      }));
    if (
      found.data[0] &&
      (product.name !== plan.name || product.description !== (plan.description ?? null))
    ) {
      await stripe.products.update(product.id, {
        name: plan.name,
        description: plan.description ?? "",
      });
    }

    for (const interval of ["month", "year"] as Interval[]) {
      const amount = priceFor(plan, interval);
      if (amount === null || amount === undefined) continue;
      const lookup = lookupKey(plan, interval);
      const unitAmount = Math.round(amount * 100);
      const { data } = await stripe.prices.list({ lookup_keys: [lookup], limit: 1 });
      const current = data[0];
      if (
        current &&
        current.unit_amount === unitAmount &&
        current.currency === currency &&
        current.active
      ) {
        console.log(`✓ ${lookup} ${amount} ${currency} (unchanged)`);
        continue;
      }
      await stripe.prices.create({
        product: product.id,
        currency,
        unit_amount: unitAmount,
        recurring: { interval },
        lookup_key: lookup,
        transfer_lookup_key: true,
        metadata: { planId: plan.id },
      });
      console.log(`+ ${lookup} ${amount} ${currency}${current ? " (replaced)" : ""}`);
    }
  }
  console.log(
    "Done. Configure the customer portal at https://dashboard.stripe.com/settings/billing/portal",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
