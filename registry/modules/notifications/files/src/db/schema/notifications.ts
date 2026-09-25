import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { user } from "./auth";

export const notification = pgTable(
  "notification",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    /** Free-form category for filtering or icons, e.g. "billing", "team". */
    type: text("type").notNull().default("info"),
    title: text("title").notNull(),
    body: text("body"),
    /** Where clicking the notification goes. */
    href: text("href"),
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("notification_user_created_idx").on(table.userId, table.createdAt)],
);

export type Notification = typeof notification.$inferSelect;
