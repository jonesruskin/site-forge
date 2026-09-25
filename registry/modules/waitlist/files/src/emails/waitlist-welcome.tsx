import {
  EmailButton,
  EmailCode,
  EmailHeading,
  EmailLayout,
  EmailText,
} from "@/emails/components/email-layout";
import siteConfig from "@/site.config";

type WaitlistWelcomeEmailProps = { position: number; statusUrl: string; name?: string };

export function WaitlistWelcomeEmail({ position, statusUrl, name }: WaitlistWelcomeEmailProps) {
  return (
    <EmailLayout preview={`You're #${position} on the ${siteConfig.name} waitlist`}>
      <EmailHeading>{name ? `You're in, ${name}.` : "You're in."}</EmailHeading>
      <EmailText>Your place on the {siteConfig.name} waitlist:</EmailText>
      <EmailCode>#{position}</EmailCode>
      <EmailText>Share your personal link: every friend who joins moves you up the list.</EmailText>
      <EmailButton href={statusUrl}>See your position and link</EmailButton>
    </EmailLayout>
  );
}

WaitlistWelcomeEmail.PreviewProps = {
  position: 42,
  statusUrl: "https://example.com/waitlist/abc123",
  name: "Ada",
};
