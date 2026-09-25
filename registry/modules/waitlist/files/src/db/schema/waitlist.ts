import { index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const waitlistEntry = pgTable(
  "waitlist_entry",
  {
    id: uuid().primaryKey().defaultRandom(),
    email: text().notNull().unique(),
    name: text(),
    /** Public code used in referral links and the status page URL. */
    referralCode: text().notNull().unique(),
    /** referralCode of whoever invited this person. */
    referredBy: text(),
    referrals: integer().notNull().default(0),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("waitlist_rank_idx").on(table.referrals, table.createdAt)],
);

export type WaitlistEntry = typeof waitlistEntry.$inferSelect;
