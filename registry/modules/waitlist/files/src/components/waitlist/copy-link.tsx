"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CopyLink({ url, label = "Your referral link" }: { url: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex w-full max-w-md gap-2">
      <label htmlFor="referral-link" className="sr-only">
        {label}
      </label>
      <Input
        id="referral-link"
        readOnly
        value={url}
        onFocus={(event) => event.currentTarget.select()}
        className="font-mono text-sm"
      />
      <Button
        type="button"
        variant="outline"
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? <CheckIcon aria-hidden /> : <CopyIcon aria-hidden />}
        <span>{copied ? "Copied" : "Copy"}</span>
      </Button>
    </div>
  );
}
