import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";

/** One row per user once they finish or skip the questionnaire. */
export const onboarding = pgTable("onboarding", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  /** Question id → answer (string, or string[] for multiple choice). */
  answers: jsonb("answers").$type<Record<string, string | string[]>>().notNull().default({}),
  completedAt: timestamp("completed_at"),
  skippedAt: timestamp("skipped_at"),
  checklistDismissedAt: timestamp("checklist_dismissed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type OnboardingRow = typeof onboarding.$inferSelect;
