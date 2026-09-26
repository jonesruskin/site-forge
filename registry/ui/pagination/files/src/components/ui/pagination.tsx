import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PaginationProps = {
  page: number;
  pageCount: number;
  /** Builds the URL for a page, e.g. (p) => `/blog?page=${p}`. */
  href: (page: number) => string;
  labels?: {
    previous?: string;
    next?: string;
    navigation?: string;
    page?: (page: number) => string;
  };
  className?: string;
};

/** Pages to show: first, last, current ±1, with gaps as null. */
function pageWindow(page: number, pageCount: number): (number | null)[] {
  const pages = new Set(
    [1, pageCount, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pageCount),
  );
  const sorted = [...pages].sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1]! > 1 ? [null, p] : [p]));
}

export function Pagination({ page, pageCount, href, labels = {}, className }: PaginationProps) {
  if (pageCount <= 1) return null;
  const pageLabel = labels.page ?? ((p: number) => `Page ${p}`);
  const edge = cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1");

  return (
    <nav
      aria-label={labels.navigation ?? "Pagination"}
      className={cn("flex items-center justify-center gap-1", className)}
    >
      {page > 1 ? (
        <Link href={href(page - 1)} rel="prev" className={edge}>
          <ChevronLeftIcon aria-hidden />
          {labels.previous ?? "Previous"}
        </Link>
      ) : (
        <span aria-disabled className={cn(edge, "pointer-events-none opacity-40")}>
          <ChevronLeftIcon aria-hidden />
          {labels.previous ?? "Previous"}
        </span>
      )}
      <ul className="hidden items-center gap-1 sm:flex">
        {pageWindow(page, pageCount).map((p, i) =>
          p === null ? (
            <li key={`gap-${i}`} aria-hidden className="text-muted-foreground px-2">
              …
            </li>
          ) : (
            <li key={p}>
              <Link
                href={href(p)}
                aria-label={pageLabel(p)}
                aria-current={p === page ? "page" : undefined}
                className={buttonVariants({
                  variant: p === page ? "outline" : "ghost",
                  size: "icon-sm",
                })}
              >
                {p}
              </Link>
            </li>
          ),
        )}
      </ul>
      {page < pageCount ? (
        <Link href={href(page + 1)} rel="next" className={edge}>
          {labels.next ?? "Next"}
          <ChevronRightIcon aria-hidden />
        </Link>
      ) : (
        <span aria-disabled className={cn(edge, "pointer-events-none opacity-40")}>
          {labels.next ?? "Next"}
          <ChevronRightIcon aria-hidden />
        </span>
      )}
    </nav>
  );
}
