import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { downloadTemplate } from "giget";

import { CliError } from "../utils/errors";
import { exists } from "../utils/fs";
import { run } from "../utils/exec";

export const DEFAULT_REPO = "jonesruskin/site-forge";

export type RegistrySource = {
  /** Directory containing `registry/` and `apps/starter/`. */
  root: string;
  /** "local" or "github:<owner>/<repo>". */
  source: string;
  ref: string;
  commit: string | null;
};

export type RegistryOptions = {
  /** Local checkout of site-forge. Defaults to $SITE_FORGE_PATH. */
  path?: string;
  /** Branch, tag or commit to download from GitHub. */
  ref?: string;
  /** owner/repo. Defaults to $SITE_FORGE_REPO or jonesruskin/site-forge. */
  repo?: string;
};

function cacheRoot() {
  if (process.env.SITE_FORGE_CACHE) return process.env.SITE_FORGE_CACHE;
  const base = process.env.XDG_CACHE_HOME ?? path.join(os.homedir(), ".cache");
  return path.join(base, "site-forge");
}

function githubToken() {
  return process.env.GITHUB_TOKEN || process.env.GH_TOKEN || undefined;
}

/** Resolves a ref to a commit SHA. Tries git (honours proxies/credentials), then the REST API. */
async function resolveCommit(repo: string, ref: string): Promise<string | null> {
  if (/^[0-9a-f]{40}$/.test(ref)) return ref;

  const git = await run(
    "git",
    ["ls-remote", `https://github.com/${repo}.git`, ref, `${ref}^{}`],
    process.cwd(),
  ).catch(() => null);
  if (git?.ok) {
    const lines = git.stdout.trim().split("\n").filter(Boolean);
    // Prefer the peeled tag (^{}) which points at the commit rather than the tag object.
    const peeled = lines.find((line) => line.endsWith("^{}"));
    const match = (peeled ?? lines[0])?.split(/\s+/)[0];
    if (match && /^[0-9a-f]{40}$/.test(match)) return match;
  }

  try {
    const token = githubToken();
    const response = await fetch(
      `https://api.github.com/repos/${repo}/commits/${encodeURIComponent(ref)}`,
      {
        headers: {
          Accept: "application/vnd.github.sha",
          "User-Agent": "site-forge-cli",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      },
    );
    if (response.ok) {
      const sha = (await response.text()).trim();
      if (/^[0-9a-f]{40}$/.test(sha)) return sha;
    }
  } catch {
    // Offline or blocked; handled by the caller.
  }
  return null;
}

async function isRegistryRoot(dir: string) {
  return exists(path.join(dir, "registry", "core.json"));
}

export async function resolveRegistry(options: RegistryOptions = {}): Promise<RegistrySource> {
  const localPath = options.path ?? process.env.SITE_FORGE_PATH;

  if (localPath) {
    const root = path.resolve(localPath);
    if (!(await isRegistryRoot(root))) {
      throw new CliError(
        `${root} is not a site-forge checkout (registry/core.json not found).`,
        "Point SITE_FORGE_PATH (or --registry) at the root of the site-forge repository.",
      );
    }
    const head = await run("git", ["rev-parse", "HEAD"], root).catch(() => null);
    return { root, source: "local", ref: "local", commit: head?.ok ? head.stdout.trim() : null };
  }

  const repo = options.repo ?? process.env.SITE_FORGE_REPO ?? DEFAULT_REPO;
  const ref = options.ref ?? "main";
  const commit = await resolveCommit(repo, ref);
  const cacheDir = path.join(cacheRoot(), repo.replace("/", "__"));

  // Commits are immutable, so a cached download can be reused forever.
  const dir = commit
    ? path.join(cacheDir, commit)
    : await mkdtemp(path.join(os.tmpdir(), "site-forge-"));
  if (commit && (await isRegistryRoot(dir))) {
    return { root: dir, source: `github:${repo}`, ref, commit };
  }

  const target = commit ?? ref;
  // codeload serves public tarballs without the REST API's rate limit, so try it
  // anonymously first; fall back to the authenticated API for private forks.
  const attempts: { name: string; tar: string; headers: Record<string, string> }[] = [
    { name: "codeload", tar: `https://codeload.github.com/${repo}/tar.gz/${target}`, headers: {} },
  ];
  const token = githubToken();
  if (token) {
    attempts.push({
      name: "api",
      tar: `https://api.github.com/repos/${repo}/tarball/${target}`,
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
    });
  }

  let lastError: unknown;
  for (const attempt of attempts) {
    try {
      await downloadTemplate(`sf:${repo}`, {
        dir,
        force: true,
        forceClean: true,
        providers: {
          sf: () => ({
            name: "site-forge",
            version: target,
            tar: attempt.tar,
            headers: attempt.headers,
          }),
        },
      });
      lastError = undefined;
      break;
    } catch (error) {
      lastError = error;
    }
  }
  if (lastError) {
    throw new CliError(
      `Could not download ${repo}@${ref} from GitHub: ${(lastError as Error).message}`,
      "Check your network, pass --ref with an existing branch/tag, set GITHUB_TOKEN for private forks, or use a local checkout via SITE_FORGE_PATH.",
    );
  }

  if (!(await isRegistryRoot(dir))) {
    throw new CliError(`${repo}@${ref} does not contain a site-forge registry.`);
  }
  return { root: dir, source: `github:${repo}`, ref, commit };
}
