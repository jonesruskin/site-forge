"use server";

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { z } from "zod";

import { DIALS, writeDials } from "./dials";

const valueSchema = z
  .string()
  .regex(/^[\w\s.()-]+$/, "Invalid dial value")
  .max(40);
const dialsSchema = z.object(Object.fromEntries(DIALS.map((dial) => [dial.name, valueSchema])));

/** Writes the dials into src/styles/theme.css. Development only. */
export async function saveDials(values: Record<string, string>) {
  if (process.env.NODE_ENV !== "development") {
    return { ok: false as const, error: "Saving is only available in development." };
  }
  const parsed = dialsSchema.safeParse(values);
  if (!parsed.success)
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid values" };

  const file = path.join(process.cwd(), "src", "styles", "theme.css");
  const css = await readFile(file, "utf8");
  await writeFile(file, writeDials(css, parsed.data as Record<string, string>));
  return { ok: true as const };
}
