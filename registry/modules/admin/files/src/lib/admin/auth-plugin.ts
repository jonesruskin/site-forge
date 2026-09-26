import { admin } from "better-auth/plugins";

/** Better Auth admin plugin, added to auth through the auth-plugins slot. */
export const adminPlugin = admin({
  defaultRole: "user",
  adminRoles: ["admin"],
  impersonationSessionDuration: 60 * 60,
});
