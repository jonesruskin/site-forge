import { PageHeader } from "@/components/sections/page-header";
import { PricingTable } from "@/components/sections/pricing-table";
import { billingConfig } from "@/lib/billing/config";
import { pricingPlans } from "@/lib/billing/plans";
import { createMetadata } from "@/lib/metadata";
import siteConfig from "@/site.config";

export const metadata = createMetadata({
  title: "Pricing",
  description: `Plans and pricing for ${siteConfig.name}.`,
  path: "/pricing",
});

export default function PricingPage() {
  const plans = pricingPlans();
  const yearlySaving = plans
    .map((plan) =>
      plan.price.monthly && plan.price.yearly
        ? 1 - plan.price.yearly / (plan.price.monthly * 12)
        : 0,
    )
    .reduce((best, value) => Math.max(best, value), 0);

  return (
    <>
      <PageHeader
        title="Pricing"
        description={
          billingConfig.trialDays
            ? `Start with a ${billingConfig.trialDays}-day free trial. Cancel any time.`
            : "Simple plans. Cancel any time."
        }
        align="center"
      />
      <PricingTable
        className="pt-0 sm:pt-0"
        plans={plans}
        locale={siteConfig.locale}
        labels={
          yearlySaving >= 0.05 ? { yearlyHint: `Save ${Math.round(yearlySaving * 100)}%` } : {}
        }
      />
    </>
  );
}
