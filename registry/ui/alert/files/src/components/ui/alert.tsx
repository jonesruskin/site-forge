import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-1 rounded-lg border px-4 py-3 text-sm has-[>svg]:grid-cols-[1.25rem_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5",
  {
    variants: {
      variant: {
        info: "bg-card text-card-foreground [&>svg]:text-muted-foreground",
        success: "border-success/30 bg-success/5 [&>svg]:text-success",
        warning: "border-warning/50 bg-warning/10 [&>svg]:text-warning",
        destructive:
          "border-destructive/30 bg-destructive/5 text-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: { variant: "info" },
  },
);

type AlertProps = ComponentProps<"div"> &
  VariantProps<typeof alertVariants> & {
    /** Interrupt screen readers (errors) or announce politely (everything else). */
    urgent?: boolean;
  };

export function Alert({ className, variant, urgent, ...props }: AlertProps) {
  return (
    <div
      data-slot="alert"
      role={(urgent ?? variant === "destructive") ? "alert" : "status"}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

export function AlertTitle({ className, ...props }: ComponentProps<"div">) {
  return (
    <div data-slot="alert-title" className={cn("col-start-2 font-medium", className)} {...props} />
  );
}

export function AlertDescription({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid gap-1 [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}
