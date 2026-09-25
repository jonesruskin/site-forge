import type { ReactNode } from "react";

import { Section } from "@/components/sections/kit/section";
import type { SectionTone } from "@/components/sections/kit/types";
import { cn } from "@/lib/utils";

export type NewsletterBandProps = {
  title: ReactNode;
  description?: ReactNode;
  /** The signup form, e.g. <NewsletterForm /> from the newsletter module. */
  form: ReactNode;
  /** Privacy reassurance under the form. */
  note?: ReactNode;
  layout?: "inline" | "stacked";
  tone?: SectionTone;
  className?: string;
};

export function NewsletterBand({
  title,
  description,
  form,
  note,
  layout = "inline",
  tone = "muted",
  className,
}: NewsletterBandProps) {
  return (
    <Section tone={tone} className={className}>
      <div
        className={cn(
          "grid gap-8",
          layout === "inline"
            ? "lg:grid-cols-2 lg:items-center lg:gap-16"
            : "mx-auto max-w-xl text-center",
        )}
      >
        <div className="flex flex-col gap-3">
          <h2 className="text-heading">{title}</h2>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        <div className="flex flex-col gap-3">
          {form}
          {note && <p className="text-muted-foreground text-xs">{note}</p>}
        </div>
      </div>
    </Section>
  );
}
