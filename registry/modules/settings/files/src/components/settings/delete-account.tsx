"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { deleteAccountAction, type SettingsState } from "@/lib/settings/actions";

import { FormStatus } from "./form-status";

export function DeleteAccount() {
  const [state, action, pending] = useActionState<SettingsState, FormData>(deleteAccountAction, {
    status: "idle",
  });
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete account</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete your account?</DialogTitle>
          <DialogDescription>
            This permanently deletes your account and data. It can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        <form action={action} className="grid gap-4">
          <FormStatus state={state} />
          <Field
            id="delete-password"
            label="Confirm with your password"
            error={state.errors?.password}
          >
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
          <DialogFooter>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? "Deleting…" : "Delete permanently"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
