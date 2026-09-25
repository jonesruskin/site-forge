import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  align?: "start" | "center";
  /** Heading level; sections default to h2 (the page title is the h1). */
  as?: ElementType;
  /** Use the large display style instead of the section heading style. */
  display?: boolean;
  id?: string;
  className?: string;
  children?: ReactNode;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "start",
  as: Heading = "h2",
  display = false,
  id,
  className,
  children,
}: SectionHeaderProps) {
  if (!eyebrow && !title && !description && !children) return null;
  return (
    <header
      className={cn(
        "flex max-w-3xl flex-col gap-4",
        align === "center" && "mx-auto items-center text-center",
        className,
      )}
    >
      {eyebrow && <p className="text-eyebrow text-muted-foreground">{eyebrow}</p>}
      {title && (
        <Heading id={id} className={display ? "text-display" : "text-heading"}>
          {title}
        </Heading>
      )}
      {description && <p className="text-lead text-muted-foreground max-w-2xl">{description}</p>}
      {children}
    </header>
  );
}
