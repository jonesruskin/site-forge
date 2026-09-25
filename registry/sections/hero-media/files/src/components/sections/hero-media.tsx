import Image from "next/image";
import type { ReactNode } from "react";

import { SectionActions } from "@/components/sections/kit/section-actions";
import type { SectionAction, SectionImage } from "@/components/sections/kit/types";
import { cn } from "@/lib/utils";

export type HeroMediaProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: SectionAction[];
  /** Background image. For video pass `video` (muted, looping, decorative). */
  image?: SectionImage;
  video?: { src: string; poster?: string; type?: string };
  /** Vertical placement of the copy. */
  align?: "center" | "end";
  /** 0–1 strength of the background scrim that keeps text readable. */
  scrim?: number;
  className?: string;
};

/**
 * Copy over full-bleed media. The section is always inverted, and the scrim
 * uses the inverted background token, so text contrast holds in every theme.
 */
export function HeroMedia({
  eyebrow,
  title,
  description,
  actions,
  image,
  video,
  align = "end",
  scrim = 0.55,
  className,
}: HeroMediaProps) {
  return (
    <section
      aria-labelledby="hero-title"
      className={cn(
        "tone-inverted bg-background text-foreground relative isolate flex min-h-[80dvh] overflow-hidden",
        align === "center" ? "items-center" : "items-end",
        className,
      )}
    >
      {video ? (
        <video
          className="absolute inset-0 -z-20 size-full object-cover motion-reduce:hidden"
          autoPlay
          muted
          loop
          playsInline
          poster={video.poster}
          aria-hidden
        >
          <source src={video.src} type={video.type ?? "video/mp4"} />
        </video>
      ) : null}
      {image && (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover"
        />
      )}
      <div
        aria-hidden
        className="from-background via-background/60 absolute inset-0 -z-10 bg-linear-to-t to-transparent"
        style={{ opacity: scrim + 0.3 }}
      />
      <div
        className={cn(
          "container-page flex flex-col gap-6 py-20 sm:py-28",
          align === "center" && "items-center text-center",
        )}
      >
        {eyebrow && <p className="text-eyebrow text-muted-foreground">{eyebrow}</p>}
        <h1 id="hero-title" className="text-display max-w-4xl">
          {title}
        </h1>
        {description && <p className="text-lead text-muted-foreground max-w-2xl">{description}</p>}
        <SectionActions
          actions={actions}
          align={align === "center" ? "center" : "start"}
          className="mt-2"
        />
      </div>
    </section>
  );
}
