/**
 * Regenerates the starter's CLI-owned baseline files (src/generated/*, src/env.ts,
 * src/lib/fonts.ts, .env.example) exactly as the CLI would for a project with no
 * modules, and exports JSON Schemas for registry manifests.
 *
 *   pnpm tsx scripts/sync-starter.ts          # write
 *   pnpm tsx scripts/sync-starter.ts --check  # fail if anything is out of date
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

import { z } from "zod";

import { generateEnvExample } from "../packages/cli/src/generate/env-example";
import { generateFiles } from "../packages/cli/src/generate/generated-files";
import { generateFontsFile } from "../packages/cli/src/project/theme";
import {
  coreManifestSchema,
  moduleManifestSchema,
  presetSchema,
  sectionManifestSchema,
  themeManifestSchema,
  uiManifestSchema,
} from "../packages/cli/src/schema/manifest";

const root = path.resolve(import.meta.dirname, "..");
const check = process.argv.includes("--check");
const stale: string[] = [];

async function put(file: string, content: string) {
  const absolute = path.join(root, file);
  const current = await readFile(absolute, "utf8").catch(() => null);
  if (current === content) return;
  if (check) {
    stale.push(file);
    return;
  }
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, content);
  console.log(`wrote ${file}`);
}

const core = coreManifestSchema.parse(
  JSON.parse(await readFile(path.join(root, "registry/core.json"), "utf8")),
);
const starter = core.starter;

const generated = generateFiles(core, []);
for (const [file, content] of generated.write) await put(path.join(starter, file), content);
await put(path.join(starter, "src/lib/fonts.ts"), generateFontsFile({}));
await put(path.join(starter, ".env.example"), generateEnvExample(core.env, []));
await put(
  "registry/themes/neutral/theme.css",
  await readFile(path.join(root, starter, "src/styles/theme.css"), "utf8"),
);

const schemas = {
  "core.schema.json": coreManifestSchema,
  "module.schema.json": moduleManifestSchema,
  "ui.schema.json": uiManifestSchema,
  "section.schema.json": sectionManifestSchema,
  "preset.schema.json": presetSchema,
  "theme.schema.json": themeManifestSchema,
};
for (const [file, schema] of Object.entries(schemas)) {
  const json = z.toJSONSchema(schema, { io: "input", unrepresentable: "any" });
  await put(path.join("registry/schema", file), `${JSON.stringify(json, null, 2)}\n`);
}

if (check && stale.length) {
  console.error(`Out of date (run pnpm sync:starter):\n  ${stale.join("\n  ")}`);
  process.exit(1);
}
