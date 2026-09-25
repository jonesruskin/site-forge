import { resume } from "@/content/resume";
import { toJsonResume } from "@/lib/about/resume";

export const dynamic = "force-static";

/** The résumé as JSON Resume, for job boards and tools that import it. */
export function GET() {
  return Response.json(toJsonResume(resume), {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}
