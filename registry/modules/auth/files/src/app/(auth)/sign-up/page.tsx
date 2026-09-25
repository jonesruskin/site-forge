import Link from "next/link";
import { redirect } from "next/navigation";

import { SignUpForm } from "@/components/auth/sign-up-form";
import { hasSocialProviders, SocialButtons } from "@/components/auth/social-buttons";
import { AuthCard } from "@/components/sections/auth-card";
import { Separator } from "@/components/ui/separator";
import { safeNext } from "@/lib/auth/redirect";
import { getSession } from "@/lib/auth/session";
import { createMetadata } from "@/lib/metadata";
import siteConfig from "@/site.config";

export const metadata = createMetadata({ title: "Create an account", path: "/sign-up" });

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeNext((await searchParams).next);
  if (await getSession()) redirect(next);

  return (
    <AuthCard
      logo={siteConfig.name}
      title="Create your account"
      description={siteConfig.description}
      footer={
        <>
          Already have an account?{" "}
          <Link href="/sign-in" className="text-foreground underline underline-offset-4">
            Sign in
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
      <SignUpForm next={next} />
    </AuthCard>
  );
}
