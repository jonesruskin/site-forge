import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { apiKey } from "@/db/schema/api";

import { apiConfig } from "./config";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/** 40 base62 characters ≈ 238 bits of entropy. */
function randomSecret(length = 40) {
  const bytes = randomBytes(length * 2);
  let out = "";
  for (const byte of bytes) {
    // Rejection sampling keeps the distribution uniform (248 = 62 * 4).
    if (byte < 248) out += ALPHABET[byte % 62];
    if (out.length === length) break;
  }
  return out;
}

export function hashKey(key: string) {
  return createHash("sha256").update(key).digest("hex");
}

export type CreateKeyInput = { name: string; scopes: string[]; expiresInDays?: number | null };

/** Creates a key and returns the plaintext secret. It is never retrievable again. */
export async function createApiKey(userId: string, input: CreateKeyInput) {
  const key = `${apiConfig.keyPrefix}_${randomSecret()}`;
  const expiresAt = input.expiresInDays
    ? new Date(Date.now() + input.expiresInDays * 86_400_000)
    : null;
  const [row] = await db
    .insert(apiKey)
    .values({
      userId,
      name: input.name,
      scopes: input.scopes,
      start: key.slice(0, apiConfig.keyPrefix.length + 6),
      hash: hashKey(key),
      expiresAt,
    })
    .returning();
  return { key, row: row! };
}

export async function listApiKeys(userId: string) {
  return db
    .select({
      id: apiKey.id,
      name: apiKey.name,
      start: apiKey.start,
      scopes: apiKey.scopes,
      lastUsedAt: apiKey.lastUsedAt,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
    })
    .from(apiKey)
    .where(eq(apiKey.userId, userId))
    .orderBy(desc(apiKey.createdAt));
}

export async function revokeApiKey(userId: string, id: string) {
  await db.delete(apiKey).where(and(eq(apiKey.userId, userId), eq(apiKey.id, id)));
}

/** Resolves a presented key to its row, or null when unknown or expired. */
export async function verifyApiKey(key: string) {
  if (!key.startsWith(`${apiConfig.keyPrefix}_`)) return null;
  // Looking up by hash is safe: equality on a SHA-256 digest leaks nothing useful.
  const row = await db.query.apiKey.findFirst({ where: eq(apiKey.hash, hashKey(key)) });
  if (!row || (row.expiresAt && row.expiresAt < new Date())) return null;
  return row;
}

/** Records usage at most once a minute per key, to keep writes off the hot path. */
export async function touchApiKey(row: { id: string; lastUsedAt: Date | null }) {
  if (row.lastUsedAt && Date.now() - row.lastUsedAt.getTime() < 60_000) return;
  await db.update(apiKey).set({ lastUsedAt: new Date() }).where(eq(apiKey.id, row.id));
}
