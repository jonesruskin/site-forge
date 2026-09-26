import * as p from "@clack/prompts";
import { defineCommand } from "citty";

import { findProjectRoot, readManifest } from "../project/project";
import { applyRemoval, assertRemovable, planRemoval } from "../project/remove";
import type { Selection } from "../resolve";
import { CliError } from "../utils/errors";
import { detectPackageManager, runVisible } from "../utils/exec";
import { formatList, isInteractive, log, pc } from "../utils/log";

/** "blog", "section:faq", "ui:dialog" → kind + name, using only what's installed. */
function parseInstalled(
  input: string,
  installed: { modules: string[]; sections: string[]; ui: string[] },
) {
  const [prefix, rest] = input.includes(":")
    ? (input.split(":", 2) as [string, string])
    : [null, input];
  const lookups = [
    { kind: "modules" as const, match: prefix === null || prefix === "module" },
    { kind: "sections" as const, match: prefix === null || prefix === "section" },
    { kind: "ui" as const, match: prefix === null || prefix === "ui" },
  ];
  for (const { kind, match } of lookups)
    if (match && installed[kind].includes(rest)) return { kind, name: rest };
  throw new CliError(
    `"${input}" is not installed.`,
    "Run `site list`: installed items are marked ●.",
  );
}

export const remove = defineCommand({
  meta: {
    name: "remove",
    description:
      "Remove modules, sections (section:<name>) or UI primitives (ui:<name>) — works offline",
  },
  args: {
    items: {
      type: "positional",
      required: true,
      description: "Names to remove, e.g. blog section:faq",
    },
    force: { type: "boolean", default: false, description: "Also delete files you have modified" },
    "dry-run": {
      type: "boolean",
      default: false,
      description: "Show what would change without writing",
    },
    yes: { type: "boolean", alias: "y", default: false, description: "Skip the confirmation" },
    install: {
      type: "boolean",
      default: true,
      description: "Prune node_modules afterwards (--no-install to skip)",
    },
  },
  async run({ args }) {
    const projectDir = await findProjectRoot();
    const manifest = await readManifest(projectDir);
    const installed = {
      modules: Object.keys(manifest.modules),
      sections: Object.keys(manifest.sections),
      ui: Object.keys(manifest.ui),
    };
    const selection: Selection = { modules: [], sections: [], ui: [] };
    const names = [args.items, ...(args._ ?? [])]
      .flatMap((v) => String(v).split(","))
      .filter(Boolean);
    for (const input of new Set(names)) {
      const { kind, name } = parseInstalled(input, installed);
      if (!selection[kind].includes(name)) selection[kind].push(name);
    }

    assertRemovable(manifest, selection);
    const plan = await planRemoval(projectDir, manifest, selection);

    const lines = [
      selection.modules.length && `modules       ${formatList(selection.modules)}`,
      selection.sections.length && `sections      ${formatList(selection.sections)}`,
      selection.ui.length && `ui            ${formatList(selection.ui)}`,
      `files         ${plan.deletable.length} to delete${plan.missing.length ? `, ${plan.missing.length} already gone` : ""}`,
      plan.modified.length &&
        `${pc.yellow("modified")}      ${plan.modified.length} ${args.force ? "will be deleted (--force)" : "will be kept (yours now)"}`,
      plan.dependencies.length && `dependencies  ${plan.dependencies.join(", ")}`,
    ].filter(Boolean);
    p.note(lines.join("\n"), "Removing");
    if (plan.modified.length)
      log.message(plan.modified.map((f) => `  ${pc.yellow("~")} ${f}`).join("\n"));

    if (args["dry-run"]) {
      log.message(plan.deletable.map((f) => `  ${pc.red("-")} ${f}`).join("\n") || "  (no files)");
      return;
    }
    if (!args.yes && isInteractive()) {
      const ok = await p.confirm({ message: "Remove these?", initialValue: true });
      if (p.isCancel(ok) || !ok) {
        p.cancel("Nothing removed.");
        return;
      }
    }

    const result = await applyRemoval(projectDir, manifest, plan, { force: args.force });
    if (result.removedDependencies.length && args.install) {
      const pm = detectPackageManager();
      log.step(`Pruning dependencies with ${pm}`);
      if (!(await runVisible(pm, ["install"], projectDir)))
        log.warn(`Install failed. Run \`${pm} install\` to retry.`);
    }
    if (result.kept.length) {
      log.warn(
        `Kept (you changed them; they're yours now):\n${result.kept.map((f) => `  ${f}`).join("\n")}`,
      );
    }
    if (plan.withTables.length) {
      log.info(
        `Database tables from ${plan.withTables.join(", ")} are still in your database. Generate a migration to drop them (\`pnpm db:generate\`) when you're sure.`,
      );
    }
    log.success(
      `Removed ${formatList([...selection.modules, ...selection.sections, ...selection.ui])}: ${result.deleted.length} file(s) deleted.`,
    );
  },
});
