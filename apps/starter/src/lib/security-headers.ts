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
 *
 * A source written as "$NAME" resolves to the origin of the NAME environment
 * variable at build time (dropped when unset), so modules can allow hosts that
 * only exist in configuration, like an S3-compatible storage endpoint.
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

function resolveSource(source: string): string[] {
  if (!source.startsWith("$")) return [source];
  const value = process.env[source.slice(1)];
  if (!value) return [];
  try {
    return [new URL(value).origin];
  } catch {
    return [];
  }
}

export function buildCsp(...sources: CspDirectives[]) {
  const merged: CspDirectives = {};
  for (const directives of [baseCsp, ...sources, extraCsp]) {
    for (const [directive, values] of Object.entries(directives)) {
      const resolved = values.flatMap(resolveSource);
      merged[directive] = [...new Set([...(merged[directive] ?? []), ...resolved])];
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
