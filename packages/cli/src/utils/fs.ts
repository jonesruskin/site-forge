import { createHash } from "node:crypto";
import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

export async function exists(file: string) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

export async function readText(file: string) {
  return readFile(file, "utf8");
}

export async function readTextIfExists(file: string) {
  return (await exists(file)) ? readFile(file, "utf8") : null;
}

export async function writeText(file: string, content: string) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content);
}

/** Bytes, so images and fonts survive copying (text hashes are identical either way). */
export async function readBytesIfExists(file: string) {
  return (await exists(file)) ? readFile(file) : null;
}

export async function writeBytes(file: string, content: Uint8Array) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content);
}

export async function readJson<T = unknown>(file: string): Promise<T> {
  return JSON.parse(await readFile(file, "utf8")) as T;
}

export async function writeJson(file: string, value: unknown) {
  await writeText(file, `${JSON.stringify(value, null, 2)}\n`);
}

export async function remove(file: string) {
  await rm(file, { recursive: true, force: true });
}

export function sha256(content: string | Buffer) {
  return createHash("sha256").update(content).digest("hex");
}

/** Path with forward slashes, for manifests and generated imports. */
export function toPosix(p: string) {
  return p.split(path.sep).join("/");
}
