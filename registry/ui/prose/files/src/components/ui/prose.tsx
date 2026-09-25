import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * Typography for rendered Markdown/MDX. Every value comes from theme tokens, so
 * articles follow the site's identity without a typography plugin.
 */
export function Prose({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="prose"
      className={cn(
        "text-foreground max-w-[68ch] text-base leading-7",
        "[&>*+*]:mt-5 [&_:is(h2,h3,h4)+*]:mt-3",
        "[&_h2]:font-display [&_h2]:mt-12 [&_h2]:scroll-mt-24 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight",
        "[&_h3]:font-display [&_h3]:mt-9 [&_h3]:scroll-mt-24 [&_h3]:text-xl [&_h3]:font-semibold",
        "[&_h4]:mt-7 [&_h4]:scroll-mt-24 [&_h4]:font-semibold",
        "[&_a]:text-foreground [&_a]:decoration-muted-foreground/50 hover:[&_a]:decoration-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:transition-colors",
        // Heading anchors (rehype-autolink-headings) read as headings, not links.
        "[&_:is(h2,h3,h4)>a]:no-underline hover:[&_:is(h2,h3,h4)>a]:underline",
        "[&_strong]:font-semibold",
        "[&_:is(ul,ol)]:pl-6 [&_li]:mt-2 [&_li]:pl-1 [&_ol]:list-decimal [&_ul]:list-disc [&_li::marker]:text-muted-foreground",
        "[&_blockquote]:text-muted-foreground [&_blockquote]:border-l-2 [&_blockquote]:pl-5 [&_blockquote]:italic",
        "[&_hr]:my-10 [&_hr]:border-t",
        "[&_:not(pre)>code]:bg-muted [&_:not(pre)>code]:rounded-sm [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[0.875em]",
        "[&_pre]:bg-muted [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-sm [&_pre]:leading-6",
        "[&_img]:rounded-lg [&_img]:border [&_figcaption]:text-muted-foreground [&_figcaption]:mt-2 [&_figcaption]:text-center [&_figcaption]:text-sm",
        "[&_table]:w-full [&_table]:text-sm [&_th]:border-b [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-medium [&_td]:border-b [&_td]:px-3 [&_td]:py-2",
        "[&_kbd]:bg-muted [&_kbd]:rounded-sm [&_kbd]:border [&_kbd]:px-1 [&_kbd]:font-mono [&_kbd]:text-xs",
        className,
      )}
      {...props}
    />
  );
}
