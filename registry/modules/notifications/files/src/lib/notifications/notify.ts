import "server-only";

import { and, count, desc, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { notification } from "@/db/schema/notifications";

export type NotifyInput = { title: string; body?: string; href?: string; type?: string };

/** Adds a notification to a user's inbox. Call from any server code. */
export async function notify(userId: string, input: NotifyInput) {
  const [row] = await db.insert(notification).values({ userId, ...input }).returning();
  return row;
}

export async function listNotifications(userId: string, { limit = 20, offset = 0 } = {}) {
  return db
    .select()
    .from(notification)
    .where(eq(notification.userId, userId))
    .orderBy(desc(notification.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function unreadCount(userId: string) {
  const [row] = await db
    .select({ value: count() })
    .from(notification)
    .where(and(eq(notification.userId, userId), isNull(notification.readAt)));
  return row?.value ?? 0;
}

export async function markRead(userId: string, id?: string) {
  await db
    .update(notification)
    .set({ readAt: new Date() })
    .where(and(eq(notification.userId, userId), isNull(notification.readAt), ...(id ? [eq(notification.id, id)] : [])));
}
