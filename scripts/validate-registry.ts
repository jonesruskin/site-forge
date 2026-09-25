/**
 * Validates the registry beyond what JSON schemas can express:
 *
 *  - every manifest parses; referenced modules/ui/sections/themes exist
 *  - files listed in manifests exist, and every file on disk is listed
 *  - env vars declared in module.json match the Zod fragment in envFile
 *  - imports only reach the starter, the item itself, its requirements,
 *    or generated slot files (the module isolation rule)
 *  - styling uses semantic tokens only (no palette colors, color literals, font names)
 *
 *   pnpm validate
 */
import { readFile } from "node:fs/promises";
import path from "node:path";

import { glob } from "tinyglobby";

import { envExportName } from "../packages/cli/src/generate/generated-files";
import { Registry, type ItemKind } from "../packages/cli/src/registry/registry";
import type { ModuleManifest } from "../packages/cli/src/schema/manifest";

const root = path.resolve(import.meta.dirname, "..");
const errors: string[] = [];
const fail = (where: string, message: string) => errors.push(`${where}: ${message}`);

const registry = await Registry.load({ root, source: "local", ref: "local", commit: null });
const starterDir = path.join(root, registry.core.starter);

/** Files whose purpose is to hold literal values for places CSS variables can't reach. */
const LITERAL_VALUE_FILES = new Set(["src/emails/theme.ts", "src/lib/seo/og-theme.ts"]);

const PALETTE =
  /\b(?:bg|text|border|ring|fill|stroke|from|via|to|outline|decoration|divide|shadow|accent|caret)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)(?:-\d{2,3})?\b/;
const COLOR_LITERAL = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(/;
const FONT_FAMILY = /font-\[['"]?[A-Z]/;
const DARK_COLOR = /\bdark:(?:bg|text|border|ring|fill|stroke)-/;

// ── ownership map: project path → owner ─────────────────────────────────
const owners = new Map<string, string>();
for (const file of await glob("**/*", {
  cwd: starterDir,
  dot: true,
  ignore: ["node_modules/**", ".next/**"],
})) {
  owners.set(file, "starter");
}
for (const slot of Object.values(registry.core.slots)) owners.set(slot.file, "starter");
owners.set("src/generated/db-schema.ts", "module:database");

type Item = { kind: ItemKind; name: string; files: { from: string; to: string }[] };
const items: Item[] = [
  ...[...registry.modules.values()].map((m) => ({
    kind: "module" as const,
    name: m.name,
    files: m.files,
  })),
  ...[...registry.ui.values()].map((u) => ({ kind: "ui" as const, name: u.name, files: u.files })),
  ...[...registry.sections.values()].map((s) => ({
    kind: "section" as const,
    name: s.name,
    files: s.files,
  })),
];
for (const item of items) {
  for (const file of item.files) {
    const previous = owners.get(file.to);
    if (previous && previous !== "starter")
      fail(`${item.kind}:${item.name}`, `${file.to} is also installed by ${previous}`);
    owners.set(file.to, `${item.kind}:${item.name}`);
  }
}
for (const m of registry.modules.values()) {
  for (const slot of Object.values(m.slots)) owners.set(slot.file, `module:${m.name}`);
}

// ── allowed owners per item (itself + transitive requirements) ──────────
function moduleClosure(name: string, seen = new Set<string>()): Set<string> {
  if (seen.has(name)) return seen;
  seen.add(name);
  const manifest = registry.modules.get(name);
  manifest?.requires.forEach((dependency) => moduleClosure(dependency, seen));
  return seen;
}
function uiClosure(names: string[], seen = new Set<string>()): Set<string> {
  for (const name of names) {
    if (seen.has(name)) continue;
    seen.add(name);
    uiClosure(registry.ui.get(name)?.ui ?? [], seen);
  }
  return seen;
}
function sectionClosure(names: string[], seen = new Set<string>()): Set<string> {
  for (const name of names) {
    if (seen.has(name)) continue;
    seen.add(name);
    sectionClosure(registry.sections.get(name)?.sections ?? [], seen);
  }
  return seen;
}

function allowedOwners(item: Item) {
  const allowed = new Set<string>(["starter", `${item.kind}:${item.name}`]);
  if (item.kind === "module") {
    const modules = moduleClosure(item.name);
    const manifests = [...modules]
      .map((n) => registry.modules.get(n))
      .filter(Boolean) as ModuleManifest[];
    modules.forEach((n) => allowed.add(`module:${n}`));
    uiClosure(manifests.flatMap((m) => m.ui)).forEach((n) => allowed.add(`ui:${n}`));
    const sections = sectionClosure(manifests.flatMap((m) => m.sections));
    sections.forEach((n) => allowed.add(`section:${n}`));
    uiClosure([...sections].flatMap((s) => registry.sections.get(s)?.ui ?? [])).forEach((n) =>
      allowed.add(`ui:${n}`),
    );
  }
  if (item.kind === "ui")
    uiClosure(registry.ui.get(item.name)!.ui).forEach((n) => allowed.add(`ui:${n}`));
  if (item.kind === "section") {
    const manifest = registry.sections.get(item.name)!;
    const sections = sectionClosure(manifest.sections);
    sections.forEach((n) => allowed.add(`section:${n}`));
    uiClosure([
      ...manifest.ui,
      ...[...sections].flatMap((s) => registry.sections.get(s)?.ui ?? []),
    ]).forEach((n) => allowed.add(`ui:${n}`));
  }
  return allowed;
}

function resolveProjectImport(specifier: string, fromFile: string) {
  let base: string;
  if (specifier === "@/site.config") return "site.config.ts";
  if (specifier.startsWith("@/")) base = `src/${specifier.slice(2)}`;
  else if (specifier.startsWith("."))
    base = path.posix.join(path.posix.dirname(fromFile), specifier);
  else return null;
  const candidates = [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`];
  return candidates.find((candidate) => owners.has(candidate)) ?? candidates[1]!;
}

const IMPORT =
  /(?:import|export)\s[^'"]*?from\s+["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)|import\s+["']([^"']+)["']/g;

for (const item of items) {
  const where = `${item.kind}:${item.name}`;
  const itemDir = path.join(
    root,
    "registry",
    item.kind === "ui" ? "ui" : `${item.kind}s`,
    item.name,
    "files",
  );

  // Every file on disk must be listed.
  const onDisk = await glob("**/*", { cwd: itemDir, dot: true });
  const listed = new Set(item.files.map((f) => f.from));
  for (const file of onDisk)
    if (!listed.has(file)) fail(where, `files/${file} exists but is not listed in the manifest`);

  const allowed = allowedOwners(item);
  for (const file of item.files) {
    const content = await readFile(path.join(itemDir, file.from), "utf8").catch(() => null);
    if (content === null) {
      fail(where, `listed file files/${file.from} does not exist`);
      continue;
    }
    if (!/\.(tsx?|css|mdx?)$/.test(file.to)) continue;

    for (const match of content.matchAll(IMPORT)) {
      const specifier = match[1] ?? match[2] ?? match[3]!;
      const target = resolveProjectImport(specifier, file.to);
      if (!target) continue;
      const owner = owners.get(target);
      if (!owner)
        fail(where, `${file.to} imports "${specifier}", which no installed item provides`);
      else if (!allowed.has(owner)) {
        fail(
          where,
          `${file.to} imports "${specifier}" from ${owner}; add it to requires/ui/sections or use a slot`,
        );
      }
    }

    if (
      /\.(tsx?|css)$/.test(file.to) &&
      !LITERAL_VALUE_FILES.has(file.to) &&
      !/^src\/emails\//.test(file.to)
    ) {
      const lines = content.split("\n");
      lines.forEach((line, index) => {
        const at = `${where} ${file.to}:${index + 1}`;
        if (PALETTE.test(line)) errors.push(`${at}: palette color class; use semantic tokens`);
        if (COLOR_LITERAL.test(line) && !/opengraph-image|ImageResponse/.test(file.to)) {
          errors.push(
            `${at}: color literal; use semantic tokens (or a *-theme.ts file for non-CSS targets)`,
          );
        }
        if (FONT_FAMILY.test(line))
          errors.push(`${at}: font family in a class; use font-sans/font-display/font-mono`);
        if (DARK_COLOR.test(line))
          errors.push(`${at}: dark: color override; tokens already switch`);
      });
    }
    if (/\bTODO\b|\bFIXME\b/.test(content)) fail(where, `${file.to} contains a TODO/FIXME`);
  }
}

// ── module-specific checks ───────────────────────────────────────────────
for (const m of registry.modules.values()) {
  const where = `module:${m.name}`;
  for (const name of m.requires)
    if (!registry.modules.has(name)) fail(where, `requires unknown module "${name}"`);
  for (const name of m.conflicts)
    if (!registry.modules.has(name)) fail(where, `conflicts with unknown module "${name}"`);
  for (const name of m.ui) if (!registry.ui.has(name)) fail(where, `uses unknown ui "${name}"`);
  for (const name of m.sections)
    if (!registry.sections.has(name)) fail(where, `uses unknown section "${name}"`);
  for (const file of m.dbSchema)
    if (!m.files.some((f) => f.to === file)) fail(where, `dbSchema ${file} is not in files`);
  for (const c of m.contributes.slots) {
    if (!m.files.some((f) => f.to === c.from))
      fail(where, `slot contribution ${c.from} is not one of its files`);
  }

  const readme = await readFile(
    path.join(root, "registry/modules", m.name, "README.md"),
    "utf8",
  ).catch(() => null);
  if (!readme) fail(where, "README.md is missing");
  else {
    for (const heading of ["## Setup", "## Environment", "## Customization", "## Removal"]) {
      if (!readme.includes(heading)) fail(where, `README.md lacks "${heading}"`);
    }
    for (const variable of m.env)
      if (!readme.includes(variable.name))
        fail(where, `README.md doesn't document ${variable.name}`);
  }

  if (m.env.length > 0 && !m.envFile) fail(where, "declares env vars but no envFile");
  if (m.envFile) {
    const file = m.files.find((f) => f.to === m.envFile);
    if (!file) {
      fail(where, `envFile ${m.envFile} is not in files`);
      continue;
    }
    const source = await readFile(
      path.join(root, "registry/modules", m.name, "files", file.from),
      "utf8",
    );
    if (!source.includes(`export const ${envExportName(m.name)} =`)) {
      fail(where, `envFile must export \`${envExportName(m.name)}\``);
    }
    const declared = new Set(
      [...source.matchAll(/^\s{4}([A-Z][A-Z0-9_]+):/gm)].map((match) => match[1]!),
    );
    for (const variable of m.env) {
      if (!declared.has(variable.name))
        fail(where, `${variable.name} is in module.json but not in ${m.envFile}`);
      if (variable.scope === "client" && !variable.name.startsWith("NEXT_PUBLIC_")) {
        fail(where, `client variable ${variable.name} must start with NEXT_PUBLIC_`);
      }
    }
    for (const name of declared) {
      if (!m.env.some((v) => v.name === name))
        fail(where, `${name} is in ${m.envFile} but not documented in module.json`);
    }
  }
}

for (const s of registry.sections.values()) {
  for (const name of s.ui)
    if (!registry.ui.has(name)) fail(`section:${s.name}`, `uses unknown ui "${name}"`);
}

for (const preset of registry.presets.values()) {
  const where = `preset:${preset.name}`;
  for (const name of preset.modules)
    if (!registry.modules.has(name)) fail(where, `unknown module "${name}"`);
  for (const name of preset.sections)
    if (!registry.sections.has(name)) fail(where, `unknown section "${name}"`);
  for (const name of preset.ui) if (!registry.ui.has(name)) fail(where, `unknown ui "${name}"`);
  if (!registry.themes.has(preset.theme)) fail(where, `unknown theme "${preset.theme}"`);
  for (const file of preset.files) {
    const exists = await readFile(registry.filePath("preset", preset.name, file.from)).then(
      () => true,
      () => false,
    );
    if (!exists) fail(where, `file ${file.from} missing in registry/presets/files/${preset.name}/`);
  }
}

const neutral = await readFile(path.join(root, "registry/themes/neutral/theme.css"), "utf8");
const starterTheme = await readFile(path.join(starterDir, "src/styles/theme.css"), "utf8");
if (neutral !== starterTheme)
  fail("theme:neutral", "differs from the starter's theme.css (run pnpm sync:starter)");

if (errors.length > 0) {
  console.error(
    `✖ ${errors.length} registry problem(s):\n\n${errors.map((e) => `  • ${e}`).join("\n")}`,
  );
  process.exit(1);
}
console.log(
  `✔ registry valid: ${registry.modules.size} modules, ${registry.sections.size} sections, ${registry.ui.size} ui, ${registry.presets.size} presets, ${registry.themes.size} themes`,
);
