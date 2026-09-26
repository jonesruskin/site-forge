import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { x } from "tinyexec";
import { afterAll, describe, expect, it } from "vitest";

import { repoRoot } from "./helpers";

const cli = (bin: string) => path.join(repoRoot, "packages/cli/src/bin", bin);
const tsx = path.join(repoRoot, "node_modules/.bin/tsx");
const tmp = await mkdtemp(path.join(os.tmpdir(), "site-forge-test-"));
const env = {
  ...process.env,
  SITE_FORGE_PATH: repoRoot,
  CI: "1",
  npm_config_user_agent: "pnpm/12",
};

afterAll(() => rm(tmp, { recursive: true, force: true }));

/** Like runCli, but returns the result instead of throwing on a non-zero exit. */
async function tryCli(bin: string, args: string[], cwd: string) {
  const result = await x(tsx, [cli(bin), ...args], {
    nodeOptions: { cwd, env },
    throwOnError: false,
  });
  return { code: result.exitCode, output: result.stdout + result.stderr };
}

async function runCli(bin: string, args: string[], cwd: string) {
  const result = await x(tsx, [cli(bin), ...args], {
    nodeOptions: { cwd, env },
    throwOnError: false,
  });
  if (result.exitCode !== 0)
    throw new Error(`${bin} ${args.join(" ")} failed:\n${result.stdout}\n${result.stderr}`);
  return result;
}

describe("create-site + site add (local registry, no install)", () => {
  const dir = path.join(tmp, "acme");

  it("creates a project with modules and records the manifest", async () => {
    await runCli(
      "create-site.ts",
      ["acme", "--yes", "--modules", "seo", "--name", "Acme", "--no-install", "--no-git"],
      tmp,
    );
    const manifest = JSON.parse(await readFile(path.join(dir, ".site/manifest.json"), "utf8"));
    expect(Object.keys(manifest.modules)).toEqual(["seo"]);
    expect(manifest.files["src/app/sitemap.ts"].owner).toBe("module:seo");
    expect(manifest.files["package.json"].owner).toBe("starter");

    const pkg = JSON.parse(await readFile(path.join(dir, "package.json"), "utf8"));
    expect(pkg.name).toBe("acme");
    expect(pkg.scripts.site).toBe("site");
    expect(pkg.devDependencies["@site-forge/create-site"]).toMatch(/^\^/);

    const config = await readFile(path.join(dir, "site.config.ts"), "utf8");
    expect(config).toContain('name: "Acme"');
    expect(await readFile(path.join(dir, "pnpm-workspace.yaml"), "utf8")).toContain("allowBuilds");
  });

  it("adds a module with its dependencies", async () => {
    await runCli("site.ts", ["add", "contact", "--no-install"], dir);
    const manifest = JSON.parse(await readFile(path.join(dir, ".site/manifest.json"), "utf8"));
    expect(Object.keys(manifest.modules)).toEqual(["seo", "email", "rate-limit", "contact"]);
    expect(await readFile(path.join(dir, "src/env.ts"), "utf8")).toContain("contactEnv");
    expect(await readFile(path.join(dir, "README.md"), "utf8")).toContain(
      "[`contact`](.site/modules/contact.md)",
    );
    expect(await readFile(path.join(dir, ".site/modules/contact.md"), "utf8")).toContain(
      "# contact",
    );
    const pkg = JSON.parse(await readFile(path.join(dir, "package.json"), "utf8"));
    expect(pkg.dependencies.resend).toBeDefined();
  });

  it("keeps local edits unless --overwrite", async () => {
    const file = path.join(dir, "src/lib/contact/config.ts");
    const { writeFile } = await import("node:fs/promises");
    await writeFile(file, "// mine\n");
    await runCli("site.ts", ["add", "ui:button", "--no-install"], dir);
    expect(await readFile(file, "utf8")).toBe("// mine\n");
  });

  it("regenerates files offline with sync", async () => {
    await rm(path.join(dir, "src/env.ts"));
    await runCli("site.ts", ["sync"], dir);
    expect(await readFile(path.join(dir, "src/env.ts"), "utf8")).toContain("contactEnv");
  });

  it("reports the project's health with doctor", async () => {
    const healthy = await tryCli("site.ts", ["doctor", "--offline"], dir);
    expect(healthy.code).toBe(0);
    expect(healthy.output).toContain("Generated files are in sync");
    expect(healthy.output).toContain("package.json lists every dependency");

    const { writeFile } = await import("node:fs/promises");
    await writeFile(path.join(dir, ".env.local"), "NEXT_PUBLIC_STRIPE_SECRET=sk_live_abc\n");
    const leaky = await tryCli("site.ts", ["doctor", "--offline"], dir);
    expect(leaky.code).toBe(1);
    expect(leaky.output).toContain("exposed to the browser");
    await rm(path.join(dir, ".env.local"));

    const strict = await tryCli("site.ts", ["doctor", "--offline", "--production"], dir);
    expect(strict.code).toBe(1);
    expect(strict.output).toContain("RESEND_API_KEY");
  });

  it("shows and applies registry updates", async () => {
    const manifestFile = path.join(dir, ".site/manifest.json");
    const manifest = JSON.parse(await readFile(manifestFile, "utf8"));
    const current = manifest.modules.seo.version;
    manifest.modules.seo.version = "0.0.1";
    const { writeFile } = await import("node:fs/promises");
    await writeFile(manifestFile, JSON.stringify(manifest, null, 2));

    const diff = await runCli("site.ts", ["diff"], dir);
    expect(diff.stdout).toContain("update 0.0.1");

    await runCli("site.ts", ["update", "--no-install"], dir);
    const updated = JSON.parse(await readFile(manifestFile, "utf8"));
    expect(updated.modules.seo.version).toBe(current);
  });

  it("refuses to remove what others depend on", async () => {
    const result = await tryCli("site.ts", ["remove", "email", "--yes", "--no-install"], dir);
    expect(result.code).not.toBe(0);
    expect(result.output).toContain("module contact requires email");
  });

  it("removes a module, keeping files you changed", async () => {
    await runCli("site.ts", ["remove", "contact", "--yes", "--no-install"], dir);
    const manifest = JSON.parse(await readFile(path.join(dir, ".site/manifest.json"), "utf8"));
    expect(Object.keys(manifest.modules).sort()).toEqual(["email", "rate-limit", "seo"]);
    expect(manifest.files["src/lib/contact/config.ts"]).toBeUndefined();
    // Edited earlier in this suite: kept, and now owned by the project.
    expect(await readFile(path.join(dir, "src/lib/contact/config.ts"), "utf8")).toBe("// mine\n");
    await expect(readFile(path.join(dir, "src/lib/contact/actions.tsx"), "utf8")).rejects.toThrow();
    expect(await readFile(path.join(dir, "src/env.ts"), "utf8")).not.toContain("contactEnv");
    expect(await readFile(path.join(dir, "site.config.ts"), "utf8")).not.toContain("contact:");
    await expect(readFile(path.join(dir, ".site/modules/contact.md"), "utf8")).rejects.toThrow();
  });
});
