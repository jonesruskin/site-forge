import "server-only";

import { WelcomeEmail } from "@/emails/welcome";
import { sendEmail } from "@/lib/email/send";
import { absoluteUrl } from "@/lib/url";
import siteConfig from "@/site.config";

/** Sent once the email address is verified (auth-events slot). */
export async function sendWelcomeEmail(event: {
  type: string;
  user: { id: string; name: string; email: string };
}) {
  if (event.type !== "user.verified") return;
  await sendEmail({
    to: event.user.email,
    subject: `Welcome to ${siteConfig.name}`,
    react: WelcomeEmail({
      name: event.user.name.split(" ")[0] || event.user.name,
      dashboardUrl: absoluteUrl("/dashboard"),
    }),
    idempotencyKey: `welcome:${event.user.id}`,
  });
}
