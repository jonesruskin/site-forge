import Image from "next/image";

import { cn } from "@/lib/utils";

import type { SectionImage } from "./types";

type SectionMediaProps = {
  image: SectionImage;
  /** CSS aspect ratio of the frame, e.g. "16/10". The image covers it. */
  aspect?: string;
  /** next/image sizes hint for responsive loading. */
  sizes?: string;
  className?: string;
  imageClassName?: string;
};

/** A framed, responsive image that always fills its aspect box without layout shift. */
export function SectionMedia({
  image,
  aspect = "16/10",
  sizes = "(min-width: 1024px) 50vw, 100vw",
  className,
  imageClassName,
}: SectionMediaProps) {
  return (
    <div
      className={cn("bg-muted relative overflow-hidden rounded-xl border", className)}
      style={{ aspectRatio: aspect }}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        priority={image.priority}
        className={cn("object-cover", imageClassName)}
      />
    </div>
  );
}
