import siteConfig from "@/site.config";

import { NavLink } from "./nav-link";

export function SiteFooter() {
  const { footer, legal } = siteConfig.nav;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t">
      <div className="container-page py-12">
        {footer.length > 0 && (
          <div className="mb-12 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
            {footer.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h2 className="mb-3 text-sm font-medium text-foreground">{group.title}</h2>
                <ul className="flex flex-col gap-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <NavLink
                        href={link.href}
                        external={link.external}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        )}
        <div className="flex flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.name}
          </p>
          {(legal.length > 0 || siteConfig.socials.length > 0) && (
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {legal.map((link) => (
                <li key={link.href}>
                  <NavLink href={link.href} className="transition-colors hover:text-foreground">
                    {link.label}
                  </NavLink>
                </li>
              ))}
              {siteConfig.socials.map((social) => (
                <li key={social.href}>
                  <NavLink
                    href={social.href}
                    external
                    className="capitalize transition-colors hover:text-foreground"
                  >
                    {social.label ?? social.platform}
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}
