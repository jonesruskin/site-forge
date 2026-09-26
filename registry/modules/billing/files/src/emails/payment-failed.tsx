import {
  EmailButton,
  EmailHeading,
  EmailLayout,
  EmailText,
} from "@/emails/components/email-layout";
import siteConfig from "@/site.config";

export function PaymentFailedEmail({ portalUrl }: { portalUrl: string }) {
  return (
    <EmailLayout preview={`Your ${siteConfig.name} payment didn't go through`}>
      <EmailHeading>Your payment didn&apos;t go through</EmailHeading>
      <EmailText>
        We couldn&apos;t charge your card for your {siteConfig.name} subscription. We&apos;ll retry
        automatically, but updating your payment method now avoids any interruption.
      </EmailText>
      <EmailButton href={portalUrl}>Update payment method</EmailButton>
    </EmailLayout>
  );
}

PaymentFailedEmail.PreviewProps = { portalUrl: "https://example.com/billing/portal" };
