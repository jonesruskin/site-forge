"use client";

import { KeyRoundIcon } from "lucide-react";
import { useActionState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CopyButton } from "@/components/ui/copy-button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { createKeyAction, type CreateKeyState } from "@/lib/api/actions";

export function CreateKeyForm({
  scopes,
  endpoint,
}: {
  scopes: Record<string, string>;
  endpoint: string;
}) {
  const [state, action, pending] = useActionState<CreateKeyState, FormData>(createKeyAction, {
    status: "idle",
  });
  const scopeEntries = Object.entries(scopes);

  return (
    <div className="grid gap-6">
      {state.status === "created" && state.key && (
        <Alert variant="success">
          <KeyRoundIcon aria-hidden />
          <AlertTitle>“{state.name}” is ready. Copy it now — it won’t be shown again.</AlertTitle>
          <AlertDescription className="text-foreground mt-3 grid gap-3">
            <div className="flex gap-2">
              <label htmlFor="new-api-key" className="sr-only">
                New API key
              </label>
              <Input
                id="new-api-key"
                readOnly
                value={state.key}
                onFocus={(event) => event.currentTarget.select()}
                className="font-mono text-xs"
              />
              <CopyButton value={state.key} label="Copy" />
            </div>
            <div className="bg-muted relative rounded-md p-3 pr-12">
              <code className="block font-mono text-xs break-all">
                curl -H &quot;Authorization: Bearer {state.key}&quot; {endpoint}
              </code>
              <CopyButton
                value={`curl -H "Authorization: Bearer ${state.key}" ${endpoint}`}
                size="icon-sm"
                variant="ghost"
                className="absolute top-1.5 right-1.5"
              />
            </div>
          </AlertDescription>
        </Alert>
      )}
      {state.status === "error" && state.message && (
        <Alert variant="destructive">
          <AlertDescription className="text-destructive">{state.message}</AlertDescription>
        </Alert>
      )}
      <form action={action} key={state.key} className="grid max-w-xl gap-5">
        <Field
          id="key-name"
          label="Name"
          description="Where the key is used, e.g. “CI deploys”."
          error={state.errors?.name}
        >
          {(control) => (
            <Input {...control} name="name" required maxLength={60} autoComplete="off" />
          )}
        </Field>
        <fieldset
          className="grid gap-3"
          aria-describedby={state.errors?.scopes ? "key-scopes-error" : undefined}
        >
          <legend className="mb-1 text-sm font-medium">Scopes</legend>
          {scopeEntries.map(([scope, description], index) => (
            <div key={scope} className="flex items-start gap-3">
              <Checkbox
                id={`scope-${scope}`}
                name="scopes"
                value={scope}
                defaultChecked={index === 0}
                className="mt-0.5"
              />
              <Label htmlFor={`scope-${scope}`} className="grid gap-0.5 font-normal">
                <span className="font-mono text-sm">{scope}</span>
                <span className="text-muted-foreground text-sm">{description}</span>
              </Label>
            </div>
          ))}
          {state.errors?.scopes && (
            <p id="key-scopes-error" className="text-destructive text-sm">
              {state.errors.scopes[0]}
            </p>
          )}
        </fieldset>
        <Field id="key-expiry" label="Expires" className="max-w-48">
          {(control) => (
            <NativeSelect {...control} name="expiresInDays" defaultValue="90">
              <option value="30">In 30 days</option>
              <option value="90">In 90 days</option>
              <option value="365">In a year</option>
              <option value="0">Never</option>
            </NativeSelect>
          )}
        </Field>
        <div>
          <Button type="submit" disabled={pending}>
            {pending ? "Creating…" : "Create key"}
          </Button>
        </div>
      </form>
    </div>
  );
}
