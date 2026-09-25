"use server";

import { z } from "zod";

import { NewsletterConfirmEmail } from "@/emails/newsletter-confirm";
import { sendEmail } from "@/lib/email/send";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { absoluteUrl } from "@/lib/url";

import { newsletterConfig } from "./config";
import { subscribe } from "./providers";
import { createConfirmToken } from "./token";

export type NewsletterState = {
  status: "idle" | "success" | "error";
  message?: string;
  email?: string;
};

const schema = z.object({ email: z.email("Please enter a valid email address.").trim().max(200) });

export async function subscribeToNewsletter(
  _previous: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  // Honeypot: bots fill every field.
  if (String(formData.get("company") ?? ""))
    return { status: "success", message: newsletterConfig.checkInboxMessage };

  const parsed = schema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message,
      email: String(formData.get("email") ?? ""),
    };
  }

  const ip = await clientIp();
  const limit = await rateLimit(`newsletter:${ip}`, { limit: 5, window: "10 m" });
  if (!limit.success)
    return { status: "error", message: "Too many attempts. Please try again later." };

  const { email } = parsed.data;
  try {
    if (newsletterConfig.doubleOptIn) {
      const confirmUrl = absoluteUrl(
        `/newsletter/confirm?token=${encodeURIComponent(createConfirmToken(email))}`,
      );
      await sendEmail({
        to: email,
        subject: `Confirm your subscription`,
        react: <NewsletterConfirmEmail confirmUrl={confirmUrl} />,
      });
      return { status: "success", message: newsletterConfig.checkInboxMessage };
    }
    await subscribe({ email });
    return { status: "success", message: newsletterConfig.confirmedMessage };
  } catch (error) {
    console.error("[newsletter] subscribe failed", error);
    return { status: "error", message: "Something went wrong. Please try again.", email };
  }
}
