import path from "node:path";

import type { Registry } from "../registry/registry";
import type { FileEntry, ProjectManifest } from "../schema/manifest";
import { exists, readBytesIfExists, sha256 } from "../utils/fs";

export type InstalledItem = {
  kind: "module" | "section" | "ui";
  name: string;
  version: string;
  files: FileEntry[];
};

export type FileDrift = {
  path: string;
  /** Local copy differs from what was installed. */
  local: "unchanged" | "modified" | "missing";
  /** Registry copy differs from what was installed. */
  upstream: "unchanged" | "changed" | "added" | "removed";
};

export type ItemDrift = {
  item: InstalledItem;
  latest: string | null;
  files: FileDrift[];
};

export function installedItems(manifest: ProjectManifest): InstalledItem[] {
  return [
    ...Object.values(manifest.modules).map((m) => ({
      kind: "module" as const,
      name: m.name,
      version: m.version,
      files: m.files,
    })),
    ...Object.values(manifest.sections).map((s) => ({
      kind: "section" as const,
      name: s.name,
      version: s.version,
      files: s.files,
    })),
    ...Object.values(manifest.ui).map((u) => ({
      kind: "ui" as const,
      name: u.name,
      version: u.version,
      files: u.files,
    })),
  ];
}

function registryItem(registry: Registry, item: InstalledItem) {
  if (item.kind === "module") return registry.modules.get(item.name) ?? null;
  if (item.kind === "section") return registry.sections.get(item.name) ?? null;
  return registry.ui.get(item.name) ?? null;
}

/** Compares one installed item with the project on disk and with the registry. */
export async function itemDrift(
  projectDir: string,
  manifest: ProjectManifest,
  registry: Registry,
  item: InstalledItem,
): Promise<ItemDrift> {
  const latest = registryItem(registry, item);
  const files: FileDrift[] = [];
  const upstreamEntries = new Map((latest?.files ?? []).map((entry) => [entry.to, entry]));
  const installedPaths = new Set(item.files.map((entry) => entry.to));

  for (const entry of item.files) {
    const recorded = manifest.files[entry.to];
    const current = await readBytesIfExists(path.join(projectDir, entry.to));
    const local =
      current === null
        ? "missing"
        : recorded && sha256(current) === recorded.hash
          ? "unchanged"
          : "modified";
    const next = upstreamEntries.get(entry.to);
    let upstream: FileDrift["upstream"] = "removed";
    if (next) {
      const source = registry.filePath(item.kind, item.name, next.from);
      const bytes = (await exists(source)) ? await readBytesIfExists(source) : null;
      upstream = bytes && recorded && sha256(bytes) === recorded.hash ? "unchanged" : "changed";
    }
    files.push({ path: entry.to, local, upstream });
  }
  for (const [to] of upstreamEntries) {
    if (!installedPaths.has(to)) files.push({ path: to, local: "missing", upstream: "added" });
  }
  return { item, latest: latest?.version ?? null, files };
}

/** Compares semver strings (x.y.z). */
export function compareVersions(a: string, b: string) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0);
  return 0;
}
