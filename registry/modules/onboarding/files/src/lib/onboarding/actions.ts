"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireSession } from "@/lib/auth/session";

import { onboardingConfig } from "./config";
import { saveOnboarding } from "./state";

function answersSchema() {
  const shape: Record<string, z.ZodType> = {};
  for (const question of onboardingConfig.questions) {
    if (question.type === "choice") {
      const option = z.enum(question.options as [string, ...string[]]);
      shape[question.id] = (question.multiple ? z.array(option) : option).optional();
    } else {
      shape[question.id] = z.string().trim().max(500).optional();
    }
  }
  return z.object(shape);
}

export async function completeOnboardingAction(formData: FormData) {
  const { user } = await requireSession("/onboarding");
  let raw: unknown = {};
  try {
    raw = JSON.parse(String(formData.get("answers") ?? "{}"));
  } catch {
    // Treated as no answers.
  }
  const parsed = answersSchema().safeParse(raw);
  const answers = Object.fromEntries(
    Object.entries(parsed.success ? parsed.data : {}).filter(
      ([, value]) =>
        value !== undefined && value !== "" && !(Array.isArray(value) && value.length === 0),
    ),
  ) as Record<string, string | string[]>;
  await saveOnboarding(user.id, { answers, completedAt: new Date() });
  revalidatePath("/dashboard");
  redirect(onboardingConfig.afterOnboarding);
}

export async function skipOnboardingAction() {
  const { user } = await requireSession("/onboarding");
  await saveOnboarding(user.id, { skippedAt: new Date() });
  redirect(onboardingConfig.afterOnboarding);
}

export async function dismissChecklistAction() {
  const { user } = await requireSession("/dashboard");
  await saveOnboarding(user.id, { checklistDismissedAt: new Date() });
  revalidatePath("/dashboard");
}
