import { CheckIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Section } from "@/components/sections/kit/section";
import { SectionHeader } from "@/components/sections/kit/section-header";
import type { SectionTone } from "@/components/sections/kit/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PricingPlan = {
  id: string;
  name: string;
  description?: string;
  /** Amounts in major units (e.g. 12 = $12). `null` renders `customPriceLabel`. */
  price: { monthly: number | null; yearly?: number | null };
  currency?: string;
  customPriceLabel?: string;
  features: string[];
  /**
   * Where the button goes. Pass `{ monthly, yearly }` to send each interval to
   * its own URL (the right one shows with the CSS toggle).
   */
  cta: { label: string; href: string | { monthly: string; yearly: string } };
  highlighted?: boolean;
  badge?: string;
};

export type PricingTableProps = {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  plans: PricingPlan[];
  /** Show the monthly/yearly switch when any plan has a yearly price. */
  showIntervalToggle?: boolean;
  labels?: {
    monthly?: string;
    yearly?: string;
    perMonth?: string;
    perYear?: string;
    /** Shown next to "Yearly", e.g. "Save 20%". */
    yearlyHint?: string;
    interval?: string;
  };
  locale?: string;
  /** Unique per page if you render more than one table. */
  name?: string;
  tone?: SectionTone;
  className?: string;
};

function formatPrice(amount: number, currency: string, locale?: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * The monthly/yearly toggle is pure CSS: two radio inputs and `:has()`. No
 * client JavaScript, works before hydration, and remains keyboard accessible.
 */
export function PricingTable({
  eyebrow,
  title,
  description,
  plans,
  showIntervalToggle = true,
  labels = {},
  locale,
  name = "billing-interval",
  tone,
  className,
}: PricingTableProps) {
  const hasYearly = plans.some((plan) => plan.price.yearly != null);
  const toggle = showIntervalToggle && hasYearly;
  // Literal class names so Tailwind can see them.
  const hideWhenYearly = "group-has-[[data-interval=yearly]:checked]/pricing:hidden";
  const showWhenYearly = "group-has-[[data-interval=yearly]:checked]/pricing:inline";
  const showWhenYearlyFlex = "group-has-[[data-interval=yearly]:checked]/pricing:inline-flex";

  return (
    <Section tone={tone} className={cn("group/pricing", className)}>
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        align="center"
        className="mb-10"
      />
      {toggle && (
        <fieldset className="mb-12 flex justify-center">
          <legend className="sr-only">{labels.interval ?? "Billing interval"}</legend>
          <div className="bg-muted inline-flex rounded-full p-1 text-sm">
            {(["monthly", "yearly"] as const).map((interval) => (
              <label
                key={interval}
                className="has-[:checked]:bg-background has-[:checked]:text-foreground has-[:focus-visible]:ring-ring text-muted-foreground flex cursor-pointer items-center gap-2 rounded-full px-4 py-1.5 font-medium transition-colors has-[:checked]:shadow-xs has-[:focus-visible]:ring-2"
              >
                <input
                  type="radio"
                  name={name}
                  value={interval}
                  data-interval={interval}
                  defaultChecked={interval === "monthly"}
                  className="sr-only"
                />
                {interval === "monthly"
                  ? (labels.monthly ?? "Monthly")
                  : (labels.yearly ?? "Yearly")}
                {interval === "yearly" && labels.yearlyHint && (
                  <span className="text-success text-xs font-semibold">{labels.yearlyHint}</span>
                )}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <ul
        className={cn(
          "mx-auto grid max-w-5xl gap-6",
          plans.length >= 3 ? "lg:grid-cols-3" : "md:grid-cols-2",
          plans.length === 2 && "max-w-3xl",
        )}
      >
        {plans.map((plan) => {
          const currency = plan.currency ?? "USD";
          const monthly = plan.price.monthly;
          const yearlyPrice = plan.price.yearly;
          return (
            <li
              key={plan.id}
              className={cn(
                "bg-card relative flex flex-col gap-6 rounded-2xl border p-8",
                plan.highlighted && "border-foreground shadow-lg",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                {plan.badge && (
                  <span className="bg-primary text-primary-foreground rounded-full px-2.5 py-0.5 text-xs font-medium">
                    {plan.badge}
                  </span>
                )}
              </div>
              {plan.description && (
                <p className="text-muted-foreground -mt-3 text-sm">{plan.description}</p>
              )}
              <p className="flex items-baseline gap-1">
                {monthly === null ? (
                  <span className="font-display text-4xl font-semibold tracking-tight">
                    {plan.customPriceLabel ?? "Custom"}
                  </span>
                ) : (
                  <>
                    <span
                      className={cn(
                        "font-display text-4xl font-semibold tracking-tight tabular-nums",
                        toggle && yearlyPrice != null && hideWhenYearly,
                      )}
                    >
                      {formatPrice(monthly, currency, locale)}
                    </span>
                    <span
                      className={cn(
                        "text-muted-foreground text-sm",
                        toggle && yearlyPrice != null && hideWhenYearly,
                      )}
                    >
                      {labels.perMonth ?? "/month"}
                    </span>
                    {toggle && yearlyPrice != null && (
                      <>
                        <span
                          className={cn(
                            "font-display hidden text-4xl font-semibold tracking-tight tabular-nums",
                            showWhenYearly,
                          )}
                        >
                          {formatPrice(yearlyPrice, currency, locale)}
                        </span>
                        <span
                          className={cn("text-muted-foreground hidden text-sm", showWhenYearly)}
                        >
                          {labels.perYear ?? "/year"}
                        </span>
                      </>
                    )}
                  </>
                )}
              </p>
              {typeof plan.cta.href === "string" || !toggle ? (
                <Button
                  asChild
                  variant={plan.highlighted ? "primary" : "outline"}
                  size="lg"
                  className="w-full"
                >
                  {/* Plain anchors: CTAs often hit checkout routes, which must never be prefetched. */}
                  <a
                    href={typeof plan.cta.href === "string" ? plan.cta.href : plan.cta.href.monthly}
                  >
                    {plan.cta.label}
                  </a>
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    variant={plan.highlighted ? "primary" : "outline"}
                    size="lg"
                    className={cn("w-full", hideWhenYearly)}
                  >
                    <a href={plan.cta.href.monthly}>{plan.cta.label}</a>
                  </Button>
                  <Button
                    asChild
                    variant={plan.highlighted ? "primary" : "outline"}
                    size="lg"
                    className={cn("hidden w-full", showWhenYearlyFlex)}
                  >
                    <a href={plan.cta.href.yearly}>{plan.cta.label}</a>
                  </Button>
                </>
              )}
              <ul className="flex flex-col gap-3 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <CheckIcon aria-hidden className="text-foreground mt-0.5 size-4 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
