"use client";

import { useActionState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { inviteMemberAction, type TeamState } from "@/lib/teams/actions";

export function InviteForm({ organizationId }: { organizationId: string }) {
  const [state, action, pending] = useActionState<TeamState, FormData>(inviteMemberAction, { status: "idle" });
  return (
    <form action={action} className="grid gap-4">
      {state.message && (
        <Alert variant={state.status === "success" ? "success" : "destructive"}>
          <AlertDescription className={state.status === "success" ? "text-foreground" : "text-destructive"}>{state.message}</AlertDescription>
        </Alert>
      )}
      <input type="hidden" name="organizationId" value={organizationId} />
      <div className="grid gap-4 sm:grid-cols-[1fr_10rem_auto] sm:items-end">
        <Field id="invite-email" label="Email" error={state.errors?.email}>
          {(control) => <Input {...control} name="email" type="email" required placeholder="teammate@example.com" />}
        </Field>
        <Field id="invite-role" label="Role" error={state.errors?.role}>
          {(control) => (
            <NativeSelect {...control} name="role" defaultValue="member">
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </NativeSelect>
          )}
        </Field>
        <Button type="submit" disabled={pending}>
          {pending ? "Sending…" : "Send invite"}
        </Button>
      </div>
    </form>
  );
}
