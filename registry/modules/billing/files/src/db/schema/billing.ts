import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";

/** One payment-provider customer per user. */
export const billingCustomer = pgTable("billing_customer", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  customerId: text("customer_id").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Mirror of provider subscriptions, kept current by webhooks. */
export const subscription = pgTable(
  "subscription",
  {
    /** Provider subscription id. */
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    customerId: text("customer_id").notNull(),
    planId: text("plan_id").notNull(),
    /** Provider price reference (lookup key). */
    price: text("price").notNull(),
    interval: text("interval"),
    status: text("status").notNull(),
    currentPeriodEnd: timestamp("current_period_end"),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    trialEnd: timestamp("trial_end"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("subscription_user_id_idx").on(table.userId)],
);

export type SubscriptionRow = typeof subscription.$inferSelect;
