import { AlertTriangleIcon, CheckCircle2Icon, InfoIcon, OctagonAlertIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const variants = {
  info: { icon: InfoIcon, className: "bg-muted/60", iconClass: "text-muted-foreground" },
  success: {
    icon: CheckCircle2Icon,
    className: "border-success/30 bg-success/5",
    iconClass: "text-success",
  },
  warning: {
    icon: AlertTriangleIcon,
    className: "border-warning/50 bg-warning/10",
    iconClass: "text-warning",
  },
  danger: {
    icon: OctagonAlertIcon,
    className: "border-destructive/30 bg-destructive/5",
    iconClass: "text-destructive",
  },
} as const;

type CalloutProps = {
  type?: keyof typeof variants;
  title?: ReactNode;
  children: ReactNode;
};

/** Use in MDX: <Callout type="warning" title="Heads up">…</Callout> */
export function Callout({ type = "info", title, children }: CalloutProps) {
  const { icon: Icon, className, iconClass } = variants[type];
  return (
    <aside
      className={cn("not-prose my-6 flex gap-3 rounded-lg border p-4 text-sm leading-6", className)}
    >
      <Icon aria-hidden className={cn("mt-0.5 size-4 shrink-0", iconClass)} />
      <div className="min-w-0 [&>*+*]:mt-2">
        {title && <p className="font-semibold">{title}</p>}
        {children}
      </div>
    </aside>
  );
}
