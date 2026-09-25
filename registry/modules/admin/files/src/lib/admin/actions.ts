"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/lib/auth/auth";

import { requireAdmin } from "./guard";

const userId = z.string().min(1);

export async function setRoleAction(formData: FormData) {
  await requireAdmin();
  const { id, role } = z.object({ id: userId, role: z.enum(["user", "admin"]) }).parse(Object.fromEntries(formData));
  await auth.api.setRole({ body: { userId: id, role }, headers: await headers() });
  revalidatePath("/admin/users");
}

export async function banUserAction(formData: FormData) {
  await requireAdmin();
  const { id, reason, days } = z
    .object({ id: userId, reason: z.string().max(200).optional(), days: z.coerce.number().int().min(0).max(3650).default(0) })
    .parse(Object.fromEntries(formData));
  await auth.api.banUser({
    body: { userId: id, banReason: reason || undefined, ...(days > 0 && { banExpiresIn: days * 86_400 }) },
    headers: await headers(),
  });
  revalidatePath("/admin/users");
}

export async function unbanUserAction(formData: FormData) {
  await requireAdmin();
  await auth.api.unbanUser({ body: { userId: userId.parse(formData.get("id")) }, headers: await headers() });
  revalidatePath("/admin/users");
}

export async function revokeSessionsAction(formData: FormData) {
  await requireAdmin();
  await auth.api.revokeUserSessions({ body: { userId: userId.parse(formData.get("id")) }, headers: await headers() });
  revalidatePath("/admin/users");
}

export async function impersonateAction(formData: FormData) {
  await requireAdmin();
  await auth.api.impersonateUser({ body: { userId: userId.parse(formData.get("id")) }, headers: await headers() });
  redirect("/dashboard");
}

export async function stopImpersonatingAction() {
  await auth.api.stopImpersonating({ headers: await headers() });
  redirect("/admin/users");
}
