import Link from "next/link";
import type { ReactNode } from "react";

import { NavLink } from "@/components/site/nav-link";
import type { NavGroup, NavLink as NavLinkItem, Social } from "@/lib/site";
import { cn } from "@/lib/utils";

export type FooterColumnsProps = {
  logo: ReactNode;
  tagline?: ReactNode;
  groups: NavGroup[];
  legal?: NavLinkItem[];
  socials?: Social[];
  /** e.g. "© 2026 Acme Inc." */
  copyright: ReactNode;
  /** Extra content under the tagline, e.g. a newsletter form. */
  aside?: ReactNode;
  className?: string;
};

export function FooterColumns({
  logo,
  tagline,
  groups,
  legal = [],
  socials = [],
  copyright,
  aside,
  className,
}: FooterColumnsProps) {
  return (
    <footer className={cn("border-t", className)}>
      <div className="container-page grid gap-12 py-16 lg:grid-cols-[1.2fr_2fr]">
        <div className="flex max-w-sm flex-col gap-4">
          <Link href="/" className="font-display w-fit font-semibold tracking-tight">
            {logo}
          </Link>
          {tagline && <p className="text-muted-foreground text-sm leading-relaxed">{tagline}</p>}
          {aside}
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {groups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="mb-4 text-sm font-medium">{group.title}</h2>
              <ul className="flex flex-col gap-3">
                {group.links.map((link) => (
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
          ))}
        </div>
      </div>
      <div className="border-t">
        <div className="container-page text-muted-foreground flex flex-col gap-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>{copyright}</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {legal.map((link) => (
              <li key={link.href}>
                <NavLink href={link.href} className="hover:text-foreground transition-colors">
                  {link.label}
                </NavLink>
              </li>
            ))}
            {socials.map((social) => (
              <li key={social.href}>
                <NavLink
                  href={social.href}
                  external
                  className="hover:text-foreground capitalize transition-colors"
                >
                  {social.label ?? social.platform}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
