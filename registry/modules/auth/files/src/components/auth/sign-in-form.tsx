"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { magicLinkAction, signInAction, type AuthFormState } from "@/lib/auth/actions";

import { AuthStatus, SubmitButton } from "./auth-form";

const idle: AuthFormState = { status: "idle" };

/** Password sign-in with an optional switch to a passwordless magic link. */
export function SignInForm({ next, magicLink = true }: { next?: string; magicLink?: boolean }) {
  const [mode, setMode] = useState<"password" | "link">("password");
  const [passwordState, passwordAction, passwordPending] = useActionState(signInAction, idle);
  const [linkState, linkAction, linkPending] = useActionState(magicLinkAction, idle);

  if (mode === "link") {
    return (
      <form action={linkAction} className="grid gap-4">
        <AuthStatus state={linkState} />
        {linkState.status !== "success" && (
          <>
            <Field id="magic-email" label="Email" error={linkState.errors?.email}>
              {(control) => (
                <Input
                  {...control}
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  defaultValue={linkState.values?.email}
                />
              )}
            </Field>
            {next && <input type="hidden" name="next" value={next} />}
            <SubmitButton pending={linkPending} pendingLabel="Sending…">
              Email me a sign-in link
            </SubmitButton>
          </>
        )}
        <Button type="button" variant="link" size="sm" onClick={() => setMode("password")}>
          Use a password instead
        </Button>
      </form>
    );
  }

  return (
    <form action={passwordAction} className="grid gap-4">
      <AuthStatus state={passwordState} />
      <Field id="email" label="Email" error={passwordState.errors?.email}>
        {(control) => (
          <Input
            {...control}
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={passwordState.values?.email}
          />
        )}
      </Field>
      <Field id="password" label="Password" error={passwordState.errors?.password}>
        {(control) => (
          <Input
            {...control}
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        )}
      </Field>
      <div className="-mt-2 flex justify-end">
        <Link
          href="/forgot-password"
          className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
        >
          Forgot password?
        </Link>
      </div>
      {next && <input type="hidden" name="next" value={next} />}
      <SubmitButton pending={passwordPending} pendingLabel="Signing in…">
        Sign in
      </SubmitButton>
      {magicLink && (
        <Button type="button" variant="link" size="sm" onClick={() => setMode("link")}>
          Sign in with an email link instead
        </Button>
      )}
    </form>
  );
}
