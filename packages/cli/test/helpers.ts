import path from "node:path";

import { Registry } from "../src/registry/registry";

export const repoRoot = path.resolve(import.meta.dirname, "../../..");

export async function loadRepoRegistry() {
  return Registry.load({ root: repoRoot, source: "local", ref: "local", commit: null });
}
