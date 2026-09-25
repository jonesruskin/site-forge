import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { SkipLink } from "@/components/site/skip-link";
import { ThemeProvider } from "@/components/site/theme-provider";
import { bodyEnd } from "@/generated/body-end";
import { providers } from "@/generated/providers";
import { fontVariables } from "@/lib/fonts";
import { rootMetadata } from "@/lib/metadata";
import siteConfig from "@/site.config";

import "./globals.css";

export const metadata: Metadata = rootMetadata();

export const viewport: Viewport = {
  colorScheme: "light dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const tree = [ThemeProvider, ...providers].reduceRight<ReactNode>(
    (inner, Provider) => <Provider>{inner}</Provider>,
    children,
  );

  return (
    <html lang={siteConfig.locale} className={fontVariables} suppressHydrationWarning>
      <body>
        <SkipLink />
        {tree}
        {bodyEnd.map((Component, index) => (
          <Component key={index} />
        ))}
      </body>
    </html>
  );
}
