/**
 * Security headers applied to every response (see next.config.ts).
 *
 * The Content-Security-Policy is assembled from a strict base plus sources
 * that installed modules declare (analytics hosts, Stripe, S3 buckets …),
 * collected in src/generated/next.ts. Add your own in `extraCsp` below.
 *
 * Scripts allow 'unsafe-inline' because statically rendered Next.js pages
 * inline their bootstrap scripts; nonce-based CSP would force every page to
 * render dynamically. Everything else is locked to known origins.
 */
export type CspDirectives = Record<string, string[]>;

const isDev = process.env.NODE_ENV !== "production";

const baseCsp: CspDirectives = {
  "default-src": ["'self'"],
  "script-src": ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : [])],
  "style-src": ["'self'", "'unsafe-inline'"],
  "img-src": ["'self'", "blob:", "data:"],
  "font-src": ["'self'", "data:"],
  "connect-src": ["'self'", ...(isDev ? ["ws:"] : [])],
  "media-src": ["'self'"],
  "frame-src": ["'self'"],
  "worker-src": ["'self'", "blob:"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'none'"],
};

/** Sources specific to this site. */
const extraCsp: CspDirectives = {};

export function buildCsp(...sources: CspDirectives[]) {
  const merged: CspDirectives = {};
  for (const directives of [baseCsp, ...sources, extraCsp]) {
    for (const [directive, values] of Object.entries(directives)) {
      merged[directive] = [...new Set([...(merged[directive] ?? []), ...values])];
    }
  }
  const policy = Object.entries(merged).map(
    ([directive, values]) => `${directive} ${values.join(" ")}`,
  );
  if (!isDev) policy.push("upgrade-insecure-requests");
  return policy.join("; ");
}

export function securityHeaders(moduleCsp: CspDirectives) {
  return [
    { key: "Content-Security-Policy", value: buildCsp(moduleCsp) },
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=()",
    },
  ];
}
