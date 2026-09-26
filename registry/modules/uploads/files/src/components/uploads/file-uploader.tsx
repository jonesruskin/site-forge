"use client";

import { CheckIcon, UploadCloudIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useId, useRef, useState, type DragEvent } from "react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { finishUploadAction, startUploadAction } from "@/lib/uploads/actions";
import { cn } from "@/lib/utils";

type Item = {
  id: string;
  file: File;
  progress: number;
  status: "queued" | "uploading" | "done" | "error";
  error?: string;
  abort?: () => void;
};

const CONCURRENCY = 3;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unit]}`;
}

function put(
  target: { url: string; headers: Record<string, string> },
  file: File,
  onProgress: (value: number) => void,
) {
  const xhr = new XMLHttpRequest();
  const done = new Promise<void>((resolve, reject) => {
    xhr.upload.onprogress = (event) =>
      event.lengthComputable && onProgress(event.loaded / event.total);
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed (${xhr.status}).`));
    xhr.onerror = () => reject(new Error("Network error — check the storage CORS settings."));
    xhr.onabort = () => reject(new Error("Cancelled."));
  });
  xhr.open("PUT", target.url);
  for (const [name, value] of Object.entries(target.headers)) xhr.setRequestHeader(name, value);
  xhr.send(file);
  return { done, abort: () => xhr.abort() };
}

/**
 * Drop, pick or paste files. Each goes straight to storage with its own
 * progress bar; the server only signs the request and verifies the result.
 */
export function FileUploader({ accept, maxSizeMb }: { accept: string[]; maxSizeMb: number }) {
  const router = useRouter();
  const inputId = useId();
  const [items, setItems] = useState<Item[]>([]);
  const [dragging, setDragging] = useState(false);
  const active = useRef(0);
  const queue = useRef<Item[]>([]);

  const update = (id: string, patch: Partial<Item>) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  async function upload(item: Item) {
    try {
      update(item.id, { status: "uploading" });
      const started = await startUploadAction({
        name: item.file.name,
        contentType: item.file.type,
        size: item.file.size,
      });
      if (!started.ok) throw new Error(started.error);
      const request = put(started.data.target, item.file, (progress) =>
        update(item.id, { progress }),
      );
      update(item.id, { abort: request.abort });
      await request.done;
      const finished = await finishUploadAction(started.data.id);
      if (!finished.ok) throw new Error(finished.error);
      update(item.id, { status: "done", progress: 1, abort: undefined });
      router.refresh();
    } catch (error) {
      update(item.id, {
        status: "error",
        error: error instanceof Error ? error.message : "Upload failed.",
        abort: undefined,
      });
    }
  }

  function pump() {
    while (active.current < CONCURRENCY && queue.current.length > 0) {
      const item = queue.current.shift()!;
      active.current++;
      void upload(item).finally(() => {
        active.current--;
        pump();
      });
    }
  }

  function add(files: Iterable<File>) {
    const next = [...files].map((file) => ({
      id: crypto.randomUUID(),
      file,
      progress: 0,
      status: "queued" as const,
    }));
    if (next.length === 0) return;
    setItems((current) => [...next, ...current.filter((item) => item.status !== "done")]);
    queue.current.push(...next);
    pump();
  }

  // Paste screenshots or copied files anywhere on the page.
  const onPaste = useEffectEvent((event: ClipboardEvent) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest("input, textarea, [contenteditable]")) return;
    const files = event.clipboardData?.files;
    if (files?.length) {
      event.preventDefault();
      add(files);
    }
  });

  useEffect(() => {
    const listener = (event: ClipboardEvent) => onPaste(event);
    window.addEventListener("paste", listener);
    return () => window.removeEventListener("paste", listener);
  }, []);

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    add(event.dataTransfer.files);
  };

  return (
    <div className="grid gap-4">
      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "border-input hover:bg-accent/50 has-focus-visible:ring-ring/50 flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-10 text-center transition-colors has-focus-visible:ring-3",
          dragging && "border-primary bg-primary/5",
        )}
      >
        <UploadCloudIcon aria-hidden className="text-muted-foreground size-8" />
        <span className="text-sm font-medium">Drop files, click to choose, or paste</span>
        <span className="text-muted-foreground text-xs">
          {accept.join(", ")} · up to {maxSizeMb} MB each
        </span>
        <input
          id={inputId}
          type="file"
          multiple
          accept={accept.join(",")}
          className="sr-only"
          onChange={(event) => {
            if (event.target.files) add(event.target.files);
            event.target.value = "";
          }}
        />
      </label>

      {items.length > 0 && (
        <ul className="grid gap-2" aria-label="Uploads">
          {items.map((item) => (
            <li key={item.id} className="grid gap-2 rounded-lg border px-4 py-3">
              <div className="flex items-center gap-3 text-sm">
                <span className="min-w-0 flex-1 truncate font-medium">{item.file.name}</span>
                <span className="text-muted-foreground shrink-0 text-xs">
                  {formatBytes(item.file.size)}
                </span>
                {item.status === "done" && (
                  <CheckIcon aria-label="Uploaded" className="text-success size-4" />
                )}
                {item.abort && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={item.abort}
                    aria-label={`Cancel ${item.file.name}`}
                  >
                    <XIcon aria-hidden />
                  </Button>
                )}
              </div>
              {item.status === "error" ? (
                <p role="alert" className="text-destructive text-xs">
                  {item.error}
                </p>
              ) : (
                item.status !== "done" && (
                  <Progress
                    label={`Uploading ${item.file.name}`}
                    value={item.status === "queued" ? 0 : Math.round(item.progress * 100)}
                    className="h-1.5"
                  />
                )
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
