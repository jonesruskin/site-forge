"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { DocsNavGroup } from "@/lib/docs/docs";
import { cn } from "@/lib/utils";

export function DocsSidebar({
  groups,
  label = "Documentation",
}: {
  groups: DocsNavGroup[];
  label?: string;
}) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className="flex flex-col gap-6 text-sm">
      {groups.map((group, index) => (
        <div key={group.title ?? index} className="flex flex-col gap-1">
          {group.title && <p className="px-2 pb-1 font-medium">{group.title}</p>}
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "text-muted-foreground hover:bg-accent hover:text-foreground block rounded-md px-2 py-1.5 transition-colors",
                      active && "bg-accent text-foreground font-medium",
                    )}
                  >
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
