import "server-only";

import { Resend } from "resend";

import { emailEnv } from "@/env/email";
import { newsletterEnv } from "@/env/newsletter";

export type Subscriber = { email: string; name?: string };

/** One function per provider. Add your own (Mailchimp, Loops, a database table …) here. */
const providers: Record<
  typeof newsletterEnv.NEWSLETTER_PROVIDER,
  (subscriber: Subscriber) => Promise<void>
> = {
  async resend({ email, name }) {
    if (!emailEnv.RESEND_API_KEY)
      throw new Error("RESEND_API_KEY is required for the resend newsletter provider.");
    const resend = new Resend(emailEnv.RESEND_API_KEY);
    const { error } = await resend.contacts.create({
      email,
      firstName: name,
      unsubscribed: false,
      ...(newsletterEnv.RESEND_SEGMENT_ID && {
        segments: [{ id: newsletterEnv.RESEND_SEGMENT_ID }],
      }),
    });
    // Re-subscribing an existing contact is not an error for us.
    if (error && !/already exists/i.test(error.message)) throw new Error(error.message);
  },

  async buttondown({ email }) {
    const response = await fetch("https://api.buttondown.com/v1/subscribers", {
      method: "POST",
      headers: {
        Authorization: `Token ${newsletterEnv.BUTTONDOWN_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email_address: email, type: "regular" }),
    });
    if (!response.ok && response.status !== 409)
      throw new Error(`Buttondown: ${response.status} ${await response.text()}`);
  },

  async kit({ email, name }) {
    const headers = {
      "X-Kit-Api-Key": newsletterEnv.KIT_API_KEY ?? "",
      "Content-Type": "application/json",
    };
    const created = await fetch("https://api.kit.com/v4/subscribers", {
      method: "POST",
      headers,
      body: JSON.stringify({ email_address: email, first_name: name, state: "active" }),
    });
    if (!created.ok) throw new Error(`Kit: ${created.status} ${await created.text()}`);
    if (newsletterEnv.KIT_FORM_ID) {
      const added = await fetch(
        `https://api.kit.com/v4/forms/${newsletterEnv.KIT_FORM_ID}/subscribers`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ email_address: email }),
        },
      );
      if (!added.ok) throw new Error(`Kit form: ${added.status} ${await added.text()}`);
    }
  },

  async log({ email }) {
    console.info(`[newsletter] would subscribe ${email} (NEWSLETTER_PROVIDER not set)`);
  },
};

export async function subscribe(subscriber: Subscriber) {
  await providers[newsletterEnv.NEWSLETTER_PROVIDER ?? "log"](subscriber);
}
