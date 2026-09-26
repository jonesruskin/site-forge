import * as p from "@clack/prompts";

import { Registry } from "../registry/registry";
import { resolveRegistry, type RegistryOptions } from "../registry/source";
import type { ProjectManifest } from "../schema/manifest";
import { run } from "../utils/exec";
import { exists } from "../utils/fs";
import path from "node:path";

/** Flags shared by every command that reads the registry. */
export const registryArgs = {
  ref: {
    type: "string",
    description:
      "Registry branch, tag or commit on GitHub (default: main, or the ref recorded in the project)",
  },
  registry: {
    type: "string",
    description: "Path to a local site-forge checkout (overrides $SITE_FORGE_PATH)",
  },
  repo: {
    type: "string",
    description:
      "GitHub owner/repo to download the registry from (default: jonesruskin/site-forge)",
  },
} as const;

export async function loadRegistry(
  args: { ref?: string; registry?: string; repo?: string },
  project?: ProjectManifest,
) {
  const options: RegistryOptions = { path: args.registry, repo: args.repo, ref: args.ref };
  if (!options.ref && project && project.registry.ref !== "local")
    options.ref = project.registry.ref;
  if (!options.repo && project?.registry.source.startsWith("github:")) {
    options.repo = project.registry.source.slice("github:".length);
  }
  const spinner = p.spinner();
  spinner.start("Loading registry");
  try {
    const source = await resolveRegistry(options);
    const registry = await Registry.load(source);
    const where = source.source === "local" ? source.root : `${source.source}@${source.ref}`;
    spinner.stop(`Registry ${registry.version} from ${where}`);
    return registry;
  } catch (error) {
    spinner.error("Could not load the registry");
    throw error;
  }
}

/** Formats touched files with the project's own Prettier (if installed). */
export async function formatFiles(projectDir: string, files: string[]) {
  const formattable = files.filter(
    (f) => /\.(tsx?|mjs|json|css|md)$/.test(f) && !f.startsWith("src/generated/"),
  );
  if (formattable.length === 0) return;
  if (!(await exists(path.join(projectDir, "node_modules", ".bin", "prettier")))) return;
  await run(
    path.join(projectDir, "node_modules", ".bin", "prettier"),
    ["--write", ...formattable],
    projectDir,
  );
}

export function splitList(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
