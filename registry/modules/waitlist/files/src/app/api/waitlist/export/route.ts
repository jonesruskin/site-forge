import { timingSafeEqual } from "node:crypto";

import { waitlistEnv } from "@/env/waitlist";
import { allEntries } from "@/lib/waitlist/waitlist";

export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const expected = waitlistEnv.WAITLIST_ADMIN_TOKEN;
  const given = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!expected || given.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

function csvCell(value: unknown) {
  const text = value instanceof Date ? value.toISOString() : String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** CSV of every sign-up in queue order. `Authorization: Bearer $WAITLIST_ADMIN_TOKEN`. */
export async function GET(request: Request) {
  if (!authorized(request)) return new Response("Unauthorized", { status: 401 });
  const rows = await allEntries();
  const header = [
    "position",
    "email",
    "name",
    "referrals",
    "referral_code",
    "referred_by",
    "created_at",
  ];
  const lines = rows.map((row, index) =>
    [index + 1, row.email, row.name, row.referrals, row.referralCode, row.referredBy, row.createdAt]
      .map(csvCell)
      .join(","),
  );
  return new Response([header.join(","), ...lines].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="waitlist-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
