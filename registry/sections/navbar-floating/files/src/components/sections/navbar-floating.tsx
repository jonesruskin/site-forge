import Link from "next/link";
import type { ReactNode } from "react";

import { SectionActions } from "@/components/sections/kit/section-actions";
import type { SectionAction } from "@/components/sections/kit/types";
import { MobileNav } from "@/components/site/mobile-nav";
import { NavLink } from "@/components/site/nav-link";
import type { NavLink as NavLinkItem } from "@/lib/site";
import { cn } from "@/lib/utils";

export type NavbarFloatingProps = {
  logo: ReactNode;
  logoHref?: string;
  links: NavLinkItem[];
  actions?: SectionAction[];
  trailing?: ReactNode;
  navLabel?: string;
  className?: string;
};

/** A rounded bar detached from the edges, floating over content as you scroll. */
export function NavbarFloating({
  logo,
  logoHref = "/",
  links,
  actions,
  trailing,
  navLabel = "Main",
  className,
}: NavbarFloatingProps) {
  return (
    <header className={cn("sticky top-3 z-40 px-3 sm:top-4", className)}>
      <div className="bg-background/80 supports-[backdrop-filter]:bg-background/60 mx-auto flex h-14 max-w-measure items-center gap-6 rounded-2xl border px-4 shadow-md backdrop-blur-md sm:px-5">
        <Link
          href={logoHref}
          className="font-display flex shrink-0 items-center gap-2 font-semibold tracking-tight"
        >
          {logo}
        </Link>
        {links.length > 0 && (
          <nav aria-label={navLabel} className="mx-auto hidden md:block">
            <ul className="flex items-center gap-1">
              {links.map((link) => (
                <li key={link.href}>
                  <NavLink
                    href={link.href}
                    external={link.external}
                    className="text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg px-3 py-1.5 text-sm transition-colors"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <SectionActions actions={actions} size="md" className="hidden gap-2 sm:flex" />
          {trailing}
          <MobileNav links={links} />
        </div>
      </div>
    </header>
  );
}
