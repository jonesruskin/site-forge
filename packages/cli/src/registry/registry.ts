import { readdir } from "node:fs/promises";
import path from "node:path";

import type { z } from "zod";

import {
  coreManifestSchema,
  moduleManifestSchema,
  presetSchema,
  sectionManifestSchema,
  themeManifestSchema,
  uiManifestSchema,
  type CoreManifest,
  type ModuleManifest,
  type Preset,
  type SectionManifest,
  type ThemeManifest,
  type UiManifest,
} from "../schema/manifest";
import { CliError } from "../utils/errors";
import { exists, readJson, readText } from "../utils/fs";
import { suggest } from "../utils/strings";
import type { RegistrySource } from "./source";

export type ItemKind = "module" | "ui" | "section";

export type Theme = ThemeManifest & { css: string };

async function listDirs(dir: string) {
  if (!(await exists(dir))) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

async function parseFile<S extends z.ZodType>(
  schema: S,
  file: string,
  root: string,
): Promise<z.output<S>> {
  const raw = await readJson(file);
  const result = schema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  • ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");
    throw new CliError(`Invalid manifest ${path.relative(root, file)}\n${issues}`);
  }
  return result.data;
}

export class Registry {
  private constructor(
    readonly source: RegistrySource,
    readonly core: CoreManifest,
    readonly modules: Map<string, ModuleManifest>,
    readonly ui: Map<string, UiManifest>,
    readonly sections: Map<string, SectionManifest>,
    readonly presets: Map<string, Preset>,
    readonly themes: Map<string, Theme>,
  ) {}

  get root() {
    return this.source.root;
  }

  get version() {
    return this.core.version;
  }

  static async load(source: RegistrySource) {
    const root = source.root;
    const registryDir = path.join(root, "registry");
    const core = await parseFile(coreManifestSchema, path.join(registryDir, "core.json"), root);

    const modules = new Map<string, ModuleManifest>();
    for (const dir of await listDirs(path.join(registryDir, "modules"))) {
      const manifest = await parseFile(
        moduleManifestSchema,
        path.join(registryDir, "modules", dir, "module.json"),
        root,
      );
      if (manifest.name !== dir)
        throw new CliError(`registry/modules/${dir}: name must equal the directory name.`);
      modules.set(manifest.name, manifest);
    }

    const ui = new Map<string, UiManifest>();
    for (const dir of await listDirs(path.join(registryDir, "ui"))) {
      const manifest = await parseFile(
        uiManifestSchema,
        path.join(registryDir, "ui", dir, "ui.json"),
        root,
      );
      if (manifest.name !== dir)
        throw new CliError(`registry/ui/${dir}: name must equal the directory name.`);
      ui.set(manifest.name, manifest);
    }

    const sections = new Map<string, SectionManifest>();
    for (const dir of await listDirs(path.join(registryDir, "sections"))) {
      const manifest = await parseFile(
        sectionManifestSchema,
        path.join(registryDir, "sections", dir, "section.json"),
        root,
      );
      if (manifest.name !== dir)
        throw new CliError(`registry/sections/${dir}: name must equal the directory name.`);
      sections.set(manifest.name, manifest);
    }

    const presets = new Map<string, Preset>();
    const presetsDir = path.join(registryDir, "presets");
    if (await exists(presetsDir)) {
      for (const file of (await readdir(presetsDir)).filter((f) => f.endsWith(".json")).sort()) {
        const preset = await parseFile(presetSchema, path.join(presetsDir, file), root);
        if (`${preset.name}.json` !== file)
          throw new CliError(`registry/presets/${file}: name must equal the file name.`);
        presets.set(preset.name, preset);
      }
    }

    const themes = new Map<string, Theme>();
    for (const dir of await listDirs(path.join(registryDir, "themes"))) {
      const manifest = await parseFile(
        themeManifestSchema,
        path.join(registryDir, "themes", dir, "theme.json"),
        root,
      );
      const css = await readText(path.join(registryDir, "themes", dir, "theme.css"));
      themes.set(manifest.name, { ...manifest, css });
    }

    return new Registry(source, core, modules, ui, sections, presets, themes);
  }

  /** Absolute path of a registry file for an item. */
  filePath(kind: ItemKind | "preset", name: string, from: string) {
    switch (kind) {
      case "module":
        return path.join(this.root, "registry", "modules", name, "files", from);
      case "ui":
        return path.join(this.root, "registry", "ui", name, "files", from);
      case "section":
        return path.join(this.root, "registry", "sections", name, "files", from);
      case "preset":
        return path.join(this.root, "registry", "presets", "files", name, from);
    }
  }

  starterDir() {
    return path.join(this.root, this.core.starter);
  }

  getModule(name: string) {
    const manifest = this.modules.get(name);
    if (!manifest) throw this.unknown("module", name, [...this.modules.keys()]);
    return manifest;
  }

  getUi(name: string) {
    const manifest = this.ui.get(name);
    if (!manifest) throw this.unknown("UI primitive", name, [...this.ui.keys()]);
    return manifest;
  }

  getSection(name: string) {
    const manifest = this.sections.get(name);
    if (!manifest) throw this.unknown("section", name, [...this.sections.keys()]);
    return manifest;
  }

  getPreset(name: string) {
    const preset = this.presets.get(name);
    if (!preset) throw this.unknown("preset", name, [...this.presets.keys()]);
    return preset;
  }

  getTheme(name: string) {
    const theme = this.themes.get(name);
    if (!theme) throw this.unknown("theme", name, [...this.themes.keys()]);
    return theme;
  }

  /**
   * Resolves a user-supplied name to a registry item. `section:hero` and
   * `ui:button` are explicit; a bare name is looked up as a module, then a
   * section, then a UI primitive.
   */
  resolveName(input: string): { kind: ItemKind; name: string } {
    const [prefix, rest] = input.includes(":")
      ? (input.split(":", 2) as [string, string])
      : [null, input];
    if (prefix === "module") return { kind: "module", name: this.getModule(rest).name };
    if (prefix === "section") return { kind: "section", name: this.getSection(rest).name };
    if (prefix === "ui") return { kind: "ui", name: this.getUi(rest).name };
    if (prefix) throw new CliError(`Unknown prefix "${prefix}:". Use module:, section: or ui:.`);
    if (this.modules.has(input)) return { kind: "module", name: input };
    if (this.sections.has(input)) return { kind: "section", name: input };
    if (this.ui.has(input)) return { kind: "ui", name: input };
    throw this.unknown("module, section or UI primitive", input, [
      ...this.modules.keys(),
      ...this.sections.keys(),
      ...this.ui.keys(),
    ]);
  }

  private unknown(kind: string, name: string, candidates: string[]) {
    const guess = suggest(name, candidates);
    return new CliError(
      `Unknown ${kind} "${name}".${guess ? ` Did you mean "${guess}"?` : ""}`,
      "Run `site list` to see everything available.",
    );
  }
}
