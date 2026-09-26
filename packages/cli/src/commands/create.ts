import { readdir } from "node:fs/promises";
import path from "node:path";

import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import { builders } from "magicast";

import { generateReadme } from "../generate/readme";
import { applyPlan, orderedModules, pnpmWorkspace } from "../project/apply";
import { readPackageJson, writeManifest, writePackageJson } from "../project/project";
import { copyStarter } from "../project/starter";
import { applyTheme } from "../project/theme";
import type { Registry } from "../registry/registry";
import { resolvePlan, type Selection } from "../resolve";
import type { ProjectManifest } from "../schema/manifest";
import { CliError } from "../utils/errors";
import {
  detectPackageManager,
  hasCommand,
  packageManagerSpec,
  run,
  runVisible,
  type PackageManager,
} from "../utils/exec";
import { exists, readText, sha256, writeText } from "../utils/fs";
import { formatList, isInteractive, log, pc } from "../utils/log";
import { adaptCommands, runScript } from "../utils/package-manager";
import { slugify, titleCase } from "../utils/strings";
import { CLI_NAME, CLI_VERSION } from "../version";
import { formatFiles, loadRegistry, registryArgs, splitList } from "./shared";

const cancelled = () => {
  p.cancel("Cancelled.");
  process.exit(0);
};

function unwrap<T>(value: T): Exclude<T, symbol> {
  if (p.isCancel(value)) cancelled();
  return value as Exclude<T, symbol>;
}

async function isEmptyDir(dir: string) {
  if (!(await exists(dir))) return true;
  const entries = await readdir(dir);
  return entries.filter((e) => e !== ".git" && e !== ".DS_Store").length === 0;
}

const CATEGORY_LABELS: Record<string, string> = {
  "seo-ops": "SEO & ops",
  content: "Content",
  marketing: "Marketing",
  saas: "SaaS",
  portfolio: "Portfolio",
  commerce: "Commerce",
  infrastructure: "Infrastructure",
  developer: "Developer experience",
};

async function chooseModules(registry: Registry, preselected: string[]) {
  const groups: Record<string, { value: string; label: string; hint: string }[]> = {};
  for (const m of registry.modules.values()) {
    const label = CATEGORY_LABELS[m.category] ?? m.category;
    (groups[label] ??= []).push({ value: m.name, label: m.name, hint: m.description });
  }
  return unwrap(
    await p.groupMultiselect({
      message: "Which modules should the site include? (dependencies are added automatically)",
      options: groups,
      initialValues: preselected,
      required: false,
    }),
  );
}

/** What to do when `gh repo create` fails; Codespaces needs a different login. */
export function githubCreateHint(name: string, visibility: string, env = process.env) {
  const retry = `gh repo create ${name} --${visibility} --source . --remote origin --push`;
  if (env.CODESPACES === "true") {
    return [
      "Couldn't create the GitHub repository. In a Codespace, gh uses the Codespace's own token,",
      "which can only access the repository the Codespace was opened from. Your site is ready;",
      "to publish it, run inside the project:",
      "  unset GITHUB_TOKEN   # use your own login in this terminal",
      "  gh auth login",
      `  ${retry}`,
    ].join("\n");
  }
  return `Couldn't create the GitHub repository. Run \`gh auth login\`, then inside the project: ${retry}`;
}

export const createArgs = {
  dir: { type: "positional", required: false, description: "Directory to create the site in" },
  preset: { type: "string", description: "Preset to start from (see `site list presets`)" },
  modules: { type: "string", description: "Comma-separated modules to add on top of the preset" },
  sections: { type: "string", description: "Comma-separated sections to add" },
  ui: { type: "string", description: "Comma-separated UI primitives to add" },
  theme: {
    type: "string",
    description: "Theme to apply (neutral, editorial, playful, terminal …)",
  },
  name: { type: "string", description: "Site name" },
  description: { type: "string", description: "One-sentence site description" },
  url: { type: "string", description: "Production URL, e.g. https://example.com" },
  author: { type: "string", description: "Author or company name" },
  install: {
    type: "boolean",
    default: true,
    description: "Install dependencies (--no-install to skip)",
  },
  git: {
    type: "boolean",
    default: true,
    description: "Initialise a git repository (--no-git to skip)",
  },
  github: {
    type: "string",
    description: "Create a GitHub repo with the gh CLI: private | public (interactive runs ask)",
  },
  pm: {
    type: "string",
    description: "Package manager: pnpm | npm | yarn | bun (default: the one running this)",
  },
  yes: {
    type: "boolean",
    alias: "y",
    default: false,
    description: "Accept defaults, never prompt",
  },
  "cli-spec": {
    type: "string",
    description: `Version spec for the ${CLI_NAME} devDependency (default: ^${CLI_VERSION})`,
  },
  ...registryArgs,
} as const;

export const create = defineCommand({
  meta: { name: "create", description: "Create a new site from the registry" },
  args: createArgs,
  async run({ args }) {
    const interactive = isInteractive() && !args.yes;
    p.intro(pc.inverse(" create-site "));

    // ── where ────────────────────────────────────────────────────────────
    let dirInput = args.dir;
    if (!dirInput) {
      if (!interactive)
        throw new CliError("Missing target directory.", "Usage: create-site <dir> [--preset saas]");
      dirInput = unwrap(
        await p.text({
          message: "Where should the site be created?",
          placeholder: "my-site",
          defaultValue: "my-site",
        }),
      );
    }
    const projectDir = path.resolve(dirInput);
    if (!(await isEmptyDir(projectDir))) {
      throw new CliError(`${projectDir} is not empty.`, "Pick a new directory name.");
    }

    const registry = await loadRegistry(args);

    // ── what ─────────────────────────────────────────────────────────────
    let presetName = args.preset ?? null;
    if (!presetName && interactive && registry.presets.size > 0) {
      presetName =
        unwrap(
          await p.select<string>({
            message: "Start from a preset?",
            options: [
              ...[...registry.presets.values()].map((preset) => ({
                value: preset.name,
                label: preset.title,
                hint: preset.description,
              })),
              { value: "", label: "Nothing", hint: "the bare starter; add modules next" },
            ],
          }),
        ) || null;
    }
    const preset = presetName ? registry.getPreset(presetName) : null;

    let moduleNames = [...(preset?.modules ?? []), ...splitList(args.modules)];
    if (interactive && !args.modules) moduleNames = await chooseModules(registry, moduleNames);

    let themeName = args.theme ?? preset?.theme ?? "neutral";
    if (interactive && !args.theme && registry.themes.size > 1) {
      themeName = unwrap(
        await p.select<string>({
          message: "Theme (only a starting point; every token is yours to change)",
          initialValue: themeName,
          options: [...registry.themes.values()].map((theme) => ({
            value: theme.name,
            label: theme.title,
            hint: theme.description,
          })),
        }),
      );
    }
    const theme = registry.getTheme(themeName);

    const selection: Selection = {
      modules: moduleNames,
      sections: [...(preset?.sections ?? []), ...splitList(args.sections)],
      ui: [...(preset?.ui ?? []), ...splitList(args.ui)],
    };
    const plan = resolvePlan(registry, selection);

    // ── who ──────────────────────────────────────────────────────────────
    const defaultName = titleCase(path.basename(projectDir));
    const ask = async (
      message: string,
      value: string | undefined,
      fallback: string,
      placeholder?: string,
    ) => {
      if (value !== undefined || !interactive) return value ?? fallback;
      return unwrap(
        await p.text({ message, placeholder: placeholder ?? fallback, defaultValue: fallback }),
      );
    };
    const siteName = await ask("Site name", args.name, defaultName);
    const description = await ask(
      "One-sentence description",
      args.description,
      `${siteName} website.`,
    );
    const url = (await ask("Production URL", args.url, "https://example.com")).replace(/\/+$/, "");
    const author = await ask("Author or company", args.author, siteName);

    const pm = (args.pm as PackageManager | undefined) ?? detectPackageManager();

    if (interactive) {
      const summary = [
        `${pc.dim("directory")}  ${projectDir}`,
        `${pc.dim("preset")}     ${preset?.title ?? "none"}`,
        `${pc.dim("theme")}      ${theme.title}`,
        `${pc.dim("modules")}    ${plan.modules.length ? formatList(plan.modules.map((m) => m.name)) : "none"}`,
        ...(plan.implied.length ? [`${pc.dim("  (implied)")} ${plan.implied.join(", ")}`] : []),
        `${pc.dim("sections")}   ${plan.sections.length ? plan.sections.map((s) => s.name).join(", ") : "none"}`,
      ].join("\n");
      p.note(summary, "Plan");
      if (!unwrap(await p.confirm({ message: "Create the site?", initialValue: true })))
        cancelled();
    }

    // ── build it ─────────────────────────────────────────────────────────
    const spinner = p.spinner();
    spinner.start("Copying starter");

    const manifest: ProjectManifest = {
      version: 1,
      registry: {
        source: registry.source.source,
        ref: registry.source.ref,
        commit: registry.source.commit,
        version: registry.version,
      },
      cli: CLI_VERSION,
      core: {
        version: registry.core.version,
        slots: registry.core.slots,
        env: registry.core.env,
        allowBuilds: registry.core.allowBuilds,
      },
      preset: preset?.name ?? null,
      theme: theme.name,
      modules: {},
      ui: {},
      sections: {},
      files: {},
    };

    await copyStarter(registry, projectDir, manifest);
    // The starter's AGENTS.md is written for pnpm; match the project's package manager.
    const agentsFile = path.join(projectDir, "AGENTS.md");
    if (pm !== "pnpm" && (await exists(agentsFile))) {
      const agents = adaptCommands(await readText(agentsFile), pm);
      await writeText(agentsFile, agents);
      manifest.files["AGENTS.md"] = { owner: "starter", hash: sha256(agents) };
    }

    const pkg = await readPackageJson(projectDir);
    pkg.name = slugify(path.basename(projectDir)) || "site";
    pkg.version = "0.1.0";
    pkg.scripts = { ...pkg.scripts, site: "site" };
    pkg.devDependencies = {
      ...pkg.devDependencies,
      [CLI_NAME]: args["cli-spec"] ?? `^${CLI_VERSION}`,
    };
    if (pm !== "bun") {
      const spec = await packageManagerSpec(pm);
      if (spec) pkg.packageManager = spec;
    }
    await writePackageJson(projectDir, pkg);

    if (pm === "pnpm") {
      await writeText(
        path.join(projectDir, "pnpm-workspace.yaml"),
        pnpmWorkspace(registry.core.allowBuilds),
      );
    }

    await applyTheme(projectDir, theme);
    for (const file of ["src/styles/theme.css", "src/lib/fonts.ts"]) {
      const content = await readText(path.join(projectDir, file));
      manifest.files[file] = { owner: `theme:${theme.name}`, hash: sha256(content) };
    }

    await writeText(
      path.join(projectDir, "README.md"),
      generateReadme({ name: siteName, description, packageManager: pm, manifest, modules: [] }),
    );
    await writeManifest(projectDir, manifest);

    spinner.message("Adding modules and sections");
    const result = await applyPlan({
      registry,
      projectDir,
      manifest,
      plan,
      selection: plan.added,
      preset,
      overwrite: true,
      siteConfig: {
        set: {
          name: siteName,
          description,
          url: builders.raw(`process.env.NEXT_PUBLIC_SITE_URL ?? "${url}"`),
        },
        setPaths: { "author.name": author, "seo.titleTemplate": `%s · ${siteName}` },
      },
    });
    spinner.stop(
      `Created ${pc.bold(siteName)} with ${orderedModules(manifest).length} modules, ${plan.sections.length} sections, ${plan.ui.length} UI primitives`,
    );

    // ── install, git, GitHub ─────────────────────────────────────────────
    if (args.install) {
      log.step(`Installing dependencies with ${pm}`);
      const ok = await runVisible(pm, ["install"], projectDir);
      if (!ok)
        log.warn(`Dependency install failed. Run \`${pm} install\` inside the project to retry.`);
      else await formatFiles(projectDir, result.touched);
    }

    if (args.git && (await hasCommand("git"))) {
      const inRepo = (await run("git", ["rev-parse", "--is-inside-work-tree"], projectDir)).ok;
      if (!inRepo) {
        await run("git", ["init", "-b", "main"], projectDir);
        await run("git", ["add", "-A"], projectDir);
        const commit = await run(
          "git",
          ["commit", "-m", "Initial commit from site-forge"],
          projectDir,
        );
        if (commit.ok) log.success("Initialised git repository");
        else
          log.warn("Initialised git, but the first commit failed (is git user.name/email set?).");
      }
    }

    let github = args.github;
    if (!github && interactive && args.git && (await hasCommand("gh"))) {
      const choice = unwrap(
        await p.select<string>({
          message: "Create a GitHub repository with the gh CLI?",
          options: [
            { value: "", label: "No" },
            { value: "private", label: "Yes, private" },
            { value: "public", label: "Yes, public" },
          ],
        }),
      );
      github = choice || undefined;
    }
    if (github) {
      if (!["private", "public"].includes(github))
        throw new CliError("--github must be private or public.");
      if (!(await hasCommand("gh"))) {
        log.warn(
          "The gh CLI is not installed. Create the repository manually, then `git remote add origin …`.",
        );
      } else {
        const ok = await runVisible(
          "gh",
          [
            "repo",
            "create",
            pkg.name,
            `--${github}`,
            "--source",
            ".",
            "--remote",
            "origin",
            "--push",
          ],
          projectDir,
        );
        if (!ok) log.warn(githubCreateHint(pkg.name ?? "site", github));
      }
    }

    // ── what next ────────────────────────────────────────────────────────
    for (const { module, notes } of result.postInstall) {
      p.note(notes.map((n) => `• ${n}`).join("\n"), `${module}`);
    }
    if (result.skipped.length) {
      log.warn(
        `Skipped ${result.skipped.length} file(s):\n${result.skipped.map((s) => `  ${s.path}: ${s.reason}`).join("\n")}`,
      );
    }
    const relative = path.relative(process.cwd(), projectDir) || ".";
    const runCmd = runScript(pm);
    p.outro(
      [
        "Next steps:",
        `  cd ${relative}`,
        ...(args.install ? [] : [`  ${pm} install`]),
        `  ${runCmd} dev`,
        "",
        `Tune the look in ${pc.cyan("src/styles/theme.css")}, content in ${pc.cyan("site.config.ts")}.`,
        `Check env vars any time with ${pc.cyan(`${runCmd} site doctor`)}.`,
      ].join("\n"),
    );
  },
});
