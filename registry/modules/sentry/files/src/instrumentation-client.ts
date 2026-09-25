import * as Sentry from "@sentry/nextjs";

import { sentryOptions } from "@/lib/sentry/options";

if (sentryOptions.enabled) {
  Sentry.init({
    ...sentryOptions,
    // Session replay only for sessions with an error, with all text and media masked.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1,
    integrations: [Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true })],
  });
}

/** Traces client-side navigations. */
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
