"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSession } from "@/lib/auth/session";

import { completeUpload, createUpload, deleteUpload, UploadError } from "./uploads";

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

async function attempt<T>(run: () => Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, data: await run() };
  } catch (error) {
    if (error instanceof UploadError) return { ok: false, error: error.message };
    console.error("[uploads]", error);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

const requestSchema = z.object({
  name: z.string().min(1).max(1000),
  contentType: z.string().max(255),
  size: z.number().int().nonnegative(),
});

export async function startUploadAction(input: z.input<typeof requestSchema>) {
  const { user } = await requireSession("/files");
  return attempt(() => createUpload(user.id, requestSchema.parse(input)));
}

export async function finishUploadAction(id: string) {
  const { user } = await requireSession("/files");
  const result = await attempt(() => completeUpload(user.id, z.uuid().parse(id)));
  if (result.ok) revalidatePath("/files");
  return result.ok ? { ok: true as const } : result;
}

export async function deleteUploadAction(formData: FormData) {
  const { user } = await requireSession("/files");
  await deleteUpload(user.id, z.uuid().parse(formData.get("id")));
  revalidatePath("/files");
}
