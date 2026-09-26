import type { ReactNode } from "react";

import { Section } from "@/components/sections/kit/section";
import { SectionActions } from "@/components/sections/kit/section-actions";
import { SectionMedia } from "@/components/sections/kit/section-media";
import type { SectionAction, SectionImage, SectionTone } from "@/components/sections/kit/types";
import { cn } from "@/lib/utils";

export type HeroSplitProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: SectionAction[];
  note?: ReactNode;
  image?: SectionImage;
  /** Anything other than an image: video, code sample, product demo. */
  media?: ReactNode;
  /** Which side the media sits on from `lg` up. */
  mediaSide?: "start" | "end";
  tone?: SectionTone;
  className?: string;
};

export function HeroSplit({
  eyebrow,
  title,
  description,
  actions,
  note,
  image,
  media,
  mediaSide = "end",
  tone,
  className,
}: HeroSplitProps) {
  return (
    <Section tone={tone} spacing="lg" className={className} aria-labelledby="hero-title">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className={cn("flex flex-col gap-6", mediaSide === "start" && "lg:order-2")}>
          {eyebrow && <p className="text-eyebrow text-muted-foreground">{eyebrow}</p>}
          <h1 id="hero-title" className="text-display">
            {title}
          </h1>
          {description && <p className="text-lead text-muted-foreground max-w-xl">{description}</p>}
          <SectionActions actions={actions} className="mt-2" />
          {note && <p className="text-muted-foreground text-sm">{note}</p>}
        </div>
        {(image || media) && (
          <div className={cn(mediaSide === "start" && "lg:order-1")}>
            {media ??
              (image && (
                <SectionMedia
                  image={{ ...image, priority: image.priority ?? true }}
                  aspect="4/3"
                  className="shadow-md"
                />
              ))}
          </div>
        )}
      </div>
    </Section>
  );
}
