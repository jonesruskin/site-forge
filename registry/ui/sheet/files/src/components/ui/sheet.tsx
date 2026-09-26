"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { XIcon } from "lucide-react";
import { Dialog as SheetPrimitive } from "radix-ui";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export const Sheet = SheetPrimitive.Root;
export const SheetTrigger = SheetPrimitive.Trigger;
export const SheetClose = SheetPrimitive.Close;

const sheetVariants = cva(
  "bg-popover text-popover-foreground data-[state=open]:animate-in fixed z-50 flex flex-col gap-4 overflow-y-auto shadow-lg",
  {
    variants: {
      side: {
        right: "inset-y-0 right-0 h-full w-[min(24rem,85vw)] border-l",
        left: "inset-y-0 left-0 h-full w-[min(24rem,85vw)] border-r",
        top: "inset-x-0 top-0 max-h-[85dvh] border-b",
        bottom: "inset-x-0 bottom-0 max-h-[85dvh] rounded-t-xl border-t",
      },
    },
    defaultVariants: { side: "right" },
  },
);

type SheetContentProps = ComponentProps<typeof SheetPrimitive.Content> &
  VariantProps<typeof sheetVariants> & { closeLabel?: string };

export function SheetContent({
  className,
  children,
  side,
  closeLabel = "Close",
  ...props
}: SheetContentProps) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className="bg-foreground/40 data-[state=open]:animate-in fixed inset-0 z-50" />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(sheetVariants({ side }), className)}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-4 right-4 rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none">
          <XIcon className="size-4" aria-hidden />
          <span className="sr-only">{closeLabel}</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

export function SheetHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div data-slot="sheet-header" className={cn("grid gap-1.5 p-6 pb-0", className)} {...props} />
  );
}

export function SheetTitle({ className, ...props }: ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("font-semibold", className)}
      {...props}
    />
  );
}

export function SheetDescription({
  className,
  ...props
}: ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}
