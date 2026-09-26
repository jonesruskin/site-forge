import type { StaticImageData } from "next/image";
import type { ReactNode } from "react";

/** A link rendered as a button. */
export type SectionAction = {
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
  /** Opens in a new tab with safe rel attributes. Detected automatically for absolute URLs. */
  external?: boolean;
  icon?: ReactNode;
};

/** An image rendered with next/image. Remote hosts must be allowed in next.config. */
export type SectionImage = {
  src: string | StaticImageData;
  alt: string;
  width?: number;
  height?: number;
  /** Load eagerly (above-the-fold images). */
  priority?: boolean;
};

export type SectionTone = "default" | "muted" | "inverted";
export type SectionSpacing = "none" | "sm" | "md" | "lg";
