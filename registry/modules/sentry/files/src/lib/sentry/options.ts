/** Shared by the browser, Node.js and edge runtimes. Tune sampling here. */
export const sentryOptions = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  // 10% of requests traced in production; everything while developing.
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,
  // Personal data (IPs, cookies) is not sent unless you opt in.
  sendDefaultPii: false,
};
