import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "./auth";

/** The current session, or null. Cached for the duration of a request. */
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

/** Returns the session or redirects to sign-in, coming back to `returnTo` afterwards. */
export async function requireSession(returnTo = "/dashboard") {
  const session = await getSession();
  if (!session) redirect(`/sign-in?next=${encodeURIComponent(returnTo)}`);
  return session;
}

export async function requireUser(returnTo?: string) {
  return (await requireSession(returnTo)).user;
}
