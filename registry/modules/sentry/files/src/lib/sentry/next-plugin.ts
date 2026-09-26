import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";

/**
 * Wraps next.config with Sentry's build integration. Events go through
 * /monitoring on your own domain, so ad blockers and the CSP don't drop them;
 * source maps upload only when SENTRY_AUTH_TOKEN is set (and are then deleted
 * from the public build).
 */
export function sentryNextPlugin(config: NextConfig): NextConfig {
  return withSentryConfig(config, {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    authToken: process.env.SENTRY_AUTH_TOKEN,
    tunnelRoute: "/monitoring",
    silent: !process.env.CI,
    telemetry: false,
    sourcemaps: {
      disable: !process.env.SENTRY_AUTH_TOKEN,
      deleteSourcemapsAfterUpload: true,
    },
    widenClientFileUpload: true,
  });
}
