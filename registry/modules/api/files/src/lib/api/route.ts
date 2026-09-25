import "server-only";

import { after, NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth/auth";
import { rateLimit, rateLimitHeaders, type RateLimitOptions } from "@/lib/rate-limit";

import { apiConfig, type ApiScope } from "./config";
import { touchApiKey, verifyApiKey } from "./keys";

/** Who is calling: a key (with its scopes) or a signed-in browser session (all scopes). */
export type Principal =
  | { type: "key"; userId: string; keyId: string; scopes: string[] }
  | { type: "session"; userId: string; scopes: ["*"] };

/** Throw from a handler to answer with an RFC 9457 problem document. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
  }
}

const TITLES: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
  413: "Content Too Large",
  415: "Unsupported Media Type",
  422: "Unprocessable Content",
  429: "Too Many Requests",
  500: "Internal Server Error",
};

export function problem(status: number, detail: string, extra: Record<string, unknown> = {}) {
  return NextResponse.json(
    { type: "about:blank", title: TITLES[status] ?? "Error", status, detail, ...extra },
    { status, headers: { "Content-Type": "application/problem+json" } },
  );
}

type Schema = z.ZodType;
type Infer<S> = S extends Schema ? z.output<S> : undefined;

type RouteOptions<Q, B, A extends "required" | "optional" | "none"> = {
  /** "required" (default): a key or session must be present. */
  auth?: A;
  /** Scope a key needs. Sessions (first-party browser calls) have every scope. */
  scope?: ApiScope;
  /** Validates URL search params (values are strings; use z.coerce for numbers). */
  query?: Q;
  /** Validates the JSON body. */
  body?: B;
  /** Per principal (or per IP when anonymous). `false` disables. Defaults to site.config api.rateLimit. */
  rateLimit?: RateLimitOptions | false;
};

type Context<Q, B, A, P> = {
  request: NextRequest;
  params: P;
  query: Infer<Q>;
  body: Infer<B>;
  principal: A extends "required" ? Principal : Principal | null;
};

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

async function authenticate(request: NextRequest): Promise<Principal | null> {
  const header = request.headers.get("authorization");
  if (header) {
    const [scheme, token] = header.split(" ");
    if (scheme?.toLowerCase() !== "bearer" || !token)
      throw new ApiError(401, "Use `Authorization: Bearer <key>`.");
    const key = await verifyApiKey(token.trim());
    if (!key) throw new ApiError(401, "Invalid or expired API key.");
    after(() => touchApiKey(key));
    return { type: "key", userId: key.userId, keyId: key.id, scopes: key.scopes };
  }
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return null;
  // Cookies ride along on cross-site requests; only same-origin writes may use them.
  if (!SAFE_METHODS.has(request.method)) {
    const origin = request.headers.get("origin");
    if (!origin || origin !== request.nextUrl.origin)
      throw new ApiError(403, "Cross-origin request rejected.");
  }
  return { type: "session", userId: session.user.id, scopes: ["*"] };
}

function clientIp(request: NextRequest) {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

async function readBody(request: NextRequest, schema: Schema) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    throw new ApiError(415, "Send a JSON body with `Content-Type: application/json`.");
  }
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    throw new ApiError(400, "The request body is not valid JSON.");
  }
  return validate(schema, json, "body");
}

function validate(schema: Schema, value: unknown, where: "query" | "body") {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new ApiError(422, `Invalid ${where}.`, {
      errors: z.flattenError(result.error).fieldErrors,
    });
  }
  return result.data;
}

/**
 * Wraps a route handler with authentication, scopes, validation, rate limiting
 * and consistent errors. Return plain data for a 200 JSON response, or any
 * Response for full control.
 *
 *   export const GET = apiRoute(
 *     { scope: "read", query: z.object({ limit: z.coerce.number().max(100).default(20) }) },
 *     async ({ principal, query }) => ({ data: await listThings(principal.userId, query.limit) }),
 *   );
 */
export function apiRoute<
  Q extends Schema | undefined = undefined,
  B extends Schema | undefined = undefined,
  A extends "required" | "optional" | "none" = "required",
  P extends Record<string, string | string[]> = Record<string, string>,
>(
  options: RouteOptions<Q, B, A>,
  handler: (context: Context<Q, B, A, P>) => unknown | Promise<unknown>,
) {
  const mode = options.auth ?? "required";
  const limits = options.rateLimit === undefined ? apiConfig.rateLimit : options.rateLimit;

  return async function route(request: NextRequest, context: { params: Promise<P> }) {
    let headers: Record<string, string> = {};
    try {
      const principal = mode === "none" ? null : await authenticate(request);
      if (mode === "required" && !principal) {
        throw new ApiError(401, "Authenticate with an API key: `Authorization: Bearer <key>`.");
      }
      if (options.scope && principal?.type === "key" && !principal.scopes.includes(options.scope)) {
        throw new ApiError(403, `This key is missing the "${options.scope}" scope.`);
      }
      if (limits) {
        const subject = principal
          ? `${principal.type}:${principal.type === "key" ? principal.keyId : principal.userId}`
          : `ip:${clientIp(request)}`;
        const result = await rateLimit(`api:${subject}`, limits);
        headers = rateLimitHeaders(result);
        if (!result.success)
          throw new ApiError(429, "Rate limit exceeded. See the Retry-After header.");
      }
      const query = options.query
        ? validate(options.query, Object.fromEntries(request.nextUrl.searchParams), "query")
        : undefined;
      const body = options.body ? await readBody(request, options.body) : undefined;

      const result = await handler({
        request,
        params: await context.params,
        query,
        body,
        principal,
      } as Context<Q, B, A, P>);

      const response = result instanceof Response ? result : NextResponse.json(result ?? null);
      for (const [name, value] of Object.entries(headers)) response.headers.set(name, value);
      return response;
    } catch (error) {
      if (!(error instanceof ApiError)) {
        console.error("[api]", request.method, request.nextUrl.pathname, error);
      }
      const response =
        error instanceof ApiError
          ? problem(error.status, error.message, error.details)
          : problem(500, "Something went wrong on our side.");
      for (const [name, value] of Object.entries(headers)) response.headers.set(name, value);
      return response;
    }
  };
}
