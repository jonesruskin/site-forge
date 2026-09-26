"use server";

import { APIError } from "better-auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/lib/auth/auth";
import { requireSession } from "@/lib/auth/session";

export type SettingsState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string[] | undefined>;
};

function failure(error: unknown, fallback: string): SettingsState {
  if (error instanceof APIError)
    return { status: "error", message: error.body?.message ?? fallback };
  throw error;
}

export async function updateProfileAction(
  _: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  await requireSession("/settings");
  const parsed = z
    .object({
      name: z.string().trim().min(1, "Enter your name.").max(100),
      image: z.url("Enter a valid URL.").or(z.literal("")).optional(),
    })
    .safeParse({ name: formData.get("name"), image: formData.get("image") ?? undefined });
  if (!parsed.success) return { status: "error", errors: z.flattenError(parsed.error).fieldErrors };
  try {
    await auth.api.updateUser({
      body: {
        name: parsed.data.name,
        ...(parsed.data.image !== undefined && { image: parsed.data.image || null }),
      },
      headers: await headers(),
    });
  } catch (error) {
    return failure(error, "Couldn't save your profile.");
  }
  revalidatePath("/", "layout");
  return { status: "success", message: "Profile saved." };
}

export async function changeEmailAction(
  _: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  await requireSession("/settings");
  const parsed = z.email("Enter a valid email address.").safeParse(
    String(formData.get("email") ?? "")
      .trim()
      .toLowerCase(),
  );
  if (!parsed.success)
    return { status: "error", errors: { email: [parsed.error.issues[0]!.message] } };
  try {
    await auth.api.changeEmail({
      body: { newEmail: parsed.data, callbackURL: "/settings" },
      headers: await headers(),
    });
  } catch (error) {
    return failure(error, "Couldn't start the email change.");
  }
  return { status: "success", message: `Check ${parsed.data} to confirm the change.` };
}

export async function changePasswordAction(
  _: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  await requireSession("/settings/security");
  const parsed = z
    .object({
      currentPassword: z.string().min(1, "Enter your current password."),
      newPassword: z.string().min(8, "Use at least 8 characters.").max(128),
    })
    .safeParse({
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
    });
  if (!parsed.success) return { status: "error", errors: z.flattenError(parsed.error).fieldErrors };
  try {
    await auth.api.changePassword({
      body: { ...parsed.data, revokeOtherSessions: formData.get("revokeOthers") === "on" },
      headers: await headers(),
    });
  } catch (error) {
    return failure(error, "Couldn't change your password.");
  }
  return { status: "success", message: "Password changed." };
}

export async function revokeSessionAction(formData: FormData) {
  await requireSession("/settings/security");
  const token = z.string().min(1).parse(formData.get("token"));
  await auth.api.revokeSession({ body: { token }, headers: await headers() });
  revalidatePath("/settings/security");
}

export async function revokeOtherSessionsAction() {
  await requireSession("/settings/security");
  await auth.api.revokeOtherSessions({ headers: await headers() });
  revalidatePath("/settings/security");
}

export async function deleteAccountAction(
  _: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  await requireSession("/settings/account");
  const password = String(formData.get("password") ?? "");
  if (!password)
    return { status: "error", errors: { password: ["Enter your password to confirm."] } };
  try {
    await auth.api.deleteUser({ body: { password }, headers: await headers() });
  } catch (error) {
    return failure(error, "Couldn't delete your account.");
  }
  redirect("/");
}
