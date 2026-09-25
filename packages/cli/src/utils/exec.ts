import { x } from "tinyexec";

export async function run(command: string, args: string[], cwd: string) {
  const result = await x(command, args, {
    nodeOptions: { cwd, stdio: "pipe" },
    throwOnError: false,
  });
  return { ok: result.exitCode === 0, stdout: result.stdout, stderr: result.stderr };
}

/** Runs a command with inherited stdio (installs, git), resolving to success. */
export async function runVisible(command: string, args: string[], cwd: string) {
  const result = await x(command, args, {
    nodeOptions: { cwd, stdio: "inherit" },
    throwOnError: false,
  });
  return result.exitCode === 0;
}

export async function hasCommand(command: string) {
  try {
    const result = await x(command, ["--version"], { throwOnError: false });
    return result.exitCode === 0;
  } catch {
    return false;
  }
}

export type PackageManager = "pnpm" | "npm" | "yarn" | "bun";

/** The package manager that launched the CLI (npx → npm, pnpm dlx → pnpm …). */
export function detectPackageManager(): PackageManager {
  const agent = process.env.npm_config_user_agent ?? "";
  if (agent.startsWith("pnpm")) return "pnpm";
  if (agent.startsWith("yarn")) return "yarn";
  if (agent.startsWith("bun")) return "bun";
  if (agent.startsWith("npm")) return "npm";
  return "pnpm";
}
