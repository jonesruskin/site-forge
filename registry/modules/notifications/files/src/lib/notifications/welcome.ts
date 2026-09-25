import "server-only";

import siteConfig from "@/site.config";

import { notify } from "./notify";

/** First inbox item for every new account (auth-events slot). */
export async function welcomeNotification(event: { type: string; user: { id: string } }) {
  if (event.type !== "user.created") return;
  await notify(event.user.id, {
    type: "welcome",
    title: `Welcome to ${siteConfig.name}`,
    body: "This is your inbox. Updates about your account and activity show up here.",
    href: "/dashboard",
  });
}
