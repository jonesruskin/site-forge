"use client";

import { useActionState, useEffect, useId, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { joinWaitlistAction, type WaitlistState } from "@/lib/waitlist/actions";
import { cn } from "@/lib/utils";

type WaitlistFormProps = {
  /** Also ask for a name. */
  withName?: boolean;
  labels?: {
    email?: string;
    name?: string;
    placeholder?: string;
    submit?: string;
    submitting?: string;
  };
  className?: string;
};

/** Email (+ optional name) form. Picks up `?ref=` from the URL so referrals are credited. */
export function WaitlistForm({ withName = false, labels = {}, className }: WaitlistFormProps) {
  const [state, action, pending] = useActionState<WaitlistState, FormData>(joinWaitlistAction, {
    status: "idle",
  });
  const refInput = useRef<HTMLInputElement>(null);
  const id = useId();

  // Credit referrals from links like /?ref=abc123 (read from the URL after hydration).
  useEffect(() => {
    if (refInput.current)
      refInput.current.value = new URLSearchParams(window.location.search).get("ref") ?? "";
  }, []);

  if (state.status === "exists") {
    return (
      <p role="status" className={cn("text-sm font-medium", className)}>
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-col gap-2 sm:flex-row">
        {withName && (
          <>
            <label htmlFor={`${id}-name`} className="sr-only">
              {labels.name ?? "Name"}
            </label>
            <Input
              id={`${id}-name`}
              name="name"
              autoComplete="name"
              placeholder={labels.name ?? "Name"}
              className="sm:w-40"
            />
          </>
        )}
        <label htmlFor={`${id}-email`} className="sr-only">
          {labels.email ?? "Email address"}
        </label>
        <Input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder={labels.placeholder ?? "you@example.com"}
          defaultValue={state.email}
          aria-invalid={state.status === "error" || undefined}
          aria-describedby={state.status === "error" ? `${id}-error` : undefined}
          className="sm:flex-1"
        />
        <input ref={refInput} type="hidden" name="ref" defaultValue="" />
        <div aria-hidden className="absolute -left-[9999px]">
          <input name="company" tabIndex={-1} autoComplete="off" />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? (labels.submitting ?? "Joining…") : (labels.submit ?? "Join the waitlist")}
        </Button>
      </div>
      {state.status === "error" && (
        <p id={`${id}-error`} role="alert" className="text-destructive text-sm">
          {state.message}
        </p>
      )}
    </form>
  );
}
