# ci

Continuous integration on GitHub Actions for this project.

- **`.github/workflows/ci.yml`**: on pushes to `main` and every pull request: install (frozen
  lockfile), lint, typecheck, test (when a `test` script exists) and a production build.
  Works with pnpm, npm or yarn by looking at the lockfile.
- **Fast**: dependency and `.next/cache` caching; superseded runs are cancelled.
- **Safe**: a read-only `GITHUB_TOKEN`, no `pull_request_target`, no secrets needed (the build
  runs with `SKIP_ENV_VALIDATION=1`).
- **`.github/dependabot.yml`**: one grouped pull request a week for minor/patch updates, plus
  monthly GitHub Actions updates.

## Setup

Push the repository to GitHub. Optionally require the "Lint, typecheck, test, build" check in
branch protection.

## Environment

No variables. If a build step needs a public value (e.g. `NEXT_PUBLIC_SITE_URL`), add it under
`env:` in the workflow; never put secrets there.

## Usage

Runs automatically. Re-run from the Actions tab.

## Customization

- End-to-end tests: add a job that runs `pnpm exec playwright install --with-deps` and your
  Playwright suite against `pnpm start`.
- Deploy previews: Vercel and Netlify build pull requests on their own; keep this workflow as
  the quality gate.

## Removal

`pnpm site remove ci` (deletes both files).
