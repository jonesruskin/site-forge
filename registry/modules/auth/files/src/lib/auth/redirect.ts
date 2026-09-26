import { authConfig } from "./config";

/** Only same-site relative paths are allowed as post-auth destinations (no open redirects). */
export function safeNext(value: FormDataEntryValue | string | null | undefined) {
  const next = typeof value === "string" ? value : "";
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\"))
    return authConfig.afterSignIn;
  return next;
}
