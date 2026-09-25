import { PlusIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Section } from "@/components/sections/kit/section";
import { SectionHeader } from "@/components/sections/kit/section-header";
import type { SectionTone } from "@/components/sections/kit/types";
import { cn } from "@/lib/utils";

export type FaqItem = { question: string; answer: ReactNode };

export type FaqProps = {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  items: FaqItem[];
  /** "stacked": header above · "split": header beside the list on large screens */
  layout?: "stacked" | "split";
  /** Only one answer open at a time (native `<details name>`). */
  exclusive?: boolean;
  /** Unique per page when rendering several FAQs with `exclusive`. */
  name?: string;
  tone?: SectionTone;
  className?: string;
};

/** Native <details> disclosure: zero JavaScript, searchable with Ctrl+F, accessible by default. */
export function Faq({
  eyebrow,
  title,
  description,
  items,
  layout = "stacked",
  exclusive = true,
  name = "faq",
  tone,
  className,
}: FaqProps) {
  return (
    <Section tone={tone} className={className}>
      <div
        className={cn(
          "grid gap-12",
          layout === "split" ? "lg:grid-cols-[1fr_1.6fr] lg:gap-20" : "mx-auto max-w-3xl",
        )}
      >
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
          align={layout === "split" ? "start" : "center"}
        />
        <div className="divide-y border-y">
          {items.map((item) => (
            <details key={item.question} name={exclusive ? name : undefined} className="group">
              <summary className="focus-visible:ring-ring/40 flex cursor-pointer list-none items-start justify-between gap-6 rounded-sm py-5 font-medium outline-none focus-visible:ring-3 [&::-webkit-details-marker]:hidden">
                {item.question}
                <PlusIcon
                  aria-hidden
                  className="text-muted-foreground mt-0.5 size-4 shrink-0 transition-transform group-open:rotate-45"
                />
              </summary>
              <div className="text-muted-foreground -mt-1 pr-10 pb-5 leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}
