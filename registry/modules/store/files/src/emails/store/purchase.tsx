import {
  EmailButton,
  EmailHeading,
  EmailLayout,
  EmailText,
} from "@/emails/components/email-layout";
import siteConfig from "@/site.config";

type PurchaseEmailProps = {
  productName: string;
  downloadUrl: string;
  expiresInDays: number;
  free?: boolean;
};

export function PurchaseEmail({
  productName,
  downloadUrl,
  expiresInDays,
  free = false,
}: PurchaseEmailProps) {
  return (
    <EmailLayout preview={`Your download: ${productName}`}>
      <EmailHeading>{free ? `Here's ${productName}` : `Thanks for your purchase`}</EmailHeading>
      <EmailText>
        {free
          ? `Thanks for your interest in ${productName}. Your download is ready.`
          : `Your copy of ${productName} is ready to download. A receipt comes separately from our payment provider.`}
      </EmailText>
      <EmailButton href={downloadUrl}>Download {productName}</EmailButton>
      <EmailText muted>
        The link works for {expiresInDays} days. Save the file somewhere safe; if the link expires,
        reply to this email and {siteConfig.name} will send a new one.
      </EmailText>
    </EmailLayout>
  );
}

PurchaseEmail.PreviewProps = {
  productName: "The Field Guide",
  downloadUrl: "https://example.com/store/download/example",
  expiresInDays: 7,
} satisfies PurchaseEmailProps;
