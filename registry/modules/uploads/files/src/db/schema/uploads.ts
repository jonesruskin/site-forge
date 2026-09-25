import { bigint, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { user } from "./auth";

export const upload = pgTable(
  "upload",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    /** Object key in the bucket (or path under .site/dev/uploads). */
    key: text("key").notNull().unique(),
    name: text("name").notNull(),
    contentType: text("content_type").notNull(),
    size: bigint("size", { mode: "number" }).notNull(),
    /** "pending" until the browser finishes the PUT and the server verifies the object. */
    status: text("status", { enum: ["pending", "ready"] })
      .notNull()
      .default("pending"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("upload_user_created_idx").on(table.userId, table.createdAt)],
);

export type Upload = typeof upload.$inferSelect;
