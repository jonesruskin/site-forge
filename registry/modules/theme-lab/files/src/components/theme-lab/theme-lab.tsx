"use client";

import { CheckIcon, CopyIcon, RotateCcwIcon, SaveIcon, ShuffleIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { saveDials } from "@/lib/theme-lab/actions";
import { DIALS, FOLLOW_HUE, numeric, type DialName, type DialValues } from "@/lib/theme-lab/dials";

import { ContrastReport } from "./contrast";
import { Preview } from "./preview";

type ThemeLabProps = {
  initial: DialValues;
  /** Saving writes to disk, so it is only offered by the dev server. */
  canSave: boolean;
};

function format(dial: (typeof DIALS)[number], value: number) {
  const decimals = dial.step < 0.01 ? 3 : dial.step < 1 ? 2 : 0;
  return `${Number(value.toFixed(decimals))}${dial.unit}`;
}

function randomDials(): DialValues {
  const pick = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)]!;
  const hue = Math.round(Math.random() * 360);
  const colorful = Math.random() > 0.35;
  return {
    hue: String(hue),
    tint: String(pick([0, 0.006, 0.012, 0.02, 0.028])),
    accent: String(colorful ? pick([0.12, 0.16, 0.2, 0.24]) : 0),
    "accent-hue":
      Math.random() > 0.6 ? String((hue + pick([30, 150, 180, 210])) % 360) : FOLLOW_HUE,
    "accent-lightness": String(colorful ? pick([0.48, 0.55, 0.62]) : pick([0.2, 0.25])),
    radius: `${pick([0, 0.25, 0.5, 0.75, 1, 1.25])}rem`,
    density: String(pick([0.9, 0.95, 1, 1.05, 1.12])),
    shadow: String(pick([0, 0.5, 1, 1.6, 2.2])),
    motion: String(pick([0.4, 0.8, 1, 1.4])),
    "type-scale": String(pick([0.92, 1, 1.08, 1.16])),
    measure: `${pick([64, 72, 80])}rem`,
  };
}

export function ThemeLab({ initial, canSave }: ThemeLabProps) {
  const [values, setValues] = useState<DialValues>(initial);
  const [saved, setSaved] = useState<"idle" | "saved" | "copied" | string>("idle");
  const [pending, startTransition] = useTransition();

  // Apply dials to <html> so every token (and every component) follows live.
  useEffect(() => {
    const root = document.documentElement;
    for (const [name, value] of Object.entries(values))
      root.style.setProperty(`--dial-${name}`, value);
  }, [values]);

  // Leaving the lab restores the theme from theme.css.
  useEffect(() => {
    const root = document.documentElement;
    return () => DIALS.forEach((dial) => root.style.removeProperty(`--dial-${dial.name}`));
  }, []);

  const set = useCallback((name: DialName, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setSaved("idle");
  }, []);

  const css = useMemo(
    () => DIALS.map((dial) => `  --dial-${dial.name}: ${values[dial.name]};`).join("\n"),
    [values],
  );

  const followsHue = values["accent-hue"] === FOLLOW_HUE;

  return (
    <div className="grid min-h-dvh lg:grid-cols-[22rem_1fr]">
      <aside className="bg-background flex flex-col gap-6 border-b p-6 lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto lg:border-r lg:border-b-0">
        <div>
          <p className="text-eyebrow text-muted-foreground">Theme lab</p>
          <h1 className="mt-1 text-xl font-semibold">Turn the dials</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Every token and component on the right derives from these numbers.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          {DIALS.map((dial) => {
            const raw = dial.name === "accent-hue" && followsHue ? values.hue : values[dial.name];
            const value = numeric(raw);
            const id = `dial-${dial.name}`;
            return (
              <div key={dial.name} className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-2">
                  <label htmlFor={id} className="text-sm font-medium">
                    {dial.label}
                  </label>
                  <output
                    htmlFor={id}
                    className="text-muted-foreground font-mono text-xs tabular-nums"
                  >
                    {dial.name === "accent-hue" && followsHue ? "= hue" : format(dial, value)}
                  </output>
                </div>
                <input
                  id={id}
                  type="range"
                  min={dial.min}
                  max={dial.max}
                  step={dial.step}
                  value={value}
                  disabled={dial.name === "accent-hue" && followsHue}
                  aria-describedby={`${id}-help`}
                  onChange={(event) => set(dial.name, `${event.target.value}${dial.unit}`)}
                  className="accent-primary w-full disabled:opacity-40"
                />
                <p id={`${id}-help`} className="text-muted-foreground text-xs">
                  {dial.help}
                </p>
                {dial.name === "accent-hue" && (
                  <label className="flex items-center gap-2 text-xs">
                    <Switch
                      checked={followsHue}
                      onCheckedChange={(checked) =>
                        set("accent-hue", checked ? FOLLOW_HUE : values.hue)
                      }
                    />
                    Follow the surface hue
                  </label>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-auto flex flex-col gap-2 border-t pt-5">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => setValues(randomDials())}>
              <ShuffleIcon aria-hidden /> Surprise me
            </Button>
            <Button variant="outline" size="sm" onClick={() => setValues(initial)}>
              <RotateCcwIcon aria-hidden /> Reset
            </Button>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={async () => {
              await navigator.clipboard.writeText(css);
              setSaved("copied");
            }}
          >
            {saved === "copied" ? <CheckIcon aria-hidden /> : <CopyIcon aria-hidden />}
            {saved === "copied" ? "Copied" : "Copy dials"}
          </Button>
          {canSave && (
            <Button
              size="sm"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await saveDials(values);
                  setSaved(result.ok ? "saved" : result.error);
                })
              }
            >
              {saved === "saved" ? <CheckIcon aria-hidden /> : <SaveIcon aria-hidden />}
              {saved === "saved" ? "Saved to theme.css" : "Save to theme.css"}
            </Button>
          )}
          <p role="status" className="text-muted-foreground min-h-4 text-xs">
            {saved !== "idle" && saved !== "saved" && saved !== "copied" ? saved : ""}
          </p>
        </div>
      </aside>

      <div className="min-w-0">
        <ContrastReport watch={values} />
        <Preview />
      </div>
    </div>
  );
}
