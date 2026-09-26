"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

/** Horizontal tabs (links) for the settings area, scrollable on small screens. */
export function SettingsTabs({
  links,
  label = "Settings",
}: {
  links: { label: string; href: string }[];
  label?: string;
}) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className="-mx-1 overflow-x-auto border-b">
      <ul className="flex min-w-max gap-1 px-1">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "text-muted-foreground hover:text-foreground -mb-px inline-flex border-b-2 border-transparent px-3 py-2.5 text-sm font-medium transition-colors",
                  active && "border-foreground text-foreground",
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
