import type { NextConfig } from "next";

/** A self-contained server in .next/standalone: the image ships only what the app uses. */
export function dockerNextPlugin(config: NextConfig): NextConfig {
  return { ...config, output: "standalone" };
}
