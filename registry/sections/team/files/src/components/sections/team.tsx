import Image from "next/image";
import type { ReactNode } from "react";

import { Section } from "@/components/sections/kit/section";
import { SectionHeader } from "@/components/sections/kit/section-header";
import type { SectionImage, SectionTone } from "@/components/sections/kit/types";
import { cn } from "@/lib/utils";

export type TeamMember = {
  name: string;
  role: string;
  bio?: string;
  photo?: SectionImage;
  links?: { label: string; href: string }[];
};

export type TeamProps = {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  members: TeamMember[];
  columns?: 3 | 4;
  tone?: SectionTone;
  className?: string;
};

export function Team({
  eyebrow,
  title,
  description,
  members,
  columns = 4,
  tone,
  className,
}: TeamProps) {
  return (
    <Section tone={tone} className={className}>
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="mb-12 sm:mb-16"
      />
      <ul
        className={cn(
          "grid gap-x-6 gap-y-12 sm:grid-cols-2",
          columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3",
        )}
      >
        {members.map((member) => (
          <li key={member.name} className="flex flex-col gap-4">
            <div className="bg-muted relative aspect-[4/5] overflow-hidden rounded-xl border">
              {member.photo ? (
                <Image
                  src={member.photo.src}
                  alt={member.photo.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <span
                  aria-hidden
                  className="text-muted-foreground absolute inset-0 flex items-center justify-center text-4xl font-medium"
                >
                  {member.name
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-semibold">{member.name}</h3>
              <p className="text-muted-foreground text-sm">{member.role}</p>
            </div>
            {member.bio && (
              <p className="text-muted-foreground text-sm leading-relaxed">{member.bio}</p>
            )}
            {member.links && member.links.length > 0 && (
              <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {member.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground text-muted-foreground underline-offset-4 hover:underline"
                    >
                      {link.label}
                      <span className="sr-only"> ({member.name})</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </Section>
  );
}
