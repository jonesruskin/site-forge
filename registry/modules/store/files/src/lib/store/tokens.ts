import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { storeEnv } from "@/env/store";

import { storeConfig } from "./products";

/*
 * Download links carry their own proof: product, order and expiry, signed with
 * HMAC-SHA256. No database is needed, and a link can't be edited to point at
 * another product or live longer.
 */

type Grant = { product: string; order: string; expires: number };

function secret() {
  const value = storeEnv.STORE_DOWNLOAD_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV === "production")
    throw new Error("STORE_DOWNLOAD_SECRET is required in production.");
  return "development-only-store-secret-never-use-in-production";
}

const sign = (payload: string) =>
  createHmac("sha256", secret()).update(payload).digest("base64url");

export function createDownloadToken(
  product: string,
  order: string,
  days = storeConfig.downloadExpiresInDays,
) {
  const grant: Grant = { product, order, expires: Math.floor(Date.now() / 1000) + days * 86_400 };
  const payload = Buffer.from(JSON.stringify(grant)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export type TokenCheck = { ok: true; grant: Grant } | { ok: false; reason: "invalid" | "expired" };

export function verifyDownloadToken(token: string): TokenCheck {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return { ok: false, reason: "invalid" };
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given))
    return { ok: false, reason: "invalid" };
  try {
    const grant = JSON.parse(Buffer.from(payload, "base64url").toString()) as Grant;
    if (grant.expires * 1000 < Date.now()) return { ok: false, reason: "expired" };
    return { ok: true, grant };
  } catch {
    return { ok: false, reason: "invalid" };
  }
}
