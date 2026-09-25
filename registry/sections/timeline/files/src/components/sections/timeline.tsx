import type { ReactNode } from "react";

import { Section } from "@/components/sections/kit/section";
import { SectionHeader } from "@/components/sections/kit/section-header";
import type { SectionTone } from "@/components/sections/kit/types";

export type TimelineEntry = {
  /** Display label, e.g. "2024" or "March 2025". */
  date: string;
  /** Machine-readable date for <time>, e.g. "2025-03". */
  dateTime?: string;
  title: ReactNode;
  description?: ReactNode;
};

export type TimelineProps = {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  entries: TimelineEntry[];
  tone?: SectionTone;
  className?: string;
};

export function Timeline({ eyebrow, title, description, entries, tone, className }: TimelineProps) {
  return (
    <Section tone={tone} className={className}>
      <SectionHeader eyebrow={eyebrow} title={title} description={description} className="mb-12" />
      <ol className="relative max-w-3xl border-l">
        {entries.map((entry, index) => (
          <li key={index} className="relative pb-10 pl-8 last:pb-0">
            <span
              aria-hidden
              className="bg-background border-foreground absolute top-1.5 -left-[5px] size-2.5 rounded-full border-2"
            />
            <time dateTime={entry.dateTime} className="text-muted-foreground font-mono text-xs">
              {entry.date}
            </time>
            <h3 className="mt-1 font-semibold">{entry.title}</h3>
            {entry.description && (
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {entry.description}
              </p>
            )}
          </li>
        ))}
      </ol>
    </Section>
  );
}
