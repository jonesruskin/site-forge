import type { ComponentProps, ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

import type { SectionSpacing, SectionTone } from "./types";

type SectionProps = Omit<ComponentProps<"section">, "children"> & {
  /** Rendered element; use "div" when nesting inside another landmark. */
  as?: ElementType;
  /**
   * default: page background · muted: subtle band · inverted: flips light/dark
   * tokens for this block (dark band on a light page and vice versa).
   */
  tone?: SectionTone;
  spacing?: SectionSpacing;
  /** Wrap children in the page container (max width + gutters). */
  contained?: boolean;
  containerClassName?: string;
  children: ReactNode;
};

const spacingClasses: Record<SectionSpacing, string> = {
  none: "",
  sm: "py-10 sm:py-12",
  md: "py-16 sm:py-24",
  lg: "py-24 sm:py-32",
};

const toneClasses: Record<SectionTone, string> = {
  default: "",
  muted: "bg-muted",
  inverted: "tone-inverted bg-background text-foreground",
};

/** Vertical rhythm, tone and width for every section. */
export function Section({
  as: Component = "section",
  tone = "default",
  spacing = "md",
  contained = true,
  className,
  containerClassName,
  children,
  ...props
}: SectionProps) {
  return (
    <Component
      data-tone={tone}
      className={cn(toneClasses[tone], spacingClasses[spacing], className)}
      {...props}
    >
      {contained ? (
        <div className={cn("container-page", containerClassName)}>{children}</div>
      ) : (
        children
      )}
    </Component>
  );
}
