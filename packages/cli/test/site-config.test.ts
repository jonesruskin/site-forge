import { readFile } from "node:fs/promises";
import path from "node:path";

import { builders } from "magicast";
import { describe, expect, it } from "vitest";

import { removeFromSiteConfig, updateSiteConfig } from "../src/codemods/site-config";
import { repoRoot } from "./helpers";

const starterConfig = await readFile(path.join(repoRoot, "apps/starter/site.config.ts"), "utf8");

describe("site.config.ts codemods", () => {
  it("adds nav entries, blocks and features, then removes them", () => {
    const nav = [
      { location: "header" as const, label: "Blog", href: "/blog" },
      { location: "footer" as const, group: "Company", label: "Contact", href: "/contact" },
    ];
    const added = updateSiteConfig(starterConfig, {
      nav,
      blocks: { contact: { title: "Hi" } },
      features: { beta: true },
    });
    expect(added).toContain('href: "/blog"');
    expect(added).toContain('title: "Company"');
    expect(added).toContain("contact: {");
    expect(added).toContain("beta: true");
    expect(added).not.toMatch(/\n\s*\n\s+\w+:/); // no blank lines inside the object

    const again = updateSiteConfig(added, { nav });
    expect(again.match(/href: "\/blog"/g)).toHaveLength(1);

    const removed = removeFromSiteConfig(added, { nav, blocks: ["contact"], features: ["beta"] });
    expect(removed).not.toContain("/blog");
    expect(removed).not.toContain("Company");
    expect(removed).not.toContain("contact: {");
    expect(removed).not.toContain("beta");
  });

  it("sets values including raw expressions and nested paths", () => {
    const next = updateSiteConfig(starterConfig, {
      set: {
        name: "Acme",
        url: builders.raw('process.env.NEXT_PUBLIC_SITE_URL ?? "https://acme.dev"'),
      },
      setPaths: { "author.name": "Ada", "seo.titleTemplate": "%s · Acme" },
    });
    expect(next).toContain('name: "Acme"');
    expect(next).toContain('process.env.NEXT_PUBLIC_SITE_URL ?? "https://acme.dev"');
    expect(next).toContain('name: "Ada"');
    expect(next).toContain('titleTemplate: "%s · Acme"');
  });

  it("does not overwrite existing blocks", () => {
    const first = updateSiteConfig(starterConfig, { blocks: { contact: { title: "Mine" } } });
    const second = updateSiteConfig(first, { blocks: { contact: { title: "Registry" } } });
    expect(second).toContain('"Mine"');
    expect(second).not.toContain('"Registry"');
  });

  it("refuses files it can't understand", () => {
    expect(() => updateSiteConfig("export const x = 1;", { features: { a: true } })).toThrow(
      /defineSite/,
    );
  });
});
