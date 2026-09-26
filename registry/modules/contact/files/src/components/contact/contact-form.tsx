"use client";

import { CheckCircle2Icon } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitContact } from "@/lib/contact/actions";
import type { ContactState } from "@/lib/contact/schema";

import { Turnstile } from "./turnstile";

type ContactFormProps = {
  turnstileSiteKey?: string;
  labels?: Partial<{
    name: string;
    email: string;
    message: string;
    submit: string;
    submitting: string;
  }>;
};

const initialState: ContactState = { status: "idle" };

/**
 * Works without JavaScript (server action). With JS it adds inline validation
 * feedback, a pending state and the timing check used for spam scoring.
 */
export function ContactForm({ turnstileSiteKey, labels = {} }: ContactFormProps) {
  const [state, formAction, pending] = useActionState(submitContact, initialState);
  const timestampRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (timestampRef.current) timestampRef.current.value = String(Date.now());
  }, []);

  useEffect(() => {
    if (state.status !== "idle") statusRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        className="bg-card flex items-start gap-3 rounded-lg border p-6 outline-none"
      >
        <CheckCircle2Icon aria-hidden className="text-success mt-0.5 size-5 shrink-0" />
        <p>{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-6" noValidate={false}>
      {state.status === "error" && state.message && (
        <div
          ref={statusRef}
          tabIndex={-1}
          role="alert"
          className="border-destructive/40 bg-destructive/5 text-destructive rounded-md border px-4 py-3 text-sm outline-none"
        >
          {state.message}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="contact-name" label={labels.name ?? "Name"} error={state.errors?.name}>
          {(control) => (
            <Input
              {...control}
              name="name"
              autoComplete="name"
              required
              maxLength={100}
              defaultValue={state.values?.name}
            />
          )}
        </Field>
        <Field id="contact-email" label={labels.email ?? "Email"} error={state.errors?.email}>
          {(control) => (
            <Input
              {...control}
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={200}
              defaultValue={state.values?.email}
            />
          )}
        </Field>
      </div>

      <Field id="contact-message" label={labels.message ?? "Message"} error={state.errors?.message}>
        {(control) => (
          <Textarea
            {...control}
            name="message"
            rows={6}
            required
            minLength={10}
            maxLength={5000}
            defaultValue={state.values?.message}
          />
        )}
      </Field>

      {/* Spam traps: invisible to people, irresistible to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input ref={timestampRef} type="hidden" name="_t" defaultValue="0" />

      <Turnstile siteKey={turnstileSiteKey} />

      <div>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? (labels.submitting ?? "Sending…") : (labels.submit ?? "Send message")}
        </Button>
      </div>
    </form>
  );
}
