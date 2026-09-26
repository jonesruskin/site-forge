import { readFile } from "node:fs/promises";
import path from "node:path";

import { defineCommand } from "citty";
import { createTwoFilesPatch } from "diff";

import { compareVersions, installedItems, itemDrift, type ItemDrift } from "../project/drift";
import { findProjectRoot, readManifest } from "../project/project";
import { CliError } from "../utils/errors";
import { log, pc } from "../utils/log";
import { loadRegistry, registryArgs } from "./shared";

function colorize(patch: string) {
  return patch
    .split("\n")
    .slice(2)
    .map((line) =>
      line.startsWith("+++") || line.startsWith("---")
        ? pc.bold(line)
        : line.startsWith("+")
          ? pc.green(line)
          : line.startsWith("-")
            ? pc.red(line)
            : line.startsWith("@@")
              ? pc.cyan(line)
              : line,
    )
    .join("\n");
}

function summary(drift: ItemDrift) {
  const modified = drift.files.filter((f) => f.local === "modified").length;
  const changed = drift.files.filter((f) => f.upstream !== "unchanged").length;
  const newer = drift.latest && compareVersions(drift.latest, drift.item.version) > 0;
  const status = !drift.latest
    ? pc.yellow("not in registry")
    : newer
      ? pc.green(`update ${drift.item.version} → ${drift.latest}`)
      : changed
        ? pc.yellow("registry files differ")
        : pc.dim("up to date");
  const edits = modified ? pc.yellow(`${modified} local edit${modified === 1 ? "" : "s"}`) : "";
  return `  ${pc.cyan(`${drift.item.kind}:${drift.item.name}`.padEnd(30))} ${drift.item.version.padEnd(8)} ${status}${edits ? `  ${edits}` : ""}`;
}

export const diff = defineCommand({
  meta: {
    name: "diff",
    description:
      "Compare installed items with the registry: what's updated upstream and what you changed",
  },
  args: {
    item: {
      type: "positional",
      required: false,
      description: "Show file diffs for one item, e.g. blog or ui:dialog",
    },
    ...registryArgs,
  },
  async run({ args }) {
    const projectDir = await findProjectRoot();
    const manifest = await readManifest(projectDir);
    const registry = await loadRegistry(args, manifest);
    const items = installedItems(manifest);

    if (!args.item) {
      const drifts = await Promise.all(
        items.map((item) => itemDrift(projectDir, manifest, registry, item)),
      );
      process.stdout.write(`${drifts.map(summary).join("\n")}\n`);
      const updates = drifts.filter(
        (d) => d.latest && compareVersions(d.latest, d.item.version) > 0,
      );
      if (updates.length)
        log.info(`Update with \`site update ${updates.map((d) => d.item.name).join(" ")}\`.`);
      else log.success("Everything is up to date with the registry.");
      return;
    }

    const input = String(args.item);
    const [prefix, name] = input.includes(":") ? input.split(":", 2) : [null, input];
    const item = items.find((i) => i.name === name && (!prefix || i.kind === prefix));
    if (!item) throw new CliError(`"${input}" is not installed.`);
    const drift = await itemDrift(projectDir, manifest, registry, item);
    process.stdout.write(`${summary(drift)}\n\n`);

    const latest =
      item.kind === "module"
        ? registry.modules.get(item.name)
        : item.kind === "section"
          ? registry.sections.get(item.name)
          : registry.ui.get(item.name);
    for (const file of drift.files) {
      const entry = latest?.files.find((e) => e.to === file.path);
      const local = await readFile(path.join(projectDir, file.path), "utf8").catch(() => "");
      const upstream = entry
        ? await readFile(registry.filePath(item.kind, item.name, entry.from), "utf8").catch(
            () => "",
          )
        : "";
      if (local === upstream) continue;
      const label =
        file.upstream === "added"
          ? "new upstream"
          : file.upstream === "removed"
            ? "removed upstream"
            : file.local === "modified"
              ? "local edits"
              : "updated upstream";
      process.stdout.write(`${pc.bold(file.path)} ${pc.dim(`(${label})`)}\n`);
      process.stdout.write(
        `${colorize(createTwoFilesPatch(`yours/${file.path}`, `registry/${file.path}`, local, upstream, "", "", { context: 3 }))}\n`,
      );
    }
  },
});
