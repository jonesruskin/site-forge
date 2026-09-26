import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { SectionActions } from "@/components/sections/kit/section-actions";
import type { SectionAction } from "@/components/sections/kit/types";
import { cn } from "@/lib/utils";

export type Breadcrumb = { label: string; href?: string };

export type PageHeaderProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  breadcrumbs?: Breadcrumb[];
  actions?: SectionAction[];
  /** Extra content under the description: metadata, tags, author … */
  children?: ReactNode;
  align?: "start" | "center";
  bordered?: boolean;
  className?: string;
};

/** The h1 block for inner pages (blog index, docs, legal, settings …). */
export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
  actions,
  children,
  align = "start",
  bordered = false,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn("container-page pt-12 pb-10 sm:pt-16", bordered && "border-b", className)}
    >
      <div
        className={cn(
          "flex max-w-3xl flex-col gap-4",
          align === "center" && "mx-auto items-center text-center",
        )}
      >
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb">
            <ol className="text-muted-foreground flex flex-wrap items-center gap-1 text-sm">
              {breadcrumbs.map((crumb, index) => {
                const last = index === breadcrumbs.length - 1;
                return (
                  <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                    {crumb.href && !last ? (
                      <Link href={crumb.href} className="hover:text-foreground transition-colors">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span
                        aria-current={last ? "page" : undefined}
                        className={cn(last && "text-foreground")}
                      >
                        {crumb.label}
                      </span>
                    )}
                    {!last && <ChevronRightIcon aria-hidden className="size-3.5" />}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}
        {eyebrow && <p className="text-eyebrow text-muted-foreground">{eyebrow}</p>}
        <h1 className="text-display">{title}</h1>
        {description && <p className="text-lead text-muted-foreground">{description}</p>}
        {children}
        <SectionActions actions={actions} size="md" align={align} className="mt-2" />
      </div>
    </header>
  );
}
