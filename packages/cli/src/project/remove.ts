import { readdir, rmdir } from "node:fs/promises";
import path from "node:path";

import { removeFromSiteConfig } from "../codemods/site-config";
import { updateReadme } from "../generate/readme";
import type { ItemKind } from "../registry/registry";
import type { Selection } from "../resolve";
import type { ModuleManifest, ProjectManifest } from "../schema/manifest";
import { CliError } from "../utils/errors";
import { readBytesIfExists, readTextIfExists, remove, sha256, writeText } from "../utils/fs";
import { orderedModules, syncGenerated } from "./apply";
import { pruneDependencies } from "./package-json";
import { readPackageJson, writeManifest, writePackageJson } from "./project";

export type RemovalPlan = {
  selection: Selection;
  /** Registry-owned files that still match what was installed: safe to delete. */
  deletable: string[];
  /** Files the user changed: kept unless forced. */
  modified: string[];
  /** Files already gone. */
  missing: string[];
  dependencies: string[];
  /** Modules whose DB tables will be left in the database. */
  withTables: string[];
};

const owner = (kind: ItemKind, name: string) => `${kind}:${name}`;

/**
 * Checks that nothing left behind still depends on what's being removed:
 * modules via `requires`, and ui/sections via the `ui`/`sections` lists.
 */
export function assertRemovable(manifest: ProjectManifest, selection: Selection) {
  const leaving = {
    modules: new Set(selection.modules),
    sections: new Set(selection.sections),
    ui: new Set(selection.ui),
  };
  const problems: string[] = [];
  for (const m of Object.values(manifest.modules)) {
    if (leaving.modules.has(m.name)) continue;
    for (const r of m.requires)
      if (leaving.modules.has(r)) problems.push(`module ${m.name} requires ${r}`);
    for (const s of m.sections)
      if (leaving.sections.has(s)) problems.push(`module ${m.name} uses section ${s}`);
    for (const u of m.ui) if (leaving.ui.has(u)) problems.push(`module ${m.name} uses ui ${u}`);
  }
  for (const s of Object.values(manifest.sections)) {
    if (leaving.sections.has(s.name)) continue;
    for (const d of s.sections)
      if (leaving.sections.has(d)) problems.push(`section ${s.name} uses section ${d}`);
    for (const u of s.ui) if (leaving.ui.has(u)) problems.push(`section ${s.name} uses ui ${u}`);
  }
  for (const u of Object.values(manifest.ui)) {
    if (leaving.ui.has(u.name)) continue;
    for (const d of u.ui) if (leaving.ui.has(d)) problems.push(`ui ${u.name} uses ui ${d}`);
  }
  if (problems.length) {
    throw new CliError(
      `Can't remove: other installed items depend on it.\n  ${problems.join("\n  ")}`,
      "Remove those too (list them in the same command), or keep this one.",
    );
  }
}

export async function planRemoval(
  projectDir: string,
  manifest: ProjectManifest,
  selection: Selection,
) {
  const owners = new Set([
    ...selection.modules.map((n) => owner("module", n)),
    ...selection.sections.map((n) => owner("section", n)),
    ...selection.ui.map((n) => owner("ui", n)),
  ]);
  const plan: RemovalPlan = {
    selection,
    deletable: [],
    modified: [],
    missing: [],
    dependencies: [],
    withTables: [],
  };

  for (const [file, record] of Object.entries(manifest.files)) {
    if (!owners.has(record.owner)) continue;
    const current = await readBytesIfExists(path.join(projectDir, file));
    if (current === null) plan.missing.push(file);
    else if (sha256(current) === record.hash) plan.deletable.push(file);
    else plan.modified.push(file);
  }

  // Dependencies of leaving items that no remaining item declares.
  const remaining = [
    ...Object.values(manifest.modules).filter((m) => !selection.modules.includes(m.name)),
    ...Object.values(manifest.sections).filter((s) => !selection.sections.includes(s.name)),
    ...Object.values(manifest.ui).filter((u) => !selection.ui.includes(u.name)),
  ];
  const stillNeeded = new Set(
    remaining.flatMap((item) => [
      ...Object.keys(item.dependencies),
      ...Object.keys((item as Partial<ModuleManifest>).devDependencies ?? {}),
    ]),
  );
  const leaving = [
    ...selection.modules.map((n) => manifest.modules[n]!),
    ...selection.sections.map((n) => manifest.sections[n]!),
    ...selection.ui.map((n) => manifest.ui[n]!),
  ];
  plan.dependencies = [
    ...new Set(
      leaving.flatMap((item) => [
        ...Object.keys(item.dependencies),
        ...Object.keys((item as Partial<ModuleManifest>).devDependencies ?? {}),
      ]),
    ),
  ].filter((name) => !stillNeeded.has(name));
  plan.withTables = selection.modules.filter((n) => manifest.modules[n]!.dbSchema.length > 0);
  return plan;
}

async function removeEmptyParents(projectDir: string, file: string) {
  let dir = path.dirname(path.join(projectDir, file));
  while (dir.startsWith(projectDir) && dir !== projectDir) {
    const entries = await readdir(dir).catch(() => null);
    if (!entries || entries.length > 0) return;
    await rmdir(dir).catch(() => undefined);
    dir = path.dirname(dir);
  }
}

export async function applyRemoval(
  projectDir: string,
  manifest: ProjectManifest,
  plan: RemovalPlan,
  { force = false } = {},
) {
  const deleted: string[] = [];
  const kept: string[] = [];
  const files = force ? [...plan.deletable, ...plan.modified] : plan.deletable;
  for (const file of files) {
    await remove(path.join(projectDir, file));
    await removeEmptyParents(projectDir, file);
    deleted.push(file);
  }
  if (!force) kept.push(...plan.modified);

  const { selection } = plan;
  const leavingModules = selection.modules.map((n) => manifest.modules[n]!);

  // site.config.ts: nav entries, module blocks and feature switches.
  const configFile = path.join(projectDir, "site.config.ts");
  const config = await readTextIfExists(configFile);
  if (config !== null && leavingModules.length) {
    try {
      const next = removeFromSiteConfig(config, {
        nav: leavingModules.flatMap((m) => m.contributes.nav),
        blocks: leavingModules.flatMap((m) => Object.keys(m.contributes.siteConfig)),
        features: leavingModules.flatMap((m) => Object.keys(m.contributes.features)),
      });
      if (next !== config) await writeText(configFile, next);
    } catch {
      kept.push("site.config.ts (remove the module's blocks and nav entries by hand)");
    }
  }

  // package.json: dependencies nothing else needs, and the modules' scripts (if unchanged).
  const pkg = await readPackageJson(projectDir);
  const pruned = pruneDependencies(pkg, plan.dependencies, new Set());
  const scripts = { ...pruned.pkg.scripts };
  for (const m of leavingModules) {
    for (const [name, command] of Object.entries(m.contributes.scripts)) {
      if (scripts[name] === command) delete scripts[name];
    }
  }
  await writePackageJson(projectDir, { ...pruned.pkg, scripts });

  for (const m of selection.modules) {
    await remove(path.join(projectDir, ".site", "modules", `${m}.md`));
    delete manifest.modules[m];
  }
  for (const s of selection.sections) delete manifest.sections[s];
  for (const u of selection.ui) delete manifest.ui[u];
  const owners = new Set([
    ...selection.modules.map((n) => owner("module", n)),
    ...selection.sections.map((n) => owner("section", n)),
    ...selection.ui.map((n) => owner("ui", n)),
  ]);
  for (const [file, record] of Object.entries(manifest.files)) {
    // Kept (modified) files become the project's own.
    if (owners.has(record.owner)) delete manifest.files[file];
  }

  const readmeFile = path.join(projectDir, "README.md");
  const readme = await readTextIfExists(readmeFile);
  if (readme !== null) {
    const next = updateReadme(readme, orderedModules(manifest));
    if (next !== readme) await writeText(readmeFile, next);
  }

  const regenerated = await syncGenerated(projectDir, manifest);
  await writeManifest(projectDir, manifest);
  return { deleted, kept, regenerated, removedDependencies: pruned.removed };
}
