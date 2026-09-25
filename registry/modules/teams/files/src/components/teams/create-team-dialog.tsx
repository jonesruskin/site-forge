"use client";

import { useActionState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createTeamAction, type TeamState } from "@/lib/teams/actions";

export function CreateTeamDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [state, action, pending] = useActionState<TeamState, FormData>(createTeamAction, { status: "idle" });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a team</DialogTitle>
          <DialogDescription>Invite people and share access. You&apos;ll be the owner.</DialogDescription>
        </DialogHeader>
        <form action={action} className="grid gap-4">
          {state.message && (
            <Alert variant="destructive">
              <AlertDescription className="text-destructive">{state.message}</AlertDescription>
            </Alert>
          )}
          <Field id="team-name" label="Team name" error={state.errors?.name}>
            {(control) => <Input {...control} name="name" required minLength={2} maxLength={60} />}
          </Field>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating…" : "Create team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
