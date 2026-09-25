import { generateCode, parseModule } from "magicast";
import { getDefaultExportOptions } from "magicast/helpers";

import type { NavEntry } from "../schema/manifest";
import { CliError } from "../utils/errors";

/* eslint-disable @typescript-eslint/no-explicit-any -- magicast proxies are untyped */

export type SiteConfigChanges = {
  /** Scalar top-level values to overwrite (name, description …). */
  set?: Record<string, unknown>;
  /** Nested values to overwrite by dotted path, e.g. "author.name" or "seo.titleTemplate". */
  setPaths?: Record<string, unknown>;
  nav?: NavEntry[];
  /** Top-level blocks added only when missing. */
  blocks?: Record<string, unknown>;
  /** Blocks deep-merged over existing ones (presets). */
  merge?: Record<string, unknown>;
  features?: Record<string, boolean>;
};

export type SiteConfigRemoval = {
  nav?: NavEntry[];
  blocks?: string[];
  features?: string[];
};

function load(code: string) {
  const mod = parseModule(code);
  let config: any;
  try {
    config = getDefaultExportOptions(mod);
  } catch {
    config = undefined;
  }
  if (!config || typeof config !== "object") {
    throw new CliError(
      "Could not update site.config.ts automatically: it must `export default defineSite({ ... })`.",
      "Apply the changes by hand — they are listed below.",
    );
  }
  return { mod, config };
}

/**
 * recast separates multi-line properties with blank lines; the config reads better
 * without them. Only the object literal passed to defineSite() is touched.
 */
export function tidy(code: string) {
  const start = code.indexOf("defineSite(");
  const end = code.lastIndexOf("});");
  if (start === -1 || end === -1) return code;
  const body = code.slice(start, end).replace(/\n[ \t]*\n(?=[ \t]*\S)/g, "\n");
  return code.slice(0, start) + body + code.slice(end);
}

function toPlain(value: any): any {
  if (Array.isArray(value)) return value.map(toPlain);
  if (value && typeof value === "object" && "$type" in value)
    return JSON.parse(JSON.stringify(value));
  return value;
}

function asArray(proxy: any): any[] {
  if (!proxy) return [];
  const out: any[] = [];
  for (let i = 0; i < proxy.length; i++) out.push(proxy[i]);
  return out;
}

function ensureObject(parent: any, key: string) {
  if (parent[key] === undefined) parent[key] = {};
  return parent[key];
}

function ensureArray(parent: any, key: string) {
  if (parent[key] === undefined) parent[key] = [];
  return parent[key];
}

function addNav(config: any, entry: NavEntry) {
  const nav = ensureObject(config, "nav");
  const link: Record<string, string> = { label: entry.label, href: entry.href };
  if (entry.icon) link.icon = entry.icon;

  if (entry.location === "footer") {
    const groups = ensureArray(nav, "footer");
    const title = entry.group ?? "Links";
    let group = asArray(groups).find((g) => g.title === title);
    if (!group) {
      groups.push({ title, links: [] });
      group = groups[groups.length - 1];
    }
    const links = ensureArray(group, "links");
    if (!asArray(links).some((l) => l.href === entry.href)) links.push(link);
    return;
  }

  const list = ensureArray(nav, entry.location);
  if (!asArray(list).some((l) => l.href === entry.href)) list.push(link);
}

function removeNav(config: any, entry: NavEntry) {
  const nav = config.nav;
  if (!nav) return;
  if (entry.location === "footer") {
    const groups = nav.footer;
    asArray(groups).forEach((group, groupIndex) => {
      const index = asArray(group.links).findIndex((l) => l.href === entry.href);
      if (index >= 0) group.links.splice(index, 1);
      if (group.links && group.links.length === 0 && group.title === (entry.group ?? "Links")) {
        groups.splice(groupIndex, 1);
      }
    });
    return;
  }
  const list = nav[entry.location];
  const index = asArray(list).findIndex((l) => l.href === entry.href);
  if (index >= 0) list.splice(index, 1);
}

function deepMerge(target: any, value: Record<string, unknown>) {
  for (const [key, next] of Object.entries(value)) {
    const isPlainObject = next && typeof next === "object" && !Array.isArray(next);
    if (
      isPlainObject &&
      target[key] &&
      typeof target[key] === "object" &&
      !Array.isArray(toPlain(target[key]))
    ) {
      deepMerge(target[key], next as Record<string, unknown>);
    } else {
      target[key] = next;
    }
  }
}

export function updateSiteConfig(code: string, changes: SiteConfigChanges) {
  const { mod, config } = load(code);

  for (const [key, value] of Object.entries(changes.set ?? {})) config[key] = value;

  for (const [dotted, value] of Object.entries(changes.setPaths ?? {})) {
    const keys = dotted.split(".");
    const last = keys.pop()!;
    let target = config;
    for (const key of keys) target = ensureObject(target, key);
    target[last] = value;
  }

  for (const [key, value] of Object.entries(changes.blocks ?? {})) {
    if (config[key] === undefined) config[key] = value;
  }

  if (changes.merge) deepMerge(config, changes.merge);

  if (changes.features && Object.keys(changes.features).length > 0) {
    const features = ensureObject(config, "features");
    for (const [flag, enabled] of Object.entries(changes.features)) {
      if (features[flag] === undefined) features[flag] = enabled;
    }
  }

  for (const entry of changes.nav ?? []) addNav(config, entry);

  return tidy(generateCode(mod).code);
}

export function removeFromSiteConfig(code: string, removal: SiteConfigRemoval) {
  const { mod, config } = load(code);
  for (const entry of removal.nav ?? []) removeNav(config, entry);
  for (const key of removal.blocks ?? []) delete config[key];
  if (config.features) for (const flag of removal.features ?? []) delete config.features[flag];
  return tidy(generateCode(mod).code);
}

/** Human-readable description of changes, printed when the codemod can't run. */
export function describeChanges(changes: SiteConfigChanges) {
  const lines: string[] = [];
  for (const entry of changes.nav ?? []) {
    lines.push(
      `nav.${entry.location}${entry.group ? ` (${entry.group})` : ""}: { label: "${entry.label}", href: "${entry.href}" }`,
    );
  }
  for (const [key, value] of Object.entries(changes.blocks ?? {}))
    lines.push(`${key}: ${JSON.stringify(value)}`);
  for (const [flag, enabled] of Object.entries(changes.features ?? {}))
    lines.push(`features.${flag}: ${enabled}`);
  return lines;
}
