import { defineCommand } from "citty";

import { syncGenerated } from "../project/apply";
import { findProjectRoot, readManifest } from "../project/project";
import { log } from "../utils/log";

export const sync = defineCommand({
  meta: {
    name: "sync",
    description:
      "Regenerate CLI-owned files (src/env.ts, src/generated/*, .env.example) — works offline",
  },
  async run() {
    const projectDir = await findProjectRoot();
    const manifest = await readManifest(projectDir);
    const changed = await syncGenerated(projectDir, manifest);
    if (changed.length === 0) log.success("Generated files are up to date.");
    else log.success(`Regenerated:\n${changed.map((f) => `  ${f}`).join("\n")}`);
  },
});
