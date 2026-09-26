"use client";

import { useActionState, useId } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeToNewsletter, type NewsletterState } from "@/lib/newsletter/actions";
import { cn } from "@/lib/utils";

type NewsletterFormProps = {
  labels?: { email?: string; placeholder?: string; submit?: string; submitting?: string };
  className?: string;
};

/** Inline email + button. Progressive enhancement: works without JavaScript. */
export function NewsletterForm({ labels = {}, className }: NewsletterFormProps) {
  const [state, action, pending] = useActionState<NewsletterState, FormData>(
    subscribeToNewsletter,
    { status: "idle" },
  );
  const id = useId();

  if (state.status === "success") {
    return (
      <p role="status" className={cn("text-sm font-medium", className)}>
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-col gap-2 sm:flex-row">
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
        <div aria-hidden className="absolute -left-[9999px]">
          <input name="company" tabIndex={-1} autoComplete="off" />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? (labels.submitting ?? "Subscribing…") : (labels.submit ?? "Subscribe")}
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
