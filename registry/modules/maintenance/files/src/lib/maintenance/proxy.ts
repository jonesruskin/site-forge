import type { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { maintenanceEnv } from "@/env/maintenance";
import siteConfig from "@/site.config";

import { maintenancePage } from "./page";
import { maintenanceWindow } from "./window";

const config = z
  .object({
    title: z.string().default("We'll be right back"),
    message: z.string().default("We're making some improvements. Thanks for your patience."),
    /** Path prefixes that keep working (webhooks, health checks). */
    allow: z.array(z.string()).default(["/api/payments/webhook", "/api/health", "/monitoring"]),
  })
  .parse((siteConfig as { maintenance?: unknown }).maintenance ?? {});

const BYPASS_COOKIE = "site_maintenance_bypass";
const forcedOn = ["on", "true", "1"].includes(maintenanceEnv.MAINTENANCE_MODE);

async function digest(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Buffer.from(bytes).toString("hex");
}

/** Serves a 503 while maintenance is on; everything else passes through untouched. */
export async function maintenanceProxy(request: NextRequest, response: NextResponse) {
  const now = new Date();
  const scheduled =
    maintenanceWindow && now >= maintenanceWindow.start && now < maintenanceWindow.end;
  if (!forcedOn && !scheduled) return undefined;

  const { pathname, searchParams } = request.nextUrl;
  if (config.allow.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)))
    return undefined;

  const token = maintenanceEnv.MAINTENANCE_BYPASS_TOKEN;
  if (token) {
    const expected = await digest(token);
    if (request.cookies.get(BYPASS_COOKIE)?.value === expected) return undefined;
    if (searchParams.get("maintenance") === token) {
      // Remember this browser; only a hash of the token is stored.
      response.cookies.set(BYPASS_COOKIE, expected, {
        httpOnly: true,
        sameSite: "lax",
        secure: request.nextUrl.protocol === "https:",
        path: "/",
        maxAge: 60 * 60 * 12,
      });
      return undefined;
    }
  }

  const until = scheduled ? maintenanceWindow!.end : undefined;
  const retryAfter = until
    ? Math.max(60, Math.ceil((until.getTime() - now.getTime()) / 1000))
    : 600;
  return new Response(maintenancePage({ title: config.title, message: config.message, until }), {
    status: 503,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Retry-After": String(retryAfter),
      "Cache-Control": "no-store",
    },
  });
}
