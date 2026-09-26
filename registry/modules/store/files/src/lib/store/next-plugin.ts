import type { NextConfig } from "next";

/** Bundles private/downloads with the download route on serverless hosts (Vercel, Netlify). */
export function storeNextPlugin(config: NextConfig): NextConfig {
  return {
    ...config,
    outputFileTracingIncludes: {
      ...config.outputFileTracingIncludes,
      "/store/download/**": ["./private/downloads/**/*"],
    },
  };
}
