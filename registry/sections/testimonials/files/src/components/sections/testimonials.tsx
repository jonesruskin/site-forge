import Image from "next/image";
import type { ReactNode } from "react";

import { Section } from "@/components/sections/kit/section";
import { SectionHeader } from "@/components/sections/kit/section-header";
import type { SectionImage, SectionTone } from "@/components/sections/kit/types";
import { cn } from "@/lib/utils";

export type Testimonial = {
  quote: ReactNode;
  name: string;
  role?: string;
  avatar?: SectionImage;
  href?: string;
};

export type TestimonialsProps = {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  /** A large quote shown above the grid. */
  featured?: Testimonial;
  testimonials: Testimonial[];
  tone?: SectionTone;
  className?: string;
};

function Person({ testimonial }: { testimonial: Testimonial }) {
  const initials = testimonial.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
  const name = testimonial.href ? (
    <a
      href={testimonial.href}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:underline"
    >
      {testimonial.name}
    </a>
  ) : (
    testimonial.name
  );
  return (
    <figcaption className="flex items-center gap-3">
      {testimonial.avatar ? (
        <Image
          src={testimonial.avatar.src}
          alt={testimonial.avatar.alt}
          width={40}
          height={40}
          className="size-10 rounded-full object-cover"
        />
      ) : (
        <span
          aria-hidden
          className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-full text-sm font-medium"
        >
          {initials}
        </span>
      )}
      <span className="flex flex-col text-sm">
        <span className="font-medium">{name}</span>
        {testimonial.role && <span className="text-muted-foreground">{testimonial.role}</span>}
      </span>
    </figcaption>
  );
}

export function Testimonials({
  eyebrow,
  title,
  description,
  featured,
  testimonials,
  tone,
  className,
}: TestimonialsProps) {
  return (
    <Section tone={tone} className={className}>
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        align="center"
        className="mb-12 sm:mb-16"
      />
      {featured && (
        <figure className="mx-auto mb-16 flex max-w-3xl flex-col items-center gap-8 text-center">
          <blockquote className="font-display text-2xl leading-snug font-medium tracking-tight text-balance sm:text-3xl">
            “{featured.quote}”
          </blockquote>
          <Person testimonial={featured} />
        </figure>
      )}
      <div className={cn("gap-4 sm:columns-2 lg:columns-3")}>
        {testimonials.map((testimonial, index) => (
          <figure
            key={index}
            className="bg-card mb-4 flex break-inside-avoid flex-col gap-6 rounded-xl border p-6"
          >
            <blockquote className="text-sm leading-relaxed">“{testimonial.quote}”</blockquote>
            <Person testimonial={testimonial} />
          </figure>
        ))}
      </div>
    </Section>
  );
}
