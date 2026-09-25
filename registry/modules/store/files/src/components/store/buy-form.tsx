"use client";

import { MailCheckIcon } from "lucide-react";
import { useActionState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { buyAction, type BuyState } from "@/lib/store/actions";

/** Email + one button. Paid products continue to checkout; free ones are emailed straight away. */
export function BuyForm({ slug, label, free }: { slug: string; label: string; free: boolean }) {
  const [state, action, pending] = useActionState<BuyState, FormData>(buyAction, {
    status: "idle",
  });

  if (state.status === "sent") {
    return (
      <Alert variant="success">
        <MailCheckIcon aria-hidden />
        <AlertTitle>Check your inbox</AlertTitle>
        <AlertDescription className="text-foreground">
          We sent the download link to {state.email}. It can take a minute to arrive.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="slug" value={slug} />
      <Field
        id="buy-email"
        label="Email"
        description={
          free ? "We'll email you the download link." : "For your receipt and download link."
        }
        error={state.status === "error" ? state.message : undefined}
      >
        {(control) => (
          <Input
            {...control}
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
          />
        )}
      </Field>
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? (free ? "Sending…" : "Opening checkout…") : label}
      </Button>
    </form>
  );
}
