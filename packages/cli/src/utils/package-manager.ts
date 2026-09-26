import type { PackageManager } from "./exec";

/** How to run a package.json script: `npm run dev`, but `pnpm dev`, `yarn dev`, `bun dev`. */
export function runScript(pm: string) {
  return pm === "npm" ? "npm run" : pm;
}

/**
 * Rewrites `pnpm <script>` commands in project docs (AGENTS.md) for the package
 * manager the project actually uses, so instructions can be copied as-is.
 * pnpm-only subcommands (dlx, exec, install) are left untouched.
 */
export function adaptCommands(text: string, pm: PackageManager | string) {
  if (pm === "pnpm") return text;
  return text.replace(/`pnpm (?!dlx\b|exec\b|install\b)/g, `\`${runScript(pm)} `);
}
