import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Section } from "@/components/sections/kit/section";
import { SectionHeader } from "@/components/sections/kit/section-header";
import type { SectionTone } from "@/components/sections/kit/types";
import { cn } from "@/lib/utils";

export type Feature = {
  icon?: ReactNode;
  title: ReactNode;
  description: ReactNode;
  href?: string;
  linkLabel?: string;
};

export type FeatureGridProps = {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  features: Feature[];
  columns?: 2 | 3 | 4;
  /** "plain": icon + text · "cards": bordered tiles */
  variant?: "plain" | "cards";
  tone?: SectionTone;
  className?: string;
};

const columnClasses = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

export function FeatureGrid({
  eyebrow,
  title,
  description,
  features,
  columns = 3,
  variant = "plain",
  tone,
  className,
}: FeatureGridProps) {
  return (
    <Section tone={tone} className={className}>
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="mb-12 sm:mb-16"
      />
      <ul
        className={cn(
          "grid gap-x-8 gap-y-10",
          columnClasses[columns],
          variant === "cards" && "gap-4 gap-y-4",
        )}
      >
        {features.map((feature, index) => (
          <li
            key={index}
            className={cn(
              "flex flex-col gap-3",
              variant === "cards" &&
                "bg-card hover:border-foreground/20 rounded-xl border p-6 transition-colors",
            )}
          >
            {feature.icon && (
              <div
                className="bg-muted text-foreground flex size-10 items-center justify-center rounded-lg border [&_svg]:size-5"
                aria-hidden
              >
                {feature.icon}
              </div>
            )}
            <h3 className="font-semibold">{feature.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            {feature.href && (
              <Link
                href={feature.href}
                className="text-foreground mt-auto inline-flex items-center gap-1 text-sm font-medium hover:underline"
              >
                {feature.linkLabel ?? "Learn more"}
                <ArrowRightIcon aria-hidden className="size-3.5" />
              </Link>
            )}
          </li>
        ))}
      </ul>
    </Section>
  );
}
