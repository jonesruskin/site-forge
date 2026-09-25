"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireSession } from "@/lib/auth/session";

import { markRead } from "./notify";

export async function markAllReadAction() {
  const { user } = await requireSession("/notifications");
  await markRead(user.id);
  revalidatePath("/", "layout");
}

/** Marks one notification read, then follows its link. */
export async function openNotificationAction(formData: FormData) {
  const { user } = await requireSession("/notifications");
  const { id, href } = z
    .object({ id: z.uuid(), href: z.string().optional() })
    .parse(Object.fromEntries(formData));
  await markRead(user.id, id);
  revalidatePath("/", "layout");
  redirect(href && href.startsWith("/") && !href.startsWith("//") ? href : "/notifications");
}
