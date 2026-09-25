import { MenuIcon } from "lucide-react";
import type { ReactNode } from "react";

import { DocsSearch } from "@/components/docs/docs-search";
import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { docsConfig } from "@/lib/docs/config";
import { docsNav } from "@/lib/docs/docs";

export default async function DocsLayout({ children }: { children: ReactNode }) {
  const groups = await docsNav();
  return (
    <div className="container-page lg:grid lg:grid-cols-[15rem_1fr] lg:gap-10">
      <aside className="hidden lg:block">
        <div className="sticky top-16 flex max-h-[calc(100dvh-4rem)] flex-col gap-6 overflow-y-auto py-10 pr-2">
          <DocsSearch />
          <DocsSidebar groups={groups} label={docsConfig.title} />
        </div>
      </aside>
      <div className="flex flex-col gap-3 border-b py-4 lg:hidden">
        <DocsSearch />
        <details className="group">
          <summary className="text-muted-foreground flex cursor-pointer list-none items-center gap-2 text-sm [&::-webkit-details-marker]:hidden">
            <MenuIcon aria-hidden className="size-4" /> {docsConfig.title}
          </summary>
          <div className="pt-4">
            <DocsSidebar groups={groups} label={docsConfig.title} />
          </div>
        </details>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
