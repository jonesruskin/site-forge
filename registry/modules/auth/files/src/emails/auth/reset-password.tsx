import {
  EmailButton,
  EmailHeading,
  EmailLayout,
  EmailText,
} from "@/emails/components/email-layout";

export function ResetPasswordEmail({ url, name }: { url: string; name?: string }) {
  return (
    <EmailLayout
      preview="Reset your password"
      footer="If you didn't ask for this, you can ignore this email. Your password won't change."
    >
      <EmailHeading>Reset your password</EmailHeading>
      <EmailText>
        {name ? `Hi ${name}, ` : ""}we received a request to reset your password.
      </EmailText>
      <EmailButton href={url}>Choose a new password</EmailButton>
      <EmailText muted>The link expires in 1 hour and signs you out of other devices.</EmailText>
    </EmailLayout>
  );
}

ResetPasswordEmail.PreviewProps = {
  url: "https://example.com/reset-password?token=preview",
  name: "Ada",
};
