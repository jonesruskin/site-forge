import Link from "next/link";
import type { ReactNode } from "react";

import { SectionMedia } from "@/components/sections/kit/section-media";
import type { SectionImage } from "@/components/sections/kit/types";
import { cn } from "@/lib/utils";

export type AuthCardProps = {
  logo?: ReactNode;
  logoHref?: string;
  title: ReactNode;
  description?: ReactNode;
  /** The form (sign-in, sign-up, reset …). */
  children: ReactNode;
  /** Under the card, e.g. "No account? Sign up". */
  footer?: ReactNode;
  /** Adds a media panel beside the card on large screens. */
  aside?: { image?: SectionImage; content?: ReactNode };
  className?: string;
};

/** Frame for authentication screens: centered card, or split-screen when `aside` is set. */
export function AuthCard({
  logo,
  logoHref = "/",
  title,
  description,
  children,
  footer,
  aside,
  className,
}: AuthCardProps) {
  const card = (
    <div className="flex w-full max-w-sm flex-col gap-8">
      {logo && (
        <Link href={logoHref} className="font-display w-fit text-lg font-semibold tracking-tight">
          {logo}
        </Link>
      )}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
      </div>
      {children}
      {footer && <div className="text-muted-foreground text-sm">{footer}</div>}
    </div>
  );

  if (!aside) {
    return (
      <main
        id="main"
        tabIndex={-1}
        className={cn(
          "flex min-h-dvh items-center justify-center px-4 py-16 outline-none",
          className,
        )}
      >
        {card}
      </main>
    );
  }

  return (
    <main
      id="main"
      tabIndex={-1}
      className={cn("grid min-h-dvh outline-none lg:grid-cols-2", className)}
    >
      <div className="flex items-center justify-center px-4 py-16">{card}</div>
      <aside className="tone-inverted bg-background text-foreground relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-end lg:p-12">
        {aside.image && (
          <SectionMedia
            image={aside.image}
            className="absolute inset-0 rounded-none border-0"
            aspect="auto"
            sizes="50vw"
          />
        )}
        {aside.content && <div className="relative">{aside.content}</div>}
      </aside>
    </main>
  );
}
