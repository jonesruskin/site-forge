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
});
