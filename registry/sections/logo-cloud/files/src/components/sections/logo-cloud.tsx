import Image from "next/image";
import type { ReactNode } from "react";

import { Section } from "@/components/sections/kit/section";
import type { SectionImage, SectionTone } from "@/components/sections/kit/types";
import { cn } from "@/lib/utils";

export type Logo = SectionImage & { href?: string };

export type LogoCloudProps = {
  /** e.g. "Trusted by teams at" */
  title?: ReactNode;
  logos: Logo[];
  /** Render logos in one color (currentColor-like) for a calmer row. */
  monochrome?: boolean;
  tone?: SectionTone;
  className?: string;
};

export function LogoCloud({ title, logos, monochrome = true, tone, className }: LogoCloudProps) {
  return (
    <Section tone={tone} spacing="sm" className={className}>
      {title && <p className="text-muted-foreground mb-8 text-center text-sm">{title}</p>}
      <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
        {logos.map((logo) => {
          const img = (
            <Image
              src={logo.src}
              alt={logo.alt}
              width={logo.width ?? 120}
              height={logo.height ?? 40}
              className={cn(
                "h-7 w-auto object-contain sm:h-8",
                monochrome &&
                  "opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0 dark:invert",
              )}
            />
          );
          return (
            <li key={logo.alt}>
              {logo.href ? (
                <a href={logo.href} target="_blank" rel="noopener noreferrer" className="block">
                  {img}
                </a>
              ) : (
                img
              )}
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
