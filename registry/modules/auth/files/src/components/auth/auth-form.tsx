"use client";

import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react";
import type { ReactNode } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { AuthFormState } from "@/lib/auth/actions";

/** Status banner shared by every auth form. */
export function AuthStatus({ state }: { state: AuthFormState }) {
  if (!state.message) return null;
  const success = state.status === "success";
  return (
    <Alert variant={success ? "success" : "destructive"}>
      {success ? <CheckCircle2Icon aria-hidden /> : <AlertCircleIcon aria-hidden />}
      <AlertDescription className={success ? "text-foreground" : "text-destructive"}>
        {state.message}
      </AlertDescription>
    </Alert>
  );
}

export function SubmitButton({
  pending,
  children,
  pendingLabel,
}: {
  pending: boolean;
  children: ReactNode;
  pendingLabel: string;
}) {
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? pendingLabel : children}
    </Button>
  );
}
