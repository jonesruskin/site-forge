import "server-only";

import { getActiveSubscription } from "./entitlements";

/** Checklist item for the onboarding module (ignored when it isn't installed). */
export const billingOnboardingTask = {
  id: "choose-plan",
  title: "Choose a plan",
  description: "Start a trial or pick the plan that fits.",
  href: "/pricing",
  done: async (userId: string) => (await getActiveSubscription(userId)) !== null,
};
