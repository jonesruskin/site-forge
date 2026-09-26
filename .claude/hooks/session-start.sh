#!/usr/bin/env bash
# Prepares a fresh Claude Code cloud session: dependencies installed and the
# playground generated, so typecheck, tests and `pnpm dev` work immediately.
# Local sessions skip it (your checkout is already set up).
set -euo pipefail
[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0
cd "${CLAUDE_PROJECT_DIR:-$(pwd)}"

command -v pnpm >/dev/null 2>&1 || corepack enable >/dev/null 2>&1 || npm install -g pnpm >/dev/null
pnpm install --frozen-lockfile >/dev/null 2>&1 || pnpm install >/dev/null
if [ ! -f apps/playground/package.json ]; then
  pnpm playground:sync >/dev/null && pnpm install --frozen-lockfile >/dev/null 2>&1 || true
fi
echo "site-forge ready: dependencies installed, playground generated. See CLAUDE.md for conventions."
