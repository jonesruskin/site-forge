import { ogSize, renderOgImage } from "@/lib/seo/og-image";
import siteConfig from "@/site.config";

export const alt = siteConfig.name;
export const size = ogSize;
export const contentType = "image/png";

/** Default social image for every page that doesn't define its own. */
export default function Image() {
  return renderOgImage({ title: siteConfig.name, description: siteConfig.description });
}
