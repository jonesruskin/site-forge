import Link from "next/link";

import { Button } from "@/components/ui/button";
import { isExternal } from "@/lib/url";
import { cn } from "@/lib/utils";

import type { SectionAction } from "./types";

type SectionActionsProps = {
  actions?: SectionAction[];
  align?: "start" | "center";
  size?: "md" | "lg";
  className?: string;
};

/** Buttons rendered as links. The first action defaults to primary, the rest to outline. */
export function SectionActions({
  actions,
  align = "start",
  size = "lg",
  className,
}: SectionActionsProps) {
  if (!actions?.length) return null;
  return (
    <div className={cn("flex flex-wrap gap-3", align === "center" && "justify-center", className)}>
      {actions.map((action, index) => {
        const external = action.external ?? isExternal(action.href);
        const variant = action.variant ?? (index === 0 ? "primary" : "outline");
        return (
          <Button key={`${action.href}-${action.label}`} asChild variant={variant} size={size}>
            {external ? (
              <a href={action.href} target="_blank" rel="noopener noreferrer">
                {action.label}
                {action.icon}
              </a>
            ) : (
              <Link href={action.href}>
                {action.label}
                {action.icon}
              </Link>
            )}
          </Button>
        );
      })}
    </div>
  );
}
