"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/** Mount once (e.g. via the body-end slot or a layout). Call `toast()` from anywhere on the client. */
export function Toaster(props: ToasterProps) {
  const { resolvedTheme } = useTheme();
  return (
    <Sonner
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "bg-popover! text-popover-foreground! border-border! rounded-lg! shadow-md! font-sans!",
          description: "text-muted-foreground!",
          actionButton: "bg-primary! text-primary-foreground!",
          cancelButton: "bg-muted! text-muted-foreground!",
        },
      }}
      {...props}
    />
  );
}

export { toast } from "sonner";
