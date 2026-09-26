import { ChevronDownIcon } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/** A real <select>: no JS, native pickers on mobile, works in plain forms. */
export function NativeSelect({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <div data-slot="native-select" className={cn("relative w-full", className)}>
      <select
        className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:border-destructive h-10 w-full appearance-none rounded-md border py-2 pr-9 pl-3 text-base shadow-xs outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        {...props}
      >
        {children}
      </select>
      <ChevronDownIcon
        aria-hidden
        className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
      />
    </div>
  );
}
