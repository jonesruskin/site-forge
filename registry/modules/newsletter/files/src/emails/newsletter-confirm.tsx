import {
  EmailButton,
  EmailHeading,
  EmailLayout,
  EmailText,
} from "@/emails/components/email-layout";
import siteConfig from "@/site.config";

export function NewsletterConfirmEmail({ confirmUrl }: { confirmUrl: string }) {
  return (
    <EmailLayout
      preview={`Confirm your subscription to ${siteConfig.name}`}
      footer="If you didn't sign up, ignore this email and you won't be subscribed."
    >
      <EmailHeading>Confirm your subscription</EmailHeading>
      <EmailText>
        Tap the button below to start receiving updates from {siteConfig.name}. The link expires in
        48 hours.
      </EmailText>
      <EmailButton href={confirmUrl}>Confirm subscription</EmailButton>
    </EmailLayout>
  );
}

NewsletterConfirmEmail.PreviewProps = {
  confirmUrl: "https://example.com/newsletter/confirm?token=preview",
};
