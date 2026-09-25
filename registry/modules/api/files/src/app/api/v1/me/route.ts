import { eq } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { ApiError, apiRoute } from "@/lib/api/route";

/** GET /api/v1/me — the account the key belongs to. A template for your own endpoints. */
export const GET = apiRoute({ scope: "read" }, async ({ principal }) => {
  const row = await db.query.user.findFirst({
    where: eq(user.id, principal.userId),
    columns: { id: true, name: true, email: true, image: true, createdAt: true },
  });
  if (!row) throw new ApiError(404, "Account not found.");
  return {
    data: row,
    auth:
      principal.type === "key" ? { type: "key", scopes: principal.scopes } : { type: "session" },
  };
});
