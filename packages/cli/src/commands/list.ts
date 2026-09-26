import { defineCommand } from "citty";

import type { Registry } from "../registry/registry";
import { findProjectRoot, readManifest } from "../project/project";
import type { ProjectManifest } from "../schema/manifest";
import { pc } from "../utils/log";
import { loadRegistry, registryArgs } from "./shared";

const KINDS = ["modules", "sections", "ui", "presets", "themes"] as const;
type Kind = (typeof KINDS)[number];

function heading(text: string) {
  return `\n${pc.bold(pc.underline(text))}`;
}

function row(name: string, description: string, installed: boolean, extra = "") {
  const mark = installed ? pc.green("●") : pc.dim("○");
  return `  ${mark} ${pc.cyan(name.padEnd(20))} ${description}${extra ? pc.dim(`  ${extra}`) : ""}`;
}

function render(registry: Registry, kinds: Kind[], project: ProjectManifest | null) {
  const out: string[] = [];
  if (kinds.includes("presets")) {
    out.push(heading("Presets"));
    for (const preset of registry.presets.values()) {
      out.push(
        row(
          preset.name,
          preset.description,
          project?.preset === preset.name,
          `${preset.modules.length} modules`,
        ),
      );
    }
  }
  if (kinds.includes("modules")) {
    const byCategory = new Map<string, string[]>();
    for (const m of registry.modules.values()) {
      const extra = m.requires.length ? `requires ${m.requires.join(", ")}` : "";
      const list = byCategory.get(m.category) ?? [];
      list.push(row(m.name, m.description, Boolean(project?.modules[m.name]), extra));
      byCategory.set(m.category, list);
    }
    for (const [category, rows] of byCategory) out.push(heading(`Modules · ${category}`), ...rows);
  }
  if (kinds.includes("sections")) {
    const byGroup = new Map<string, string[]>();
    for (const s of registry.sections.values()) {
      const list = byGroup.get(s.group) ?? [];
      list.push(row(s.name, s.description, Boolean(project?.sections[s.name])));
      byGroup.set(s.group, list);
    }
    out.push(heading("Sections (add with section:<name>)"));
    for (const [group, rows] of byGroup) out.push(`  ${pc.dim(group)}`, ...rows);
  }
  if (kinds.includes("ui")) {
    out.push(heading("UI primitives (add with ui:<name>)"));
    for (const u of registry.ui.values())
      out.push(row(u.name, u.description, Boolean(project?.ui[u.name])));
  }
  if (kinds.includes("themes")) {
    out.push(heading("Themes"));
    for (const t of registry.themes.values())
      out.push(row(t.name, t.description, project?.theme === t.name));
  }
  return out.join("\n");
}

export const list = defineCommand({
  meta: { name: "list", description: "Show modules, sections, UI primitives, presets and themes" },
  args: {
    kind: { type: "positional", required: false, description: `One of: ${KINDS.join(", ")}` },
    json: { type: "boolean", default: false, description: "Machine-readable output" },
    ...registryArgs,
  },
  async run({ args }) {
    const project = await findProjectRoot()
      .then(readManifest)
      .catch(() => null);
    const registry = await loadRegistry(args, project ?? undefined);
    const kinds: Kind[] =
      args.kind && KINDS.includes(args.kind as Kind) ? [args.kind as Kind] : [...KINDS];

    if (args.json) {
      const data = {
        registry: { version: registry.version, source: registry.source },
        presets: kinds.includes("presets") ? [...registry.presets.values()] : undefined,
        modules: kinds.includes("modules")
          ? [...registry.modules.values()].map(
              ({ name, title, description, category, requires, routes, env }) => ({
                name,
                title,
                description,
                category,
                requires,
                routes,
                env: env.map((e) => e.name),
                installed: Boolean(project?.modules[name]),
              }),
            )
          : undefined,
        sections: kinds.includes("sections")
          ? [...registry.sections.values()].map(({ name, title, description, group }) => ({
              name,
              title,
              description,
              group,
            }))
          : undefined,
        ui: kinds.includes("ui")
          ? [...registry.ui.values()].map(({ name, description }) => ({ name, description }))
          : undefined,
        themes: kinds.includes("themes")
          ? [...registry.themes.values()].map(({ name, title, description }) => ({
              name,
              title,
              description,
            }))
          : undefined,
      };
      process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);
      return;
    }
    process.stdout.write(`${render(registry, kinds, project)}\n\n`);
    if (project) process.stdout.write(`${pc.green("●")} installed in this project\n\n`);
  },
});
