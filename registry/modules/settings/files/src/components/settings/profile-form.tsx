"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updateProfileAction, type SettingsState } from "@/lib/settings/actions";

import { FormStatus } from "./form-status";

export function ProfileForm({ name, image }: { name: string; image?: string | null }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(updateProfileAction, {
    status: "idle",
  });
  return (
    <form action={action} className="grid max-w-md gap-4">
      <FormStatus state={state} />
      <Field id="name" label="Name" error={state.errors?.name}>
        {(control) => (
          <Input {...control} name="name" autoComplete="name" defaultValue={name} required />
        )}
      </Field>
      <Field
        id="image"
        label="Avatar URL"
        optionalLabel="(optional)"
        description="A square image works best."
        error={state.errors?.image}
      >
        {(control) => (
          <Input
            {...control}
            name="image"
            type="url"
            defaultValue={image ?? ""}
            placeholder="https://"
          />
        )}
      </Field>
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </form>
  );
}
