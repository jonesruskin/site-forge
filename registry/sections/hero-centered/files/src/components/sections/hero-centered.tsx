import Link from "next/link";
import type { ReactNode } from "react";

import { Section } from "@/components/sections/kit/section";
import { SectionActions } from "@/components/sections/kit/section-actions";
import { SectionMedia } from "@/components/sections/kit/section-media";
import type { SectionAction, SectionImage, SectionTone } from "@/components/sections/kit/types";

export type HeroCenteredProps = {
  /** Small pill above the title, e.g. "New: v2 is out". Links when `badgeHref` is set. */
  badge?: ReactNode;
  badgeHref?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: SectionAction[];
  /** Fine print under the actions, e.g. "No credit card required". */
  note?: ReactNode;
  /** Screenshot or illustration under the copy. Pass `media` for anything that isn't an image. */
  image?: SectionImage;
  media?: ReactNode;
  tone?: SectionTone;
  className?: string;
};

export function HeroCentered({
  badge,
  badgeHref,
  title,
  description,
  actions,
  note,
  image,
  media,
  tone,
  className,
}: HeroCenteredProps) {
  const pill = badge && (
    <span className="bg-background text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium shadow-xs">
      {badge}
    </span>
  );
  return (
    <Section tone={tone} spacing="lg" className={className} aria-labelledby="hero-title">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        {pill &&
          (badgeHref ? (
            <Link href={badgeHref} className="rounded-full transition-opacity hover:opacity-80">
              {pill}
            </Link>
          ) : (
            pill
          ))}
        <h1 id="hero-title" className="text-display">
          {title}
        </h1>
        {description && <p className="text-lead text-muted-foreground max-w-2xl">{description}</p>}
        <SectionActions actions={actions} align="center" className="mt-2" />
        {note && <p className="text-muted-foreground text-sm">{note}</p>}
      </div>
      {(image || media) && (
        <div className="mt-16 sm:mt-20">
          {media ??
            (image && (
              <SectionMedia
                image={{ ...image, priority: image.priority ?? true }}
                aspect="16/9"
                sizes="(min-width: 1280px) 1152px, 100vw"
                className="shadow-lg"
              />
            ))}
        </div>
      )}
    </Section>
  );
}
