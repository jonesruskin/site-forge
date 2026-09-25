import * as Sentry from "@sentry/nextjs";

import { sentryOptions } from "@/lib/sentry/options";

/** Starts Sentry on the server (Node.js and edge runtimes). */
export function register() {
  if (!sentryOptions.enabled) return;
  Sentry.init(sentryOptions);
}

/** Reports errors from server components, route handlers, actions and the proxy. */
export const onRequestError = Sentry.captureRequestError;
