import {
  EmailButton,
  EmailHeading,
  EmailLayout,
  EmailText,
} from "@/emails/components/email-layout";
import siteConfig from "@/site.config";

export function WelcomeEmail({ name, dashboardUrl }: { name: string; dashboardUrl: string }) {
  return (
    <EmailLayout preview={`Welcome to ${siteConfig.name}`}>
      <EmailHeading>Welcome, {name}</EmailHeading>
      <EmailText>Your account is ready. Here&apos;s where to start:</EmailText>
      <EmailButton href={dashboardUrl}>Open your dashboard</EmailButton>
      <EmailText muted>Questions? Just reply to this email.</EmailText>
    </EmailLayout>
  );
}

WelcomeEmail.PreviewProps = { name: "Ada", dashboardUrl: "https://example.com/dashboard" };
