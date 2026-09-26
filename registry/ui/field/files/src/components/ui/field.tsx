import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** Props to spread onto the control so assistive tech reads its label, hint and error. */
export type FieldControlProps = {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
};

type FieldProps = {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  /** One message or a list; the first is shown. */
  error?: string | string[];
  /** Visually marks the field as optional instead of required. */
  optionalLabel?: string;
  className?: string;
  children: (control: FieldControlProps) => ReactNode;
};

/**
 * Label + control + description + error, wired together with ids.
 *
 *   <Field id="email" label="Email" error={errors?.email}>
 *     {(control) => <Input {...control} name="email" type="email" />}
 *   </Field>
 */
export function Field({
  id,
  label,
  description,
  error,
  optionalLabel,
  className,
  children,
}: FieldProps) {
  const message = Array.isArray(error) ? error[0] : error;
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = message ? `${id}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div data-slot="field" className={cn("grid gap-2", className)}>
      <Label htmlFor={id}>
        {label}
        {optionalLabel && (
          <span className="text-muted-foreground font-normal">{optionalLabel}</span>
        )}
      </Label>
      {children({
        id,
        "aria-describedby": describedBy,
        ...(message && { "aria-invalid": true as const }),
      })}
      {description && (
        <p id={descriptionId} className="text-muted-foreground text-sm">
          {description}
        </p>
      )}
      {message && (
        <p id={errorId} className="text-destructive text-sm">
          {message}
        </p>
      )}
    </div>
  );
}
