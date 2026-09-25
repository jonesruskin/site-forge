import * as Sentry from "@sentry/nextjs";

/** Errors caught by error.tsx / global-error.tsx (the error-reporters slot). */
export function reportToSentry(error: Error & { digest?: string }) {
  Sentry.captureException(error, { tags: error.digest ? { digest: error.digest } : undefined });
}
