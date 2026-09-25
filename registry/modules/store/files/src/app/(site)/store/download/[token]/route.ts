import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

import { NextResponse } from "next/server";

import { getProduct } from "@/lib/store/products";
import { verifyDownloadToken } from "@/lib/store/tokens";

const DOWNLOADS = path.join(process.cwd(), "private", "downloads");

const MIME: Record<string, string> = {
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".epub": "application/epub+zip",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

function problem(status: number, message: string) {
  return new NextResponse(message, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex" },
  });
}

/** Streams a purchased file after checking the signed, expiring token. */
export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const check = verifyDownloadToken((await params).token);
  if (!check.ok) {
    return check.reason === "expired"
      ? problem(410, "This download link has expired. Reply to your purchase email for a new one.")
      : problem(404, "This download link isn't valid.");
  }
  const product = getProduct(check.grant.product);
  if (!product) return problem(404, "This product is no longer available.");
  if (product.url) return NextResponse.redirect(product.url, 302);

  const file = path.resolve(DOWNLOADS, product.file!);
  if (!file.startsWith(DOWNLOADS + path.sep))
    return problem(404, "This download link isn't valid.");
  const info = await stat(file).catch(() => null);
  if (!info?.isFile()) {
    console.error(`[store] missing file for ${product.slug}: private/downloads/${product.file}`);
    return problem(500, "The file is temporarily unavailable. Please try again later.");
  }
  const name = path.basename(file);
  return new Response(Readable.toWeb(createReadStream(file)) as ReadableStream<Uint8Array>, {
    headers: {
      "Content-Type": MIME[path.extname(name).toLowerCase()] ?? "application/octet-stream",
      "Content-Length": String(info.size),
      "Content-Disposition": `attachment; filename="${name.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
