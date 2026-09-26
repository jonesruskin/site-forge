import "server-only";

import { contactEnv } from "@/env/contact";

/** Name of the hidden field humans never fill in. */
export const HONEYPOT_FIELD = "website";
/** Name of the field holding the time the form became interactive. */
export const TIMESTAMP_FIELD = "_t";

const MIN_FILL_MS = 2_500;

async function verifyTurnstile(token: string | null, ip: string) {
  if (!contactEnv.TURNSTILE_SECRET_KEY) return true;
  if (!token) return false;
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({
      secret: contactEnv.TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: ip,
    }),
  });
  const result = (await response.json()) as { success: boolean };
  return result.success;
}

/**
 * Layered bot checks. Returns a reason when the submission looks automated.
 * Callers should pretend success in that case so bots learn nothing.
 */
export async function detectSpam(formData: FormData, ip: string): Promise<string | null> {
  if (String(formData.get(HONEYPOT_FIELD) ?? "").length > 0) return "honeypot";

  const startedAt = Number(formData.get(TIMESTAMP_FIELD));
  if (Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < MIN_FILL_MS)
    return "too-fast";

  const token = formData.get("cf-turnstile-response");
  if (!(await verifyTurnstile(typeof token === "string" ? token : null, ip))) return "turnstile";

  return null;
}
