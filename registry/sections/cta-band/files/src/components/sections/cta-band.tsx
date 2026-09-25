import type { ReactNode } from "react";

import { Section } from "@/components/sections/kit/section";
import { SectionActions } from "@/components/sections/kit/section-actions";
import type { SectionAction } from "@/components/sections/kit/types";
import { cn } from "@/lib/utils";

export type CtaBandProps = {
  title: ReactNode;
  description?: ReactNode;
  actions?: SectionAction[];
  /** inverted: full-width flipped band · card: inset rounded panel · plain: bordered band */
  variant?: "inverted" | "card" | "plain";
  align?: "start" | "center";
  className?: string;
};

export function CtaBand({
  title,
  description,
  actions,
  variant = "card",
  align = "center",
  className,
}: CtaBandProps) {
  const body = (
    <div
      className={cn(
        "flex flex-col gap-6",
        align === "center"
          ? "items-center text-center"
          : "lg:flex-row lg:items-end lg:justify-between",
      )}
    >
      <div className={cn("flex max-w-2xl flex-col gap-4", align === "center" && "items-center")}>
        <h2 className="text-heading">{title}</h2>
        {description && <p className="text-lead text-muted-foreground">{description}</p>}
      </div>
      <SectionActions
        actions={actions}
        align={align === "center" ? "center" : "start"}
        className="shrink-0"
      />
    </div>
  );

  if (variant === "inverted") {
    return (
      <Section tone="inverted" className={className}>
        {body}
      </Section>
    );
  }
  if (variant === "card") {
    return (
      <Section className={className}>
        <div className="tone-inverted bg-background text-foreground rounded-2xl px-6 py-14 sm:px-12 sm:py-20">
          {body}
        </div>
      </Section>
    );
  }
  return <Section className={cn("border-y", className)}>{body}</Section>;
}
