import {
  EmailDivider,
  EmailHeading,
  EmailLayout,
  EmailText,
} from "@/emails/components/email-layout";

type ContactNotificationEmailProps = {
  name: string;
  email: string;
  message: string;
};

export function ContactNotificationEmail({ name, email, message }: ContactNotificationEmailProps) {
  return (
    <EmailLayout
      preview={`${name}: ${message.slice(0, 80)}`}
      footer="You received this because someone submitted the contact form on your site. Reply to answer them directly."
    >
      <EmailHeading>New message from {name}</EmailHeading>
      <EmailText muted>
        {name} · {email}
      </EmailText>
      <EmailDivider />
      {message.split(/\n{2,}/).map((paragraph, index) => (
        <EmailText key={index}>{paragraph}</EmailText>
      ))}
    </EmailLayout>
  );
}

ContactNotificationEmail.PreviewProps = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "Hello! I'd love to learn more about what you do.\n\nCould we set up a call next week?",
} satisfies ContactNotificationEmailProps;
