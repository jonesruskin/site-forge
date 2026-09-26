import type { ReactNode } from "react";

import { Section } from "@/components/sections/kit/section";
import { SectionHeader } from "@/components/sections/kit/section-header";
import type { SectionTone } from "@/components/sections/kit/types";
import { cn } from "@/lib/utils";

export type BentoItem = {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  /** Visual slot at the top of the tile: screenshot, chart, illustration. */
  media?: ReactNode;
  /** sm: 1×1 · wide: 2×1 · tall: 1×2 · lg: 2×2 · full: whole row */
  size?: "sm" | "wide" | "tall" | "lg" | "full";
  /** Flip this tile's tokens for emphasis. */
  inverted?: boolean;
};

export type BentoGridProps = {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  items: BentoItem[];
  tone?: SectionTone;
  className?: string;
};

const sizeClasses: Record<NonNullable<BentoItem["size"]>, string> = {
  sm: "",
  wide: "sm:col-span-2",
  tall: "lg:row-span-2",
  lg: "sm:col-span-2 lg:row-span-2",
  full: "sm:col-span-2 lg:col-span-3",
};

export function BentoGrid({ eyebrow, title, description, items, tone, className }: BentoGridProps) {
  return (
    <Section tone={tone} className={className}>
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="mb-12 sm:mb-16"
      />
      <ul className="grid auto-rows-[minmax(14rem,auto)] grid-flow-dense gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <li
            key={index}
            className={cn(
              "bg-card flex flex-col overflow-hidden rounded-xl border",
              item.inverted && "tone-inverted bg-background text-foreground",
              sizeClasses[item.size ?? "sm"],
            )}
          >
            {item.media && (
              <div className="relative min-h-40 flex-1 overflow-hidden border-b">{item.media}</div>
            )}
            <div className="flex flex-col gap-2 p-6">
              {item.icon && (
                <div className="text-foreground mb-2 [&_svg]:size-5" aria-hidden>
                  {item.icon}
                </div>
              )}
              <h3 className="font-semibold">{item.title}</h3>
              {item.description && (
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
