import { z } from "zod";

import siteConfig from "@/site.config";

export const authConfig = z
  .object({
    /** Where people land after signing in (unless a safe ?next= is given). */
    afterSignIn: z.string().default("/dashboard"),
    /** Paths the proxy redirects to /sign-in when no session cookie is present. */
    protectedPaths: z.array(z.string()).default(["/dashboard", "/settings", "/admin"]),
    requireEmailVerification: z.boolean().default(true),
    magicLink: z.boolean().default(true),
  })
  .parse((siteConfig as { auth?: unknown }).auth ?? {});
