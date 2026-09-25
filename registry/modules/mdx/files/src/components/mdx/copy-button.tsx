"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

/** Copies the text of the nearest code block. */
export function CopyButton({ label = "Copy code" }: { label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async (event) => {
        const code =
          event.currentTarget.closest("[data-code-block]")?.querySelector("code")?.innerText ?? "";
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="bg-background/80 text-muted-foreground hover:text-foreground absolute top-2.5 right-2.5 inline-flex size-8 items-center justify-center rounded-md border opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
    >
      {copied ? (
        <CheckIcon aria-hidden className="size-3.5" />
      ) : (
        <CopyIcon aria-hidden className="size-3.5" />
      )}
      <span className="sr-only">{copied ? "Copied" : label}</span>
    </button>
  );
}
