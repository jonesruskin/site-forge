"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { devToolsEnabled, flagDefinitions, OVERRIDE_COOKIE } from "./config";
import { readPersonalOverrides } from "./index";

/** Sets or clears this browser's override for one flag (dev tools only). */
export async function setOverrideAction(formData: FormData) {
  if (!devToolsEnabled) throw new Error("Flag overrides are disabled.");
  const { flag, value } = z
    .object({
      flag: z.string().refine((name) => name in flagDefinitions, "Unknown flag"),
      value: z.enum(["on", "off", "default"]),
    })
    .parse(Object.fromEntries(formData));

  const overrides = { ...(await readPersonalOverrides()) };
  if (value === "default") delete overrides[flag];
  else overrides[flag] = value === "on";

  const store = await cookies();
  if (Object.keys(overrides).length === 0) store.delete(OVERRIDE_COOKIE);
  else
    store.set(OVERRIDE_COOKIE, JSON.stringify(overrides), {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
  revalidatePath("/", "layout");
}

export async function clearOverridesAction() {
  if (!devToolsEnabled) throw new Error("Flag overrides are disabled.");
  (await cookies()).delete(OVERRIDE_COOKIE);
  revalidatePath("/", "layout");
}
