# docker

Run the site on any server, VPS or container platform (Fly.io, Railway, Render, Kubernetes).

- **Small image**: a multi-stage build on `node:22-alpine` with Next.js
  [standalone output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output):
  only the files the server needs, running as a non-root user.
- **Health check**: `/api/health` answers `{ "status": "ok" }`; the image's `HEALTHCHECK` uses it.
- **No secrets in the image**: server variables are read when the container starts;
  `NEXT_PUBLIC_*` values are build args because they're compiled into the browser bundle.
- **compose.yaml**: the app alone, or with the `database` profile a Postgres 17 container and a
  one-shot `migrate` service that applies migrations before you start serving.

## Setup

```sh
cp .env.example .env    # fill in production values
docker compose up --build
# with Postgres (database module):
docker compose --profile database up --build
```

Build and run without compose:

```sh
docker build --build-arg NEXT_PUBLIC_SITE_URL=https://example.com -t my-site .
docker run -p 3000:3000 --env-file .env my-site
```

## Environment

No variables of its own. Everything in `.env.example` is passed at runtime.

## Usage

Put a reverse proxy (Caddy, Traefik, nginx) in front for HTTPS. Use a volume or object storage
for anything written at runtime: the container's filesystem is disposable.

## Customization

- Node version, base image: `Dockerfile`.
- Services (Redis, MinIO for uploads): `compose.yaml`.

## Removal

`pnpm site remove docker` (removes the files and the standalone output setting).
