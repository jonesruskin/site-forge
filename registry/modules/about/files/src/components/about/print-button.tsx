"use client";

import { PrinterIcon } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

/**
 * Prints the résumé. Printing always uses the light palette: in dark mode the
 * page is flipped with the `tone-inverted` class for the duration of the print.
 */
export function PrintButton({ targetId }: { targetId: string }) {
  useEffect(() => {
    const target = () => document.getElementById(targetId);
    const before = () => {
      if (document.documentElement.classList.contains("dark"))
        target()?.classList.add("tone-inverted");
    };
    const after = () => target()?.classList.remove("tone-inverted");
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
    };
  }, [targetId]);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => window.print()}
      className="print:hidden"
    >
      <PrinterIcon aria-hidden />
      Print or save as PDF
    </Button>
  );
}
