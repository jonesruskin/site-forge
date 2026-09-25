import Link from "next/link";
import type { ComponentProps } from "react";

import { isExternal } from "@/lib/url";

type NavLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  external?: boolean;
};

/** A Link that opens external URLs in a new tab with safe rel attributes. */
export function NavLink({ href, external, children, ...props }: NavLinkProps) {
  if (external ?? isExternal(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
}
