import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

import { authConfig } from "./config";

/**
 * Optimistic gate: bounces visitors without a session cookie away from
 * protected paths before any rendering. Pages still verify the session
 * (requireSession) because a cookie can be stale or forged.
 */
export function authProxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isProtected = authConfig.protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  if (!isProtected || getSessionCookie(request)) return undefined;
  const url = new URL("/sign-in", request.url);
  url.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(url);
}
