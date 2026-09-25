import type { PackageJson } from "./project";

export type DependencyChanges = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
};

function sortKeys(record: Record<string, string>) {
  return Object.fromEntries(Object.entries(record).sort(([a], [b]) => a.localeCompare(b)));
}

/**
 * Adds dependencies and scripts that are missing. Existing versions are kept:
 * the project owns its package.json once created.
 */
export function mergePackageJson(pkg: PackageJson, changes: DependencyChanges) {
  const added: string[] = [];
  const next: PackageJson = { ...pkg };

  for (const field of ["dependencies", "devDependencies"] as const) {
    const incoming = changes[field];
    if (!incoming || Object.keys(incoming).length === 0) continue;
    const current = { ...(next[field] ?? {}) };
    for (const [name, version] of Object.entries(incoming)) {
      const alreadyPresent =
        current[name] || next.dependencies?.[name] || next.devDependencies?.[name];
      if (!alreadyPresent) {
        current[name] = version;
        added.push(name);
      }
    }
    next[field] = sortKeys(current);
  }

  if (changes.scripts) {
    const scripts = { ...(next.scripts ?? {}) };
    for (const [name, command] of Object.entries(changes.scripts)) scripts[name] ??= command;
    next.scripts = scripts;
  }

  return { pkg: next, added };
}

/** Removes dependencies no longer needed by anything else in the project. */
export function pruneDependencies(
  pkg: PackageJson,
  candidates: string[],
  stillNeeded: Set<string>,
) {
  const next: PackageJson = { ...pkg };
  const removed: string[] = [];
  for (const field of ["dependencies", "devDependencies"] as const) {
    const current = { ...(next[field] ?? {}) };
    for (const name of candidates) {
      if (current[name] && !stillNeeded.has(name)) {
        delete current[name];
        removed.push(name);
      }
    }
    next[field] = current;
  }
  return { pkg: next, removed };
}
