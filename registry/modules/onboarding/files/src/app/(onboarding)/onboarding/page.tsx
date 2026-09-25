import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { OnboardingWizard } from "@/components/onboarding/wizard";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/auth/session";
import { skipOnboardingAction } from "@/lib/onboarding/actions";
import { onboardingConfig } from "@/lib/onboarding/config";
import { getOnboarding } from "@/lib/onboarding/state";
import siteConfig from "@/site.config";

export const metadata: Metadata = { title: "Welcome", robots: { index: false } };

export default async function OnboardingPage() {
  const { user } = await requireSession("/onboarding");
  if (onboardingConfig.questions.length === 0) redirect(onboardingConfig.afterOnboarding);
  const state = await getOnboarding(user.id);

  return (
    <div className="bg-background flex min-h-dvh flex-col">
      <header className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="font-display font-semibold tracking-tight">
          {siteConfig.name}
        </Link>
        <form action={skipOnboardingAction}>
          <Button type="submit" variant="ghost" size="sm">
            Skip for now
          </Button>
        </form>
      </header>
      <main id="main" className="flex flex-1 items-start justify-center px-4 pt-[8vh] pb-16">
        <div className="w-full max-w-xl">
          <p className="text-muted-foreground mb-8 text-sm">
            Welcome, {user.name.split(" ")[0] || user.name}. A few quick questions to set things up.
          </p>
          <OnboardingWizard questions={onboardingConfig.questions} initial={state?.answers} />
        </div>
      </main>
    </div>
  );
}
