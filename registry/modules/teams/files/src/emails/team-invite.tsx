import { EmailButton, EmailHeading, EmailLayout, EmailText } from "@/emails/components/email-layout";
import siteConfig from "@/site.config";

type TeamInviteEmailProps = { teamName: string; inviterName: string; role: string; url: string };

export function TeamInviteEmail({ teamName, inviterName, role, url }: TeamInviteEmailProps) {
  return (
    <EmailLayout
      preview={`${inviterName} invited you to ${teamName} on ${siteConfig.name}`}
      footer="If you weren't expecting this invitation, you can ignore this email."
    >
      <EmailHeading>Join {teamName}</EmailHeading>
      <EmailText>
        {inviterName} invited you to join {teamName} on {siteConfig.name} as {role === "admin" ? "an admin" : `a ${role}`}.
      </EmailText>
      <EmailButton href={url}>Accept invitation</EmailButton>
    </EmailLayout>
  );
}

TeamInviteEmail.PreviewProps = { teamName: "Acme", inviterName: "Ada Lovelace", role: "member", url: "https://example.com/invite/preview" };
