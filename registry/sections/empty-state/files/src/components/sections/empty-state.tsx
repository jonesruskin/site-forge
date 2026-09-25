import type { ReactNode } from "react";

import { SectionActions } from "@/components/sections/kit/section-actions";
import type { SectionAction } from "@/components/sections/kit/types";
import { cn } from "@/lib/utils";

export type EmptyStateProps = {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: SectionAction[];
  /** dashed: inside lists and tables · plain: full-page first-run screens */
  variant?: "dashed" | "plain";
  className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  actions,
  variant = "dashed",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 px-6 py-14 text-center",
        variant === "dashed" && "rounded-xl border border-dashed",
        className,
      )}
    >
      {icon && (
        <div
          aria-hidden
          className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full [&_svg]:size-5"
        >
          {icon}
        </div>
      )}
      <div className="flex max-w-sm flex-col gap-1.5">
        <h2 className="font-semibold">{title}</h2>
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
      </div>
      <SectionActions actions={actions} size="md" align="center" className="mt-2" />
    </div>
  );
}
