import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function Input({ className, type = "text", ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-input bg-background placeholder:text-muted-foreground flex h-10 w-full min-w-0 rounded-md border px-3 py-2 text-base shadow-xs transition-[border-color,box-shadow] outline-none md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-3",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:text-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className,
      )}
      {...props}
    />
  );
}
