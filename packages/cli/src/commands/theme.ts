import path from "node:path";

import * as p from "@clack/prompts";
import { defineCommand } from "citty";

import { writeManifest, findProjectRoot, readManifest } from "../project/project";
import { applyTheme } from "../project/theme";
import { CliError } from "../utils/errors";
import { readText, sha256, writeText } from "../utils/fs";
import { log, pc } from "../utils/log";
import { loadRegistry, registryArgs } from "./shared";

/** CLI flag → dial name. Values are validated loosely; CSS is the final judge. */
const DIALS = {
  hue: { dial: "--dial-hue", pattern: /^\d{1,3}(\.\d+)?$/ },
  tint: { dial: "--dial-tint", pattern: /^0?(\.\d+)?$|^0$/ },
  accent: { dial: "--dial-accent", pattern: /^0?(\.\d+)?$|^0$/ },
  "accent-hue": { dial: "--dial-accent-hue", pattern: /^\d{1,3}(\.\d+)?$/ },
  "accent-lightness": { dial: "--dial-accent-lightness", pattern: /^0?\.\d+$/ },
  radius: { dial: "--dial-radius", pattern: /^\d*\.?\d+(rem|px)?$/ },
  density: { dial: "--dial-density", pattern: /^\d*\.?\d+$/ },
  shadow: { dial: "--dial-shadow", pattern: /^\d*\.?\d+$/ },
  motion: { dial: "--dial-motion", pattern: /^\d*\.?\d+$/ },
  "type-scale": { dial: "--dial-type-scale", pattern: /^\d*\.?\d+$/ },
  measure: { dial: "--dial-measure", pattern: /^\d*\.?\d+(rem|px|ch)$/ },
} as const;

type DialFlag = keyof typeof DIALS;

export function setDial(css: string, dial: string, value: string) {
  const pattern = new RegExp(`(${dial}:\\s*)([^;]+)(;)`);
  if (!pattern.test(css)) throw new CliError(`theme.css has no ${dial} dial.`);
  return css.replace(pattern, `$1${value}$3`);
}

export function readDials(css: string) {
  const dials: Record<string, string> = {};
  for (const match of css.matchAll(/(--dial-[a-z-]+):\s*([^;]+);/g))
    dials[match[1]!] ??= match[2]!.trim();
  return dials;
}

export const theme = defineCommand({
  meta: {
    name: "theme",
    description:
      "Apply a registry theme, or turn individual dials (e.g. --hue 25 --accent 0.18 --radius 0)",
  },
  args: {
    name: {
      type: "positional",
      required: false,
      description: "Theme to apply (see `site list themes`)",
    },
    overwrite: {
      type: "boolean",
      default: false,
      description: "Replace a theme.css that has local edits",
    },
    ...Object.fromEntries(
      Object.entries(DIALS).map(([flag, { dial }]) => [
        flag,
        { type: "string", description: `Set ${dial}` },
      ]),
    ),
    ...registryArgs,
  } as const,
  async run({ args }) {
    const projectDir = await findProjectRoot();
    const manifest = await readManifest(projectDir);
    const themeFile = path.join(projectDir, "src/styles/theme.css");
    const flags = args as unknown as Record<string, string | undefined>;
    const dialChanges = (Object.keys(DIALS) as DialFlag[]).filter(
      (flag) => flags[flag] !== undefined,
    );

    if (args.name) {
      const registry = await loadRegistry(args, manifest);
      const next = registry.getTheme(args.name);
      const current = await readText(themeFile);
      const tracked = manifest.files["src/styles/theme.css"];
      if (tracked && tracked.hash !== sha256(current) && !args.overwrite) {
        throw new CliError(
          "src/styles/theme.css has local edits.",
          "Re-run with --overwrite to replace it (commit first so you can compare), or use dial flags to adjust it.",
        );
      }
      await applyTheme(projectDir, next);
      for (const file of ["src/styles/theme.css", "src/lib/fonts.ts"]) {
        manifest.files[file] = {
          owner: `theme:${next.name}`,
          hash: sha256(await readText(path.join(projectDir, file))),
        };
      }
      manifest.theme = next.name;
      await writeManifest(projectDir, manifest);
      log.success(`Applied theme ${pc.cyan(next.title)}. Fonts updated in src/lib/fonts.ts.`);
    }

    if (dialChanges.length) {
      let css = await readText(themeFile);
      for (const flag of dialChanges) {
        const value = flags[flag]!.trim();
        if (!DIALS[flag].pattern.test(value))
          throw new CliError(`Invalid value for --${flag}: "${value}".`);
        css = setDial(css, DIALS[flag].dial, value);
      }
      await writeText(themeFile, css);
      log.success(`Updated ${dialChanges.map((f) => `${DIALS[f].dial}=${flags[f]}`).join(", ")}`);
    }

    if (!args.name && dialChanges.length === 0) {
      const dials = readDials(await readText(themeFile));
      p.note(
        Object.entries(dials)
          .map(([dial, value]) => `${pc.cyan(dial.padEnd(24))} ${value}`)
          .join("\n"),
        `Current dials (theme: ${manifest.theme})`,
      );
      log.info(
        "Change one: `site theme --hue 25 --accent 0.18`. Apply another theme: `site theme editorial`.",
      );
    }
  },
});
