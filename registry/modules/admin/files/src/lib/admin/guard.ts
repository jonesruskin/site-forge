import "server-only";

import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { db } from "@/db";
import { user as userTable } from "@/db/schema/auth";
import { adminEnv } from "@/env/admin";
import { requireSession } from "@/lib/auth/session";

/** Admin session or a 404: non-admins can't tell the area exists. */
export async function requireAdmin(returnTo = "/admin") {
  const session = await requireSession(returnTo);
  const role = (session.user as { role?: string | null }).role;
  if (role === "admin") return session;

  // Bootstrap: emails listed in ADMIN_EMAILS are promoted on first visit.
  const listed = (adminEnv.ADMIN_EMAILS as unknown as string[] | undefined) ?? [];
  if (listed.includes(session.user.email.toLowerCase())) {
    await db.update(userTable).set({ role: "admin" }).where(eq(userTable.id, session.user.id));
    return session;
  }
  notFound();
}
