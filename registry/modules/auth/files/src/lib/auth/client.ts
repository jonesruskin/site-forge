"use client";

import { magicLinkClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { authClientPlugins } from "@/generated/auth-client-plugins";

/** Browser client for interactive flows (session hooks, plugin APIs). Forms use server actions. */
export const authClient = createAuthClient({
  plugins: [magicLinkClient(), ...authClientPlugins],
});
