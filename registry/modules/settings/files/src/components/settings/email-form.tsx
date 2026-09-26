"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { changeEmailAction, type SettingsState } from "@/lib/settings/actions";

import { FormStatus } from "./form-status";

export function EmailForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(changeEmailAction, {
    status: "idle",
  });
  return (
    <form action={action} className="grid max-w-md gap-4">
      <FormStatus state={state} />
      <Field
        id="email"
        label="Email"
        description="We'll send a confirmation link to the new address."
        error={state.errors?.email}
      >
        {(control) => (
          <Input
            {...control}
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={email}
            required
          />
        )}
      </Field>
      <div>
        <Button type="submit" variant="outline" disabled={pending}>
          {pending ? "Sending…" : "Change email"}
        </Button>
      </div>
    </form>
  );
}
