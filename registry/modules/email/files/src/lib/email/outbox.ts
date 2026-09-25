import "server-only";

import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/** Development-only mailbox on disk, so every flow works without an email provider. */
const OUTBOX_DIR = path.join(process.cwd(), ".site", "dev", "outbox");

export type OutboxMessage = {
  id: string;
  from: string;
  to: string[];
  replyTo?: string;
  subject: string;
  createdAt: string;
};

export async function saveToOutbox(
  message: Omit<OutboxMessage, "id" | "createdAt">,
  html: string,
  text: string,
) {
  const createdAt = new Date().toISOString();
  const id = `${createdAt.replace(/[-:.TZ]/g, "")}-${Math.random().toString(36).slice(2, 8)}`;
  await mkdir(OUTBOX_DIR, { recursive: true });
  await Promise.all([
    writeFile(
      path.join(OUTBOX_DIR, `${id}.json`),
      JSON.stringify({ ...message, id, createdAt }, null, 2),
    ),
    writeFile(path.join(OUTBOX_DIR, `${id}.html`), html),
    writeFile(path.join(OUTBOX_DIR, `${id}.txt`), text),
  ]);
  return id;
}

export async function listOutbox(): Promise<OutboxMessage[]> {
  const files = await readdir(OUTBOX_DIR).catch(() => []);
  const messages = await Promise.all(
    files
      .filter((file) => file.endsWith(".json"))
      .map(
        async (file) =>
          JSON.parse(await readFile(path.join(OUTBOX_DIR, file), "utf8")) as OutboxMessage,
      ),
  );
  return messages.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function readOutboxMessage(id: string) {
  if (!/^[\w-]+$/.test(id)) return null;
  try {
    const [meta, html, text] = await Promise.all([
      readFile(path.join(OUTBOX_DIR, `${id}.json`), "utf8"),
      readFile(path.join(OUTBOX_DIR, `${id}.html`), "utf8"),
      readFile(path.join(OUTBOX_DIR, `${id}.txt`), "utf8"),
    ]);
    return { ...(JSON.parse(meta) as OutboxMessage), html, text };
  } catch {
    return null;
  }
}
