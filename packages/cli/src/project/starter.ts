import { readFile } from "node:fs/promises";
import path from "node:path";

import { glob } from "tinyglobby";

import type { Registry } from "../registry/registry";
import type { ProjectManifest } from "../schema/manifest";
import { sha256, writeText } from "../utils/fs";

const ALWAYS_IGNORED = [
  "**/node_modules/**",
  "**/.next/**",
  "**/.turbo/**",
  "next-env.d.ts",
  "**/*.tsbuildinfo",
];

/** Copies the starter into `projectDir`, recording a hash for every file. */
export async function copyStarter(
  registry: Registry,
  projectDir: string,
  manifest: ProjectManifest,
) {
  const starterDir = registry.starterDir();
  const files = await glob("**/*", {
    cwd: starterDir,
    dot: true,
    onlyFiles: true,
    ignore: [...ALWAYS_IGNORED, ...registry.core.ignore],
  });
  for (const file of files.sort()) {
    const content = await readFile(path.join(starterDir, file));
    await writeText(path.join(projectDir, file), content.toString("utf8"));
    manifest.files[file] = { owner: "starter", hash: sha256(content) };
  }
  return files;
}
