"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { WaitlistWelcomeEmail } from "@/emails/waitlist-welcome";
import { sendEmail } from "@/lib/email/send";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { absoluteUrl } from "@/lib/url";

import { joinWaitlist, positionOf } from "./waitlist";

export type WaitlistState = {
  status: "idle" | "error" | "exists";
  message?: string;
  email?: string;
};

const schema = z.object({
  email: z.email("Please enter a valid email address.").trim().max(200),
  name: z.string().trim().max(100).optional(),
  ref: z
    .string()
    .regex(/^[a-z0-9]{4,16}$/)
    .optional()
    .catch(undefined),
});

export async function joinWaitlistAction(
  _previous: WaitlistState,
  formData: FormData,
): Promise<WaitlistState> {
  if (String(formData.get("company") ?? ""))
    return { status: "exists", message: "Thanks! Check your inbox." };

  const parsed = schema.safeParse({
    email: formData.get("email"),
    name: formData.get("name") || undefined,
    ref: formData.get("ref") || undefined,
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message,
      email: String(formData.get("email") ?? ""),
    };
  }

  const limit = await rateLimit(`waitlist:${await clientIp()}`, { limit: 5, window: "10 m" });
  if (!limit.success)
    return { status: "error", message: "Too many attempts. Please try again later." };

  const { entry, created } = await joinWaitlist(parsed.data);
  const statusUrl = absoluteUrl(`/waitlist/${entry.referralCode}`);
  const position = await positionOf(entry);

  await sendEmail({
    to: entry.email,
    subject: created ? `You're #${position} on the waitlist` : "Your waitlist link",
    react: (
      <WaitlistWelcomeEmail
        position={position}
        statusUrl={statusUrl}
        name={entry.name ?? undefined}
      />
    ),
    idempotencyKey: created ? `waitlist-welcome:${entry.id}` : undefined,
  }).catch((error) => console.error("[waitlist] email failed", error));

  if (!created) {
    // Don't reveal someone else's position to whoever typed their address.
    return {
      status: "exists",
      message: "You're already on the list. We've emailed you your personal link.",
    };
  }
  redirect(`/waitlist/${entry.referralCode}?welcome=1`);
}
