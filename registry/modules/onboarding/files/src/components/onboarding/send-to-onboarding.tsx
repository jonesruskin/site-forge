"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Sends a brand-new account to the questionnaire. Done on the client, after the
 * dashboard has streamed, so the server never aborts a response midway.
 */
export function SendToOnboarding() {
  const router = useRouter();
  useEffect(() => router.replace("/onboarding"), [router]);
  return null;
}
