import { z } from "zod";

import siteConfig from "@/site.config";

const id = z.string().regex(/^[a-zA-Z][\w-]*$/);

const questionSchema = z.discriminatedUnion("type", [
  z.object({
    id,
    type: z.literal("choice"),
    title: z.string().min(1),
    description: z.string().optional(),
    options: z.array(z.string().min(1)).min(2).max(9),
    /** Allow picking several options. */
    multiple: z.boolean().default(false),
  }),
  z.object({
    id,
    type: z.literal("text"),
    title: z.string().min(1),
    description: z.string().optional(),
    placeholder: z.string().optional(),
    optional: z.boolean().default(true),
  }),
]);

export type OnboardingQuestion = z.output<typeof questionSchema>;

export const onboardingConfig = z
  .object({
    /** Send accounts younger than a day to /onboarding the first time they open the dashboard. */
    redirectNewUsers: z.boolean().default(true),
    questions: z.array(questionSchema).max(8).default([]),
    /** Where the questionnaire leads when finished or skipped. */
    afterOnboarding: z.string().startsWith("/").default("/dashboard"),
  })
  .parse((siteConfig as { onboarding?: unknown }).onboarding ?? {});
