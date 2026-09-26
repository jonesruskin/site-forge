import path from "node:path";

import type { Installed } from "../resolve";
import { projectManifestSchema, type ProjectManifest } from "../schema/manifest";
import { CliError } from "../utils/errors";
import { exists, readJson, writeJson } from "../utils/fs";

export const MANIFEST_PATH = ".site/manifest.json";

/**
 * Files the CLI itself writes or edits (generated slots, env, config codemods).
 * They're never hash-tracked: a changed hash would only mean the CLI did its job,
 * not that you customized the file.
 */
const CLI_MANAGED = new Set([
  "package.json",
  "site.config.ts",
  "README.md",
  ".gitignore",
  ".env.example",
  "pnpm-workspace.yaml",
  "src/env.ts",
  "src/proxy.ts",
]);

export function isCliManaged(file: string) {
  return CLI_MANAGED.has(file) || file.startsWith("src/generated/");
}

export type PackageJson = {
  name?: string;
  version?: string;
  private?: boolean;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
};

/** Walks up from `cwd` to the nearest directory containing .site/manifest.json. */
export async function findProjectRoot(cwd = process.cwd()) {
  let dir = path.resolve(cwd);
  while (true) {
    if (await exists(path.join(dir, MANIFEST_PATH))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new CliError(
        "No site-forge project found (missing .site/manifest.json).",
        "Run this inside a project created with `create-site`, or create one first.",
      );
    }
    dir = parent;
  }
}

export async function readManifest(projectDir: string): Promise<ProjectManifest> {
  const raw = await readJson(path.join(projectDir, MANIFEST_PATH));
  const result = projectManifestSchema.safeParse(raw);
  if (!result.success) {
    throw new CliError(
      `.site/manifest.json is invalid: ${result.error.issues[0]?.message ?? "unknown error"}`,
    );
  }
  return result.data;
}

export async function writeManifest(projectDir: string, manifest: ProjectManifest) {
  const sorted: ProjectManifest = {
    ...manifest,
    files: Object.fromEntries(
      Object.entries(manifest.files).sort(([a], [b]) => a.localeCompare(b)),
    ),
  };
  await writeJson(path.join(projectDir, MANIFEST_PATH), sorted);
}

export function installedFrom(manifest: ProjectManifest): Installed {
  return { modules: manifest.modules, sections: manifest.sections, ui: manifest.ui };
}

export async function readPackageJson(projectDir: string) {
  return readJson<PackageJson>(path.join(projectDir, "package.json"));
}

export async function writePackageJson(projectDir: string, pkg: PackageJson) {
  await writeJson(path.join(projectDir, "package.json"), pkg);
}
