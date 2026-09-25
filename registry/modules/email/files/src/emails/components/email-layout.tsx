import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

import siteConfig from "@/site.config";

import { emailTheme as t } from "../theme";

type EmailLayoutProps = {
  /** Inbox preview line shown next to the subject. */
  preview: string;
  children: ReactNode;
  /** Small print under the content (why they got this email, unsubscribe …). */
  footer?: ReactNode;
};

/** Shared frame for every email: site name, content card, footer. */
export function EmailLayout({ preview, children, footer }: EmailLayoutProps) {
  return (
    <Html lang={siteConfig.locale}>
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{ backgroundColor: t.page, fontFamily: t.fontFamily, margin: 0, padding: "32px 0" }}
      >
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "0 16px" }}>
          <Text
            style={{ fontSize: "15px", fontWeight: 600, color: t.foreground, margin: "0 0 16px" }}
          >
            <Link href={siteConfig.url} style={{ color: t.foreground, textDecoration: "none" }}>
              {siteConfig.name}
            </Link>
          </Text>
          <Section
            style={{
              backgroundColor: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: t.radius,
              padding: "32px",
            }}
          >
            {children}
          </Section>
          <Text
            style={{ fontSize: "12px", lineHeight: "18px", color: t.muted, margin: "16px 0 0" }}
          >
            {footer ?? (
              <>
                Sent by {siteConfig.name} ·{" "}
                <Link href={siteConfig.url} style={{ color: t.muted }}>
                  {siteConfig.url.replace(/^https?:\/\//, "")}
                </Link>
              </>
            )}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function EmailHeading({ children }: { children: ReactNode }) {
  return (
    <Heading
      as="h1"
      style={{
        fontSize: "22px",
        lineHeight: "28px",
        fontWeight: 600,
        color: t.foreground,
        margin: "0 0 16px",
      }}
    >
      {children}
    </Heading>
  );
}

export function EmailText({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  return (
    <Text
      style={{
        fontSize: "15px",
        lineHeight: "24px",
        color: muted ? t.muted : t.foreground,
        margin: "0 0 16px",
      }}
    >
      {children}
    </Text>
  );
}

export function EmailButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Button
      href={href}
      style={{
        backgroundColor: t.primary,
        color: t.primaryForeground,
        borderRadius: t.radius,
        fontSize: "14px",
        fontWeight: 600,
        padding: "12px 20px",
        textDecoration: "none",
        display: "inline-block",
        margin: "8px 0 16px",
      }}
    >
      {children}
    </Button>
  );
}

export function EmailCode({ children }: { children: ReactNode }) {
  return (
    <Text
      style={{
        fontFamily: t.monoFamily,
        fontSize: "24px",
        letterSpacing: "6px",
        fontWeight: 600,
        color: t.foreground,
        backgroundColor: t.page,
        borderRadius: t.radius,
        padding: "12px 16px",
        margin: "8px 0 16px",
        textAlign: "center",
      }}
    >
      {children}
    </Text>
  );
}

export function EmailDivider() {
  return <Hr style={{ borderColor: t.border, margin: "24px 0" }} />;
}
