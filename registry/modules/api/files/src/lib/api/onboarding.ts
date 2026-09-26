import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { apiKey } from "@/db/schema/api";

/** Checklist item for the onboarding module (ignored when it isn't installed). */
export const apiOnboardingTask = {
  id: "api-key",
  title: "Create an API key",
  description: "Call the API from your own code or scripts.",
  href: "/settings/api-keys",
  done: async (userId: string) =>
    !!(await db.query.apiKey.findFirst({
      where: eq(apiKey.userId, userId),
      columns: { id: true },
    })),
};
