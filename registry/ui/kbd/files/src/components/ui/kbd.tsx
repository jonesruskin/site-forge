import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function Kbd({ className, ...props }: ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-5 min-w-5 items-center justify-center rounded-sm border px-1 font-mono text-[0.7rem] font-medium",
        className,
      )}
      {...props}
    />
  );
}
