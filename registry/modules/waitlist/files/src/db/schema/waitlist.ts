import { index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const waitlistEntry = pgTable(
  "waitlist_entry",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    name: text("name"),
    /** Public code used in referral links and the status page URL. */
    referralCode: text("referral_code").notNull().unique(),
    /** referralCode of whoever invited this person. */
    referredBy: text("referred_by"),
    referrals: integer("referrals").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("waitlist_rank_idx").on(table.referrals, table.createdAt)],
);

export type WaitlistEntry = typeof waitlistEntry.$inferSelect;
