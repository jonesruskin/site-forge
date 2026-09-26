import path from "node:path";

import * as p from "@clack/prompts";
import { defineCommand } from "citty";

import { applyPlan } from "../project/apply";
import { compareVersions, installedItems, itemDrift } from "../project/drift";
import { findProjectRoot, installedFrom, readManifest, writeManifest } from "../project/project";
import { resolvePlan, type Selection } from "../resolve";
import { CliError } from "../utils/errors";
import { detectPackageManager, runVisible } from "../utils/exec";
import { remove } from "../utils/fs";
import { formatList, log, pc } from "../utils/log";
import { formatFiles, loadRegistry, registryArgs } from "./shared";

export const update = defineCommand({
  meta: {
    name: "update",
    description:
      "Update installed items to the registry's latest versions, keeping your local edits",
  },
  args: {
    items: {
      type: "positional",
      required: false,
      description: "Items to update (default: everything with a newer version)",
    },
    overwrite: { type: "boolean", default: false, description: "Replace files you have modified" },
    install: {
      type: "boolean",
      default: true,
      description: "Install new dependencies (--no-install to skip)",
    },
    ...registryArgs,
  },
  async run({ args }) {
    const projectDir = await findProjectRoot();
    const manifest = await readManifest(projectDir);
    const registry = await loadRegistry(args, manifest);
    const all = installedItems(manifest);

    const names = [args.items, ...(args._ ?? [])]
      .filter(Boolean)
      .flatMap((v) => String(v).split(","));
    const targets = names.length
      ? names.map((input) => {
          const [prefix, name] = input.includes(":") ? input.split(":", 2) : [null, input];
          const item = all.find((i) => i.name === name && (!prefix || i.kind === prefix));
          if (!item) throw new CliError(`"${input}" is not installed.`);
          return item;
        })
      : all.filter((item) => {
          const latest =
            item.kind === "module"
              ? registry.modules.get(item.name)
              : item.kind === "section"
                ? registry.sections.get(item.name)
                : registry.ui.get(item.name);
          return latest && compareVersions(latest.version, item.version) > 0;
        });

    if (targets.length === 0) {
      log.success("Everything is up to date with the registry.");
      return;
    }

    // Files dropped upstream are deleted if you never touched them.
    const drifts = await Promise.all(
      targets.map((item) => itemDrift(projectDir, manifest, registry, item)),
    );
    const obsolete = drifts.flatMap((d) =>
      d.files.filter((f) => f.upstream === "removed" && f.local === "unchanged").map((f) => f.path),
    );

    // Re-resolve the targets as if new, so new requirements come along too.
    const current = installedFrom(manifest);
    const installed = {
      modules: { ...current.modules },
      sections: { ...current.sections },
      ui: { ...current.ui },
    };
    const selection: Selection = { modules: [], sections: [], ui: [] };
    for (const item of targets) {
      const key = item.kind === "module" ? "modules" : item.kind === "section" ? "sections" : "ui";
      selection[key].push(item.name);
      delete installed[key][item.name];
    }
    const plan = resolvePlan(registry, selection, installed);
    p.note(
      targets
        .map((item) => {
          const drift = drifts.find((d) => d.item === item)!;
          return `${pc.cyan(`${item.kind}:${item.name}`.padEnd(28))} ${item.version} → ${drift.latest ?? "?"}`;
        })
        .join("\n"),
      "Updating",
    );

    const result = await applyPlan({
      registry,
      projectDir,
      manifest,
      plan,
      selection: plan.added,
      overwrite: args.overwrite,
    });
    if (obsolete.length) {
      for (const file of obsolete) {
        await remove(path.join(projectDir, file));
        delete manifest.files[file];
      }
      await writeManifest(projectDir, manifest);
    }

    if (result.dependencies.length && args.install) {
      const pm = detectPackageManager();
      log.step(`Installing ${result.dependencies.length} new dependencies with ${pm}`);
      if (!(await runVisible(pm, ["install"], projectDir)))
        log.warn(`Install failed. Run \`${pm} install\` to retry.`);
    }
    await formatFiles(projectDir, result.touched);
    if (result.skipped.length) {
      log.warn(
        `Kept your version of ${result.skipped.length} file(s):\n${result.skipped.map((s) => `  ${s.path}`).join("\n")}\nSee the upstream changes with \`site diff <item>\`; take them with --overwrite.`,
      );
    }
    log.success(
      `Updated ${formatList(targets.map((t) => t.name))}: ${result.written.length} file(s) written${obsolete.length ? `, ${obsolete.length} removed` : ""}.`,
    );
  },
});
