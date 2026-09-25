import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { generateEnvExample } from "../src/generate/env-example";
import { generateFiles, relativeImport } from "../src/generate/generated-files";
import { generateFontsFile } from "../src/project/theme";
import { resolvePlan } from "../src/resolve";
import { loadRepoRegistry, repoRoot } from "./helpers";

describe("generated files", async () => {
  const registry = await loadRepoRegistry();
  const starter = path.join(repoRoot, registry.core.starter);

  it("reproduces the starter baseline exactly for zero modules", async () => {
    const { write } = generateFiles(registry.core, []);
    for (const [file, content] of write) {
      expect(await readFile(path.join(starter, file), "utf8"), file).toBe(content);
    }
    expect(await readFile(path.join(starter, "src/lib/fonts.ts"), "utf8")).toBe(
      generateFontsFile({}),
    );
    expect(await readFile(path.join(starter, ".env.example"), "utf8")).toBe(
      generateEnvExample(registry.core.env, []),
    );
  });

  it("wires slot contributions and env fragments", () => {
    const plan = resolvePlan(registry, { modules: ["seo", "contact"], sections: [], ui: [] });
    const { write, remove } = generateFiles(registry.core, plan.modules);
    expect(write.get("src/generated/body-end.ts")).toContain(
      'import { SiteJsonLd } from "../lib/seo/site-json-ld";',
    );
    expect(write.get("src/generated/sitemap.ts")).toContain("export const sitemapSources");
    expect(write.get("src/env.ts")).toContain('import { contactEnv } from "./env/contact";');
    expect(write.get("src/generated/next.ts")).toContain("https://challenges.cloudflare.com");
    expect(remove).toContain("src/proxy.ts");
  });

  it("creates src/proxy.ts only when a module contributes a handler", () => {
    const seo = registry.getModule("seo");
    const withProxy = {
      ...seo,
      name: "proxy-demo",
      contributes: {
        ...seo.contributes,
        slots: [
          { slot: "proxy", import: "maintenance", from: "src/lib/maintenance.ts", order: 10 },
        ],
      },
    };
    const { write } = generateFiles(registry.core, [withProxy]);
    expect(write.get("src/proxy.ts")).toContain("export async function proxy");
    expect(write.get("src/generated/proxy.ts")).toContain(
      'import { maintenance } from "../lib/maintenance";',
    );
  });

  it("aliases colliding import names", () => {
    const seo = registry.getModule("seo");
    const a = {
      ...seo,
      name: "a",
      contributes: {
        ...seo.contributes,
        slots: [{ slot: "body-end", import: "Widget", from: "src/a.tsx", order: 1 }],
      },
    };
    const b = {
      ...seo,
      name: "b",
      contributes: {
        ...seo.contributes,
        slots: [{ slot: "body-end", import: "Widget", from: "src/b.tsx", order: 2 }],
      },
    };
    const file = generateFiles(registry.core, [a, b]).write.get("src/generated/body-end.ts")!;
    expect(file).toContain('import { Widget } from "../a";');
    expect(file).toContain('import { Widget as Widget2 } from "../b";');
  });

  it("computes relative imports", () => {
    expect(relativeImport("src/env.ts", "src/env/contact.ts")).toBe("./env/contact");
    expect(relativeImport("src/generated/x.ts", "src/lib/y.tsx")).toBe("../lib/y");
  });

  it("documents every env var once in .env.example", () => {
    const plan = resolvePlan(registry, { modules: ["contact"], sections: [], ui: [] });
    const example = generateEnvExample(registry.core.env, plan.modules);
    expect(example).toContain("CONTACT_TO_EMAIL=hello@example.com");
    expect(example).toContain("(required)");
    expect(example.match(/RESEND_API_KEY=/g)).toHaveLength(1);
  });
});
