import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input bg-background placeholder:text-muted-foreground flex field-sizing-content min-h-24 w-full rounded-md border px-3 py-2 text-base shadow-xs transition-[border-color,box-shadow] outline-none md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-3",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
