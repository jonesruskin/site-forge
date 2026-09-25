"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updateTeamAction, type TeamState } from "@/lib/teams/actions";

export function TeamForm({ organizationId, name, disabled }: { organizationId: string; name: string; disabled?: boolean }) {
  const [state, action, pending] = useActionState<TeamState, FormData>(updateTeamAction, { status: "idle" });
  return (
    <form action={action} className="grid max-w-md gap-4">
      <input type="hidden" name="organizationId" value={organizationId} />
      <Field
        id="team-name-edit"
        label="Team name"
        error={state.errors?.name}
        description={state.status === "success" ? state.message : undefined}
      >
        {(control) => <Input {...control} name="name" defaultValue={name} required disabled={disabled} />}
      </Field>
      {!disabled && (
        <div>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </Button>
        </div>
      )}
    </form>
  );
}
