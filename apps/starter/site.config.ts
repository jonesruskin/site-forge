import { installedModules } from "@/generated/modules";
import { defineSite } from "@/lib/site";

/**
 * Single source of truth for this site. Modules read their own blocks from here
 * (e.g. `billing`, `contact`) and the site CLI adds nav entries when installing.
 */
const siteConfig = defineSite({
  name: "Starter",
  description: "A new site built with site-forge.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en",
  author: {
    name: "Your Name",
  },
  socials: [],
  nav: {
    header: [],
    footer: [],
    legal: [],
  },
  modules: installedModules,
  features: {},
  seo: {
    titleTemplate: "%s · Starter",
    keywords: [],
  },
});

export default siteConfig;
