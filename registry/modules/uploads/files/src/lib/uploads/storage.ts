import "server-only";

import { createReadStream } from "node:fs";
import { mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

import { AwsClient } from "aws4fetch";

import { uploadsEnv } from "@/env/uploads";

/** Where an upload goes and how: the browser PUTs the file straight to `url`. */
export type UploadTarget = { url: string; method: "PUT"; headers: Record<string, string> };

export type Storage = {
  kind: "s3" | "local";
  presignUpload(key: string, contentType: string, id: string): Promise<UploadTarget>;
  /** Short-lived URL for a private object, or null when the app streams it itself. */
  presignDownload(
    key: string,
    options: { filename: string; contentType: string; inline: boolean },
  ): Promise<string | null>;
  /** Size in bytes, or null when the object doesn't exist. */
  size(key: string): Promise<number | null>;
  remove(key: string): Promise<void>;
};

const encodeKey = (key: string) => key.split("/").map(encodeURIComponent).join("/");

export function contentDisposition(filename: string, inline: boolean) {
  const ascii = filename.replace(/[^\x20-\x7e]|["\\]/g, "_");
  return `${inline ? "inline" : "attachment"}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

function s3Storage(): Storage {
  const endpoint = uploadsEnv.S3_ENDPOINT!.replace(/\/$/, "");
  const bucket = uploadsEnv.S3_BUCKET!;
  const client = new AwsClient({
    accessKeyId: uploadsEnv.S3_ACCESS_KEY_ID!,
    secretAccessKey: uploadsEnv.S3_SECRET_ACCESS_KEY!,
    service: "s3",
    region: uploadsEnv.S3_REGION,
  });
  // Path-style URLs work on AWS, R2, MinIO, Spaces and B2 alike.
  const objectUrl = (key: string) => new URL(`${endpoint}/${bucket}/${encodeKey(key)}`);

  return {
    kind: "s3",
    async presignUpload(key, contentType) {
      const url = objectUrl(key);
      url.searchParams.set("X-Amz-Expires", "600");
      const signed = await client.sign(url.toString(), {
        method: "PUT",
        headers: { "content-type": contentType },
        aws: { signQuery: true },
      });
      return { url: signed.url, method: "PUT", headers: { "content-type": contentType } };
    },
    async presignDownload(key, { filename, contentType, inline }) {
      const url = objectUrl(key);
      url.searchParams.set("X-Amz-Expires", "300");
      url.searchParams.set("response-content-disposition", contentDisposition(filename, inline));
      url.searchParams.set("response-content-type", contentType);
      const signed = await client.sign(url.toString(), { method: "GET", aws: { signQuery: true } });
      return signed.url;
    },
    async size(key) {
      const response = await client.fetch(objectUrl(key).toString(), { method: "HEAD" });
      if (response.status === 404) return null;
      if (!response.ok) throw new Error(`Storage HEAD failed: ${response.status}`);
      return Number(response.headers.get("content-length") ?? 0);
    },
    async remove(key) {
      const response = await client.fetch(objectUrl(key).toString(), { method: "DELETE" });
      if (!response.ok && response.status !== 404)
        throw new Error(`Storage DELETE failed: ${response.status}`);
    },
  };
}

/** Development fallback: files on disk, uploaded and served through /api/uploads/[id]. */
export const LOCAL_DIR = path.join(process.cwd(), ".site", "dev", "uploads");

export function localPath(key: string) {
  const resolved = path.resolve(LOCAL_DIR, key);
  if (!resolved.startsWith(LOCAL_DIR + path.sep)) throw new Error("Invalid upload key");
  return resolved;
}

function diskStorage(): Storage {
  return {
    kind: "local",
    async presignUpload(_key, contentType, id) {
      return { url: `/api/uploads/${id}`, method: "PUT", headers: { "content-type": contentType } };
    },
    async presignDownload() {
      return null;
    },
    async size(key) {
      return stat(localPath(key)).then(
        (info) => info.size,
        () => null,
      );
    },
    async remove(key) {
      await rm(localPath(key), { force: true });
    },
  };
}

export async function ensureLocalDir(key: string) {
  await mkdir(path.dirname(localPath(key)), { recursive: true });
}

export function localReadStream(key: string) {
  return Readable.toWeb(createReadStream(localPath(key))) as ReadableStream<Uint8Array>;
}

export const storage: Storage =
  uploadsEnv.S3_ENDPOINT && uploadsEnv.S3_BUCKET ? s3Storage() : diskStorage();
