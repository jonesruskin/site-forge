import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type SeparatorProps = ComponentProps<"div"> & {
  orientation?: "horizontal" | "vertical";
  /** Purely visual separators are hidden from assistive tech. */
  decorative?: boolean;
};

export function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: SeparatorProps) {
  return (
    <div
      data-slot="separator"
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : orientation}
      className={cn(
        "bg-border shrink-0",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      {...props}
    />
  );
}
