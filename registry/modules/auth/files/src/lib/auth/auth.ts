import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins";

import { db, schema } from "@/db";
import { MagicLinkEmail } from "@/emails/auth/magic-link";
import { ResetPasswordEmail } from "@/emails/auth/reset-password";
import { VerifyEmail } from "@/emails/auth/verify-email";
import { authEnv, oauthProviders } from "@/env/auth";
import { authPlugins } from "@/generated/auth-plugins";
import { sendEmail } from "@/lib/email/send";
import siteConfig from "@/site.config";

import { authConfig } from "./config";
import { emitAuthEvent } from "./events";

/**
 * `next build` evaluates route modules without serving requests. A placeholder
 * secret is used only in that phase; at runtime a missing secret still fails.
 */
const secret =
  authEnv.BETTER_AUTH_SECRET ??
  (process.env.NEXT_PHASE === "phase-production-build"
    ? "build-phase-placeholder-secret-not-used-at-runtime"
    : undefined);

export const auth = betterAuth({
  appName: siteConfig.name,
  // In development the origin is inferred from each request (any port works).
  baseURL:
    authEnv.BETTER_AUTH_URL ?? (process.env.NODE_ENV === "production" ? siteConfig.url : undefined),
  secret,
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: authConfig.requireEmailVerification,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        react: ResetPasswordEmail({ url, name: user.name }),
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    afterEmailVerification: async (user) => {
      await emitAuthEvent({ type: "user.verified", user });
    },
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: `Verify your email for ${siteConfig.name}`,
        react: VerifyEmail({ url, name: user.name }),
      });
    },
  },
  socialProviders: {
    ...(oauthProviders.google && {
      google: { clientId: authEnv.GOOGLE_CLIENT_ID!, clientSecret: authEnv.GOOGLE_CLIENT_SECRET! },
    }),
    ...(oauthProviders.github && {
      github: { clientId: authEnv.GITHUB_CLIENT_ID!, clientSecret: authEnv.GITHUB_CLIENT_SECRET! },
    }),
  },
  account: {
    accountLinking: { enabled: true, trustedProviders: ["google", "github"] },
  },
  user: {
    // Email changes are confirmed through a link sent to the new address.
    changeEmail: { enabled: true },
    // Account deletion (settings module) requires the current password.
    deleteUser: { enabled: true },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await emitAuthEvent({ type: "user.created", user });
        },
      },
    },
  },
  session: {
    // Session reads hit a signed cookie for 5 minutes before touching the database.
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  rateLimit: { enabled: process.env.NODE_ENV === "production" },
  plugins: [
    magicLink({
      disableSignUp: false,
      sendMagicLink: async ({ email, url }) => {
        await sendEmail({
          to: email,
          subject: `Your sign-in link for ${siteConfig.name}`,
          react: MagicLinkEmail({ url }),
        });
      },
    }),
    ...authPlugins,
    // Must stay last: lets server actions set auth cookies.
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User = Session["user"];
