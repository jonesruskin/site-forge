"use server";

import { z } from "zod";

import { ContactNotificationEmail } from "@/emails/contact-notification";
import { contactEnv } from "@/env/contact";
import { sendEmail } from "@/lib/email/send";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import siteConfig from "@/site.config";

import { contactConfig } from "./config";
import { contactSchema, type ContactState } from "./schema";
import { detectSpam } from "./spam";

export async function submitContact(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
  };
  const ip = await clientIp();

  const spam = await detectSpam(formData, ip);
  if (spam) {
    console.warn(`[contact] dropped submission (${spam}) from ${ip}`);
    return { status: "success", message: contactConfig.successMessage };
  }

  const limit = await rateLimit(`contact:${ip}`, { limit: 5, window: "10 m" });
  if (!limit.success) {
    return {
      status: "error",
      message: "You've sent several messages in a short time. Please try again in a few minutes.",
      values,
    };
  }

  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      errors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  const to = contactEnv.CONTACT_TO_EMAIL ?? siteConfig.author.email ?? "contact@localhost";
  try {
    await sendEmail({
      to,
      replyTo: parsed.data.email,
      subject: `${contactConfig.subjectPrefix} ${parsed.data.name}`,
      react: <ContactNotificationEmail {...parsed.data} />,
    });
  } catch (error) {
    console.error("[contact] delivery failed", error);
    return {
      status: "error",
      message: "We couldn't send your message right now. Please try again, or email us directly.",
      values,
    };
  }

  return { status: "success", message: contactConfig.successMessage };
}
