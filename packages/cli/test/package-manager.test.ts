import { describe, expect, it } from "vitest";

import { githubCreateHint } from "../src/commands/create";
import { adaptCommands, runScript } from "../src/utils/package-manager";

describe("package manager commands", () => {
  it("runs scripts the way each package manager expects", () => {
    expect(runScript("npm")).toBe("npm run");
    expect(runScript("pnpm")).toBe("pnpm");
    expect(runScript("yarn")).toBe("yarn");
    expect(runScript("bun")).toBe("bun");
  });

  it("rewrites pnpm commands in docs, leaving pnpm-only subcommands alone", () => {
    const docs =
      "| `pnpm dev` | … |\n| `pnpm site add <x>` | … |\nUse `pnpm dlx x` or `pnpm install`.";
    const npm = adaptCommands(docs, "npm");
    expect(npm).toContain("`npm run dev`");
    expect(npm).toContain("`npm run site add <x>`");
    expect(npm).toContain("`pnpm dlx x`");
    expect(npm).toContain("`pnpm install`");
    expect(adaptCommands(docs, "pnpm")).toBe(docs);
  });
});

describe("GitHub repository hint", () => {
  it("explains the Codespaces token limitation with exact commands", () => {
    const hint = githubCreateHint("my-site", "private", { CODESPACES: "true" });
    expect(hint).toContain("unset GITHUB_TOKEN");
    expect(hint).toContain("gh repo create my-site --private --source . --remote origin --push");
  });

  it("gives the plain retry elsewhere", () => {
    const hint = githubCreateHint("my-site", "public", {});
    expect(hint).not.toContain("Codespace");
    expect(hint).toContain("gh repo create my-site --public");
  });
});
