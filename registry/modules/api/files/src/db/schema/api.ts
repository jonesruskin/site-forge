import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { user } from "./auth";

/** API keys. Only a SHA-256 hash of the secret is stored; `start` is kept for display. */
export const apiKey = pgTable(
  "api_key",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    /** First characters of the key, e.g. "sk_4f9Qa", so people can tell keys apart. */
    start: text("start").notNull(),
    hash: text("hash").notNull().unique(),
    scopes: text("scopes").array().notNull().default([]),
    lastUsedAt: timestamp("last_used_at"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("api_key_user_id_idx").on(table.userId)],
);

export type ApiKey = typeof apiKey.$inferSelect;
