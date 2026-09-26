# CLI reference

Published as [`@site-forge/create-site`](https://www.npmjs.com/package/@site-forge/create-site)
with two binaries: `create-site` (new projects) and `site` (everything after). Generated
projects depend on it, so inside a project run `pnpm site …` (or `npm run site …` in an npm
project; see below).

## `create-site [dir]`

```sh
pnpm dlx @site-forge/create-site my-site                       # interactive
pnpm dlx @site-forge/create-site my-site --preset saas --yes   # non-interactive
```

The project uses the package manager that launched the CLI: `pnpm dlx` makes a pnpm project,
`npx` an npm project, `yarn dlx` / `bunx` likewise (or pass `--pm`). It's recorded in
`package.json#packageManager`, and the project's README and `AGENTS.md` use matching commands.
In an npm project, run scripts with `npm run`: `npm run dev`, `npm run site add blog`.

| Flag                                        |                                                                                  |
| ------------------------------------------- | -------------------------------------------------------------------------------- |
| `--preset <name>`                           | One of the [presets](catalog.md#presets)                                         |
| `--modules a,b` `--sections a,b` `--ui a,b` | Extra items (dependencies are added automatically)                               |
| `--theme <name>`                            | `neutral`, `editorial`, `playful`, `terminal`                                    |
| `--name` `--description` `--url` `--author` | Written into `site.config.ts`                                                    |
| `--pm <pnpm\|npm\|yarn\|bun>`               | Package manager (default: the one running the CLI); recorded as `packageManager` |
| `--no-install` `--no-git`                   | Skip dependency install / `git init` + first commit                              |
| `--github`                                  | Create a GitHub repository with `gh` and push                                    |
| `--yes`                                     | Accept defaults, no prompts                                                      |

## `site add <items…>`

`pnpm site add blog newsletter section:faq ui:dialog`. Copies files, merges dependencies and
scripts, adds `site.config.ts` blocks and nav entries, regenerates slots, env and `.env.example`,
and prints each module's setup notes. Files you've edited are kept (`--overwrite` to replace).
`--dry-run` lists what would be written.

## `site remove <items…>`

`pnpm site remove newsletter`. Refuses if something still depends on it. Deletes the module's
untouched files (edited ones stay and become yours; `--force` deletes them too), prunes
dependencies nothing else uses, removes its `site.config.ts` blocks, nav entries and scripts,
and regenerates slots. Works offline. Database tables are never dropped for you: the command
tells you to generate a migration.

## `site diff [item]`

Without an argument: every installed item with its version, available updates and how many
files you changed. With one (`site diff billing`): a colored unified diff between your files
and the registry's, labelled "updated upstream", "local edits", "new upstream" or "removed
upstream".

## `site update [items…]`

Takes registry updates: new versions of all installed items, or just the ones named. New
requirements come along, files dropped upstream are deleted if untouched, and your edited
files are kept unless `--overwrite`. Review first with `site diff`.

## `site doctor`

Checks Node.js, generated files, missing dependencies, deleted or customized files,
`site.config.ts` blocks, environment variables (required-in-production ones, and secrets
accidentally exposed through `NEXT_PUBLIC_*`), `.env` files committed to git, and available
registry updates. `--production` turns missing production variables into errors (use it in CI
before a deploy); `--offline` skips the registry check. Exits non-zero on errors.

## `site theme [name]`

`pnpm site theme editorial` switches theme (fonts included). Dial flags tune the current one:
`pnpm site theme --hue 250 --radius 0.75rem --density 1.1`.

## `site list [kind]`

Modules, sections, ui, presets or themes, with ● marking what's installed. `--json` for scripts.

## `site sync`

Regenerates `src/generated/*`, `src/env.ts`, `.env.example` and `pnpm-workspace.yaml` from the
manifest. Offline. Run it after adding your own DB schema file.

## Where the registry comes from

By default the CLI downloads this repository's `main` branch from GitHub (anonymous tarball,
cached per commit). Options, available on every command:

| Option                                   |                                                                                      |
| ---------------------------------------- | ------------------------------------------------------------------------------------ |
| `--ref <branch\|tag\|sha>`               | Pin a version, e.g. `--ref v0.2.0`. A project remembers the ref it was created from. |
| `--repo <owner/repo>`                    | Use a fork as your own registry                                                      |
| `--registry <path>` or `SITE_FORGE_PATH` | Use a local checkout (registry development)                                          |
| `GITHUB_TOKEN`                           | Used if present (higher rate limits, private forks); never required                  |
