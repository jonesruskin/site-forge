/**
 * Regenerates apps/playground with the real CLI: the starter plus EVERY module,
 * section and UI primitive from the local registry, then overlays the committed
 * demo files from apps/playground/demo. This doubles as an integration test of
 * the whole registry.
 *
 *   pnpm playground:sync          # regenerate, then run `pnpm install`
 *   pnpm playground:sync --watch  # re-copy registry files into the playground on change
 */
import { cp, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { watch } from "node:fs";
import os from "node:os";
import path from "node:path";

import { x } from "tinyexec";

import { updateSiteConfig } from "../packages/cli/src/codemods/site-config";
import { Registry } from "../packages/cli/src/registry/registry";

const root = path.resolve(import.meta.dirname, "..");
const playground = path.join(root, "apps/playground");
const demo = path.join(playground, "demo");
const KEEP = new Set(["demo", "node_modules", ".next", ".site"]);

const registry = await Registry.load({ root, source: "local", ref: "local", commit: null });

async function generate() {
  const tmp = await mkdtemp(path.join(os.tmpdir(), "site-forge-playground-"));
  const target = path.join(tmp, "playground");
  const result = await x(
    path.join(root, "node_modules/.bin/tsx"),
    [
      path.join(root, "packages/cli/src/bin/create-site.ts"),
      target,
      "--yes",
      "--no-install",
      "--no-git",
      "--name",
      "Playground",
      "--description",
      "Every site-forge module, section and primitive in one app.",
      "--url",
      "http://localhost:3000",
      "--author",
      "site-forge",
      "--modules",
      [...registry.modules.keys()].join(","),
      "--sections",
      [...registry.sections.keys()].join(","),
      "--ui",
      [...registry.ui.keys()].join(","),
      "--cli-spec",
      "workspace:*",
      "--pm",
      "pnpm",
    ],
    {
      nodeOptions: { env: { ...process.env, SITE_FORGE_PATH: root, CI: "1" } },
      throwOnError: false,
    },
  );
  if (result.exitCode !== 0) {
    console.error(result.stdout, result.stderr);
    process.exit(1);
  }

  // Replace everything except the demo overlay and caches.
  for (const entry of await readdir(playground).catch(() => [])) {
    if (!KEEP.has(entry)) await rm(path.join(playground, entry), { recursive: true, force: true });
  }
  await rm(path.join(target, "pnpm-workspace.yaml"), { force: true }); // the monorepo root owns pnpm settings
  await cp(target, playground, { recursive: true });
  await rm(tmp, { recursive: true, force: true });

  const pkgFile = path.join(playground, "package.json");
  const pkg = JSON.parse(await readFile(pkgFile, "utf8"));
  pkg.name = "playground";
  pkg.scripts = { ...pkg.scripts, "test:e2e": "playwright test" };
  await writeFile(pkgFile, `${JSON.stringify(pkg, null, 2)}\n`);

  const configFile = path.join(playground, "site.config.ts");
  const config = updateSiteConfig(await readFile(configFile, "utf8"), {
    setPaths: { "author.email": "hello@example.com" },
    nav: [
      { location: "header", label: "Sections", href: "/sections" },
      { location: "header", label: "Theme lab", href: "/lab" },
    ],
    merge: { features: { themeLab: true, flagsDevTools: true } },
  });
  await writeFile(configFile, config);

  await cp(demo, playground, { recursive: true });

  // Tailwind skips gitignored files during automatic source detection, and the
  // generated playground is gitignored, so register its sources explicitly.
  const cssFile = path.join(playground, "src/app/globals.css");
  const css = await readFile(cssFile, "utf8");
  await writeFile(
    cssFile,
    css.replace('@import "tailwindcss";', '@import "tailwindcss";\n@source "../";'),
  );
  console.log("✔ playground regenerated. Run `pnpm install` if dependencies changed.");
}

await generate();

if (process.argv.includes("--watch")) {
  console.log("watching registry/ and apps/playground/demo …");
  let timer: NodeJS.Timeout | undefined;
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(() => void generate(), 300);
  };
  watch(path.join(root, "registry"), { recursive: true }, schedule);
  watch(demo, { recursive: true }, schedule);
}
