# Cloud workflow

site-forge assumes nothing about your machine. Everything works from a browser, a cloud agent
(Claude Code on the web, Codespaces) or CI.

## Create a site without cloning anything

```sh
npx @site-forge/create-site my-site --preset portfolio --yes
```

The CLI downloads the registry from GitHub (`jonesruskin/site-forge`, branch `main`) as an
anonymous tarball, so no account or token is needed. `GITHUB_TOKEN` is used when present (for
rate limits or a private fork) but is never required. Pin a version with `--ref v0.2.0`; the
project remembers it, so later `site add` calls use the same registry version until you
`site update`.

`--github` creates the repository with the GitHub CLI and pushes the first commit.

## Working on a site in a cloud session

Generated projects include `AGENTS.md` (and `CLAUDE.md`, which imports it) describing the
project's conventions: tokens-only styling, generated files not to edit, the `site` commands.
Agents pick it up automatically.

Useful commands in a fresh container:

```sh
pnpm install
pnpm dev             # no keys needed: embedded DB, email outbox, mock payments
pnpm site doctor     # what's configured, what's missing, secrets in git
```

## Secrets

- Never commit `.env*` files (the starter's `.gitignore` already excludes everything except
  `.env.example`); `site doctor` fails if one is tracked.
- Put secrets in your host's environment settings (Vercel, Fly, Railway) or your cloud
  environment's secret store, never in `NEXT_PUBLIC_*` variables, which are bundled into the
  browser code (`site doctor` flags secret-looking ones).
- `pnpm env:check` validates variables exactly as production will; the vercel module runs it
  before every build.
- Generated GitHub Actions use a read-only token and never `pull_request_target`.

## Working on the registry itself in the cloud

This repository ships a SessionStart hook (`.claude/hooks/session-start.sh`): in Claude Code
cloud sessions it installs dependencies and generates the playground, so `pnpm check`,
`pnpm validate` and the playground are ready immediately.

## Releasing the CLI

1. Bump `packages/cli/package.json` → `version`, commit.
2. `git tag v0.2.0 && git push origin v0.2.0`.
3. `.github/workflows/release.yml` tests, builds, smoke-tests the packed tarball, publishes to
   npm with provenance using the `NPM_TOKEN` secret, and creates a GitHub release.

One-time setup: create the `site-forge` organization on npmjs.com, generate an **automation**
access token with publish rights, and add it as the `NPM_TOKEN` repository secret
(_Settings → Secrets and variables → Actions_).
