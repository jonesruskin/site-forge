import Link from "next/link";
import type { ReactNode } from "react";

import { SectionActions } from "@/components/sections/kit/section-actions";
import type { SectionAction } from "@/components/sections/kit/types";
import { MobileNav } from "@/components/site/mobile-nav";
import { NavLink } from "@/components/site/nav-link";
import type { NavLink as NavLinkItem } from "@/lib/site";
import { cn } from "@/lib/utils";

export type NavbarCenteredProps = {
  logo: ReactNode;
  logoHref?: string;
  links: NavLinkItem[];
  actions?: SectionAction[];
  trailing?: ReactNode;
  sticky?: boolean;
  navLabel?: string;
  className?: string;
};

/** Three-column bar: logo · centered links · actions. */
export function NavbarCentered({
  logo,
  logoHref = "/",
  links,
  actions,
  trailing,
  sticky = true,
  navLabel = "Main",
  className,
}: NavbarCenteredProps) {
  return (
    <header className={cn("bg-background z-40 border-b", sticky && "sticky top-0", className)}>
      <div className="container-page grid h-16 grid-cols-[1fr_auto] items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
        <Link
          href={logoHref}
          className="font-display flex w-fit items-center gap-2 font-semibold tracking-tight"
        >
          {logo}
        </Link>
        {links.length > 0 && (
          <nav aria-label={navLabel} className="hidden md:block">
            <ul className="flex items-center gap-6">
              {links.map((link) => (
                <li key={link.href}>
                  <NavLink
                    href={link.href}
                    external={link.external}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <div className="flex items-center justify-end gap-2">
          <SectionActions actions={actions} size="md" className="hidden gap-2 sm:flex" />
          {trailing}
          <MobileNav links={links} />
        </div>
      </div>
    </header>
  );
}
