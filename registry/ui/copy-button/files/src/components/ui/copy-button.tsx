"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";

type CopyButtonProps = Omit<ButtonProps, "onClick" | "children"> & {
  value: string;
  /** Visible label; omit for an icon-only button (then `aria-label` is set for you). */
  label?: string;
  copiedLabel?: string;
};

/**
 *   <CopyButton value={apiKey} label="Copy key" />
 *   <CopyButton value={snippet} size="icon-sm" variant="ghost" />
 */
export function CopyButton({
  value,
  label,
  copiedLabel = "Copied",
  variant = "outline",
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <Button
      type="button"
      variant={variant}
      aria-label={label ? undefined : copied ? copiedLabel : "Copy to clipboard"}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
        } catch {
          // Clipboard blocked (permissions, insecure context): leave the value selectable.
        }
      }}
      {...props}
    >
      {copied ? <CheckIcon aria-hidden /> : <CopyIcon aria-hidden />}
      {label && <span>{copied ? copiedLabel : label}</span>}
      <span role="status" className="sr-only">
        {copied ? copiedLabel : ""}
      </span>
    </Button>
  );
}
