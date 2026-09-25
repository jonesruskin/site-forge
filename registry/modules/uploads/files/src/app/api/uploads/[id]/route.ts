import { writeFile } from "node:fs/promises";

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getSession } from "@/lib/auth/session";
import { isInlineSafe, maxBytes } from "@/lib/uploads/config";
import {
  contentDisposition,
  ensureLocalDir,
  localPath,
  localReadStream,
  storage,
} from "@/lib/uploads/storage";
import { getUpload } from "@/lib/uploads/uploads";

type Context = { params: Promise<{ id: string }> };

async function ownedUpload(context: Context) {
  const session = await getSession();
  if (!session) return { error: NextResponse.json({ error: "Sign in first." }, { status: 401 }) };
  const id = z.uuid().safeParse((await context.params).id);
  const row = id.success ? await getUpload(session.user.id, id.data) : null;
  if (!row) return { error: NextResponse.json({ error: "Not found." }, { status: 404 }) };
  return { row };
}

/** Downloads a private file: a short-lived signed redirect to storage, or streamed from disk locally. */
export async function GET(_request: NextRequest, context: Context) {
  const { row, error } = await ownedUpload(context);
  if (error) return error;
  if (row.status !== "ready")
    return NextResponse.json({ error: "Upload not finished." }, { status: 409 });

  const inline = isInlineSafe(row.contentType);
  const signed = await storage.presignDownload(row.key, {
    filename: row.name,
    contentType: row.contentType,
    inline,
  });
  if (signed) {
    return NextResponse.redirect(signed, {
      status: 302,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
  return new Response(localReadStream(row.key), {
    headers: {
      "Content-Type": inline ? row.contentType : "application/octet-stream",
      "Content-Length": String(row.size),
      "Content-Disposition": contentDisposition(row.name, inline),
      "Cache-Control": "private, max-age=300",
      "Content-Security-Policy": "sandbox; default-src 'none'; img-src 'self'; media-src 'self'",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

/** Local development only: receives the file body the browser would otherwise PUT to S3. */
export async function PUT(request: NextRequest, context: Context) {
  if (storage.kind !== "local")
    return NextResponse.json({ error: "Upload to storage directly." }, { status: 405 });
  const { row, error } = await ownedUpload(context);
  if (error) return error;
  if (row.status !== "pending")
    return NextResponse.json({ error: "Already uploaded." }, { status: 409 });
  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Cross-origin upload rejected." }, { status: 403 });
  }
  const declared = Number(request.headers.get("content-length") ?? row.size);
  if (declared > maxBytes || declared !== row.size) {
    return NextResponse.json({ error: "Size doesn't match." }, { status: 413 });
  }
  const body = new Uint8Array(await request.arrayBuffer());
  if (body.byteLength !== row.size)
    return NextResponse.json({ error: "Size doesn't match." }, { status: 400 });
  await ensureLocalDir(row.key);
  await writeFile(localPath(row.key), body);
  return new Response(null, { status: 200 });
}
