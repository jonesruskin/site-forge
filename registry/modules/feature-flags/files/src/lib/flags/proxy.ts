import type { NextRequest, NextResponse } from "next/server";

import { VISITOR_COOKIE } from "./config";

/**
 * Gives every visitor a random, first-party id so percentage rollouts stay
 * sticky before sign-in. It carries no personal data; it only picks a bucket.
 */
export function flagsProxy(request: NextRequest, response: NextResponse) {
  if (request.cookies.has(VISITOR_COOKIE)) return undefined;
  response.cookies.set(VISITOR_COOKIE, crypto.randomUUID(), {
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return undefined;
}
