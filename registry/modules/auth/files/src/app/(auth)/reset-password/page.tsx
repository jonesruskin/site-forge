import Link from "next/link";

import { ResetPasswordForm } from "@/components/auth/password-reset-forms";
import { AuthCard } from "@/components/sections/auth-card";
import { createMetadata } from "@/lib/metadata";
import siteConfig from "@/site.config";

export const metadata = createMetadata({
  title: "Choose a new password",
  path: "/reset-password",
  noIndex: true,
});

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;
  const valid = token && !error;
  return (
    <AuthCard
      logo={siteConfig.name}
      title={valid ? "Choose a new password" : "Link expired"}
      description={valid ? undefined : "This reset link is invalid or has expired."}
      footer={
        <Link
          href={valid ? "/sign-in" : "/forgot-password"}
          className="text-foreground underline underline-offset-4"
        >
          {valid ? "Back to sign in" : "Request a new link"}
        </Link>
      }
    >
      {valid ? <ResetPasswordForm token={token} /> : null}
    </AuthCard>
  );
}
