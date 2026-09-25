import "server-only";

import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

import { rateLimitEnv } from "@/env/rate-limit";

export type RateLimitOptions = {
  /** Requests allowed per window. */
  limit: number;
  /** Window length, e.g. "10 s", "1 m", "1 h". */
  window: Duration;
};

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  /** Unix epoch (ms) when the window resets. */
  reset: number;
};

const redis =
  rateLimitEnv.UPSTASH_REDIS_REST_URL && rateLimitEnv.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: rateLimitEnv.UPSTASH_REDIS_REST_URL,
        token: rateLimitEnv.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const limiters = new Map<string, Ratelimit>();

function upstashLimiter({ limit, window }: RateLimitOptions) {
  const key = `${limit}/${window}`;
  let limiter = limiters.get(key);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(limit, window),
      prefix: "ratelimit",
      analytics: false,
    });
    limiters.set(key, limiter);
  }
  return limiter;
}

const UNITS: Record<string, number> = { ms: 1, s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 };

function toMs(window: Duration) {
  const match = /^(\d+)\s*(ms|s|m|h|d)$/.exec(window);
  if (!match) throw new Error(`Invalid rate-limit window "${window}"`);
  return Number(match[1]) * UNITS[match[2]!]!;
}

// In-memory sliding log. Correct for one long-lived server; on serverless each
// instance keeps its own counts, so configure Upstash for production.
const memory = new Map<string, number[]>();
let warned = false;

function memoryLimit(key: string, { limit, window }: RateLimitOptions): RateLimitResult {
  if (!warned && process.env.NODE_ENV === "production") {
    warned = true;
    console.warn(
      "[rate-limit] UPSTASH_REDIS_REST_URL is not set; using per-instance in-memory limits.",
    );
  }
  const now = Date.now();
  const ms = toMs(window);
  const hits = (memory.get(key) ?? []).filter((time) => time > now - ms);
  const success = hits.length < limit;
  if (success) hits.push(now);
  memory.set(key, hits);

  if (memory.size > 10_000) {
    for (const [k, times] of memory) if (times.every((time) => time <= now - ms)) memory.delete(k);
  }

  return {
    success,
    limit,
    remaining: Math.max(0, limit - hits.length),
    reset: (hits[0] ?? now) + ms,
  };
}

/**
 * Counts one request for `key` and reports whether it is allowed.
 *
 *   const { success } = await rateLimit(`contact:${await clientIp()}`, { limit: 5, window: "10 m" });
 */
export async function rateLimit(key: string, options: RateLimitOptions): Promise<RateLimitResult> {
  if (!redis) return memoryLimit(key, options);
  const { success, limit, remaining, reset } = await upstashLimiter(options).limit(key);
  return { success, limit, remaining, reset };
}

/** Best-effort client IP from proxy headers (Vercel, Cloudflare, nginx). */
export async function clientIp() {
  const h = await headers();
  return (
    h.get("cf-connecting-ip") ??
    h.get("x-real-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

/** Standard headers for API responses. */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "RateLimit-Limit": String(result.limit),
    "RateLimit-Remaining": String(result.remaining),
    "RateLimit-Reset": String(Math.max(0, Math.ceil((result.reset - Date.now()) / 1000))),
    ...(result.success
      ? {}
      : { "Retry-After": String(Math.max(1, Math.ceil((result.reset - Date.now()) / 1000))) }),
  };
}
