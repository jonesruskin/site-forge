import { linksConfig } from "@/lib/links/config";
import siteConfig from "@/site.config";

export const dynamic = "force-static";

/** vCard 3.0 escaping: backslash, comma, semicolon and newlines. */
const escape = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\;").replace(/\r?\n/g, "\\n");

/** "Save contact": a vCard phones import in one tap. */
export function GET() {
  const { name, email, url } = siteConfig.author;
  const parts = name.trim().split(/\s+/);
  const family = parts.length > 1 ? parts.at(-1)! : "";
  const given = parts.length > 1 ? parts.slice(0, -1).join(" ") : name;
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escape(name)}`,
    `N:${escape(family)};${escape(given)};;;`,
    email && `EMAIL;TYPE=INTERNET:${escape(email)}`,
    `URL:${escape(url ?? siteConfig.url)}`,
    ...siteConfig.socials.map(
      (social) => `X-SOCIALPROFILE;TYPE=${escape(social.platform)}:${escape(social.href)}`,
    ),
    linksConfig.bio && `NOTE:${escape(linksConfig.bio)}`,
    "END:VCARD",
  ].filter(Boolean);
  const filename = `${name.replace(/[^\w-]+/g, "-").replace(/^-|-$/g, "") || "contact"}.vcf`;
  return new Response(`${lines.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
