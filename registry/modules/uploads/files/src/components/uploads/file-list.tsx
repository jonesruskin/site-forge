import { FileIcon, FileTextIcon, FolderOpenIcon } from "lucide-react";

import { EmptyState } from "@/components/sections/empty-state";
import { Button } from "@/components/ui/button";
import type { Upload } from "@/db/schema/uploads";
import { deleteUploadAction } from "@/lib/uploads/actions";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const PREVIEWABLE = /^image\/(png|jpe?g|gif|webp|avif)$/i;

export function FileList({ files }: { files: Upload[] }) {
  if (files.length === 0) {
    return (
      <EmptyState
        icon={<FolderOpenIcon />}
        title="No files yet"
        description="Uploads appear here once they finish."
      />
    );
  }
  const date = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {files.map((file) => {
        const href = `/api/uploads/${file.id}`;
        const Icon =
          file.contentType.startsWith("text/") || file.contentType === "application/pdf"
            ? FileTextIcon
            : FileIcon;
        return (
          <li key={file.id} className="bg-card flex flex-col overflow-hidden rounded-lg border">
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="bg-muted relative flex aspect-video items-center justify-center overflow-hidden"
            >
              {PREVIEWABLE.test(file.contentType) ? (
                // eslint-disable-next-line @next/next/no-img-element -- private, signed URLs can't go through the image optimizer
                <img
                  src={href}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover"
                />
              ) : (
                <Icon aria-hidden className="text-muted-foreground size-10" />
              )}
              <span className="sr-only">Open {file.name}</span>
            </a>
            <div className="flex items-start gap-2 p-3">
              <div className="grid min-w-0 flex-1 gap-0.5">
                <p className="truncate text-sm font-medium" title={file.name}>
                  {file.name}
                </p>
                <p className="text-muted-foreground text-xs">
                  {formatBytes(file.size)} · {date.format(file.createdAt)}
                </p>
              </div>
              <form action={deleteUploadAction}>
                <input type="hidden" name="id" value={file.id} />
                <Button type="submit" variant="ghost" size="sm" aria-label={`Delete ${file.name}`}>
                  Delete
                </Button>
              </form>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
