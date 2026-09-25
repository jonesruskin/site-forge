import { MailIcon } from "lucide-react";
import Link from "next/link";

import { AuthCard } from "@/components/sections/auth-card";
import { createMetadata } from "@/lib/metadata";
import siteConfig from "@/site.config";

export const metadata = createMetadata({
  title: "Check your inbox",
  path: "/verify-email",
  noIndex: true,
});

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return (
    <AuthCard
      logo={siteConfig.name}
      title="Check your inbox"
      description={`We sent a verification link to ${email ?? "your email address"}. Click it to activate your account.`}
      footer={
        <Link href="/sign-in" className="text-foreground underline underline-offset-4">
          Back to sign in
        </Link>
      }
    >
      <div className="bg-muted text-muted-foreground flex items-center gap-3 rounded-lg border p-4 text-sm">
        <MailIcon aria-hidden className="size-5 shrink-0" />
        Didn&apos;t get it? Check spam, or sign in again to receive a fresh link.
      </div>
    </AuthCard>
  );
}
