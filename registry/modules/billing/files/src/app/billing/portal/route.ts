import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/lib/auth/auth";
import { getCustomerId } from "@/lib/billing/customer";
import { payments } from "@/lib/payments";

export const dynamic = "force-dynamic";

/** GET /billing/portal → the provider's customer portal (manage plan, card, invoices). */
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session)
    return NextResponse.redirect(new URL("/sign-in?next=/settings/billing", request.url), 303);
  const customerId = await getCustomerId(session.user.id);
  if (!customerId) return NextResponse.redirect(new URL("/pricing", request.url), 303);
  const portal = await payments.createPortal({
    customerId,
    returnUrl: new URL("/settings/billing", request.url).toString(),
  });
  return NextResponse.redirect(new URL(portal.url, request.url), 303);
}
