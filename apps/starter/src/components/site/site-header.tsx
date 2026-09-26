import Link from "next/link";

import { headerActions } from "@/generated/header-actions";
import siteConfig from "@/site.config";

import { MobileNav } from "./mobile-nav";
import { NavLink } from "./nav-link";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  const links = siteConfig.nav.header;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container-page flex h-16 items-center gap-6">
        <Link href="/" className="font-display text-base font-semibold tracking-tight">
          {siteConfig.name}
        </Link>
        {links.length > 0 && (
          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {links.map((link) => (
                <li key={link.href}>
                  <NavLink
                    href={link.href}
                    external={link.external}
                    className="rounded-md px-3 py-2 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <div className="ml-auto flex items-center gap-1">
          {headerActions.map((Action, index) => (
            <Action key={index} />
          ))}
          <ThemeToggle />
          <MobileNav links={links} />
        </div>
      </div>
    </header>
  );
}
