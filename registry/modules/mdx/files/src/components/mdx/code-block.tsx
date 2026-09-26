import type { ComponentProps, CSSProperties } from "react";

import { cn } from "@/lib/utils";

import { CopyButton } from "./copy-button";

/**
 * Shiki emits `var(--shiki-*)` colors; this maps them onto theme tokens, so code
 * is monochrome in a neutral theme and picks up the accent in colorful ones.
 */
const tokenColors = {
  "--shiki-foreground": "var(--foreground)",
  "--shiki-background": "transparent",
  "--shiki-token-keyword": "color-mix(in oklch, var(--primary) 75%, var(--foreground))",
  "--shiki-token-string": "color-mix(in oklch, var(--success) 85%, var(--foreground))",
  "--shiki-token-string-expression": "color-mix(in oklch, var(--success) 85%, var(--foreground))",
  "--shiki-token-constant": "color-mix(in oklch, var(--warning) 45%, var(--foreground))",
  "--shiki-token-function": "color-mix(in oklch, var(--ring) 70%, var(--foreground))",
  "--shiki-token-parameter": "var(--foreground)",
  "--shiki-token-comment": "var(--muted-foreground)",
  "--shiki-token-punctuation": "var(--muted-foreground)",
  "--shiki-token-link": "var(--primary)",
  "--shiki-token-inserted": "var(--success)",
  "--shiki-token-deleted": "var(--destructive)",
} as CSSProperties;

export function CodeBlock({ className, style, children, ...props }: ComponentProps<"pre">) {
  return (
    <div data-code-block className="group relative">
      <pre
        // Focusable so keyboard users can scroll long lines.
        tabIndex={0}
        className={cn(
          "bg-muted overflow-x-auto rounded-lg border p-4 text-sm leading-6",
          className,
        )}
        style={{ ...tokenColors, ...style }}
        {...props}
      >
        {children}
      </pre>
      <CopyButton />
    </div>
  );
}
