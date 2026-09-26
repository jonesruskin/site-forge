# rate-limit

Sliding-window rate limiting for server actions and route handlers.

- **Production**: [Upstash Redis](https://upstash.com) (HTTP, works on serverless and the edge).
- **Development / single server**: an in-memory sliding log. No setup needed.

## Setup

Nothing is required to start. For production on serverless platforms, create an Upstash Redis
database and set the two env vars below. Without them every server instance counts separately
(a warning is logged once in production).

## Environment

| Variable                   | Required | Description         |
| -------------------------- | -------- | ------------------- |
| `UPSTASH_REDIS_REST_URL`   | no       | Upstash REST URL.   |
| `UPSTASH_REDIS_REST_TOKEN` | no       | Upstash REST token. |

## Usage

```ts
import { clientIp, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

// In a server action
const { success } = await rateLimit(`signup:${await clientIp()}`, { limit: 5, window: "10 m" });
if (!success) return { error: "Too many attempts. Try again in a few minutes." };

// In a route handler
const result = await rateLimit(`api:${userId}`, { limit: 60, window: "1 m" });
if (!result.success)
  return new Response("Too Many Requests", { status: 429, headers: rateLimitHeaders(result) });
```

## Customization

- Keys are free-form strings: combine the action name with an IP, user id or API key.
- Swap `Ratelimit.slidingWindow` for `fixedWindow` or `tokenBucket` in `src/lib/rate-limit.ts`.

## Removal

`pnpm site remove rate-limit`. Modules that require it (contact, newsletter, waitlist, api …)
must be removed first.
