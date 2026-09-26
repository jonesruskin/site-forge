import "server-only";

import { and, count, desc, eq, lt } from "drizzle-orm";

import { db } from "@/db";
import { upload } from "@/db/schema/uploads";

import { isAccepted, maxBytes, uploadsConfig } from "./config";
import { storage } from "./storage";

export type UploadRequest = { name: string; contentType: string; size: number };

export class UploadError extends Error {}

function safeName(name: string) {
  const base = name
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|-+$/g, "");
  return (base || "file").slice(-120);
}

/** Validates the request, records a pending upload and returns where the browser should PUT the file. */
export async function createUpload(userId: string, request: UploadRequest) {
  const contentType = request.contentType || "application/octet-stream";
  if (!isAccepted(contentType))
    throw new UploadError(`${request.name}: this file type isn't allowed.`);
  if (request.size <= 0) throw new UploadError(`${request.name} is empty.`);
  if (request.size > maxBytes)
    throw new UploadError(`${request.name} is larger than ${uploadsConfig.maxSizeMb} MB.`);

  const [{ value: existing } = { value: 0 }] = await db
    .select({ value: count() })
    .from(upload)
    .where(eq(upload.userId, userId));
  if (existing >= uploadsConfig.maxFilesPerUser) {
    throw new UploadError(
      `You can keep up to ${uploadsConfig.maxFilesPerUser} files. Delete some first.`,
    );
  }

  const id = crypto.randomUUID();
  const key = `u/${userId}/${id}/${safeName(request.name)}`;
  await db
    .insert(upload)
    .values({ id, userId, key, name: request.name.slice(0, 255), contentType, size: request.size });
  return { id, target: await storage.presignUpload(key, contentType, id) };
}

/** Confirms the object arrived with the declared size, then marks the upload ready. */
export async function completeUpload(userId: string, id: string) {
  const row = await getUpload(userId, id);
  if (!row) throw new UploadError("Upload not found.");
  if (row.status === "ready") return row;
  const size = await storage.size(row.key);
  if (size === null) throw new UploadError(`${row.name} didn't arrive. Try again.`);
  if (size !== row.size || size > maxBytes) {
    await deleteUpload(userId, id);
    throw new UploadError(`${row.name} doesn't match what was announced and was discarded.`);
  }
  const [updated] = await db
    .update(upload)
    .set({ status: "ready" })
    .where(eq(upload.id, id))
    .returning();
  return updated!;
}

export async function getUpload(userId: string, id: string) {
  const row = await db.query.upload.findFirst({
    where: and(eq(upload.id, id), eq(upload.userId, userId)),
  });
  return row ?? null;
}

export async function listUploads(userId: string, { limit = 100 } = {}) {
  return db
    .select()
    .from(upload)
    .where(and(eq(upload.userId, userId), eq(upload.status, "ready")))
    .orderBy(desc(upload.createdAt))
    .limit(limit);
}

export async function deleteUpload(userId: string, id: string) {
  const row = await getUpload(userId, id);
  if (!row) return;
  await storage.remove(row.key);
  await db.delete(upload).where(eq(upload.id, row.id));
}

/** Removes uploads that were started but never completed. Run from a cron job. */
export async function sweepPendingUploads(olderThanHours = 24) {
  const cutoff = new Date(Date.now() - olderThanHours * 3_600_000);
  const stale = await db
    .select()
    .from(upload)
    .where(and(eq(upload.status, "pending"), lt(upload.createdAt, cutoff)));
  for (const row of stale) {
    await storage.remove(row.key);
    await db.delete(upload).where(eq(upload.id, row.id));
  }
  return stale.length;
}
