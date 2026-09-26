import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseEnv } from "node:util";

import { defineCommand } from "citty";

import { syncGenerated } from "../project/apply";
import { compareVersions, installedItems } from "../project/drift";
import { findProjectRoot, isCliManaged, readManifest, readPackageJson } from "../project/project";
import type { EnvVar, ModuleManifest } from "../schema/manifest";
import { run } from "../utils/exec";
import { exists, readBytesIfExists, sha256 } from "../utils/fs";
import { pc } from "../utils/log";
import { CLI_VERSION } from "../version";
import { loadRegistry, registryArgs } from "./shared";

type Level = "ok" | "info" | "warn" | "error";
type Finding = { level: Level; message: string; detail?: string[] };

const ICON: Record<Level, string> = {
  ok: pc.green("✔"),
  info: pc.blue("●"),
  warn: pc.yellow("▲"),
  error: pc.red("✖"),
};

/** Variables from .env files (Next.js precedence), then the shell. */
async function loadEnv(projectDir: string, production: boolean) {
  const files = production
    ? [".env.production.local", ".env.local", ".env.production", ".env"]
    : [".env.development.local", ".env.local", ".env.development", ".env"];
  const values: Record<string, string> = {};
  for (const file of files.reverse()) {
    const text = await readFile(path.join(projectDir, file), "utf8").catch(() => null);
    if (text !== null) Object.assign(values, parseEnv(text));
  }
  for (const [key, value] of Object.entries(process.env))
    if (value !== undefined) values[key] = value;
  return values;
}

function envFindings(
  vars: { module: string; env: EnvVar }[],
  values: Record<string, string>,
  production: boolean,
) {
  const findings: Finding[] = [];
  const missing = vars.filter(({ env }) => env.required && !values[env.name]);
  if (missing.length) {
    findings.push({
      level: production ? "error" : "warn",
      message: `${missing.length} variable(s) required in production ${production ? "are missing" : "are not set yet (fine for development)"}`,
      detail: missing.map(
        ({ module, env }) =>
          `${pc.bold(env.name)} ${pc.dim(`(${module})`)} ${env.description}${env.howTo ? pc.dim(` — ${env.howTo}`) : ""}`,
      ),
    });
  } else if (vars.some(({ env }) => env.required)) {
    findings.push({ level: "ok", message: "All required variables are set" });
  }

  // Anything NEXT_PUBLIC_ ships to every browser.
  const leaks = Object.entries(values).filter(
    ([name, value]) =>
      name.startsWith("NEXT_PUBLIC_") &&
      (/SECRET|PRIVATE|PASSWORD|TOKEN/.test(name) ||
        /^(sk_(live|test)_|whsec_|re_[A-Za-z0-9]{8,})/.test(value)),
  );
  if (leaks.length) {
    findings.push({
      level: "error",
      message: "Secret-looking values are exposed to the browser",
      detail: leaks.map(
        ([name]) => `${pc.bold(name)}: NEXT_PUBLIC_ variables are bundled into client code`,
      ),
    });
  }
  return findings;
}

async function gitFindings(projectDir: string): Promise<Finding[]> {
  if (!(await exists(path.join(projectDir, ".git")))) return [];
  const tracked = await run("git", ["ls-files", "--", ".env", ".env.*"], projectDir);
  const secrets = tracked.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter((file) => file && file !== ".env.example");
  if (secrets.length) {
    return [
      {
        level: "error",
        message: "Environment files are committed to git",
        detail: [
          ...secrets,
          `Untrack with \`git rm --cached ${secrets.join(" ")}\` and rotate any secrets they contained.`,
        ],
      },
    ];
  }
  const ignore = await readFile(path.join(projectDir, ".gitignore"), "utf8").catch(() => "");
  if (!/^\.env/m.test(ignore))
    return [{ level: "warn", message: ".env files are not in .gitignore" }];
  return [{ level: "ok", message: "No environment files tracked by git" }];
}

export const doctor = defineCommand({
  meta: {
    name: "doctor",
    description:
      "Check the project: generated files, dependencies, env vars, secrets in git, registry updates",
  },
  args: {
    production: {
      type: "boolean",
      default: false,
      description: "Treat missing production env vars as errors (use in CI before deploying)",
    },
    offline: { type: "boolean", default: false, description: "Skip the registry update check" },
    ...registryArgs,
  },
  async run({ args }) {
    const projectDir = await findProjectRoot();
    const manifest = await readManifest(projectDir);
    const modules: ModuleManifest[] = Object.values(manifest.modules);
    const sections: { title: string; findings: Finding[] }[] = [];

    // ── Project ─────────────────────────────────────────────────────────
    const project: Finding[] = [];
    const [major = 0, minor = 0] = process.versions.node.split(".").map(Number);
    project.push(
      major > 20 || (major === 20 && minor >= 9)
        ? { level: "ok", message: `Node.js ${process.versions.node}` }
        : {
            level: "error",
            message: `Node.js ${process.versions.node} is too old`,
            detail: ["Next.js needs 20.9 or newer."],
          },
    );
    if (manifest.cli !== CLI_VERSION) {
      project.push({
        level: "info",
        message: `Created with CLI ${manifest.cli}, running ${CLI_VERSION}`,
      });
    }
    const stale = await syncGenerated(projectDir, manifest, { dryRun: true });
    project.push(
      stale.length
        ? {
            level: "warn",
            message: `${stale.length} generated file(s) are out of date`,
            detail: [...stale, "Run `site sync`."],
          }
        : { level: "ok", message: "Generated files are in sync" },
    );
    sections.push({ title: "Project", findings: project });

    // ── Dependencies ────────────────────────────────────────────────────
    const deps: Finding[] = [];
    const pkg = await readPackageJson(projectDir);
    const declared = { ...pkg.dependencies, ...pkg.devDependencies };
    const needed = [
      ...modules.flatMap((m) => [
        ...Object.keys(m.dependencies),
        ...Object.keys(m.devDependencies),
      ]),
      ...Object.values(manifest.sections).flatMap((s) => Object.keys(s.dependencies)),
      ...Object.values(manifest.ui).flatMap((u) => Object.keys(u.dependencies)),
    ];
    const missingDeps = [...new Set(needed)].filter((name) => !declared[name]);
    deps.push(
      missingDeps.length
        ? {
            level: "error",
            message: "package.json is missing dependencies installed items need",
            detail: missingDeps,
          }
        : { level: "ok", message: "package.json lists every dependency" },
    );
    if (!(await exists(path.join(projectDir, "node_modules")))) {
      deps.push({
        level: "warn",
        message: "Dependencies are not installed",
        detail: ["Run your package manager's install."],
      });
    }
    sections.push({ title: "Dependencies", findings: deps });

    // ── Files ───────────────────────────────────────────────────────────
    const files: Finding[] = [];
    let modified = 0;
    const missing: string[] = [];
    for (const [file, record] of Object.entries(manifest.files)) {
      // Projects from 0.1.0 still track CLI-managed files; their hashes are meaningless.
      if (isCliManaged(file)) continue;
      const current = await readBytesIfExists(path.join(projectDir, file));
      if (current === null) missing.push(file);
      else if (sha256(current) !== record.hash) modified++;
    }
    if (missing.length) {
      files.push({
        level: "warn",
        message: `${missing.length} installed file(s) were deleted`,
        detail: missing.slice(0, 15),
      });
    }
    files.push({
      level: modified ? "info" : "ok",
      message: modified
        ? `${modified} file(s) customized (updates will keep your versions)`
        : "No local changes to installed files",
    });
    const config = await readFile(path.join(projectDir, "site.config.ts"), "utf8").catch(
      () => null,
    );
    if (config === null || !config.includes("defineSite(")) {
      files.push({
        level: "error",
        message: "site.config.ts is missing or doesn't call defineSite()",
      });
    } else {
      const blocks = modules.flatMap((m) =>
        Object.keys(m.contributes.siteConfig)
          .filter((key) => !new RegExp(`\\b${key}\\s*:`).test(config))
          .map((key) => `${key} (${m.name})`),
      );
      if (blocks.length) {
        files.push({
          level: "info",
          message: "site.config.ts has no block for some modules (defaults apply)",
          detail: blocks,
        });
      }
    }
    sections.push({ title: "Files", findings: files });

    // ── Environment ─────────────────────────────────────────────────────
    const values = await loadEnv(projectDir, args.production);
    const vars = [
      ...manifest.core.env.map((env) => ({ module: "core", env })),
      ...modules.flatMap((m) => m.env.map((env) => ({ module: m.name, env }))),
    ];
    sections.push({
      title: args.production ? "Environment (production)" : "Environment",
      findings: envFindings(vars, values, args.production),
    });

    // ── Git ─────────────────────────────────────────────────────────────
    const git = await gitFindings(projectDir);
    if (git.length) sections.push({ title: "Git", findings: git });

    // ── Registry ────────────────────────────────────────────────────────
    if (!args.offline) {
      try {
        const registry = await loadRegistry(args, manifest);
        const updates = installedItems(manifest).filter((item) => {
          const latest =
            item.kind === "module"
              ? registry.modules.get(item.name)
              : item.kind === "section"
                ? registry.sections.get(item.name)
                : registry.ui.get(item.name);
          return latest && compareVersions(latest.version, item.version) > 0;
        });
        sections.push({
          title: "Registry",
          findings: [
            updates.length
              ? {
                  level: "info",
                  message: `${updates.length} update(s) available`,
                  detail: [
                    `\`site diff\` to review, \`site update\` to apply: ${updates.map((u) => u.name).join(", ")}`,
                  ],
                }
              : { level: "ok", message: "Everything is up to date" },
          ],
        });
      } catch (error) {
        sections.push({
          title: "Registry",
          findings: [
            { level: "info", message: `Update check skipped: ${(error as Error).message}` },
          ],
        });
      }
    }

    // ── Report ──────────────────────────────────────────────────────────
    const out: string[] = [];
    for (const { title, findings } of sections) {
      out.push(`\n${pc.bold(title)}`);
      for (const finding of findings) {
        out.push(`  ${ICON[finding.level]} ${finding.message}`);
        for (const line of finding.detail ?? []) out.push(`      ${pc.dim("·")} ${line}`);
      }
    }
    const all = sections.flatMap((s) => s.findings);
    const errors = all.filter((f) => f.level === "error").length;
    const warnings = all.filter((f) => f.level === "warn").length;
    out.push(
      `\n${errors ? pc.red(`${errors} problem(s)`) : pc.green("No problems")}${warnings ? `, ${pc.yellow(`${warnings} warning(s)`)}` : ""}\n`,
    );
    process.stdout.write(out.join("\n"));
    if (errors) process.exitCode = 1;
  },
});
