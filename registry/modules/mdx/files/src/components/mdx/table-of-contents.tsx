import type { Heading } from "@/lib/mdx/text";
import { cn } from "@/lib/utils";

type TableOfContentsProps = {
  headings: Heading[];
  title?: string;
  className?: string;
};

/** "On this page" list for long documents. Renders nothing with fewer than two headings. */
export function TableOfContents({
  headings,
  title = "On this page",
  className,
}: TableOfContentsProps) {
  if (headings.length < 2) return null;
  return (
    <nav aria-label={title} className={cn("text-sm", className)}>
      <p className="mb-3 font-medium">{title}</p>
      <ul className="flex flex-col gap-2">
        {headings.map((heading) => (
          <li key={heading.id} className={cn(heading.depth === 3 && "pl-3")}>
            <a
              href={`#${heading.id}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
