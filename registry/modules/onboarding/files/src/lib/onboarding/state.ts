import "server-only";

import { eq } from "drizzle-orm";
import { cache } from "react";

import { db } from "@/db";
import { onboarding } from "@/db/schema/onboarding";
import { onboardingTasks } from "@/generated/onboarding-tasks";

import { onboardingConfig } from "./config";
import type { OnboardingTask } from "./types";

export const getOnboarding = cache(async (userId: string) => {
  const row = await db.query.onboarding.findFirst({ where: eq(onboarding.userId, userId) });
  return row ?? null;
});

/** The questionnaire answers, e.g. to personalize the dashboard. Empty when skipped. */
export async function getOnboardingAnswers(userId: string) {
  return (await getOnboarding(userId))?.answers ?? {};
}

type Patch = Partial<
  Pick<
    typeof onboarding.$inferInsert,
    "answers" | "completedAt" | "skippedAt" | "checklistDismissedAt"
  >
>;

export async function saveOnboarding(userId: string, patch: Patch) {
  await db
    .insert(onboarding)
    .values({ userId, ...patch })
    .onConflictDoUpdate({ target: onboarding.userId, set: patch });
}

/** Whether an account that hasn't seen the questionnaire should be sent there (created within a day). */
export function isNewAccount(createdAt: Date | string) {
  if (!onboardingConfig.redirectNewUsers || onboardingConfig.questions.length === 0) return false;
  return Date.now() - new Date(createdAt).getTime() < 86_400_000;
}

/** Tasks every project gets. Add your own here. */
const builtInTasks: OnboardingTask[] = onboardingConfig.questions.length
  ? [
      {
        id: "questionnaire",
        title: "Tell us about yourself",
        description: "A few questions so we can tailor things to you.",
        href: "/onboarding",
        done: async (userId) => !!(await getOnboarding(userId))?.completedAt,
      },
    ]
  : [];

export type ChecklistItem = Omit<OnboardingTask, "done"> & { done: boolean };

export async function getChecklist(userId: string): Promise<ChecklistItem[]> {
  const tasks: OnboardingTask[] = [...builtInTasks, ...onboardingTasks];
  return Promise.all(
    tasks.map(async ({ done, ...task }) => ({
      ...task,
      done: await done(userId).catch((error: unknown) => {
        console.error(`[onboarding] task "${task.id}" failed`, error);
        return false;
      }),
    })),
  );
}
