import * as p from "@clack/prompts";
import { defineCommand } from "citty";

import { applyPlan } from "../project/apply";
import { findProjectRoot, installedFrom, readManifest } from "../project/project";
import { resolvePlan, type Selection } from "../resolve";
import { detectPackageManager, runVisible } from "../utils/exec";
import { formatList, log, pc } from "../utils/log";
import { formatFiles, loadRegistry, registryArgs } from "./shared";

export const add = defineCommand({
  meta: {
    name: "add",
    description: "Add modules, sections (section:<name>) or UI primitives (ui:<name>)",
  },
  args: {
    items: {
      type: "positional",
      required: true,
      description: "Names to add, e.g. blog section:pricing ui:dialog",
    },
    overwrite: {
      type: "boolean",
      default: false,
      description: "Replace files that have local changes",
    },
    install: {
      type: "boolean",
      default: true,
      description: "Install new dependencies (--no-install to skip)",
    },
    "dry-run": {
      type: "boolean",
      default: false,
      description: "Show what would change without writing",
    },
    ...registryArgs,
  },
  async run({ args }) {
    const projectDir = await findProjectRoot();
    const manifest = await readManifest(projectDir);
    const registry = await loadRegistry(args, manifest);

    const requested: Selection = { modules: [], sections: [], ui: [] };
    const names = [args.items, ...(args._ ?? [])]
      .flatMap((value) => String(value).split(","))
      .filter(Boolean);
    for (const input of new Set(names)) {
      const { kind, name } = registry.resolveName(input);
      if (kind === "module") requested.modules.push(name);
      if (kind === "section") requested.sections.push(name);
      if (kind === "ui") requested.ui.push(name);
    }

    const plan = resolvePlan(registry, requested, installedFrom(manifest));
    const { added } = plan;
    const total = added.modules.length + added.sections.length + added.ui.length;
    if (total === 0) {
      log.info(
        "Everything requested is already installed. Use `site diff <name>` to compare with the registry.",
      );
      return;
    }

    const lines = [
      added.modules.length && `modules   ${formatList(added.modules)}`,
      plan.implied.length && `${pc.dim("  implied")} ${plan.implied.join(", ")}`,
      added.sections.length && `sections  ${formatList(added.sections)}`,
      added.ui.length && `ui        ${formatList(added.ui)}`,
    ].filter(Boolean);
    p.note(lines.join("\n"), "Adding");

    if (args["dry-run"]) {
      const files = [...plan.ui, ...plan.sections, ...plan.modules]
        .filter((item) => [...added.modules, ...added.sections, ...added.ui].includes(item.name))
        .flatMap((item) => item.files.map((f) => f.to));
      log.message(`Would write ${files.length} files:\n${files.map((f) => `  ${f}`).join("\n")}`);
      return;
    }

    const result = await applyPlan({
      registry,
      projectDir,
      manifest,
      plan,
      selection: added,
      overwrite: args.overwrite,
    });

    if (result.dependencies.length && args.install) {
      const pm = detectPackageManager();
      log.step(`Installing ${result.dependencies.length} new dependencies with ${pm}`);
      if (!(await runVisible(pm, ["install"], projectDir))) {
        log.warn(`Install failed. Run \`${pm} install\` to retry.`);
      }
    } else if (result.dependencies.length) {
      log.info(
        `New dependencies: ${result.dependencies.join(", ")}. Run your package manager's install.`,
      );
    }
    await formatFiles(projectDir, result.touched);

    if (result.skipped.length) {
      log.warn(
        `Kept ${result.skipped.length} locally modified file(s):\n${result.skipped.map((s) => `  ${s.path}`).join("\n")}\nRe-run with --overwrite to replace them.`,
      );
    }
    for (const { module, notes } of result.postInstall)
      p.note(notes.map((n) => `• ${n}`).join("\n"), module);
    const envCount = plan.modules
      .filter((m) => added.modules.includes(m.name))
      .flatMap((m) => m.env).length;
    if (envCount)
      log.info(`${envCount} env var(s) documented in .env.example. Check with \`site doctor\`.`);
    log.success(`Added ${total} item(s). ${result.written.length} file(s) written.`);
  },
});
