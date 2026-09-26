"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSession } from "@/lib/auth/session";

import { apiConfig } from "./config";
import { createApiKey, listApiKeys, revokeApiKey } from "./keys";

export type CreateKeyState = {
  status: "idle" | "created" | "error";
  message?: string;
  errors?: Record<string, string[] | undefined>;
  /** The plaintext key, returned exactly once. */
  key?: string;
  name?: string;
};

const MAX_KEYS = 25;

export async function createKeyAction(
  _: CreateKeyState,
  formData: FormData,
): Promise<CreateKeyState> {
  const { user } = await requireSession("/settings/api-keys");
  const scopeNames = Object.keys(apiConfig.scopes);
  const parsed = z
    .object({
      name: z.string().trim().min(1, "Name the key after where it will be used.").max(60),
      scopes: z
        .array(z.enum(scopeNames as [string, ...string[]]))
        .min(1, "Pick at least one scope."),
      expiresInDays: z.enum(["0", "30", "90", "365"]).transform(Number),
    })
    .safeParse({
      name: formData.get("name"),
      scopes: formData.getAll("scopes"),
      expiresInDays: formData.get("expiresInDays") ?? "0",
    });
  if (!parsed.success) return { status: "error", errors: z.flattenError(parsed.error).fieldErrors };

  if ((await listApiKeys(user.id)).length >= MAX_KEYS) {
    return { status: "error", message: `You can have up to ${MAX_KEYS} keys. Revoke one first.` };
  }
  const { key } = await createApiKey(user.id, parsed.data);
  revalidatePath("/settings/api-keys");
  return { status: "created", key, name: parsed.data.name };
}

export async function revokeKeyAction(formData: FormData) {
  const { user } = await requireSession("/settings/api-keys");
  const id = z.uuid().parse(formData.get("id"));
  await revokeApiKey(user.id, id);
  revalidatePath("/settings/api-keys");
}
