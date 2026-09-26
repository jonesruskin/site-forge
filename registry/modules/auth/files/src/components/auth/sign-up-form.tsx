"use client";

import { useActionState } from "react";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signUpAction, type AuthFormState } from "@/lib/auth/actions";

import { AuthStatus, SubmitButton } from "./auth-form";

export function SignUpForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(signUpAction, {
    status: "idle",
  });
  return (
    <form action={action} className="grid gap-4">
      <AuthStatus state={state} />
      <Field id="name" label="Name" error={state.errors?.name}>
        {(control) => (
          <Input
            {...control}
            name="name"
            autoComplete="name"
            required
            defaultValue={state.values?.name}
          />
        )}
      </Field>
      <Field id="email" label="Email" error={state.errors?.email}>
        {(control) => (
          <Input
            {...control}
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={state.values?.email}
          />
        )}
      </Field>
      <Field
        id="password"
        label="Password"
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
      {next && <input type="hidden" name="next" value={next} />}
      <SubmitButton pending={pending} pendingLabel="Creating account…">
        Create account
      </SubmitButton>
    </form>
  );
}
