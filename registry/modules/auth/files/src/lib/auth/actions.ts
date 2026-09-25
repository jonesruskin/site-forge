"use server";

import { APIError } from "better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { clientIp, rateLimit } from "@/lib/rate-limit";

import { auth } from "./auth";
import { authConfig } from "./config";
import { safeNext } from "./redirect";

export type AuthFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  errors?: Record<string, string[] | undefined>;
  values?: Record<string, string>;
};

const email = z.email("Enter a valid email address.").trim().toLowerCase();
const password = z.string().min(8, "Use at least 8 characters.").max(128);

async function limited(action: string) {
  const { success } = await rateLimit(`auth:${action}:${await clientIp()}`, {
    limit: 10,
    window: "10 m",
  });
  return success
    ? null
    : ({ status: "error", message: "Too many attempts. Please wait a few minutes." } as const);
}

function apiMessage(error: unknown, fallback: string) {
  if (error instanceof APIError) return error.body?.message ?? fallback;
  throw error;
}

export async function signInAction(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const blocked = await limited("sign-in");
  if (blocked) return blocked;
  const parsed = z
    .object({ email, password: z.string().min(1, "Enter your password.") })
    .safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
  const values = { email: String(formData.get("email") ?? "") };
  if (!parsed.success)
    return { status: "error", errors: z.flattenError(parsed.error).fieldErrors, values };

  try {
    await auth.api.signInEmail({
      body: { ...parsed.data, rememberMe: formData.get("remember") !== "off" },
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError && error.body?.code === "EMAIL_NOT_VERIFIED") {
      return {
        status: "error",
        message: "Please verify your email first. We've sent you a new link.",
        values,
      };
    }
    return { status: "error", message: apiMessage(error, "Invalid email or password."), values };
  }
  redirect(safeNext(formData.get("next")));
}

export async function signUpAction(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const blocked = await limited("sign-up");
  if (blocked) return blocked;
  const parsed = z
    .object({ name: z.string().trim().min(1, "Tell us your name.").max(100), email, password })
    .safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    });
  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
  };
  if (!parsed.success)
    return { status: "error", errors: z.flattenError(parsed.error).fieldErrors, values };

  const next = safeNext(formData.get("next"));
  try {
    await auth.api.signUpEmail({
      body: { ...parsed.data, callbackURL: next },
      headers: await headers(),
    });
  } catch (error) {
    return {
      status: "error",
      message: apiMessage(error, "We couldn't create your account."),
      values,
    };
  }
  if (authConfig.requireEmailVerification)
    redirect(`/verify-email?email=${encodeURIComponent(parsed.data.email)}`);
  redirect(next);
}

export async function magicLinkAction(
  _: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const blocked = await limited("magic-link");
  if (blocked) return blocked;
  const parsed = email.safeParse(formData.get("email"));
  if (!parsed.success)
    return { status: "error", errors: { email: [parsed.error.issues[0]!.message] } };
  try {
    await auth.api.signInMagicLink({
      body: { email: parsed.data, callbackURL: safeNext(formData.get("next")) },
      headers: await headers(),
    });
  } catch (error) {
    return {
      status: "error",
      message: apiMessage(error, "We couldn't send the link."),
      values: { email: parsed.data },
    };
  }
  return {
    status: "success",
    message: `Check ${parsed.data} for a sign-in link. It expires in 5 minutes.`,
  };
}

export async function socialSignInAction(formData: FormData) {
  const provider = z.enum(["google", "github"]).parse(formData.get("provider"));
  const result = await auth.api.signInSocial({
    body: { provider, callbackURL: safeNext(formData.get("next")) },
    headers: await headers(),
  });
  if (!result.url) throw new Error(`Could not start ${provider} sign-in.`);
  redirect(result.url);
}

export async function forgotPasswordAction(
  _: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const blocked = await limited("forgot");
  if (blocked) return blocked;
  const parsed = email.safeParse(formData.get("email"));
  if (!parsed.success)
    return { status: "error", errors: { email: [parsed.error.issues[0]!.message] } };
  try {
    await auth.api.requestPasswordReset({
      body: { email: parsed.data, redirectTo: "/reset-password" },
      headers: await headers(),
    });
  } catch (error) {
    // Never reveal whether an address has an account.
    if (!(error instanceof APIError)) throw error;
  }
  return {
    status: "success",
    message: "If an account exists for that address, a reset link is on its way.",
  };
}

export async function resetPasswordAction(
  _: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = z
    .object({ token: z.string().min(1), password })
    .safeParse({ token: formData.get("token"), password: formData.get("password") });
  if (!parsed.success) return { status: "error", errors: z.flattenError(parsed.error).fieldErrors };
  try {
    await auth.api.resetPassword({
      body: { newPassword: parsed.data.password, token: parsed.data.token },
      headers: await headers(),
    });
  } catch (error) {
    return {
      status: "error",
      message: apiMessage(error, "This reset link is invalid or has expired."),
    };
  }
  redirect("/sign-in?reset=1");
}

export async function signOutAction() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}
