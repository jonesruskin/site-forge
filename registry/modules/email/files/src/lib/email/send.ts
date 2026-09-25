import "server-only";

import { render } from "@react-email/render";
import type { ReactElement } from "react";
import { Resend } from "resend";

import { emailEnv } from "@/env/email";

import { saveToOutbox } from "./outbox";

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  /** A React Email template, e.g. <WelcomeEmail name="Ada" />. */
  react: ReactElement;
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  /** Makes retries safe: Resend drops duplicates with the same key for 24h. */
  idempotencyKey?: string;
  tags?: { name: string; value: string }[];
};

export type SendEmailResult = { id: string; via: "resend" | "outbox" };

const resend = emailEnv.RESEND_API_KEY ? new Resend(emailEnv.RESEND_API_KEY) : null;

/**
 * Sends an email. With RESEND_API_KEY it goes through Resend; without it (development only)
 * it is rendered and stored in the local outbox, viewable at /dev/outbox.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const from = input.from ?? emailEnv.EMAIL_FROM ?? "Site <onboarding@resend.dev>";
  const to = Array.isArray(input.to) ? input.to : [input.to];

  if (resend) {
    const { data, error } = await resend.emails.send(
      {
        from,
        to,
        subject: input.subject,
        react: input.react,
        replyTo: input.replyTo,
        cc: input.cc,
        bcc: input.bcc,
        tags: input.tags,
      },
      input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined,
    );
    if (error || !data)
      throw new Error(`Email to ${to.join(", ")} failed: ${error?.message ?? "unknown error"}`);
    return { id: data.id, via: "resend" };
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("RESEND_API_KEY is not set; cannot send email in production.");
  }

  const [html, text] = await Promise.all([
    render(input.react),
    render(input.react, { plainText: true }),
  ]);
  const id = await saveToOutbox(
    { from, to, replyTo: input.replyTo, subject: input.subject },
    html,
    text,
  );
  console.info(`[email] "${input.subject}" → ${to.join(", ")} (saved to /dev/outbox/${id})`);
  return { id, via: "outbox" };
}
