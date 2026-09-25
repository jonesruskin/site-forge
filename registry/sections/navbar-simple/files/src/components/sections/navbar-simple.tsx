import Link from "next/link";
import type { ReactNode } from "react";

import { SectionActions } from "@/components/sections/kit/section-actions";
import type { SectionAction } from "@/components/sections/kit/types";
import { MobileNav } from "@/components/site/mobile-nav";
import { NavLink } from "@/components/site/nav-link";
import type { NavLink as NavLinkItem } from "@/lib/site";
import { cn } from "@/lib/utils";

export type NavbarSimpleProps = {
  logo: ReactNode;
  logoHref?: string;
  links: NavLinkItem[];
  actions?: SectionAction[];
  /** Extra controls after the actions, e.g. a theme toggle or user menu. */
  trailing?: ReactNode;
  sticky?: boolean;
  navLabel?: string;
  className?: string;
};

export function NavbarSimple({
  logo,
  logoHref = "/",
  links,
  actions,
  trailing,
  sticky = true,
  navLabel = "Main",
  className,
}: NavbarSimpleProps) {
  return (
    <header
      className={cn(
        "bg-background/85 supports-[backdrop-filter]:bg-background/70 z-40 border-b backdrop-blur",
        sticky && "sticky top-0",
        className,
      )}
    >
      <div className="container-page flex h-16 items-center gap-8">
        <Link
          href={logoHref}
          className="font-display flex shrink-0 items-center gap-2 font-semibold tracking-tight"
        >
          {logo}
        </Link>
        {links.length > 0 && (
          <nav aria-label={navLabel} className="hidden md:block">
            <ul className="flex items-center gap-1">
              {links.map((link) => (
                <li key={link.href}>
                  <NavLink
                    href={link.href}
                    external={link.external}
                    className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm transition-colors"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <div className="ml-auto flex items-center gap-2">
          <SectionActions actions={actions} size="md" className="hidden gap-2 sm:flex" />
          {trailing}
          <MobileNav links={links} />
        </div>
      </div>
    </header>
  );
}
