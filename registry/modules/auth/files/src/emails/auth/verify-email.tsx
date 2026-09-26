import {
  EmailButton,
  EmailHeading,
  EmailLayout,
  EmailText,
} from "@/emails/components/email-layout";
import siteConfig from "@/site.config";

export function VerifyEmail({ url, name }: { url: string; name?: string }) {
  return (
    <EmailLayout
      preview={`Confirm your email for ${siteConfig.name}`}
      footer="If you didn't create an account, you can ignore this email."
    >
      <EmailHeading>{name ? `Welcome, ${name}` : "Welcome"}</EmailHeading>
      <EmailText>
        Confirm your email address to finish setting up your {siteConfig.name} account.
      </EmailText>
      <EmailButton href={url}>Verify email</EmailButton>
      <EmailText muted>The link expires in 1 hour.</EmailText>
    </EmailLayout>
  );
}

VerifyEmail.PreviewProps = {
  url: "https://example.com/api/auth/verify-email?token=preview",
  name: "Ada",
};
