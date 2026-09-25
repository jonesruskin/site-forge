import type { ReactNode } from "react";

import { Section } from "@/components/sections/kit/section";
import { SectionHeader } from "@/components/sections/kit/section-header";
import type { SectionTone } from "@/components/sections/kit/types";
import { cn } from "@/lib/utils";

export type Stat = {
  value: ReactNode;
  label: ReactNode;
  description?: ReactNode;
};

export type StatsProps = {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  stats: Stat[];
  /** "row": numbers in a line · "grid": bordered cells */
  variant?: "row" | "grid";
  tone?: SectionTone;
  className?: string;
};

export function Stats({
  eyebrow,
  title,
  description,
  stats,
  variant = "row",
  tone,
  className,
}: StatsProps) {
  return (
    <Section tone={tone} className={className}>
      <SectionHeader eyebrow={eyebrow} title={title} description={description} className="mb-12" />
      <dl
        className={cn(
          "grid gap-8 sm:grid-cols-2",
          stats.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3",
          variant === "grid" && "bg-border gap-px overflow-hidden rounded-xl border",
        )}
      >
        {stats.map((stat, index) => (
          <div
            key={index}
            className={cn("flex flex-col gap-2", variant === "grid" && "bg-background p-8")}
          >
            <dt className="text-muted-foreground order-2 text-sm">{stat.label}</dt>
            <dd className="font-display order-1 text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
              {stat.value}
            </dd>
            {stat.description && (
              <dd className="text-muted-foreground order-3 text-sm">{stat.description}</dd>
            )}
          </div>
        ))}
      </dl>
    </Section>
  );
}
