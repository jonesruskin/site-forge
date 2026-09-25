"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  className?: string;
  label?: string;
};

/** Switches between light and dark. Icons swap via CSS, so there is no hydration flash. */
export function ThemeToggle({ className, label = "Toggle color theme" }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
        className,
      )}
    >
      <SunIcon aria-hidden className="size-4 dark:hidden" />
      <MoonIcon aria-hidden className="hidden size-4 dark:block" />
      <span className="sr-only">{label}</span>
    </button>
  );
}
