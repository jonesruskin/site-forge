import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/url";

/** Paths crawlers should skip even in production. */
const DISALLOW = ["/api/", "/dev/", "/dashboard", "/admin", "/settings"];

/** Preview and staging deployments are never indexed. */
function isProductionDeployment() {
  if (process.env.VERCEL_ENV) return process.env.VERCEL_ENV === "production";
  return process.env.NODE_ENV === "production";
}

export default function robots(): MetadataRoute.Robots {
  if (!isProductionDeployment()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: DISALLOW },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
