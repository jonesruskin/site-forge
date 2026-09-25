import type { Registry } from "./registry/registry";
import type { ModuleManifest, SectionManifest, UiManifest } from "./schema/manifest";
import { CliError } from "./utils/errors";

export type Selection = {
  modules: string[];
  sections: string[];
  ui: string[];
};

export type Installed = {
  modules: Record<string, ModuleManifest>;
  sections: Record<string, SectionManifest>;
  ui: Record<string, UiManifest>;
};

export type Plan = {
  /** Every module the project will have, dependencies first. */
  modules: ModuleManifest[];
  sections: SectionManifest[];
  ui: UiManifest[];
  /** Items not installed yet. */
  added: Selection;
  /** Modules pulled in only because something required them. */
  implied: string[];
};

export const emptyInstalled = (): Installed => ({ modules: {}, sections: {}, ui: {} });

/**
 * Expands a selection with everything it requires, orders modules so that
 * dependencies come first, and rejects conflicts and cycles.
 */
export function resolvePlan(
  registry: Registry,
  requested: Selection,
  installed: Installed = emptyInstalled(),
): Plan {
  const lookupModule = (name: string) =>
    registry.modules.get(name) ?? installed.modules[name] ?? registry.getModule(name);

  // ── modules: depth-first topological sort ──────────────────────────────
  const ordered: ModuleManifest[] = [];
  const state = new Map<string, "visiting" | "done">();
  const visit = (name: string, trail: string[]) => {
    const status = state.get(name);
    if (status === "done") return;
    if (status === "visiting") {
      throw new CliError(`Circular module requirement: ${[...trail, name].join(" → ")}`);
    }
    state.set(name, "visiting");
    const manifest = lookupModule(name);
    for (const dependency of manifest.requires) visit(dependency, [...trail, name]);
    state.set(name, "done");
    ordered.push(manifest);
  };

  const roots = [...Object.keys(installed.modules), ...requested.modules];
  for (const name of roots) visit(name, []);

  const names = new Set(ordered.map((m) => m.name));
  for (const manifest of ordered) {
    for (const conflict of manifest.conflicts) {
      if (names.has(conflict)) {
        throw new CliError(
          `Module "${manifest.name}" conflicts with "${conflict}". Install only one of them.`,
        );
      }
    }
  }

  // ── sections (may compose other sections) ─────────────────────────────
  const sectionNames = new Set<string>();
  const addSection = (name: string) => {
    if (sectionNames.has(name)) return;
    sectionNames.add(name);
    const manifest =
      registry.sections.get(name) ?? installed.sections[name] ?? registry.getSection(name);
    manifest.sections.forEach(addSection);
  };
  [
    ...Object.keys(installed.sections),
    ...requested.sections,
    ...ordered.flatMap((m) => m.sections),
  ].forEach(addSection);
  const sections = [...sectionNames]
    .sort()
    .map(
      (name) =>
        registry.sections.get(name) ?? installed.sections[name] ?? registry.getSection(name),
    );

  // ── ui primitives (may compose other primitives) ──────────────────────
  const uiNames = new Set<string>();
  const addUi = (name: string) => {
    if (uiNames.has(name)) return;
    uiNames.add(name);
    const manifest = registry.ui.get(name) ?? installed.ui[name] ?? registry.getUi(name);
    manifest.ui.forEach(addUi);
  };
  [
    ...Object.keys(installed.ui),
    ...requested.ui,
    ...ordered.flatMap((m) => m.ui),
    ...sections.flatMap((s) => s.ui),
  ].forEach(addUi);
  const ui = [...uiNames]
    .sort()
    .map((name) => registry.ui.get(name) ?? installed.ui[name] ?? registry.getUi(name));

  const requestedSet = new Set(requested.modules);
  const added: Selection = {
    modules: ordered.map((m) => m.name).filter((n) => !installed.modules[n]),
    sections: sections.map((s) => s.name).filter((n) => !installed.sections[n]),
    ui: ui.map((u) => u.name).filter((n) => !installed.ui[n]),
  };

  return {
    modules: ordered,
    sections,
    ui,
    added,
    implied: added.modules.filter((n) => !requestedSet.has(n)),
  };
}

/** Installed modules that require `name` (directly). */
export function dependentsOf(name: string, modules: Record<string, ModuleManifest>) {
  return Object.values(modules)
    .filter((m) => m.requires.includes(name))
    .map((m) => m.name);
}
