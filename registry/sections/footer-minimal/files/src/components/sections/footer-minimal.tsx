import type { ReactNode } from "react";

import { NavLink } from "@/components/site/nav-link";
import type { NavLink as NavLinkItem } from "@/lib/site";
import { cn } from "@/lib/utils";

export type FooterMinimalProps = {
  copyright: ReactNode;
  links?: NavLinkItem[];
  navLabel?: string;
  className?: string;
};

export function FooterMinimal({
  copyright,
  links = [],
  navLabel = "Footer",
  className,
}: FooterMinimalProps) {
  return (
    <footer className={cn("border-t", className)}>
      <div className="container-page text-muted-foreground flex flex-col gap-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p>{copyright}</p>
        {links.length > 0 && (
          <nav aria-label={navLabel}>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <NavLink
                    href={link.href}
                    external={link.external}
                    className="hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </footer>
  );
}
