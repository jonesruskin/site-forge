import { searchIndex } from "@/lib/docs/docs";

export const dynamic = "force-static";

export async function GET() {
  return Response.json(await searchIndex(), {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
