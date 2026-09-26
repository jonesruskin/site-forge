import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { newsletterEnv } from "@/env/newsletter";

const TTL_MS = 1000 * 60 * 60 * 48;

function sign(payload: string) {
  const secret = newsletterEnv.NEWSLETTER_SECRET;
  if (!secret) throw new Error("NEWSLETTER_SECRET is not set.");
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/** Stateless confirmation token: the email and expiry, signed. No database needed. */
export function createConfirmToken(email: string) {
  const payload = Buffer.from(JSON.stringify({ email, exp: Date.now() + TTL_MS })).toString(
    "base64url",
  );
  return `${payload}.${sign(payload)}`;
}

export function verifyConfirmToken(token: string): { email: string } | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      email: string;
      exp: number;
    };
    return data.exp > Date.now() ? { email: data.email } : null;
  } catch {
    return null;
  }
}
