"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { contrastRatio } from "@/lib/theme-lab/color";

const PAIRS = [
  { label: "Text on background", fg: "--foreground", bg: "--background", min: 4.5 },
  { label: "Muted text", fg: "--muted-foreground", bg: "--background", min: 4.5 },
  { label: "Muted text on muted", fg: "--muted-foreground", bg: "--muted", min: 4.5 },
  { label: "Primary button", fg: "--primary-foreground", bg: "--primary", min: 4.5 },
  { label: "Input borders", fg: "--input", bg: "--background", min: 3 },
] as const;

/** Resolves a token to a computed color by painting it on a probe element. */
function resolve(token: string) {
  const probe = document.createElement("span");
  probe.style.color = `var(${token})`;
  probe.style.display = "none";
  document.body.appendChild(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
}

/** Live WCAG contrast for the pairs that matter most, re-measured on every dial change. */
export function ContrastReport({ watch }: { watch: unknown }) {
  const [results, setResults] = useState<{ label: string; ratio: number | null; min: number }[]>(
    [],
  );

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setResults(
        PAIRS.map((pair) => ({
          label: pair.label,
          min: pair.min,
          ratio: contrastRatio(resolve(pair.fg), resolve(pair.bg)),
        })),
      );
    });
    return () => cancelAnimationFrame(frame);
  }, [watch]);

  return (
    <section
      aria-label="Contrast"
      className="bg-background flex flex-wrap items-center gap-2 border-b px-6 py-3 text-xs"
    >
      <span className="text-muted-foreground mr-1 font-medium">Contrast</span>
      {results.map((result) => (
        <Badge
          key={result.label}
          variant={
            result.ratio === null
              ? "outline"
              : result.ratio >= result.min
                ? "success"
                : "destructive"
          }
          title={`Minimum ${result.min}:1`}
        >
          {result.label} {result.ratio === null ? "n/a" : `${result.ratio.toFixed(1)}:1`}
        </Badge>
      ))}
    </section>
  );
}
