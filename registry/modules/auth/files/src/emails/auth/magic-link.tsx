import {
  EmailButton,
  EmailHeading,
  EmailLayout,
  EmailText,
} from "@/emails/components/email-layout";
import siteConfig from "@/site.config";

export function MagicLinkEmail({ url }: { url: string }) {
  return (
    <EmailLayout
      preview={`Sign in to ${siteConfig.name}`}
      footer="If you didn't try to sign in, you can ignore this email."
    >
      <EmailHeading>Sign in to {siteConfig.name}</EmailHeading>
      <EmailText>
        Use the button below to sign in. The link works once and expires in 5 minutes.
      </EmailText>
      <EmailButton href={url}>Sign in</EmailButton>
    </EmailLayout>
  );
}

MagicLinkEmail.PreviewProps = {
  url: "https://example.com/api/auth/magic-link/verify?token=preview",
};
