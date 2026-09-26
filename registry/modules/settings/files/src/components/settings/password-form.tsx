"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { changePasswordAction, type SettingsState } from "@/lib/settings/actions";

import { FormStatus } from "./form-status";

export function PasswordForm() {
  const [state, action, pending] = useActionState<SettingsState, FormData>(changePasswordAction, {
    status: "idle",
  });
  return (
    <form action={action} className="grid max-w-md gap-4">
      <FormStatus state={state} />
      <Field id="current-password" label="Current password" error={state.errors?.currentPassword}>
        {(control) => (
          <Input
            {...control}
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
          />
        )}
      </Field>
      <Field
        id="new-password"
        label="New password"
        description="At least 8 characters."
        error={state.errors?.newPassword}
      >
        {(control) => (
          <Input
            {...control}
            name="newPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        )}
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="revokeOthers"
          defaultChecked
          className="accent-primary size-4"
        />
        Sign out of other devices
      </label>
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Change password"}
        </Button>
      </div>
    </form>
  );
}
