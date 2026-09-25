import { ArrowUpRightIcon, ContactIcon } from "lucide-react";
import Link from "next/link";

import { QrCode } from "@/components/links/qr-code";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { linksConfig, linksPageUrl, withUtm } from "@/lib/links/config";
import { createMetadata } from "@/lib/metadata";
import { isExternal } from "@/lib/url";
import { cn } from "@/lib/utils";
import siteConfig from "@/site.config";

const title = linksConfig.title ?? siteConfig.author.name;

export const metadata = createMetadata({
  title,
  description: linksConfig.bio || siteConfig.description,
  path: "/links",
});

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Link-in-bio page. Standalone: no site header or footer, one thumb-friendly column. */
export default function LinksPage() {
  return (
    <main id="main" className="bg-background flex min-h-dvh justify-center px-4 py-14 sm:py-20">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <header className="flex flex-col items-center gap-4 text-center">
          <Avatar className="size-24 text-2xl">
            {linksConfig.avatar && <AvatarImage src={linksConfig.avatar} alt="" />}
            <AvatarFallback>{initials(title)}</AvatarFallback>
          </Avatar>
          <div className="grid gap-2">
            <h1 className="text-heading">{title}</h1>
            {linksConfig.bio && (
              <p className="text-muted-foreground text-pretty">{linksConfig.bio}</p>
            )}
          </div>
        </header>

        <ul className="grid w-full gap-3">
          {linksConfig.items.map((item) => {
            const external = isExternal(item.href);
            const className = cn(
              "group flex min-h-14 w-full items-center gap-3 rounded-xl border px-5 py-3 text-left transition-[background-color,transform] active:scale-[0.99]",
              item.highlight
                ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                : "bg-card hover:bg-accent",
            );
            const content = (
              <>
                <span className="grid min-w-0 flex-1 gap-0.5">
                  <span className="font-medium">{item.label}</span>
                  {item.description && (
                    <span
                      className={cn(
                        "text-sm",
                        item.highlight ? "opacity-80" : "text-muted-foreground",
                      )}
                    >
                      {item.description}
                    </span>
                  )}
                </span>
                {external && (
                  <ArrowUpRightIcon
                    aria-hidden
                    className="size-4 shrink-0 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                )}
              </>
            );
            return (
              <li key={item.href}>
                {external ? (
                  <a href={withUtm(item.href)} rel="noreferrer" className={className}>
                    {content}
                  </a>
                ) : (
                  <Link href={item.href} className={className}>
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        {siteConfig.socials.length > 0 && (
          <ul className="flex flex-wrap justify-center gap-2" aria-label="Elsewhere">
            {siteConfig.socials.map((social) => (
              <li key={social.href}>
                <a
                  href={withUtm(social.href)}
                  rel="me noreferrer"
                  className="text-muted-foreground hover:text-foreground hover:bg-accent inline-flex h-8 items-center rounded-full border px-3 text-sm capitalize transition-colors"
                >
                  {social.label ?? social.platform}
                </a>
              </li>
            ))}
          </ul>
        )}

        <footer className="flex flex-wrap items-center justify-center gap-2">
          <Button asChild variant="outline" size="sm">
            <a href="/links/vcard" download>
              <ContactIcon aria-hidden />
              Save contact
            </a>
          </Button>
          <QrCode url={linksPageUrl()} />
        </footer>
        <Link href="/" className="text-muted-foreground text-xs underline-offset-4 hover:underline">
          {siteConfig.name}
        </Link>
      </div>
    </main>
  );
}
