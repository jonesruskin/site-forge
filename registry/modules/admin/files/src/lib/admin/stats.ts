import "server-only";

import { count, gte, isNotNull, sql } from "drizzle-orm";

import { db } from "@/db";
import { session, user } from "@/db/schema/auth";

export async function adminStats() {
  const weekAgo = new Date(Date.now() - 7 * 86_400_000);
  const [[users], [newUsers], [verified], [activeSessions], [banned]] = await Promise.all([
    db.select({ value: count() }).from(user),
    db.select({ value: count() }).from(user).where(gte(user.createdAt, weekAgo)),
    db
      .select({ value: count() })
      .from(user)
      .where(sql`${user.emailVerified} = true`),
    db.select({ value: count() }).from(session).where(gte(session.expiresAt, new Date())),
    db.select({ value: count() }).from(user).where(isNotNull(user.banExpires)),
  ]);
  return {
    users: users?.value ?? 0,
    newUsers: newUsers?.value ?? 0,
    verified: verified?.value ?? 0,
    activeSessions: activeSessions?.value ?? 0,
    banned: banned?.value ?? 0,
  };
}

/** Sign-ups per day for the last `days` days (oldest first). */
export async function signupsByDay(days = 14) {
  const since = new Date(Date.now() - days * 86_400_000);
  const rows = await db
    .select({ day: sql<string>`to_char(${user.createdAt}, 'YYYY-MM-DD')`, value: count() })
    .from(user)
    .where(gte(user.createdAt, since))
    .groupBy(sql`to_char(${user.createdAt}, 'YYYY-MM-DD')`);
  const byDay = new Map(rows.map((row) => [row.day, row.value]));
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(Date.now() - (days - 1 - index) * 86_400_000).toISOString().slice(0, 10);
    return { day: date, value: byDay.get(date) ?? 0 };
  });
}
