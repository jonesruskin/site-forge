import { ArrowRightIcon, CheckIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getSession } from "@/lib/auth/session";
import { dismissChecklistAction } from "@/lib/onboarding/actions";
import { getChecklist, getOnboarding, isNewAccount } from "@/lib/onboarding/state";
import { cn } from "@/lib/utils";

/**
 * Dashboard card listing setup tasks. Also sends brand-new accounts to the
 * questionnaire once (site.config.ts → onboarding.redirectNewUsers).
 */
export async function OnboardingChecklist({ userId }: { userId: string }) {
  const state = await getOnboarding(userId);

  if (!state) {
    const session = await getSession();
    if (session && isNewAccount(session.user.createdAt)) redirect("/onboarding");
  }
  if (state?.checklistDismissedAt) return null;

  const items = await getChecklist(userId);
  const done = items.filter((item) => item.done).length;
  if (items.length === 0 || done === items.length) return null;

  return (
    <Card className="md:col-span-2 xl:col-span-3">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
        <div className="grid gap-1.5">
          <CardTitle>Finish setting up</CardTitle>
          <CardDescription>
            {done} of {items.length} done
          </CardDescription>
        </div>
        <form action={dismissChecklistAction}>
          <Button type="submit" variant="ghost" size="sm">
            Hide
          </Button>
        </form>
      </CardHeader>
      <CardContent className="grid gap-5">
        <Progress value={done} max={items.length} label="Setup progress" className="h-1.5" />
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                aria-disabled={item.done || undefined}
                className={cn(
                  "group hover:bg-accent flex h-full items-start gap-3 rounded-lg border p-3 transition-colors",
                  item.done && "bg-muted/50 pointer-events-none",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                    item.done
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-input",
                  )}
                >
                  {item.done && <CheckIcon className="size-3" />}
                </span>
                <span className="grid min-w-0 flex-1 gap-0.5">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      item.done && "text-muted-foreground line-through",
                    )}
                  >
                    {item.title}
                    <span className="sr-only">{item.done ? " (done)" : ""}</span>
                  </span>
                  {item.description && (
                    <span className="text-muted-foreground text-xs">{item.description}</span>
                  )}
                </span>
                {!item.done && (
                  <ArrowRightIcon
                    aria-hidden
                    className="text-muted-foreground mt-0.5 size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                  />
                )}
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
