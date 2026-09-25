import "server-only";

import { authEvents } from "@/generated/auth-events";

export type AuthEventUser = { id: string; name: string; email: string; emailVerified: boolean };

/** Lifecycle events other modules subscribe to through the auth-events slot. */
export type AuthEvent = { type: "user.created"; user: AuthEventUser } | { type: "user.verified"; user: AuthEventUser };

/** Runs every subscriber; failures are logged and never block authentication. */
export async function emitAuthEvent(event: AuthEvent) {
  for (const handler of authEvents) {
    try {
      await handler(event);
    } catch (error) {
      console.error(`[auth] ${event.type} handler failed`, error);
    }
  }
}
