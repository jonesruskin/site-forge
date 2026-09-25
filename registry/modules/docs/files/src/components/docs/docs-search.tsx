"use client";

import { FileTextIcon, SearchIcon } from "lucide-react";
import type MiniSearch from "minisearch";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import type { SearchDocument } from "@/lib/docs/docs";
import { cn } from "@/lib/utils";

type Result = { id: string; title: string; href: string; section: string };

let indexPromise: Promise<MiniSearch<SearchDocument>> | null = null;

/** Downloads the static index and the search library only on first use. */
function loadIndex() {
  indexPromise ??= Promise.all([
    import("minisearch"),
    fetch("/docs/search-index.json").then((r) => r.json()),
  ]).then(
    ([{ default: MiniSearchClass }, documents]: [
      { default: typeof MiniSearch },
      SearchDocument[],
    ]) => {
      const search = new MiniSearchClass<SearchDocument>({
        fields: ["title", "section", "text"],
        storeFields: ["title", "href", "section"],
        searchOptions: { boost: { title: 4, section: 1.5 }, prefix: true, fuzzy: 0.2 },
      });
      search.addAll(documents);
      return search;
    },
  );
  return indexPromise;
}

type DocsSearchProps = {
  labels?: { trigger?: string; placeholder?: string; empty?: string; title?: string };
  className?: string;
};

/** ⌘K / Ctrl+K / "/" search dialog with combobox keyboard navigation. */
export function DocsSearch({ labels = {}, className }: DocsSearchProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [active, setActive] = useState(0);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const typing =
        event.target instanceof HTMLElement &&
        event.target.closest("input, textarea, [contenteditable]");
      if (
        (event.key === "k" && (event.metaKey || event.ctrlKey)) ||
        (event.key === "/" && !typing)
      ) {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void loadIndex().then((index) => {
      if (cancelled) return;
      const found = query.trim() ? index.search(query.trim()).slice(0, 8) : [];
      setResults(
        found.map((r) => ({ id: String(r.id), title: r.title, href: r.href, section: r.section })),
      );
      setActive(0);
    });
    return () => {
      cancelled = true;
    };
  }, [query, open]);

  const go = useCallback(
    (result?: Result) => {
      if (!result) return;
      setOpen(false);
      setQuery("");
      router.push(result.href);
    },
    [router],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        onMouseEnter={() => void loadIndex()}
        className={cn(
          "border-input bg-background text-muted-foreground hover:bg-accent flex h-9 w-full items-center gap-2 rounded-md border px-3 text-sm transition-colors",
          className,
        )}
      >
        <SearchIcon aria-hidden className="size-4" />
        <span className="flex-1 text-left">{labels.trigger ?? "Search docs…"}</span>
        <Kbd>⌘K</Kbd>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="top-[15%] max-w-xl translate-y-0 gap-0 p-0"
          showClose={false}
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">{labels.title ?? "Search documentation"}</DialogTitle>
          <div className="flex items-center gap-2 border-b px-4">
            <SearchIcon aria-hidden className="text-muted-foreground size-4" />
            <input
              ref={inputRef}
              role="combobox"
              aria-expanded={results.length > 0}
              aria-controls={listId}
              aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
              aria-autocomplete="list"
              aria-label={labels.title ?? "Search documentation"}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setActive((i) => Math.min(i + 1, results.length - 1));
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setActive((i) => Math.max(i - 1, 0));
                } else if (event.key === "Enter") {
                  event.preventDefault();
                  go(results[active]);
                }
              }}
              placeholder={labels.placeholder ?? "Search…"}
              className="placeholder:text-muted-foreground h-12 flex-1 bg-transparent text-base outline-none"
            />
          </div>
          <ul
            id={listId}
            role="listbox"
            aria-label="Results"
            className="max-h-80 overflow-y-auto p-2"
          >
            {results.map((result, index) => (
              <li
                key={result.id}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === active}
                onMouseMove={() => setActive(index)}
                onClick={() => go(result)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm",
                  index === active && "bg-accent",
                )}
              >
                <FileTextIcon aria-hidden className="text-muted-foreground size-4 shrink-0" />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">{result.title}</span>
                  {result.section && (
                    <span className="text-muted-foreground truncate text-xs">{result.section}</span>
                  )}
                </span>
              </li>
            ))}
            {query.trim() && results.length === 0 && (
              <li className="text-muted-foreground px-3 py-6 text-center text-sm">
                {labels.empty ?? "No results."}
              </li>
            )}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}
