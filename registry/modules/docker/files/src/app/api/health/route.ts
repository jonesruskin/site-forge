export const dynamic = "force-dynamic";

const startedAt = Date.now();

/** Liveness probe for Docker, Kubernetes and uptime monitors. */
export function GET() {
  return Response.json(
    { status: "ok", uptime: Math.round((Date.now() - startedAt) / 1000) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
