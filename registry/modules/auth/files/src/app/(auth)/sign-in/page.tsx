import Link from "next/link";
import { redirect } from "next/navigation";

import { SignInForm } from "@/components/auth/sign-in-form";
import { hasSocialProviders, SocialButtons } from "@/components/auth/social-buttons";
import { AuthCard } from "@/components/sections/auth-card";
import { Separator } from "@/components/ui/separator";
import { authConfig } from "@/lib/auth/config";
import { safeNext } from "@/lib/auth/redirect";
import { getSession } from "@/lib/auth/session";
import { createMetadata } from "@/lib/metadata";
import siteConfig from "@/site.config";

export const metadata = createMetadata({ title: "Sign in", path: "/sign-in", noIndex: true });

type Props = { searchParams: Promise<{ next?: string; reset?: string }> };

export default async function SignInPage({ searchParams }: Props) {
  const { next: rawNext, reset } = await searchParams;
  const next = safeNext(rawNext);
  if (await getSession()) redirect(next);

  return (
    <AuthCard
      logo={siteConfig.name}
      title="Sign in"
      description={
        reset
          ? "Your password was changed. Sign in with the new one."
          : `Welcome back to ${siteConfig.name}.`
      }
      footer={
        <>
          No account yet?{" "}
          <Link
            href={`/sign-up${rawNext ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="text-foreground underline underline-offset-4"
          >
            Create one
          </Link>
        </>
      }
    >
      <SocialButtons next={next} />
      {hasSocialProviders() && (
        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-muted-foreground text-xs">or</span>
          <Separator className="flex-1" />
        </div>
      )}
      <SignInForm next={next} magicLink={authConfig.magicLink} />
    </AuthCard>
  );
}
