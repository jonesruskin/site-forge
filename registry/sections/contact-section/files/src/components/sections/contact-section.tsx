import type { ReactNode } from "react";

import { Section } from "@/components/sections/kit/section";
import { SectionHeader } from "@/components/sections/kit/section-header";
import type { SectionTone } from "@/components/sections/kit/types";
import { cn } from "@/lib/utils";

export type ContactDetail = {
  label: string;
  value: string;
  href?: string;
  icon?: ReactNode;
};

export type ContactSectionProps = {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  details?: ContactDetail[];
  /** The form, e.g. <ContactForm /> from the contact module. */
  form: ReactNode;
  tone?: SectionTone;
  className?: string;
};

export function ContactSection({
  eyebrow,
  title,
  description,
  details = [],
  form,
  tone,
  className,
}: ContactSectionProps) {
  return (
    <Section tone={tone} className={className}>
      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <div className="flex flex-col gap-10">
          <SectionHeader eyebrow={eyebrow} title={title} description={description} />
          {details.length > 0 && (
            <dl className="grid gap-6">
              {details.map((detail) => (
                <div key={detail.label} className={cn("relative", detail.icon && "min-h-10 pl-14")}>
                  <dt className="text-muted-foreground text-sm">
                    {detail.icon && (
                      <span
                        aria-hidden
                        className="bg-muted absolute top-0 left-0 flex size-10 items-center justify-center rounded-lg border [&_svg]:size-4"
                      >
                        {detail.icon}
                      </span>
                    )}
                    {detail.label}
                  </dt>
                  <dd className="font-medium">
                    {detail.href ? (
                      <a href={detail.href} className="underline-offset-4 hover:underline">
                        {detail.value}
                      </a>
                    ) : (
                      detail.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        <div className="bg-card rounded-2xl border p-6 sm:p-8">{form}</div>
      </div>
    </Section>
  );
}
