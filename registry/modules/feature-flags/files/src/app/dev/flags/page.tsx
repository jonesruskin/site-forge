import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { explainFlag, readPersonalOverrides, type FlagName } from "@/lib/flags";
import { clearOverridesAction, setOverrideAction } from "@/lib/flags/actions";
import { devToolsEnabled, flagDefinitions } from "@/lib/flags/config";
import type { FlagReason } from "@/lib/flags/evaluate";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Feature flags", robots: { index: false } };

const REASONS: Record<FlagReason, string> = {
  override: "your override",
  environment: "FLAG_OVERRIDES",
  "allow-list": "allow list",
  rollout: "rollout bucket",
  default: "default",
};

/** Every declared flag, its value for this browser and why, with per-browser overrides. */
export default async function FlagsPage() {
  if (!devToolsEnabled) notFound();
  const overrides = await readPersonalOverrides();
  const flags = await Promise.all(
    Object.entries(flagDefinitions).map(async ([name, definition]) => ({
      name,
      definition,
      result: await explainFlag(name as FlagName),
      override: overrides[name],
    })),
  );

  return (
    <main id="main" className="container-page py-12">
      <p className="text-eyebrow text-muted-foreground">Development</p>
      <h1 className="text-heading mt-2">Feature flags</h1>
      <p className="text-muted-foreground mt-2 max-w-prose text-sm">
        Values for this browser as an anonymous visitor. Overrides are stored in a cookie and only
        affect you. Declare flags in <code className="font-mono">site.config.ts → flags</code>.
      </p>

      {flags.length === 0 ? (
        <p className="text-muted-foreground mt-10 rounded-lg border border-dashed p-8 text-center text-sm">
          No flags declared yet.
        </p>
      ) : (
        <ul className="mt-8 divide-y rounded-lg border">
          {flags.map(({ name, definition, result, override }) => {
            const current = override === undefined ? "default" : override ? "on" : "off";
            return (
              <li key={name} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <div className="grid min-w-0 flex-1 gap-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <code className="font-mono text-sm font-medium">{name}</code>
                    <Badge variant={result.enabled ? "success" : "secondary"}>
                      {result.enabled ? "On" : "Off"}
                    </Badge>
                    <span className="text-muted-foreground text-xs">
                      via {REASONS[result.reason]}
                    </span>
                  </p>
                  {definition.description && (
                    <p className="text-muted-foreground text-sm">{definition.description}</p>
                  )}
                  <p className="text-muted-foreground text-xs">
                    default {definition.default ? "on" : "off"} · rollout {definition.rollout}%
                    {definition.allow.length > 0 && ` · allow ${definition.allow.join(", ")}`}
                  </p>
                </div>
                <form
                  action={setOverrideAction}
                  className="flex"
                  role="group"
                  aria-label={`Override ${name}`}
                >
                  <input type="hidden" name="flag" value={name} />
                  {(["default", "on", "off"] as const).map((value, index) => (
                    <Button
                      key={value}
                      type="submit"
                      name="value"
                      value={value}
                      size="sm"
                      variant={current === value ? "primary" : "outline"}
                      aria-pressed={current === value}
                      className={cn(
                        "capitalize",
                        index === 0 && "rounded-r-none",
                        index === 1 && "-ml-px rounded-none",
                        index === 2 && "-ml-px rounded-l-none",
                      )}
                    >
                      {value === "default" ? "Auto" : value}
                    </Button>
                  ))}
                </form>
              </li>
            );
          })}
        </ul>
      )}
      {Object.keys(overrides).length > 0 && (
        <form action={clearOverridesAction} className="mt-6">
          <Button type="submit" variant="outline" size="sm">
            Clear all overrides
          </Button>
        </form>
      )}
    </main>
  );
}
