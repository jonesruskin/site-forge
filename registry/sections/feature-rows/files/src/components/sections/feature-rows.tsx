import { CheckIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Section } from "@/components/sections/kit/section";
import { SectionActions } from "@/components/sections/kit/section-actions";
import { SectionHeader } from "@/components/sections/kit/section-header";
import { SectionMedia } from "@/components/sections/kit/section-media";
import type { SectionAction, SectionImage, SectionTone } from "@/components/sections/kit/types";
import { cn } from "@/lib/utils";

export type FeatureRow = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description: ReactNode;
  bullets?: ReactNode[];
  actions?: SectionAction[];
  image?: SectionImage;
  media?: ReactNode;
};

export type FeatureRowsProps = {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  rows: FeatureRow[];
  /** Side of the first row's media; rows alternate from there. */
  startMedia?: "start" | "end";
  tone?: SectionTone;
  className?: string;
};

export function FeatureRows({
  eyebrow,
  title,
  description,
  rows,
  startMedia = "end",
  tone,
  className,
}: FeatureRowsProps) {
  return (
    <Section tone={tone} className={className}>
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        align="center"
        className="mb-16 sm:mb-24"
      />
      <div className="flex flex-col gap-20 sm:gap-28">
        {rows.map((row, index) => {
          const mediaFirst = (index % 2 === 0) === (startMedia === "start");
          return (
            <article key={index} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div className={cn("flex flex-col gap-4", mediaFirst && "lg:order-2")}>
                {row.eyebrow && <p className="text-eyebrow text-muted-foreground">{row.eyebrow}</p>}
                <h3 className="text-heading">{row.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{row.description}</p>
                {row.bullets && row.bullets.length > 0 && (
                  <ul className="mt-2 flex flex-col gap-2.5">
                    {row.bullets.map((bullet, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <CheckIcon aria-hidden className="text-foreground mt-0.5 size-4 shrink-0" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <SectionActions actions={row.actions} size="md" className="mt-4" />
              </div>
              <div className={cn(mediaFirst && "lg:order-1")}>
                {row.media ?? (row.image && <SectionMedia image={row.image} aspect="4/3" />)}
              </div>
            </article>
          );
        })}
      </div>
    </Section>
  );
}
