"use client";

import { useActionState } from "react";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { forgotPasswordAction, resetPasswordAction, type AuthFormState } from "@/lib/auth/actions";

import { AuthStatus, SubmitButton } from "./auth-form";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(forgotPasswordAction, {
    status: "idle",
  });
  if (state.status === "success") return <AuthStatus state={state} />;
  return (
    <form action={action} className="grid gap-4">
      <AuthStatus state={state} />
      <Field id="email" label="Email" error={state.errors?.email}>
        {(control) => (
          <Input {...control} name="email" type="email" autoComplete="email" required />
        )}
      </Field>
      <SubmitButton pending={pending} pendingLabel="Sending…">
        Send reset link
      </SubmitButton>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(resetPasswordAction, {
    status: "idle",
  });
  return (
    <form action={action} className="grid gap-4">
      <AuthStatus state={state} />
      <input type="hidden" name="token" value={token} />
      <Field
        id="password"
        label="New password"
        description="At least 8 characters."
        error={state.errors?.password}
      >
        {(control) => (
          <Input
            {...control}
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        )}
      </Field>
      <SubmitButton pending={pending} pendingLabel="Saving…">
        Set new password
      </SubmitButton>
    </form>
  );
}
