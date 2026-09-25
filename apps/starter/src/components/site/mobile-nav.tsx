"use client";

import { MenuIcon, XIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import type { NavLink as NavLinkType } from "@/lib/site";

import { NavLink } from "./nav-link";

/**
 * Mobile menu built on the native Popover API: focus handling, Esc and
 * light-dismiss come from the browser. JS only closes it after navigation.
 */
export function MobileNav({ links, label = "Menu" }: { links: NavLinkType[]; label?: string }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const popover = ref.current;
    if (popover?.matches(":popover-open")) popover.hidePopover();
  }, [pathname]);

  if (links.length === 0) return null;

  return (
    <>
      <button
        type="button"
        popoverTarget="mobile-nav"
        className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:hidden"
      >
        <MenuIcon aria-hidden className="size-5" />
        <span className="sr-only">{label}</span>
      </button>
      <div
        ref={ref}
        id="mobile-nav"
        popover="auto"
        className="inset-0 m-0 h-dvh w-full max-w-none bg-background p-0 text-foreground backdrop:bg-transparent"
      >
        <div className="container-page flex h-16 items-center justify-end">
          <button
            type="button"
            popoverTarget="mobile-nav"
            popoverTargetAction="hide"
            className="inline-flex size-9 items-center justify-center rounded-md hover:bg-accent"
          >
            <XIcon aria-hidden className="size-5" />
            <span className="sr-only">Close {label.toLowerCase()}</span>
          </button>
        </div>
        <nav aria-label={label} className="container-page">
          <ul className="flex flex-col gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <NavLink
                  href={link.href}
                  external={link.external}
                  className="block rounded-md px-3 py-3 text-lg font-medium hover:bg-accent"
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
