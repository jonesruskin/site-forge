import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type ProgressProps = ComponentProps<"div"> & {
  /** 0–max. Omit for an indeterminate bar. */
  value?: number;
  max?: number;
  label: string;
};

export function Progress({ value, max = 100, label, className, ...props }: ProgressProps) {
  const percent = value === undefined ? undefined : Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn("bg-muted relative h-2 w-full overflow-hidden rounded-full", className)}
      {...props}
    >
      <div
        className={cn(
          "bg-primary h-full rounded-full transition-[width]",
          percent === undefined && "w-1/3 animate-pulse motion-reduce:animate-none",
        )}
        style={percent === undefined ? undefined : { width: `${percent}%` }}
      />
    </div>
  );
}
