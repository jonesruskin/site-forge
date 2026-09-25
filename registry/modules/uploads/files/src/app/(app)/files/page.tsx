import type { Metadata } from "next";

import { FileList } from "@/components/uploads/file-list";
import { FileUploader } from "@/components/uploads/file-uploader";
import { requireSession } from "@/lib/auth/session";
import { uploadsConfig } from "@/lib/uploads/config";
import { listUploads } from "@/lib/uploads/uploads";

export const metadata: Metadata = { title: "Files", robots: { index: false } };

export default async function FilesPage() {
  const { user } = await requireSession("/files");
  const files = await listUploads(user.id);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Files</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Private to your account. Links to them require you to be signed in.
        </p>
      </header>
      <FileUploader accept={uploadsConfig.accept} maxSizeMb={uploadsConfig.maxSizeMb} />
      <FileList files={files} />
    </div>
  );
}
